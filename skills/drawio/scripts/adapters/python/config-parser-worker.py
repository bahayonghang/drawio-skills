import json
import re
import sys


MAX_INPUT_BYTES = 1024 * 1024
TERRAFORM_REFERENCE = re.compile(
    r'(?<![A-Za-z0-9_.])(?:module\.[A-Za-z0-9_-]+\.)*[A-Za-z][A-Za-z0-9_]*\.[A-Za-z0-9_-]+'
    r'(?:\[(?:\d+|"[^"\r\n]+")\])?'
)
TERRAFORM_NON_RESOURCE_ROOTS = {'count', 'data', 'each', 'local', 'path', 'self', 'terraform', 'var'}


def respond(payload, status=0):
    sys.stdout.write(json.dumps(payload, ensure_ascii=True, separators=(',', ':')))
    raise SystemExit(status)


def dependency_missing(message):
    respond({'ok': False, 'code': 'OPTIONAL_DEPENDENCY_MISSING', 'message': message}, 3)


def parser_failure(message):
    respond({'ok': False, 'code': 'ADAPTER_PARSE', 'message': message}, 2)


def collect_references(value, output):
    if isinstance(value, str):
        output.update(
            match.group(0)
            for match in TERRAFORM_REFERENCE.finditer(value)
            if match.group(0).split('.', 1)[0] not in TERRAFORM_NON_RESOURCE_ROOTS
        )
    elif isinstance(value, list):
        for entry in value:
            collect_references(entry, output)
    elif isinstance(value, dict):
        for entry in value.values():
            collect_references(entry, output)


def hcl_label(value):
    if isinstance(value, str) and len(value) >= 2 and value[0] == value[-1] == '"':
        return value[1:-1]
    return value


def qualify_terraform_reference(reference, module_address):
    if not module_address or reference.startswith('module.'):
        return reference
    return f'{module_address}.{reference}'


def terraform_records(request):
    try:
        import hcl2
    except ModuleNotFoundError:
        dependency_missing('python-hcl2==8.1.2 is unavailable')

    try:
        parsed = hcl2.loads(request['source'])
    except Exception:
        parser_failure('Terraform HCL could not be parsed')

    module_address = request.get('moduleAddress', '')
    if module_address and not re.fullmatch(r'(?:module\.[A-Za-z0-9_-]+)(?:\.module\.[A-Za-z0-9_-]+)*', module_address):
        parser_failure('Terraform moduleAddress is invalid')

    resources = []
    for resource_group in parsed.get('resource', []):
        if not isinstance(resource_group, dict):
            continue
        for raw_resource_type, named_resources in resource_group.items():
            if not isinstance(named_resources, dict):
                continue
            resource_type = hcl_label(raw_resource_type)
            for raw_name, body in named_resources.items():
                if not isinstance(body, dict):
                    continue
                name = hcl_label(raw_name)
                base_address = f'{resource_type}.{name}'
                address = f'{module_address}.{base_address}' if module_address else base_address
                references = set()
                for key, value in body.items():
                    if key != 'depends_on':
                        collect_references(value, references)
                depends_on = set()
                collect_references(body.get('depends_on', []), depends_on)
                references = {qualify_terraform_reference(value, module_address) for value in references}
                depends_on = {qualify_terraform_reference(value, module_address) for value in depends_on}
                references.discard(address)
                depends_on.discard(address)
                resources.append({
                    'address': address,
                    'resourceType': resource_type,
                    'provider': resource_type.split('_', 1)[0],
                    'references': sorted(references),
                    'dependsOn': sorted(depends_on),
                })

    diagnostics = []
    for key, code in [('data', 'TERRAFORM_DATA_EXCLUDED'), ('provider', 'TERRAFORM_PROVIDER_EXCLUDED'), ('locals', 'TERRAFORM_LOCALS_EXCLUDED')]:
        if parsed.get(key):
            diagnostics.append({'code': code, 'message': f'{key} blocks are outside the managed-resource projection.'})
    return {'resources': resources, 'diagnostics': diagnostics}


def sql_name(expression):
    return getattr(expression, 'name', None) or str(expression)


def sql_table_parts(table, default_schema):
    return (getattr(table, 'db', None) or default_schema, getattr(table, 'name', None) or str(table))


def sql_foreign_key_record(foreign_key, name, schema, exp):
    reference = foreign_key.args.get('reference')
    if reference is None:
        parser_failure('SQL FOREIGN KEY is missing a REFERENCES target')
    target = reference.this
    target_table = target.this if isinstance(target, exp.Schema) else target
    target_schema, target_name = sql_table_parts(target_table, schema)
    target_columns = [sql_name(value) for value in (target.expressions if isinstance(target, exp.Schema) else [])]
    return {
        'name': name,
        'columns': [sql_name(value) for value in foreign_key.expressions],
        'targetSchema': target_schema,
        'targetTable': target_name,
        'targetColumns': target_columns,
    }


def sql_records(request):
    try:
        import sqlglot
        from sqlglot import expressions as exp
    except ModuleNotFoundError:
        dependency_missing('sqlglot==30.12.0 is unavailable')

    dialect = request.get('dialect') or 'postgres'
    default_schema = request.get('defaultSchema') or '_default'
    try:
        statements = sqlglot.parse(request['source'], read=dialect)
    except Exception:
        parser_failure(f'SQL DDL could not be parsed for dialect {dialect}')

    tables = []
    diagnostics = []
    for statement in statements:
        if not isinstance(statement, exp.Create) or str(statement.args.get('kind', '')).upper() != 'TABLE':
            diagnostics.append({'code': 'SQL_UNSUPPORTED_STATEMENT', 'message': 'Only CREATE TABLE statements are projected.'})
            continue
        schema_expression = statement.this
        if isinstance(schema_expression, exp.Schema):
            table_expression = schema_expression.this
            elements = list(schema_expression.expressions)
        else:
            table_expression = schema_expression
            elements = []
        schema, table_name = sql_table_parts(table_expression, default_schema)
        columns = []
        foreign_keys = []

        for element in elements:
            if isinstance(element, exp.ColumnDef):
                constraints = list(element.args.get('constraints') or [])
                primary = any(isinstance(item.args.get('kind'), exp.PrimaryKeyColumnConstraint) for item in constraints)
                nullable = not primary and not any(isinstance(item.args.get('kind'), exp.NotNullColumnConstraint) for item in constraints)
                columns.append({
                    'name': sql_name(element.this),
                    'type': element.args.get('kind').sql(dialect=dialect) if element.args.get('kind') else 'UNKNOWN',
                    'primaryKey': primary,
                    'nullable': nullable,
                })
                for constraint in constraints:
                    kind = constraint.args.get('kind')
                    if isinstance(kind, exp.Reference):
                        target_schema, target_table = sql_table_parts(kind.this.this if isinstance(kind.this, exp.Schema) else kind.this, schema)
                        target_columns = [sql_name(value) for value in (kind.this.expressions if isinstance(kind.this, exp.Schema) else [])]
                        foreign_keys.append({
                            'name': constraint.args.get('name') and sql_name(constraint.args['name']),
                            'columns': [sql_name(element.this)],
                            'targetSchema': target_schema,
                            'targetTable': target_table,
                            'targetColumns': target_columns,
                        })
            elif isinstance(element, exp.PrimaryKey):
                primary_names = {sql_name(value) for value in element.expressions}
                for column in columns:
                    if column['name'] in primary_names:
                        column['primaryKey'] = True
            elif isinstance(element, exp.ForeignKey):
                foreign_keys.append(sql_foreign_key_record(element, None, schema, exp))
            elif isinstance(element, exp.Constraint):
                constraint_name = sql_name(element.this)
                handled = False
                for constraint in element.expressions:
                    if isinstance(constraint, exp.ForeignKey):
                        foreign_keys.append(sql_foreign_key_record(constraint, constraint_name, schema, exp))
                        handled = True
                    elif isinstance(constraint, exp.PrimaryKey):
                        primary_names = {sql_name(value) for value in constraint.expressions}
                        for column in columns:
                            if column['name'] in primary_names:
                                column['primaryKey'] = True
                                column['nullable'] = False
                        handled = True
                if not handled:
                    diagnostics.append({'code': 'SQL_UNSUPPORTED_CLAUSE', 'message': f'Unsupported named constraint {constraint_name} was skipped.'})
            else:
                diagnostics.append({'code': 'SQL_UNSUPPORTED_CLAUSE', 'message': f'Unsupported CREATE TABLE clause {type(element).__name__} was skipped.'})

        tables.append({'schema': schema, 'name': table_name, 'columns': columns, 'foreignKeys': foreign_keys})
    return {'tables': tables, 'diagnostics': diagnostics}


def main():
    raw = sys.stdin.buffer.read(MAX_INPUT_BYTES + 1)
    if len(raw) > MAX_INPUT_BYTES:
        parser_failure('optional parser input exceeds the size limit')
    try:
        request = json.loads(raw.decode('utf-8'))
    except Exception:
        parser_failure('optional parser request is not valid JSON')
    if not isinstance(request, dict) or not isinstance(request.get('source'), str):
        parser_failure('optional parser request is invalid')
    if request.get('adapter') == 'terraform':
        result = terraform_records(request)
    elif request.get('adapter') == 'sql':
        result = sql_records(request)
    else:
        parser_failure('optional parser adapter is unsupported')
    respond({'ok': True, 'result': result})


if __name__ == '__main__':
    main()

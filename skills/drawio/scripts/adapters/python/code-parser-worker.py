import ast
import json
import sys


ADAPTERS = {'python-imports', 'python-classes'}


def fail(code, message, context=None, status=2):
    response = {'ok': False, 'code': code, 'message': message}
    if context:
        response['context'] = context
    sys.stdout.write(json.dumps(response, separators=(',', ':')))
    raise SystemExit(status)


def base_name(node):
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return node.attr
    return None


def parse_file(file, adapter):
    path = file.get('path')
    source = file.get('source')
    if not isinstance(path, str) or not isinstance(source, str):
        fail('ADAPTER_PARSE', 'Python code worker received an invalid file record')
    try:
        tree = ast.parse(source, filename=path)
    except SyntaxError as error:
        fail(
            'ADAPTER_PARSE',
            'Python source contains invalid syntax',
            {
                'path': path,
                'line': error.lineno or 0,
                'column': error.offset or 0,
            },
        )

    if adapter == 'python-imports':
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append({
                        'module': alias.name,
                        'level': 0,
                        'names': [],
                        'line': node.lineno,
                        'column': node.col_offset,
                    })
            elif isinstance(node, ast.ImportFrom):
                imports.append({
                    'module': node.module or '',
                    'level': node.level,
                    'names': [alias.name for alias in node.names],
                    'line': node.lineno,
                    'column': node.col_offset,
                })
        return {'path': path, 'imports': imports}

    classes = []
    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            classes.append({
                'qualifiedName': node.name,
                'bases': [name for name in (base_name(base) for base in node.bases) if name],
                'line': node.lineno,
                'column': node.col_offset,
            })
    return {'path': path, 'classes': classes}


def main():
    if sys.version_info < (3, 11):
        fail('OPTIONAL_DEPENDENCY_MISSING', 'Python 3.11+ is required', status=3)
    try:
        request = json.load(sys.stdin)
    except Exception:
        fail('ADAPTER_PARSE', 'Python code worker received malformed JSON')
    adapter = request.get('adapter') if isinstance(request, dict) else None
    files = request.get('files') if isinstance(request, dict) else None
    if adapter not in ADAPTERS or not isinstance(files, list):
        fail('ADAPTER_PARSE', 'Python code worker received an invalid request')
    result = {'files': [parse_file(file, adapter) for file in files]}
    sys.stdout.write(json.dumps({'ok': True, 'result': result}, separators=(',', ':')))


if __name__ == '__main__':
    main()

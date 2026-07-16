import fs from "node:fs";
import path from "node:path";

const repo = "D:/Documents/Code/Agents/drawio-skills";
process.chdir(repo);

function extractPaths(md) {
  const re = /`([^`\n]+?)`/g;
  const out = new Set();
  let m;
  while ((m = re.exec(md))) {
    let p = m[1].trim();
    if (
      /^(references|assets|scripts|styles|evals|agents)\//.test(p) ||
      /^\.\.\/drawio\//.test(p)
    ) {
      out.add(p.replace(/ §.*$/, "").replace(/\/$/, ""));
    }
  }
  return [...out];
}

for (const skill of ["skills/drawio", "skills/drawio-academic-skills"]) {
  const md = fs.readFileSync(path.join(skill, "SKILL.md"), "utf8");
  const missing = [];
  for (const p of extractPaths(md)) {
    const resolved = p.startsWith("../drawio/")
      ? path.join("skills", p.replace("../", ""))
      : path.join(skill, p);
    if (!fs.existsSync(resolved)) missing.push(p);
  }
  console.log("== " + skill + " missing referenced paths ==");
  console.log(missing.length ? missing.join("\n") : "(none)");
}

for (const skill of ["skills/drawio", "skills/drawio-academic-skills"]) {
  const allFiles = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const fp = path.join(d, f);
      const st = fs.statSync(fp);
      if (st.isDirectory() && !f.startsWith(".") && f !== "vendor") walk(fp);
      else if (/\.(md|yaml|json)$/.test(f)) allFiles.push(fp);
    }
  })(skill);
  const corpus = allFiles
    .map((f) => {
      try {
        return fs.readFileSync(f, "utf8");
      } catch {
        return "";
      }
    })
    .join("\n");
  const docs = [];
  const refDir = path.join(skill, "references");
  (function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const f of fs.readdirSync(d)) {
      const fp = path.join(d, f);
      const st = fs.statSync(fp);
      if (st.isDirectory()) walk(fp);
      else docs.push(fp);
    }
  })(refDir);
  const orphans = docs.filter((f) => !corpus.includes(path.basename(f)));
  console.log("== " + skill + " orphan reference files ==");
  console.log(
    orphans.length
      ? orphans.map((o) => o.split(path.sep).join("/")).join("\n")
      : "(none)",
  );
}

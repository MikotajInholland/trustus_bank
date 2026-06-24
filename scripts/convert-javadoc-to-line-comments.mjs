import fs from 'fs';
import path from 'path';

function walk(dir, exts, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== 'node_modules' && ent.name !== 'target') {
      walk(p, exts, files);
    } else if (exts.some((e) => ent.name.endsWith(e))) {
      files.push(p);
    }
  }
  return files;
}

function javadocToLineComments(block) {
  const indentMatch = block.match(/^([ \t]*)/);
  const indent = indentMatch ? indentMatch[1] : '';
  const lines = block.split('\n');
  const texts = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (i === 0) {
      line = line.slice(indent.length);
      line = line.replace(/^\/\*\*\s?/, '');
      line = line.replace(/\s*\*\/\s*$/, '');
      if (line.trim()) texts.push(line.trimEnd());
      continue;
    }

    const trimmed = line.trim();
    if (trimmed === '*/') continue;

    let content = trimmed.replace(/^\*\s?/, '');
    content = content.replace(/\s*\*\/\s*$/, '');
    if (content.trim() === '') continue;
    texts.push(content.trimEnd());
  }

  if (texts.length === 0) return '';
  return texts.map((text) => `${indent}// ${text}`).join('\n');
}

function convert(content) {
  return content.replace(/^[ \t]*\/\*\*[\s\S]*?\*\//gm, (block) => javadocToLineComments(block));
}

const root = path.resolve(import.meta.dirname, '..');
const dirs = [path.join(root, 'backend', 'src'), path.join(root, 'frontend', 'src')];
let changed = 0;

for (const dir of dirs) {
  for (const file of walk(dir, ['.java', '.js', '.jsx'])) {
    const original = fs.readFileSync(file, 'utf8');
    if (!original.includes('/**')) continue;
    const updated = convert(original);
    if (updated !== original) {
      fs.writeFileSync(file, updated);
      changed++;
    }
  }
}

console.log(`Converted /** */ comments in ${changed} files`);

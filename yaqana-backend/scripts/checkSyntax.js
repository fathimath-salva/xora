import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const roots = ['src', 'scripts', 'tests'];
const files = [];
function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith('.js')) files.push(full);
  }
}
for (const root of roots) walk(root);
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) { failed = true; process.stderr.write(`${file}\n${result.stderr}`); }
}
if (failed) process.exit(1);
process.stdout.write(`Syntax check passed for ${files.length} JavaScript files.\n`);

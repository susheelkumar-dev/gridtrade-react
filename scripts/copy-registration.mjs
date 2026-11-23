// Copies the module manifests into the build: the portfolio's registry endpoint reads them from
// wwwroot/lab/gridtrade/registration to build the app's menu.
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
const out = 'dist/registration';
mkdirSync(out, { recursive: true });
const files = readdirSync('registration').filter((f) => f.endsWith('.manifest.json'));
for (const f of files) cpSync(`registration/${f}`, `${out}/${f}`);
console.log(`copied ${files.length} manifest(s) to ${out}`);

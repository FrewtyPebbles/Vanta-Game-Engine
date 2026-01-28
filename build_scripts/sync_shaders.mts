import fs from 'fs';
import path from 'path';
import { globSync } from 'glob'; // npm install glob

const shaders:fs.PathOrFileDescriptor[] = globSync('src/**/*.fs');

shaders.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const tsContent = `export default \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;`;
  fs.writeFileSync(`${file}.ts`, tsContent);
});
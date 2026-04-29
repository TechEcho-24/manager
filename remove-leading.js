const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./components').concat(walk('./app'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match leading-[something] or leading-tight, leading-none, leading-relaxed, etc.
  // The regex removes `leading-xxx` and any trailing space
  const newContent = content.replace(/\bleading-[a-zA-Z0-9\.\[\]]+\s?/g, '');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
});

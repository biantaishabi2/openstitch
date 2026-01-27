const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/figma.json', 'utf-8'));

function findArrowChars(obj, path = '') {
  const results = [];

  function search(value, currentPath) {
    if (typeof value === 'string') {
      const patterns = [
        { regex: /→/g, name: '→ (U+2192 RIGHT ARROW)' },
        { regex: /←/g, name: '← (U+2190 LEFT ARROW)' },
        { regex: /＜/g, name: '＜ (U+FF1C FULL-WIDTH LESS-THAN)' },
        { regex: /＞/g, name: '＞ (U+FF1E FULL-WIDTH GREATER-THAN)' },
        { regex: /－/g, name: '－ (U+FF0D FULL-WIDTH HYPHEN-MINUS)' },
        { regex: /：/g, name: '： (U+FF1A FULL-WIDTH COLON)' },
      ];

      for (const p of patterns) {
        const matches = value.match(p.regex);
        if (matches) {
          results.push({ path: currentPath, type: p.name, count: matches.length, sample: value.slice(0, 100) });
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => search(item, currentPath + '[' + i + ']'));
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => search(v, currentPath + '.' + k));
    }
  }

  search(obj, path);
  return results;
}

const results = findArrowChars(data);
console.log('=== Special Characters in Figma JSON ===');
console.log('Found', results.length, 'occurrences');
results.forEach(r => {
  console.log(`- ${r.type} at ${r.path} (count: ${r.count})`);
  console.log(`  Sample: ${r.sample}`);
});

if (results.length === 0) {
  console.log('No special characters found in Figma JSON');
}

// 检查原始 JSON 字节
const raw = fs.readFileSync('/tmp/figma.json', 'utf-8');
const bytes = Buffer.from(raw);
console.log('\n=== Raw JSON Bytes Analysis ===');
console.log('Total bytes:', bytes.length);

const e2Positions = [];
for (let i = 0; i < bytes.length; i++) {
  if (bytes[i] === 0xE2) {
    e2Positions.push(i);
  }
}
console.log('0xE2 bytes found:', e2Positions.length);

for (const pos of e2Positions.slice(0, 10)) {
  if (pos + 2 < bytes.length) {
    const seq = [bytes[pos], bytes[pos+1], bytes[pos+2]];
    const char = raw.charAt(pos);
    console.log(`Byte ${pos}: ${seq.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(', ')} = "${char}" (code: ${raw.charCodeAt(pos)})`);
  }
}

const input = '[SECTION: home]\n  [SECTION: header]\n    [IMAGE: id_logo]\n  [/SECTION]\n  [SECTION: main]\n    [TEXT: id_welcome] 欢迎来到胸科医院\n  [/SECTION]\n[/SECTION]';

const processed = input
  .replace(/[：：]/g, ':')
  .replace(/[\u201C\u201D]/g, '"')
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[＜＞]/g, m => m === '＜' ? '<' : '>')
  .replace(/[［］]/g, m => m === '［' ? '[' : ']')
  .replace(/[－]/g, '-')
  .replace(/[^\x20-\x7E]/g, '?');

console.log('Original:');
console.log(input);
console.log('\nProcessed:');
console.log(processed);
console.log('\nOriginal bytes:', Array.from(input.slice(0, 20)).map(c => c.charCodeAt(0)));
console.log('Processed bytes:', Array.from(processed.slice(0, 20)).map(c => c.charCodeAt(0)));

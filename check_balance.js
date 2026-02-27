const fs = require('fs');
const s = fs.readFileSync('script.js','utf8');
const stack = [];
for (let i=0;i<s.length;i++){
  const c = s[i];
  if (c === '\\') { i++; continue; }
  if (c === '`') { if (stack.length && stack[stack.length-1] === '`') stack.pop(); else stack.push('`'); continue; }
  if (c === '"' || c === "'") { const q=c; i++; while(i<s.length){ if (s[i]==='\\') { i+=2; continue; } if (s[i]===q) break; i++; } continue; }
  if (c === '{' || c === '(' || c === '[') stack.push(c);
  if (c === '}' || c === ')' || c === ']'){
    const o = stack.pop();
    if (!o){ console.log('Unmatched closing', c, 'at', i); process.exit(0); }
    const match = o==='{'?'}':(o==='(')?')':']';
    if (match !== c){ console.log('Mismatched', o, 'with', c, 'at', i); process.exit(0); }
  }
}
if (stack.length) console.log('Unclosed at end:', stack);
else console.log('All balanced');

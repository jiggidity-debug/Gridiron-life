const assert=require('node:assert/strict');const fs=require('fs');const vm=require('vm');
const source=fs.readFileSync(__dirname+'/../js/69-college.js','utf8');
assert.match(source,/slice\(0,250\)/);
assert.match(source,/r\.rank=score>=58 && above<250/);
const match=source.match(/score:i<2\?77:i<250\?58\+Math\.floor\(Math\.pow\(Math\.random\(\),\.8\)\*19\):28\+Math\.floor\(Math\.random\(\)\*30\)/);
assert.ok(match,'Top 250 cohort generation must produce precisely two 77-rated prospects, 248 rated 58-76, remainder 28-57');
console.log('Top 250 recruiting board thresholds OK');

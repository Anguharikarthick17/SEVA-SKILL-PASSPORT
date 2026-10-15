const fs = require('fs');
const { STARTER_CODES } = require('./starter-templates');

const filePath = 'src/data/challenges.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update interface definition to include referenceSolution
if (!content.includes('referenceSolution?: string;')) {
  content = content.replace(
    '  starterCode: string;',
    '  starterCode: string;\n  referenceSolution?: string;'
  );
}

// 2. Parse existing REAL_CHALLENGES via evaluate
const { REAL_CHALLENGES } = require('../src/data/challenges.ts');

console.log('Read', REAL_CHALLENGES.length, 'challenges.');

// Now let's transform the file:
// For each challenge id, we find its starterCode: `...` block in content,
// rename starterCode to referenceSolution, and insert the new starterCode before it!
let updated = content;

for (const ch of REAL_CHALLENGES) {
  const starter = STARTER_CODES[ch.id];
  if (!starter) {
    console.warn('No starter template for', ch.id);
    continue;
  }

  // Find the challenge section by id
  const idMarker = `id: '${ch.id}'`;
  const idIndex = updated.indexOf(idMarker);
  if (idIndex === -1) {
    console.error('Could not find id marker:', idMarker);
    continue;
  }

  // Find starterCode within this challenge block (before next challenge id or end)
  const nextChMatch = updated.indexOf("id: 'ch-", idIndex + idMarker.length);
  const blockEnd = nextChMatch !== -1 ? nextChMatch : updated.length;
  const block = updated.slice(idIndex, blockEnd);

  // Look for starterCode: `...` or starterCode: "..."
  const scMatch = block.match(/starterCode:\s*(`[\s\S]*?`|"[^"]*"|'[^']*')/);
  if (!scMatch) {
    console.error('Could not find starterCode in block for', ch.id);
    continue;
  }

  const existingCode = scMatch[1]; // includes backticks
  
  // Format replacement with starterCode: `...` and referenceSolution: `...`
  const formattedStarter = JSON.stringify(starter); // or template literal
  const replacement = `starterCode: ${JSON.stringify(starter)},
    referenceSolution: ${existingCode}`;

  const updatedBlock = block.replace(scMatch[0], replacement);
  updated = updated.slice(0, idIndex) + updatedBlock + updated.slice(blockEnd);
}

fs.writeFileSync(filePath, updated, 'utf8');
console.log('Successfully updated src/data/challenges.ts with separated starterCode and referenceSolution!');

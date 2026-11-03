import fs from 'fs';

const filePath = 'frontend/src/utils/time.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = `export function formatEventTime(timestamp) {
  const d = parseDate(timestamp);
  if (!d) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return \`\${pad(d.getHours())}:\${pad(d.getMinutes())}:\${pad(d.getSeconds())}\`;
}`;

const replacement = `export function formatEventTime(timestamp, includeDate = true) {
  const d = parseDate(timestamp);
  if (!d) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  const timeStr = \`\${h}:\${min}:\${s}\`;
  if (!includeDate) return timeStr;
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return \`\${y}-\${m}-\${day} \${timeStr}\`;
}`;

// Normalize line endings for replacement
const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
  console.error('Target not found in content!');
  process.exit(1);
}

const updated = normContent.replace(normTarget, normReplacement);
fs.writeFileSync(filePath, updated, 'utf8');
console.log('Successfully updated formatEventTime!');


const fs = require('fs');
const path = require('path');

const dir = 'src/cms/migrations';
const files = fs.readdirSync(dir).filter(f => f.startsWith('migrate') && f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the infinite recursion bug in the wrapper
  // The bug is: const res = await loggedAddDoc(colRef, data);
  // We need to change it to: const res = await addDoc(colRef, data);
  // But ONLY inside the loggedAddDoc function block!
  
  content = content.replace(/async function loggedAddDoc\(colRef, data\) \{\s*try \{\s*const res = await loggedAddDoc\(colRef, data\);/g, 
  `async function loggedAddDoc(colRef, data) {
  try {
    const res = await addDoc(colRef, data);`);

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log("Bug fixed in all migration scripts.");

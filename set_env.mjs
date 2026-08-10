import fs from 'fs';
import { execSync } from 'child_process';

const envStr = fs.readFileSync('.env', 'utf-8');
const lines = envStr.split('\n');
const envs = {};
for (const line of lines) {
   if (line.trim().startsWith('#')) continue;
   const idx = line.indexOf('=');
   if (idx !== -1) {
       const key = line.slice(0, idx).trim();
       let val = line.slice(idx + 1).trim();
       if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
       else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
       envs[key] = val;
   }
}

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET',
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_ID',
  'VITE_EMAILJS_PUBLIC_KEY'
];

for (const key of required) {
    if (envs[key]) {
        console.log('Adding', key, 'to production...');
        try {
            execSync(`npx vercel env rm ${key} production --yes`, { stdio: 'ignore' });
        } catch(e){}
        execSync(`npx vercel env add ${key} production`, { input: envs[key] });
        
        console.log('Adding', key, 'to preview...');
        try {
            execSync(`npx vercel env rm ${key} preview --yes`, { stdio: 'ignore' });
        } catch(e){}
        execSync(`npx vercel env add ${key} preview`, { input: envs[key] });
    } else {
        console.log('Missing locally:', key);
    }
}
console.log('Done!');

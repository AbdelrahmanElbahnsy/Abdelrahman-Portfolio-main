import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Instructions:
// 1. Download your Firebase Service Account JSON key from the Firebase Console (Project Settings -> Service Accounts -> Generate new private key).
// 2. Save it as `serviceAccountKey.json` in the root of this project.
// 3. Find your user UID from the Firebase Authentication console.
// 4. Run this script: `node scripts/promoteToOwner.mjs <YOUR_UID>`

const args = process.argv.slice(2);
const targetUid = args[0];

if (!targetUid) {
  console.error('\n❌ ERROR: Please provide the target UID as an argument.');
  console.error('Usage: node scripts/promoteToOwner.mjs <YOUR_UID>\n');
  process.exit(1);
}

try {
  const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  console.log(`\nPromoting user ${targetUid} to Owner...`);

  await db.collection('admins').doc(targetUid).set({
    role: 'owner',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  console.log(`\n✅ SUCCESS! User ${targetUid} has been promoted to 'owner'.`);
  console.log('You can now log in to the dashboard and manage Users & Access.');
  
  process.exit(0);

} catch (error) {
  console.error('\n❌ ERROR: Failed to promote user.');
  if (error.code === 'ENOENT') {
    console.error('Could not find serviceAccountKey.json in the project root.');
    console.error('Please download it from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key.');
  } else {
    console.error(error);
  }
  process.exit(1);
}

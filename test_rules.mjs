import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc } from 'firebase/firestore';

async function runTests() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'test-portfolio',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });

  // Create a context for an authenticated owner
  const ownerUid = 'owner-123';
  
  // Setup the mock admins document for the owner using an unauthenticated/admin context
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'admins', ownerUid), {
      role: 'owner',
      email: 'owner@test.com'
    });
  });

  // Now authenticate as the owner and try to write to settings/appearance
  const ownerContext = testEnv.authenticatedContext(ownerUid);
  const db = ownerContext.firestore();

  try {
    await assertSucceeds(
      setDoc(doc(db, 'settings', 'appearance'), {
        theme: 'dark',
        language: 'en'
      })
    );
    console.log("TEST PASSED: Owner successfully wrote to settings/appearance");
  } catch (error) {
    console.error("TEST FAILED: Owner was REJECTED when writing to settings/appearance");
    console.error(error);
  }

  await testEnv.cleanup();
  process.exit(0);
}

runTests().catch(console.error);

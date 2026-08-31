import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const OWNER_EMAILS = [
  "abdelrahmanelbahnsy5@gmail.com",
  "abdelrahmanelbahnsy3@gmail.com",
  "abdelrahmanelbahnsy19@gmail.com",
];

// Helper to initialize and retrieve Firebase Admin securely
const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !rawPrivateKey) {
      console.error('API Diagnostic Error [InitEnv]: Missing required environment variables.');
      throw new Error('Firebase Admin initialization failed: Missing required environment variables.');
    }

    let privateKey = rawPrivateKey;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
    else if (privateKey.startsWith("'") && privateKey.endsWith("'")) privateKey = privateKey.slice(1, -1);
    privateKey = privateKey.replace(/\\n/g, '\n');

    try {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    } catch (err) {
      console.error('API Diagnostic Error [InitCert]:', err?.message);
      throw new Error('Firebase Admin initialization failed: ' + (err?.message || 'Unknown error'));
    }
  }
};

const verifyTokenAndRole = async (req, db, auth) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');
  
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
  } catch (err) {
    throw new Error('Unauthorized');
  }
  
  if (!decodedToken?.uid) throw new Error('Unauthorized');

  const normalizedEmail = (decodedToken.email || '').trim().toLowerCase();
  const isOfficialOwner = OWNER_EMAILS.includes(normalizedEmail);

  let adminDoc;
  try {
    adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
  } catch (err) {
    throw new Error('Firestore lookup failed');
  }

  // Auto-resolve official owners if they don't exist or have wrong role
  if (isOfficialOwner) {
    if (!adminDoc || !adminDoc.exists || adminDoc.data()?.role !== 'owner') {
      try {
        await db.collection('admins').doc(decodedToken.uid).set({ role: 'owner', createdAt: FieldValue.serverTimestamp() }, { merge: true });
      } catch (err) {
         console.error('Failed to auto-resolve owner role in Firestore:', err);
      }
    }
    return { uid: decodedToken.uid, email: decodedToken.email, role: 'owner' };
  }

  if (!adminDoc || !adminDoc.exists) throw new Error('Forbidden');

  const userData = adminDoc.data();
  let resolvedRole = userData?.role || 'viewer';
  
  // Ensure non-official owners cannot be owners, just in case
  if (resolvedRole === 'owner' && !isOfficialOwner) {
    resolvedRole = 'admin'; // Fallback
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: resolvedRole,
  };
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).json({ success: true });

  try {
    try {
      initFirebaseAdmin();
    } catch (initErr) {
      console.error('API Diagnostic Error [Init]:', initErr);
      return res.status(500).json({ success: false, error: { message: 'Firebase Admin initialization failed' } });
    }

    const db = getFirestore();
    const auth = getAuth();
    const caller = await verifyTokenAndRole(req, db, auth);

    // GET /api/admin/users
    if (req.method === 'GET') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      }

      let listUsersResult, rolesSnapshot;
      try {
        listUsersResult = await auth.listUsers(1000);
        rolesSnapshot = await db.collection('admins').get();
      } catch (err) {
        console.error('API Diagnostic Error [GET data]:', err);
        return res.status(500).json({ success: false, error: { message: 'Failed to fetch users data' } });
      }

      const rolesMap = {};
      if (rolesSnapshot) {
        rolesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data) rolesMap[doc.id] = data.role;
        });
      }

      const users = (listUsersResult?.users || []).map(user => {
        const normalizedEmail = (user?.email || '').trim().toLowerCase();
        const isOfficialOwner = OWNER_EMAILS.includes(normalizedEmail);
        let role = rolesMap[user?.uid] || 'unassigned';
        
        if (isOfficialOwner) role = 'owner';
        else if (role === 'owner') role = 'admin'; // Strip invalid owners

        return {
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName || '',
          photoURL: user?.photoURL || '',
          emailVerified: user?.emailVerified,
          disabled: user?.disabled,
          creationTime: user?.metadata?.creationTime,
          lastSignInTime: user?.metadata?.lastSignInTime,
          providerData: (user?.providerData || []).map(p => ({ providerId: p.providerId })),
          role
        };
      });

      return res.status(200).json({ success: true, users });
    }

    // POST /api/admin/users
    if (req.method === 'POST') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      }

      const { email, password, displayName, role } = req.body || {};

      if (!email || !password || !role) {
        return res.status(400).json({ success: false, error: { message: 'Invalid request fields' } });
      }

      if (role === 'owner') {
        return res.status(403).json({ success: false, error: { message: 'Owner role cannot be assigned through User Management.' } });
      }

      if (caller.role === 'admin' && role === 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admins cannot create Admin accounts' } });
      }

      let userRecord;
      try {
        userRecord = await auth.createUser({ email, password, displayName: displayName || '' });
        await db.collection('admins').doc(userRecord.uid).set({
          role,
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error('API Diagnostic Error [createUser]:', err);
        if (err?.code === 'auth/email-already-exists') {
          return res.status(409).json({ success: false, error: { message: 'Duplicate email' } });
        }
        return res.status(500).json({ success: false, error: { message: 'Failed to create user' } });
      }

      return res.status(201).json({ success: true, message: 'User created', uid: userRecord.uid });
    }

    // PATCH /api/admin/users
    if (req.method === 'PATCH') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      }

      const { uid, role, disabled, displayName } = req.body || {};
      if (!uid) return res.status(400).json({ success: false, error: { message: 'User ID is required' } });

      let targetDoc, targetAuthRecord;
      try {
        targetDoc = await db.collection('admins').doc(uid).get();
        targetAuthRecord = await auth.getUser(uid);
      } catch (err) {
        console.error('API Diagnostic Error [PATCH GET]:', err);
        return res.status(500).json({ success: false, error: { message: 'Lookup failed' } });
      }
      
      if (!targetDoc || !targetDoc.exists || !targetAuthRecord) return res.status(404).json({ success: false, error: { message: 'User not found' } });
      
      const normalizedTargetEmail = (targetAuthRecord.email || '').trim().toLowerCase();
      const isTargetOfficialOwner = OWNER_EMAILS.includes(normalizedTargetEmail);
      const targetRole = isTargetOfficialOwner ? 'owner' : targetDoc.data()?.role;

      // --- Security Constraints ---
      if (targetRole === 'owner') {
        if (caller.role !== 'owner') return res.status(403).json({ success: false, error: { message: 'Admins cannot modify the Owner' } });
        if (role && role !== 'owner') return res.status(403).json({ success: false, error: { message: 'Owner role cannot be demoted' } });
        if (disabled === true) return res.status(403).json({ success: false, error: { message: 'Owner cannot be disabled' } });
      }

      if (role === 'owner' && targetRole !== 'owner') {
        return res.status(403).json({ success: false, error: { message: 'Owner role cannot be assigned through User Management.' } });
      }

      if (caller.role === 'admin') {
        // Admins modifying other admins
        if (targetRole === 'admin' && caller.uid !== uid) {
           return res.status(403).json({ success: false, error: { message: 'Admins cannot modify other Admins' } });
        }
      }
      // -----------------------------

      try {
        const authUpdates = {};
        if (disabled !== undefined) authUpdates.disabled = disabled;
        if (displayName !== undefined) authUpdates.displayName = displayName;
        
        if (Object.keys(authUpdates).length > 0) {
          await auth.updateUser(uid, authUpdates);
        }
        if (role && role !== targetRole) {
          await db.collection('admins').doc(uid).set({ role }, { merge: true });
        }
      } catch (err) {
        console.error('API Diagnostic Error [PATCH updates]:', err);
        return res.status(500).json({ success: false, error: { message: 'Failed to update user' } });
      }

      return res.status(200).json({ success: true, message: 'User updated successfully' });
    }

    // DELETE /api/admin/users
    if (req.method === 'DELETE') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      }

      const { uid } = req.query || {}; 
      if (!uid) return res.status(400).json({ success: false, error: { message: 'User ID is required' } });

      let targetDoc, targetAuthRecord;
      try {
        targetDoc = await db.collection('admins').doc(uid).get();
        targetAuthRecord = await auth.getUser(uid);
      } catch (err) {
        console.error('API Diagnostic Error [DELETE GET]:', err);
        return res.status(500).json({ success: false, error: { message: 'Lookup failed' } });
      }

      const normalizedTargetEmail = (targetAuthRecord?.email || '').trim().toLowerCase();
      const isTargetOfficialOwner = OWNER_EMAILS.includes(normalizedTargetEmail);
      const targetRole = isTargetOfficialOwner ? 'owner' : (targetDoc?.exists ? targetDoc.data().role : null);

      // Security Constraints
      if (targetRole === 'owner') {
        return res.status(403).json({ success: false, error: { message: 'Owner cannot be deleted' } });
      }
      if (caller.role === 'admin' && targetRole === 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admins cannot delete other Admins' } });
      }

      try {
        await auth.deleteUser(uid);
        // Only delete the specific admin mapping
        await db.collection('admins').doc(uid).delete();
      } catch (err) {
        console.error('API Diagnostic Error [DELETE]:', err);
        if (err?.code === 'auth/user-not-found') {
           return res.status(404).json({ success: false, error: { message: 'User not found' } });
        }
        return res.status(500).json({ success: false, error: { message: 'Failed to delete user' } });
      }

      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }

    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });

  } catch (error) {
    console.error('API Diagnostic Error [Unhandled]:', error?.stack || error);
    if (error?.message === 'Unauthorized') return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    if (error?.message === 'Forbidden') return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    if (error?.message === 'Firestore lookup failed') return res.status(500).json({ success: false, error: { message: 'Firestore lookup failed' } });
    return res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
}

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

  let adminDoc;
  try {
    adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
  } catch (err) {
    throw new Error('Firestore lookup failed');
  }

  if (!adminDoc || !adminDoc.exists) throw new Error('Forbidden');

  const userData = adminDoc.data();
  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: userData?.role || 'viewer',
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

      const users = (listUsersResult?.users || []).map(user => ({
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName || '',
        photoURL: user?.photoURL || '',
        emailVerified: user?.emailVerified,
        disabled: user?.disabled,
        creationTime: user?.metadata?.creationTime,
        lastSignInTime: user?.metadata?.lastSignInTime,
        role: rolesMap[user?.uid] || 'unassigned'
      }));

      return res.status(200).json({ success: true, users });
    }

    // POST /api/admin/users
    if (req.method === 'POST') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      }

      const { action, email, password, displayName, role } = req.body || {};

      // RESET PASSWORD ACTION
      if (action === 'reset_password') {
        const { targetEmail } = req.body || {};
        if (!targetEmail) return res.status(400).json({ success: false, error: { message: 'Target email required' } });
        
        let targetUser;
        try {
          targetUser = await auth.getUserByEmail(targetEmail);
        } catch(err) {
          return res.status(404).json({ success: false, error: { message: 'User not found' } });
        }

        // We can optionally verify the role of targetUser before allowing reset.
        let targetDoc;
        try { targetDoc = await db.collection('admins').doc(targetUser.uid).get(); } catch (err) {}
        const targetRole = targetDoc?.exists ? targetDoc.data().role : null;

        if (targetRole === 'owner' && caller.role !== 'owner') {
          return res.status(403).json({ success: false, error: { message: 'Admins cannot reset the Owner password' } });
        }

        try {
          const link = await auth.generatePasswordResetLink(targetEmail);
          // Normally we'd email this link using SendGrid, etc.
          // Because we don't have an SMTP server, we return the link safely for the Admin ONLY to copy/send.
          // Note: Returning the link to an authorized Admin is standard for SaaS admin panels that lack SMTP.
          return res.status(200).json({ success: true, link, message: 'Password reset link generated securely.' });
        } catch (err) {
          console.error('API Diagnostic Error [Reset Link]:', err);
          return res.status(500).json({ success: false, error: { message: 'Failed to generate reset link' } });
        }
      }

      // CREATE USER ACTION
      if (!email || !password || !role) {
        return res.status(400).json({ success: false, error: { message: 'Invalid request fields' } });
      }

      if (caller.role === 'admin' && (role === 'owner' || role === 'admin')) {
        return res.status(403).json({ success: false, error: { message: 'Admins cannot create Owner or Admin accounts' } });
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

      let targetDoc;
      try {
        targetDoc = await db.collection('admins').doc(uid).get();
      } catch (err) {
        console.error('API Diagnostic Error [PATCH GET]:', err);
        return res.status(500).json({ success: false, error: { message: 'Firestore lookup failed' } });
      }
      
      if (!targetDoc || !targetDoc.exists) return res.status(404).json({ success: false, error: { message: 'User not found' } });
      const targetRole = targetDoc.data()?.role;

      // --- Security Constraints ---
      if (targetRole === 'owner') {
        if (caller.role !== 'owner') return res.status(403).json({ success: false, error: { message: 'Admins cannot modify the Owner' } });
        if (role && role !== 'owner') return res.status(403).json({ success: false, error: { message: 'Owner role cannot be demoted' } });
        if (disabled === true) return res.status(403).json({ success: false, error: { message: 'Owner cannot be disabled' } });
      }

      if (caller.role === 'admin') {
        if (role === 'owner') return res.status(403).json({ success: false, error: { message: 'Cannot promote to Owner' } });
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
        if (role) {
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

      let targetDoc;
      try {
        targetDoc = await db.collection('admins').doc(uid).get();
      } catch (err) {
        console.error('API Diagnostic Error [DELETE GET]:', err);
        return res.status(500).json({ success: false, error: { message: 'Firestore lookup failed' } });
      }

      const targetRole = targetDoc?.exists ? targetDoc.data().role : null;

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

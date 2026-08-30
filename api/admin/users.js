// Modular dynamic imports to bypass Vercel's strict CJS/ESM bundling conflicts
let appModule, authModule, firestoreModule;

const loadModules = async () => {
  if (!appModule) {
    appModule = await import('firebase-admin/app');
    authModule = await import('firebase-admin/auth');
    firestoreModule = await import('firebase-admin/firestore');
  }
};

const initFirebaseAdmin = async () => {
  await loadModules();
  
  if (appModule.getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !rawPrivateKey) {
      console.error('API Diagnostic Error [InitEnv]: Missing required environment variables.', {
        hasProjectId: !!projectId,
        hasClientEmail: !!clientEmail,
        hasPrivateKey: !!rawPrivateKey,
      });
      throw new Error('Firebase Admin initialization failed: Missing required environment variables.');
    }

    // Vercel environment variables sometimes include surrounding quotes and escaped newlines.
    // Strip quotes and safely convert \n to actual newlines.
    let privateKey = rawPrivateKey;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Diagnostic validation of PEM structure
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
      console.error('API Diagnostic Error [InitKey]: Private key does not contain expected PEM boundaries.');
    }

    try {
      appModule.initializeApp({
        credential: appModule.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (err) {
      console.error('API Diagnostic Error [InitCert]: Firebase Admin initialization threw an exception:', err?.message, err?.code);
      throw new Error('Firebase Admin initialization failed: ' + (err?.message || 'Unknown error'));
    }
  }
};

// Middleware to verify Auth Token and extract current user role
const verifyTokenAndRole = async (req, db, auth) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(token);
  } catch (err) {
    throw new Error('Unauthorized');
  }
  
  if (!decodedToken?.uid) {
    throw new Error('Unauthorized');
  }

  let adminDoc;
  try {
    adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
  } catch (err) {
    throw new Error('Firestore lookup failed');
  }

  if (!adminDoc || !adminDoc.exists) {
    throw new Error('Forbidden');
  }

  const userData = adminDoc.data();
  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: userData?.role || 'viewer',
  };
};

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    // 1. Initialize Firebase safely
    try {
      await initFirebaseAdmin();
    } catch (initErr) {
      console.error('API Diagnostic Error [Init]:', initErr);
      return res.status(500).json({ success: false, error: 'Firebase Admin initialization failed' });
    }

    const db = firestoreModule.getFirestore();
    const auth = authModule.getAuth();

    // 2. Verify caller authentication and role
    const caller = await verifyTokenAndRole(req, db, auth);

    // GET /api/admin/users
    if (req.method === 'GET') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      let listUsersResult;
      try {
        listUsersResult = await auth.listUsers(1000);
      } catch (err) {
        console.error('API Diagnostic Error [listUsers]:', err);
        return res.status(500).json({ success: false, error: 'listUsers() failed' });
      }

      let rolesSnapshot;
      try {
        rolesSnapshot = await db.collection('admins').get();
      } catch (err) {
        console.error('API Diagnostic Error [Firestore GET]:', err);
        return res.status(500).json({ success: false, error: 'Firestore lookup failed' });
      }

      const rolesMap = {};
      if (rolesSnapshot) {
        rolesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data) rolesMap[doc.id] = data.role;
        });
      }

      const usersList = listUsersResult?.users || [];
      const users = usersList.map(user => ({
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName || '',
        photoURL: user?.photoURL || '',
        emailVerified: user?.emailVerified,
        disabled: user?.disabled,
        creationTime: user?.metadata?.creationTime,
        lastSignInTime: user?.metadata?.lastSignInTime,
        role: rolesMap[user?.uid] || 'unassigned' // Handles unassigned gracefully
      }));

      return res.status(200).json({ success: true, users });
    }

    // POST /api/admin/users
    if (req.method === 'POST') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { email, password, displayName, role } = req.body || {};

      if (!email || !password || !role) {
        return res.status(400).json({ success: false, error: 'Invalid request fields' });
      }

      if (caller.role === 'admin' && role === 'owner') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      let userRecord;
      try {
        userRecord = await auth.createUser({
          email,
          password,
          displayName: displayName || '',
        });
      } catch (err) {
        console.error('API Diagnostic Error [createUser]:', err);
        if (err?.code === 'auth/email-already-exists') {
          return res.status(409).json({ success: false, error: 'Duplicate email' });
        }
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
      }

      try {
        await db.collection('admins').doc(userRecord.uid).set({
          role,
          createdAt: firestoreModule.FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error('API Diagnostic Error [Firestore SET]:', err);
        return res.status(500).json({ success: false, error: 'Firestore lookup failed' });
      }

      return res.status(201).json({ success: true, message: 'User created', uid: userRecord.uid });
    }

    // PATCH /api/admin/users
    if (req.method === 'PATCH') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { uid, role, disabled } = req.body || {};

      if (!uid) return res.status(400).json({ success: false, error: 'Invalid request fields' });

      let targetDoc;
      try {
        targetDoc = await db.collection('admins').doc(uid).get();
      } catch (err) {
        console.error('API Diagnostic Error [Firestore PATCH GET]:', err);
        return res.status(500).json({ success: false, error: 'Firestore lookup failed' });
      }

      if (!targetDoc || !targetDoc.exists) {
         return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      const targetData = targetDoc.data();
      const targetRole = targetData?.role;

      // Owner Protection Server-Side
      if (targetRole === 'owner') {
        if (role !== 'owner' || disabled === true) {
           return res.status(403).json({ success: false, error: 'Forbidden' });
        }
      }
      if (caller.role === 'admin' && targetRole === 'owner') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
      if (caller.role === 'admin' && role === 'owner') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      try {
        if (disabled !== undefined) {
          await auth.updateUser(uid, { disabled });
        }
        if (role) {
          await db.collection('admins').doc(uid).set({ role }, { merge: true });
        }
      } catch (err) {
        console.error('API Diagnostic Error [PATCH updates]:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
      }

      return res.status(200).json({ success: true, message: 'User updated' });
    }

    // DELETE /api/admin/users
    if (req.method === 'DELETE') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { uid } = req.query || {}; 

      if (!uid) return res.status(400).json({ success: false, error: 'Invalid request fields' });

      let targetDoc;
      try {
        targetDoc = await db.collection('admins').doc(uid).get();
      } catch (err) {
        console.error('API Diagnostic Error [Firestore DELETE GET]:', err);
        return res.status(500).json({ success: false, error: 'Firestore lookup failed' });
      }

      const targetData = targetDoc?.exists ? targetDoc.data() : null;
      const targetRole = targetData?.role;

      // Owner Protection
      if (targetRole === 'owner') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
      if (caller.role === 'admin' && targetRole === 'owner') {
         return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      try {
        await auth.deleteUser(uid);
        await db.collection('admins').doc(uid).delete();
      } catch (err) {
        console.error('API Diagnostic Error [DELETE]:', err);
        if (err?.code === 'auth/user-not-found') {
           return res.status(404).json({ success: false, error: 'User not found' });
        }
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
      }

      return res.status(200).json({ success: true, message: 'User deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('API Diagnostic Error [Unhandled]:', error?.stack || error);
    
    // Explicitly handle our known thrown errors from verifyTokenAndRole
    if (error?.message === 'Unauthorized') return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (error?.message === 'Forbidden') return res.status(403).json({ success: false, error: 'Forbidden' });
    if (error?.message === 'Firestore lookup failed') return res.status(500).json({ success: false, error: 'Firestore lookup failed' });

    // Catch-all
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

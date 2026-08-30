import admin from 'firebase-admin';

// Initialize Firebase Admin App securely if not already initialized
if (!admin.apps.length) {
  try {
    // Attempt to parse the private key safely (handles \n from Vercel env)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error.stack);
  }
}

const db = admin.firestore();
const auth = admin.auth();

// Middleware to verify Auth Token and extract current user role
const verifyTokenAndRole = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized - Missing or invalid token');
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if the user is in the /admins collection in Firestore
    const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
    
    if (!adminDoc.exists) {
      throw new Error('Forbidden - User has no assigned role');
    }

    const userData = adminDoc.data();
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role || 'viewer', // Default to safest role
    };
  } catch (error) {
    throw new Error(`Unauthorized - ${error.message}`);
  }
};

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const caller = await verifyTokenAndRole(req);

    // GET /api/admin/users
    // Lists all users from Firebase Auth and merges them with Firestore 'admins' roles
    if (req.method === 'GET') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions to view users' });
      }

      const listUsersResult = await auth.listUsers(1000); // Pagination could be added
      const authUsers = listUsersResult.users;

      // Fetch all roles from Firestore
      const rolesSnapshot = await db.collection('admins').get();
      const rolesMap = {};
      rolesSnapshot.forEach(doc => {
        rolesMap[doc.id] = doc.data().role;
      });

      const users = authUsers.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        role: rolesMap[user.uid] || 'user'
      }));

      return res.status(200).json({ users });
    }

    // POST /api/admin/users
    // Creates a new Firebase Auth user and assigns them a role
    if (req.method === 'POST') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }

      const { email, password, displayName, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' });
      }

      // Security Constraint: Admins cannot create owners
      if (caller.role === 'admin' && role === 'owner') {
        return res.status(403).json({ error: 'Forbidden - Admins cannot create owners' });
      }

      // Create the Auth User
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: displayName || '',
      });

      // Create the Role document
      await db.collection('admins').doc(userRecord.uid).set({
        role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ message: 'User created securely', uid: userRecord.uid });
    }

    // PATCH /api/admin/users
    // Updates a user's role or status
    if (req.method === 'PATCH') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }

      const { uid, role, disabled } = req.body;

      if (!uid) return res.status(400).json({ error: 'UID is required' });

      // Protect the Owner
      const targetDoc = await db.collection('admins').doc(uid).get();
      const targetRole = targetDoc.exists ? targetDoc.data().role : null;

      if (targetRole === 'owner') {
        // Only the exact same owner can modify their own non-destructive attributes, 
        // but no one (not even the owner) can demote/disable the owner via API
        if (role !== 'owner' || disabled === true) {
           return res.status(403).json({ error: 'Forbidden - Cannot modify, demote, or disable an Owner account' });
        }
      }

      if (caller.role === 'admin' && targetRole === 'owner') {
        return res.status(403).json({ error: 'Forbidden - Admins cannot manage an Owner' });
      }
      if (caller.role === 'admin' && role === 'owner') {
        return res.status(403).json({ error: 'Forbidden - Admins cannot promote to Owner' });
      }

      // Update Auth status if provided
      if (disabled !== undefined) {
        await auth.updateUser(uid, { disabled });
      }

      // Update Role if provided
      if (role) {
        await db.collection('admins').doc(uid).set({ role }, { merge: true });
      }

      return res.status(200).json({ message: 'User updated securely' });
    }

    // DELETE /api/admin/users
    if (req.method === 'DELETE') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }

      const { uid } = req.query; // Usually passed in query for DELETE

      if (!uid) return res.status(400).json({ error: 'UID is required' });

      // Protect Owner
      const targetDoc = await db.collection('admins').doc(uid).get();
      const targetRole = targetDoc.exists ? targetDoc.data().role : null;

      if (targetRole === 'owner') {
        return res.status(403).json({ error: 'Forbidden - Owner accounts cannot be deleted' });
      }
      if (caller.role === 'admin' && targetRole === 'owner') {
         return res.status(403).json({ error: 'Forbidden - Admins cannot manage an Owner' });
      }

      // Delete from Auth
      await auth.deleteUser(uid);
      
      // Delete from Firestore
      await db.collection('admins').doc(uid).delete();

      return res.status(200).json({ message: 'User deleted securely' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    // Be careful not to leak sensitive Firebase errors
    const message = error.message.includes('Unauthorized') || error.message.includes('Forbidden') 
      ? error.message 
      : 'Internal Server Error';
    return res.status(error.message.includes('Unauthorized') ? 401 : 500).json({ error: message });
  }
}

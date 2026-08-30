import admin from 'firebase-admin';

// Helper to initialize and retrieve Firebase Admin securely
const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !rawPrivateKey) {
      throw new Error('Firebase Admin credentials are not fully configured. Missing required environment variables.');
    }

    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return admin;
};

// Middleware to verify Auth Token and extract current user role
const verifyTokenAndRole = async (req, db, auth) => {
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
      throw new Error('Forbidden - User has no assigned role in admins collection');
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
    return res.status(200).json({ success: true });
  }

  try {
    // 1. Initialize Firebase safely within the try-catch block
    const adminApp = getFirebaseAdmin();
    const db = adminApp.firestore();
    const auth = adminApp.auth();

    // 2. Verify caller authentication and role
    const caller = await verifyTokenAndRole(req, db, auth);

    // GET /api/admin/users
    // Lists all users from Firebase Auth and merges them with Firestore 'admins' roles
    if (req.method === 'GET') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden - Insufficient permissions to view users' });
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

      return res.status(200).json({ success: true, users });
    }

    // POST /api/admin/users
    // Creates a new Firebase Auth user and assigns them a role
    if (req.method === 'POST') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden - Insufficient permissions' });
      }

      const { email, password, displayName, role } = req.body || {};

      if (!email || !password || !role) {
        return res.status(400).json({ success: false, error: 'Email, password, and role are required' });
      }

      // Security Constraint: Admins cannot create owners
      if (caller.role === 'admin' && role === 'owner') {
        return res.status(403).json({ success: false, error: 'Forbidden - Admins cannot create owners' });
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

      return res.status(201).json({ success: true, message: 'User created securely', uid: userRecord.uid });
    }

    // PATCH /api/admin/users
    // Updates a user's role or status
    if (req.method === 'PATCH') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden - Insufficient permissions' });
      }

      const { uid, role, disabled } = req.body || {};

      if (!uid) return res.status(400).json({ success: false, error: 'UID is required' });

      // Protect the Owner
      const targetDoc = await db.collection('admins').doc(uid).get();
      if (!targetDoc.exists) {
         return res.status(404).json({ success: false, error: 'Target user role record not found' });
      }
      const targetRole = targetDoc.data().role;

      if (targetRole === 'owner') {
        // Only the exact same owner can modify their own non-destructive attributes, 
        // but no one (not even the owner) can demote/disable the owner via API
        if (role !== 'owner' || disabled === true) {
           return res.status(403).json({ success: false, error: 'Forbidden - Cannot modify, demote, or disable an Owner account' });
        }
      }

      if (caller.role === 'admin' && targetRole === 'owner') {
        return res.status(403).json({ success: false, error: 'Forbidden - Admins cannot manage an Owner' });
      }
      if (caller.role === 'admin' && role === 'owner') {
        return res.status(403).json({ success: false, error: 'Forbidden - Admins cannot promote to Owner' });
      }

      // Update Auth status if provided
      if (disabled !== undefined) {
        await auth.updateUser(uid, { disabled });
      }

      // Update Role if provided
      if (role) {
        await db.collection('admins').doc(uid).set({ role }, { merge: true });
      }

      return res.status(200).json({ success: true, message: 'User updated securely' });
    }

    // DELETE /api/admin/users
    if (req.method === 'DELETE') {
      if (caller.role !== 'owner' && caller.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden - Insufficient permissions' });
      }

      const { uid } = req.query || {}; 

      if (!uid) return res.status(400).json({ success: false, error: 'UID is required' });

      // Protect Owner
      const targetDoc = await db.collection('admins').doc(uid).get();
      const targetRole = targetDoc.exists ? targetDoc.data().role : null;

      if (targetRole === 'owner') {
        return res.status(403).json({ success: false, error: 'Forbidden - Owner accounts cannot be deleted' });
      }
      if (caller.role === 'admin' && targetRole === 'owner') {
         return res.status(403).json({ success: false, error: 'Forbidden - Admins cannot manage an Owner' });
      }

      // Delete from Auth
      await auth.deleteUser(uid);
      
      // Delete from Firestore
      await db.collection('admins').doc(uid).delete();

      return res.status(200).json({ success: true, message: 'User deleted securely' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    
    let status = 500;
    let message = 'Internal Server Error';

    if (error.message.includes('Unauthorized')) {
      status = 401;
      message = error.message;
    } else if (error.message.includes('Forbidden')) {
      status = 403;
      message = error.message;
    } else if (error.code && error.code.startsWith('auth/')) {
       // Propagate specific Firebase Auth errors
       status = 400; // generally bad requests, like email-already-exists
       if (error.code === 'auth/email-already-exists') {
         status = 409;
       } else if (error.code === 'auth/user-not-found') {
         status = 404;
       }
       message = error.message;
    } else {
       // To avoid exposing sensitive keys, only return the message if it's explicitly generated by our code
       if (error.message.includes('Firebase Admin credentials are not fully configured')) {
         message = 'Server configuration error. Firebase Admin initialization failed.';
       }
    }
    
    // GUARANTEE valid JSON response
    return res.status(status).json({ success: false, error: message });
  }
}

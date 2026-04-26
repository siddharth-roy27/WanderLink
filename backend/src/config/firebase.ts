import * as admin from 'firebase-admin';
import * as serviceAccount from '../../firebase-admin.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;

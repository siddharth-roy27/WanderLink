# Firebase Integration Guide - WanderLink

## 🚀 Architecture Overview

```
Frontend (Next.js)
   ↓ Firebase Auth (login)
   ↓ gets token
   ↓
Backend (NestJS)
   ↓ verify Firebase token
   ↓
PostgreSQL (main DB)
```

**Firebase is used for:**
- ✅ Authentication (OTP, Google)
- ✅ Storage (images, files)
- ✅ Push Notifications (FCM)

**NOT used for:**
- ❌ Database (using PostgreSQL)
- ❌ Chat (using Socket.IO)

---

## 📋 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create Project** → Name it "WanderLink"
3. Enable these services:
   - ✅ Authentication
   - ✅ Storage
   - ✅ Cloud Messaging

---

## 🔐 Step 2: Setup Firebase Auth

### Enable Authentication Providers:

1. Go to **Authentication** → **Sign-in method**
2. Enable:
   - **Phone** (OTP)
   - **Google**

### For Phone Auth:
- No additional setup needed
- Make sure to add your domain to authorized domains

### For Google Auth:
- Download the Web SDK configuration
- Add authorized domains

---

## ⚛️ Step 3: Firebase Configuration (Frontend)

### 1. Get your Firebase config:
- Go to **Project Settings** → **General** → **Your apps**
- Click **Web app** icon
- Copy the config object

### 2. Update `.env.local`:

```bash
cd frontend
cp .env.local.example .env.local
```

Fill in these values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Firebase files created:

```
frontend/src/
├── lib/
│   ├── firebase.ts           # Firebase initialization
│   ├── firebase-auth.ts      # Authentication functions
│   ├── firebase-storage.ts   # Storage functions
│   └── api-auth.ts           # Backend API integration
├── hooks/
│   └── useFirebaseAuth.ts    # React auth hook
└── types/
    └── firebase.d.ts         # TypeScript declarations
```

---

## 📱 Step 4: Phone OTP Login

### Usage Example:

```typescript
import { sendOTP, verifyOTP } from '@/lib/firebase-auth';

// Step 1: Send OTP
const handleSendOTP = async () => {
  await sendOTP('+1234567890'); // Phone with country code
};

// Step 2: Verify OTP
const handleVerifyOTP = async (code: string) => {
  const { user, token } = await verifyOTP(code);
  console.log('User:', user);
  console.log('Firebase Token:', token);
};
```

### Complete Login Component:

See `frontend/src/components/LoginPage.tsx` for a complete example.

---

## 🔄 Step 5: Connect Firebase Auth with Backend

After successful Firebase login, send the token to your NestJS backend:

```typescript
import { completeLoginFlow } from '@/lib/api-auth';

const handleLogin = async (firebaseToken: string) => {
  const response = await completeLoginFlow(firebaseToken);
  // Backend returns JWT token
  localStorage.setItem('backendToken', response.token);
};
```

### Using the React Hook:

```typescript
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

function MyComponent() {
  const { user, loading, isAuthenticated, backendToken } = useFirebaseAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <LoginPage />;

  return <div>Welcome, {user.email}!</div>;
}
```

---

## 🧩 Step 6: Verify Token in NestJS Backend

### 1. Install Firebase Admin SDK:

```bash
cd backend
npm install firebase-admin
```

### 2. Download Service Account Key:

- Go to **Firebase Console** → **Project Settings** → **Service accounts**
- Click **Generate new private key**
- Save as `firebase-admin.json` in backend root

### 3. Create Firebase Config:

```typescript
// backend/src/config/firebase.ts
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../firebase-admin.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
```

### 4. Create Auth Guard:

```typescript
// backend/src/auth/firebase-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import admin from '../config/firebase';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### 5. Create Auth Endpoint:

```typescript
// backend/src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth')
export class AuthController {
  @Post('firebase-login')
  @UseGuards(FirebaseAuthGuard)
  async firebaseLogin(@Request() req) {
    const firebaseUser = req.user;
    
    // Find or create user in PostgreSQL
    const user = await this.authService.findOrCreateUser(firebaseUser);
    
    // Generate backend JWT token
    const token = this.authService.generateToken(user);
    
    return { user, token };
  }
}
```

---

## 📸 Step 7: Image Upload (Trips / Profile)

### Usage Example:

```typescript
import { uploadImage, uploadMultipleImages } from '@/lib/firebase-storage';

// Upload single image
const handleUpload = async (file: File) => {
  const url = await uploadImage(file, 'trips');
  console.log('Download URL:', url);
  
  // Store URL in PostgreSQL
  await saveToDatabase({ imageUrl: url });
};

// Upload multiple images
const handleMultipleUpload = async (files: File[]) => {
  const urls = await uploadMultipleImages(files, 'trip-gallery');
  console.log('URLs:', urls);
};
```

### Delete File:

```typescript
import { deleteFile } from '@/lib/firebase-storage';

await deleteFile(fileUrl);
```

---

## 🔔 Step 8: Push Notifications (Optional)

### 1. Enable FCM in Firebase Console:

- Go to **Cloud Messaging**
- Note your **Server Key**

### 2. Get FCM Token (Frontend):

```typescript
import { getMessaging, getToken } from 'firebase/messaging';
import { app } from '@/lib/firebase';

const messaging = getMessaging(app);

const getFCMToken = async () => {
  const token = await getToken(messaging, {
    vapidKey: 'YOUR_VAPID_KEY', // From Firebase Console
  });
  return token;
};
```

### 3. Send Notification (Backend):

```typescript
// backend/src/notifications/notifications.service.ts
import * as admin from 'firebase-admin';

async sendPushNotification(token: string, title: string, body: string) {
  await admin.messaging().send({
    token,
    notification: {
      title,
      body,
    },
  });
}
```

---

## 🧪 Testing

### 1. Test Phone Auth:

- Use test phone numbers in Firebase Console
- Add reCAPTCHA verification if needed

### 2. Test Google Auth:

- Make sure OAuth consent screen is configured
- Add authorized domains

### 3. Test Storage:

- Upload test images
- Verify download URLs work

---

## 🔒 Security Rules

### Firebase Storage Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Firestore Rules (if used):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## 🐛 Troubleshooting

### Common Issues:

1. **reCAPTCHA not showing**
   - Make sure domain is authorized in Firebase Console
   - Check if `recaptcha-container` div exists

2. **Invalid API key**
   - Verify `.env.local` values
   - Restart Next.js dev server

3. **CORS errors**
   - Add your domain to Firebase authorized domains
   - Configure CORS in Google Cloud Console

4. **Token verification fails**
   - Check if Firebase Admin SDK is properly configured
   - Verify service account key is correct

---

## ✅ Checklist

- [ ] Created Firebase project
- [ ] Enabled Authentication (Phone, Google)
- [ ] Enabled Storage
- [ ] Updated `.env.local` with Firebase config
- [ ] Installed Firebase dependencies
- [ ] Created Firebase config files
- [ ] Setup Firebase Admin in backend
- [ ] Created auth guard in backend
- [ ] Tested login flow
- [ ] Tested image upload
- [ ] Configured security rules

---

**Last Updated:** April 26, 2026

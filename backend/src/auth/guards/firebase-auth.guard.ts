import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import admin from '../config/firebase';

/**
 * Firebase Authentication Guard
 * Verifies Firebase ID tokens from client requests
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Attach user info to request
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        phoneNumber: decodedToken.phone_number,
        name: decodedToken.name,
        picture: decodedToken.picture,
        firebaseToken: decodedToken,
      };

      return true;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

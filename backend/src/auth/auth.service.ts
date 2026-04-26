import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  /**
   * Find existing user or create new user in PostgreSQL
   */
  async findOrCreateUser(firebaseUser: any) {
    // TODO: Implement database lookup
    // Example with Prisma:
    // let user = await prisma.user.findUnique({
    //   where: { firebaseUid: firebaseUser.uid }
    // });

    // if (!user) {
    //   user = await prisma.user.create({
    //     data: {
    //       firebaseUid: firebaseUser.uid,
    //       email: firebaseUser.email,
    //       name: firebaseUser.name,
    //       phone: firebaseUser.phoneNumber,
    //       avatar: firebaseUser.picture,
    //     }
    //   });
    // }

    // Mock user for now
    const user = {
      id: '1',
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || null,
      name: firebaseUser.name || null,
      phone: firebaseUser.phoneNumber || null,
      avatar: firebaseUser.picture || null,
    };

    return user;
  }

  /**
   * Generate JWT token for backend authentication
   */
  generateToken(user: any): string {
    const payload = {
      sub: user.id,
      uid: user.firebaseUid,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  /**
   * Verify backend JWT token
   */
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Firebase Login Endpoint
   * Accepts Firebase ID token and returns backend JWT token
   */
  @Post('firebase-login')
  @UseGuards(FirebaseAuthGuard)
  async firebaseLogin(@Request() req) {
    const firebaseUser = req.user;

    try {
      // Find or create user in PostgreSQL
      const user = await this.authService.findOrCreateUser(firebaseUser);

      // Generate backend JWT token
      const token = this.authService.generateToken(user);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
        },
        token,
      };
    } catch (error) {
      console.error('Error in firebase login:', error);
      throw error;
    }
  }

  /**
   * Verify backend authentication
   */
  @Post('verify')
  @UseGuards(FirebaseAuthGuard)
  async verifyAuth(@Request() req) {
    return {
      success: true,
      user: req.user,
    };
  }
}

import { useState } from 'react';
import { sendOTP, verifyOTP, signInWithGoogle } from '@/lib/firebase-auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendOTP(phone);
      toast.success('OTP sent successfully!');
      setShowOTPInput(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, token } = await verifyOTP(otp);
      toast.success('Login successful!');
      
      // TODO: Send token to backend
      console.log('Firebase Token:', token);
      console.log('User:', user);
      
      // Redirect to dashboard or home
      // window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const { user, token } = await signInWithGoogle();
      toast.success('Google login successful!');
      
      // TODO: Send token to backend
      console.log('Firebase Token:', token);
      console.log('User:', user);
      
      // Redirect to dashboard or home
      // window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to WanderLink
          </h2>
        </div>

        {/* Google Sign In */}
        <div>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with phone</span>
          </div>
        </div>

        {/* Phone OTP Login */}
        <form className="mt-8 space-y-6" onSubmit={showOTPInput ? handleVerifyOTP : handleSendOTP}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!showOTPInput ? (
              <div>
                <label htmlFor="phone" className="sr-only">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="otp" className="sr-only">
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* reCAPTCHA container */}
          {!showOTPInput && <div id="recaptcha-container" />}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : showOTPInput
                ? 'Verify OTP'
                : 'Send OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

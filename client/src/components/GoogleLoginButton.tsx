'use client';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';

export default function GoogleLoginButton() {
  const { setAuth } = useAuth();
  const router = useRouter();
  
  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    
    try {
      const result = await api.post('/oauth/google', {
        credential: response.credential,
      });
      
      setAuth(result.data.token, result.data.user);
      router.push('/');
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Google login failed. Please try again.');
    }
  };
  
  const handleError = () => {
    alert('Google login failed');
  };
  
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
      <div className="inline-block">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
    </GoogleOAuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

const AUTH_URL = 'http://localhost/Caril-Finals/backend/auth.php';
const GOOGLE_CLIENT_ID = '135384905767-qik0dtcauptqjbusdatmabbcocrodbf7.apps.googleusercontent.com'; // Replace with your actual Client ID

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', padding: '2rem' },
  header: { textAlign: 'center' as const, marginBottom: '2rem' },
  title: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', padding: '0' },
  tab: { flex: 1, padding: '0.75rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, color: '#6b7280', borderBottom: '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' },
  tabActive: { color: '#2563eb', borderBottom: '2px solid #2563eb' },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' },
  inputWrapper: { position: 'relative' as const },
  input: { width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', transition: 'border-color 0.2s' },
  inputIcon: { position: 'absolute' as const, left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background-color 0.2s', marginTop: '1.5rem' },
  error: { backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #fecaca' },
  success: { backgroundColor: '#f0fdf4', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #bbf7d0' },
  divider: { display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#9ca3af', fontSize: '0.875rem' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#e5e7eb' },
  dividerText: { padding: '0 1rem' },
  googleButton: { width: '100%', padding: '0.75rem', backgroundColor: 'white', color: '#3c4043', border: '1px solid #dadce0', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'background-color 0.2s', marginBottom: '1rem' }
};

declare global {
  interface Window {
    google: any;
  }
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: 'popup',
            context: 'signin'
          });
          
          // Render the button instead of using prompt
          const buttonDiv = document.getElementById('google-signin-button');
          if (buttonDiv) {
            window.google.accounts.id.renderButton(
              buttonDiv,
              { 
                theme: 'outline', 
                size: 'large',
                width: '100%',
                text: 'continue_with',
                shape: 'rectangular'
              }
            );
          }
          
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
          setError('Failed to initialize Google Sign-In. Check your Client ID.');
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
      setError('Failed to load Google Sign-In');
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setError('');
    setLoading(true);

    try {
      const token = response.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userInfo = JSON.parse(jsonPayload);

      const apiResponse = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google-login',
          google_id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name
        })
      });

      const data = await apiResponse.json();

      if (data.error) {
        setError(data.error);
      } else if (data.success) {
        setSuccess('Google login successful!');
        setTimeout(() => {
          onLogin(data.user);
        }, 500);
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setError('');
    
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '135384905767-qik0dtcauptqjbusdatmabbcocrodbf7.apps.googleusercontent.com') {
      setError('Google Client ID is not configured. Please add your Client ID.');
      return;
    }

    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Prompt not displayed, reason:', notification.getNotDisplayedReason());
            setError('Google Sign-In popup was blocked. Please try again.');
          }
        });
      } catch (error) {
        console.error('Error showing Google prompt:', error);
        setError('Failed to show Google Sign-In. Please try again.');
      }
    } else {
      setError('Google Sign-In not loaded yet. Please refresh the page and try again.');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (isLogin) {
      if (!formData.username || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
    } else {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          onLogin(data.user);
        }, 500);
      }
    } catch (err) {
      setError('Connection error. Please check if Laragon is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Task Management</h1>
          <p style={styles.subtitle}>Organize your tasks efficiently</p>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
          >
            Register
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <div id="google-signin-button" style={{ marginBottom: '1rem' }}></div>

        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine}></div>
        </div>

        <div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}>
                <User size={18} />
              </div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                onKeyPress={handleKeyPress}
                style={styles.input}
                placeholder="Enter your username"
              />
            </div>
          </div>

          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIcon}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyPress={handleKeyPress}
                  style={styles.input}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyPress={handleKeyPress}
                style={styles.input}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIcon}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onKeyPress={handleKeyPress}
                  style={styles.input}
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              'Please wait...'
            ) : isLogin ? (
              <>
                <LogIn size={20} />
                Login
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Register
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
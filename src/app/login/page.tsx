'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // 👉 Replace later with Firebase signInWithEmailAndPassword
    // signInWithEmailAndPassword(auth, email, password)
    console.log('Login:', { email, password });

    // ✅ redirect
    router.push('/dashboard');
  } catch {
    setError('Invalid credentials. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleGoogle = async () => {
  setLoading(true);
  setError('');

  try {
    await signInWithGoogle();

    // ✅ redirect
    router.push('/dashboard');
  } catch {
    setError('Google sign-in failed.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      {/* Animated grid background */}
      <div className="grid-bg" aria-hidden />
      <div className="corner-tl" aria-hidden />
      <div className="corner-br" aria-hidden />

      <div className="auth-container">
        {/* Logo / Brand */}
        <div className="brand">
          <div className="brand-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="var(--color-cyan)" strokeWidth="1.5" strokeDasharray="4 2" className="spin-slow" />
              <circle cx="20" cy="20" r="10" stroke="var(--color-cyan)" strokeWidth="1" opacity="0.5" />
              <circle cx="20" cy="20" r="3" fill="var(--color-cyan)" />
              <line x1="20" y1="2" x2="20" y2="10" stroke="var(--color-cyan)" strokeWidth="1.5" />
              <line x1="20" y1="30" x2="20" y2="38" stroke="var(--color-cyan)" strokeWidth="1.5" />
              <line x1="2" y1="20" x2="10" y2="20" stroke="var(--color-cyan)" strokeWidth="1.5" />
              <line x1="30" y1="20" x2="38" y2="20" stroke="var(--color-cyan)" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">ARIA</span>
            <span className="brand-sub">ADAPTIVE INTELLIGENCE AGENT</span>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card glow-box">
          <div className="card-header">
            <div className="section-label">SECURE ACCESS</div>
            <h1 className="card-title">Sign In</h1>
            <p className="card-desc">
              Access your sessions, analytics, and performance data.
            </p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-dot" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`field ${focused === 'email' ? 'field--focused' : ''} ${email ? 'field--filled' : ''}`}>
              <label className="field-label" htmlFor="email">EMAIL ADDRESS</label>
              <div className="field-wrap">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className="field-input"
                  required
                />
                <div className="field-line" />
              </div>
            </div>

            <div className={`field ${focused === 'password' ? 'field--focused' : ''} ${password ? 'field--filled' : ''}`}>
              <label className="field-label" htmlFor="password">PASSWORD</label>
              <div className="field-wrap">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="field-input"
                  required
                />
                <div className="field-line" />
              </div>
            </div>

            <div className="form-actions">
              <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                </span>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">OR CONTINUE WITH</span>
            <span className="divider-line" />
          </div>

          <button className="btn-google" onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="auth-link">Create account</Link>
          </p>
        </div>

        {/* Status bar */}
        <div className="status-bar">
          <span className="status-dot status-dot--active" />
          <span className="status-text">SYSTEM ONLINE</span>
          <span className="status-sep">·</span>
          <span className="status-text">TLS 1.3 ENCRYPTED</span>
          <span className="status-sep">·</span>
          <span className="status-text">v2.4.1</span>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background-color: var(--color-bg-void);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Animated grid */
        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridPan 20s linear infinite;
          pointer-events: none;
        }
        @keyframes gridPan {
          0% { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }

        /* Corner decorators */
        .corner-tl, .corner-br {
          position: fixed;
          width: 300px;
          height: 300px;
          pointer-events: none;
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 50%;
        }
        .corner-tl {
          top: -100px;
          left: -100px;
          background: radial-gradient(circle at 30% 30%, rgba(0,229,255,0.04), transparent 70%);
        }
        .corner-br {
          bottom: -100px;
          right: -100px;
          background: radial-gradient(circle at 70% 70%, rgba(0,229,255,0.04), transparent 70%);
        }

        .auth-container {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        /* Brand */
        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .brand-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }
        .brand-icon svg {
          width: 100%;
          height: 100%;
        }
        .spin-slow {
          transform-origin: center;
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .brand-name {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--color-cyan);
          line-height: 1;
          text-shadow: 0 0 20px rgba(0,229,255,0.4);
        }
        .brand-sub {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.2em;
          color: var(--color-text-muted);
        }

        /* Card */
        .auth-card {
          background: var(--color-bg-card);
          border-radius: 12px;
          padding: 36px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--color-text-primary);
          line-height: 1;
        }
        .card-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        /* Error */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--color-red-dim);
          border: 1px solid rgba(255, 61, 87, 0.3);
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.05em;
          color: var(--color-red);
        }
        .error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-red);
          flex-shrink: 0;
        }

        /* Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Field */
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.2em;
          color: var(--color-text-muted);
          transition: color 0.2s;
        }
        .field--focused .field-label {
          color: var(--color-cyan);
        }
        .field-wrap {
          position: relative;
        }
        .field-input {
          width: 100%;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 12px 14px;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-primary);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus {
          border-color: var(--color-cyan);
          box-shadow: 0 0 0 3px rgba(0,229,255,0.08);
        }
        .field-line {
          position: absolute;
          bottom: 0;
          left: 14px;
          right: 14px;
          height: 1px;
          background: var(--color-cyan);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          border-radius: 1px;
        }
        .field--focused .field-line {
          transform: scaleX(1);
        }

        /* Form actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
        }
        .forgot-link {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-link:hover {
          color: var(--color-cyan);
        }

        /* Primary button */
        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,229,255,0.08));
          border: 1px solid var(--color-cyan);
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: var(--color-cyan);
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,229,255,0.2), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .btn-primary:hover:not(:disabled)::before {
          opacity: 1;
        }
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 0 24px rgba(0,229,255,0.25);
          transform: translateY(-1px);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Loading dots */
        .btn-loading {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .loading-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--color-cyan);
          animation: loadingPulse 1s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.15s; }
        .loading-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes loadingPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--color-border);
        }
        .divider-text {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        /* Google button */
        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 12px 24px;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-google:hover:not(:disabled) {
          border-color: rgba(0,229,255,0.2);
          color: var(--color-text-primary);
        }
        .btn-google:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Switch */
        .auth-switch {
          text-align: center;
          font-size: 13px;
          color: var(--color-text-muted);
        }
        .auth-link {
          color: var(--color-cyan);
          text-decoration: none;
          font-weight: 500;
          transition: text-shadow 0.2s;
        }
        .auth-link:hover {
          text-shadow: 0 0 12px rgba(0,229,255,0.5);
        }

        /* Status bar */
        .status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .status-dot--active {
          background: var(--color-green);
          box-shadow: 0 0 8px var(--color-green);
          animation: blink 2s ease-in-out infinite;
        }
        .status-text {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--color-text-muted);
        }
        .status-sep {
          color: var(--color-border);
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .auth-card { padding: 24px; }
          .card-title { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}
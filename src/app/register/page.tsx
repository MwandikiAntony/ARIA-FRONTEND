'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type UseCase = 'navigation' | 'coach' | 'both';

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  // Step 1 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 fields
  const [fullName, setFullName] = useState('');
  const [useCase, setUseCase] = useState<UseCase | null>(null);

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'WEAK', 'FAIR', 'GOOD', 'STRONG'][passwordStrength];
  const strengthColor = ['', 'var(--color-red)', 'var(--color-amber)', 'var(--color-cyan-dim)', 'var(--color-green)'][passwordStrength];

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (passwordStrength < 2) {
      setError('Please choose a stronger password.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useCase) { setError('Please select a use case.'); return; }
    setLoading(true);
    setError('');
    try {
      // TODO: integrate with Firebase Auth / backend
      await new Promise((r) => setTimeout(r, 1400));
      console.log('Register:', { email, password, fullName, useCase });
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      setError('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="grid-bg" aria-hidden />
      <div className="corner-tl" aria-hidden />
      <div className="corner-br" aria-hidden />

      <div className="auth-container">
        {/* Brand */}
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
          {/* Step indicator */}
          <div className="step-indicator">
            <div className={`step-item ${step >= 1 ? 'step-item--active' : ''}`}>
              <div className="step-dot">{step > 1 ? '✓' : '1'}</div>
              <span className="step-label">CREDENTIALS</span>
            </div>
            <div className={`step-track ${step >= 2 ? 'step-track--active' : ''}`} />
            <div className={`step-item ${step >= 2 ? 'step-item--active' : ''}`}>
              <div className="step-dot">2</div>
              <span className="step-label">PROFILE</span>
            </div>
          </div>

          <div className="card-header">
            <div className="section-label">
              {step === 1 ? 'CREATE ACCOUNT' : 'PERSONALIZE'}
            </div>
            <h1 className="card-title">
              {step === 1 ? 'Register' : 'Your Setup'}
            </h1>
            <p className="card-desc">
              {step === 1
                ? 'Create your ARIA account to unlock sessions, analytics, and real-time coaching.'
                : 'Tell us how you\'ll use ARIA so we can optimize your experience.'}
            </p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-dot" />
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1} className="auth-form">
              <div className={`field ${focused === 'email' ? 'field--focused' : ''}`}>
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

              <div className={`field ${focused === 'password' ? 'field--focused' : ''}`}>
                <label className="field-label" htmlFor="password">PASSWORD</label>
                <div className="field-wrap">
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    className="field-input"
                    required
                  />
                  <div className="field-line" />
                </div>
                {password && (
                  <div className="strength-row">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="strength-bar"
                          style={{
                            background: n <= passwordStrength ? strengthColor : 'var(--color-border)',
                            opacity: n <= passwordStrength ? 1 : 0.4,
                          }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className={`field ${focused === 'confirm' ? 'field--focused' : ''}`}>
                <label className="field-label" htmlFor="confirm">CONFIRM PASSWORD</label>
                <div className="field-wrap">
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused(null)}
                    className="field-input"
                    required
                  />
                  <div className="field-line" />
                  {confirmPassword && confirmPassword !== password && (
                    <span className="field-error">Passwords do not match</span>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-primary">
                <span>CONTINUE</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="divider">
                <span className="divider-line" />
                <span className="divider-text">OR REGISTER WITH</span>
                <span className="divider-line" />
              </div>

              <button type="button" className="btn-google" onClick={handleGoogle} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className={`field ${focused === 'name' ? 'field--focused' : ''}`}>
                <label className="field-label" htmlFor="name">FULL NAME</label>
                <div className="field-wrap">
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    className="field-input"
                    required
                  />
                  <div className="field-line" />
                </div>
              </div>

              <div className="use-case-group">
                <label className="field-label">PRIMARY USE CASE</label>
                <div className="use-case-grid">
                  {([
                    {
                      id: 'navigation' as UseCase,
                      icon: '🧭',
                      label: 'NAVIGATION',
                      desc: 'Outdoor guidance & obstacle detection',
                    },
                    {
                      id: 'coach' as UseCase,
                      icon: '🎯',
                      label: 'COACH',
                      desc: 'Communication & performance coaching',
                    },
                    {
                      id: 'both' as UseCase,
                      icon: '⚡',
                      label: 'BOTH MODES',
                      desc: 'Full platform access',
                    },
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`use-case-card ${useCase === option.id ? 'use-case-card--selected' : ''}`}
                      onClick={() => setUseCase(option.id)}
                    >
                      <span className="use-case-icon">{option.icon}</span>
                      <span className="use-case-label">{option.label}</span>
                      <span className="use-case-desc">{option.desc}</span>
                      {useCase === option.id && <div className="use-case-check">✓</div>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="terms-row">
                <input type="checkbox" id="terms" className="terms-checkbox" required />
                <label htmlFor="terms" className="terms-label">
                  I agree to the{' '}
                  <a href="#" className="auth-link">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="auth-link">Privacy Policy</a>
                </label>
              </div>

              <div className="btn-row">
                <button type="button" className="btn-back" onClick={() => { setStep(1); setError(''); }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  BACK
                </button>
                <button type="submit" className="btn-primary btn-primary--grow" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading">
                      <span className="loading-dot" />
                      <span className="loading-dot" />
                      <span className="loading-dot" />
                    </span>
                  ) : (
                    <>
                      <span>CREATE ACCOUNT</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="auth-switch">
            Already have an account?{' '}
            <Link href="/login" className="auth-link">Sign in</Link>
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
        .corner-tl, .corner-br {
          position: fixed;
          width: 300px;
          height: 300px;
          pointer-events: none;
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 50%;
        }
        .corner-tl { top: -100px; left: -100px; background: radial-gradient(circle at 30% 30%, rgba(0,229,255,0.04), transparent 70%); }
        .corner-br { bottom: -100px; right: -100px; background: radial-gradient(circle at 70% 70%, rgba(0,229,255,0.04), transparent 70%); }

        .auth-container {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        .brand { display: flex; align-items: center; gap: 16px; }
        .brand-icon { width: 48px; height: 48px; flex-shrink: 0; }
        .brand-icon svg { width: 100%; height: 100%; }
        .spin-slow { transform-origin: center; animation: spin 12s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .brand-text { display: flex; flex-direction: column; gap: 2px; }
        .brand-name {
          font-family: var(--font-display);
          font-size: 28px; font-weight: 700; letter-spacing: 0.2em;
          color: var(--color-cyan); line-height: 1;
          text-shadow: 0 0 20px rgba(0,229,255,0.4);
        }
        .brand-sub {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 500; letter-spacing: 0.2em;
          color: var(--color-text-muted);
        }

        .auth-card {
          background: var(--color-bg-card);
          border-radius: 12px;
          padding: 36px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Step indicator */
        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0.4;
          transition: opacity 0.3s;
        }
        .step-item--active { opacity: 1; }
        .step-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid var(--color-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          color: var(--color-cyan);
          background: rgba(0,229,255,0.08);
          flex-shrink: 0;
        }
        .step-item--active .step-dot {
          background: rgba(0,229,255,0.15);
          box-shadow: 0 0 12px rgba(0,229,255,0.3);
        }
        .step-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--color-text-muted);
        }
        .step-item--active .step-label { color: var(--color-cyan); }
        .step-track {
          flex: 1;
          height: 1px;
          background: var(--color-border);
          transition: background 0.3s;
        }
        .step-track--active { background: var(--color-cyan); }

        .card-header { display: flex; flex-direction: column; gap: 8px; }
        .card-title {
          font-family: var(--font-display);
          font-size: 32px; font-weight: 700; letter-spacing: 0.05em;
          color: var(--color-text-primary); line-height: 1;
        }
        .card-desc { font-size: 14px; color: var(--color-text-secondary); line-height: 1.5; }

        .error-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          background: var(--color-red-dim);
          border: 1px solid rgba(255,61,87,0.3);
          border-radius: 6px;
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.05em;
          color: var(--color-red);
        }
        .error-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-red); flex-shrink: 0; }

        .auth-form { display: flex; flex-direction: column; gap: 20px; }

        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-family: var(--font-mono); font-size: 9px; font-weight: 500;
          letter-spacing: 0.2em; color: var(--color-text-muted); transition: color 0.2s;
        }
        .field--focused .field-label { color: var(--color-cyan); }
        .field-wrap { position: relative; }
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
          position: absolute; bottom: 0; left: 14px; right: 14px; height: 1px;
          background: var(--color-cyan); transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s ease; border-radius: 1px;
        }
        .field--focused .field-line { transform: scaleX(1); }
        .field-error {
          font-family: var(--font-mono); font-size: 9px; color: var(--color-red);
          letter-spacing: 0.1em; margin-top: 4px; display: block;
        }

        /* Password strength */
        .strength-row {
          display: flex; align-items: center; gap: 8px; margin-top: 4px;
        }
        .strength-bars { display: flex; gap: 3px; }
        .strength-bar {
          width: 28px; height: 3px; border-radius: 2px;
          transition: background 0.3s, opacity 0.3s;
        }
        .strength-label {
          font-family: var(--font-mono); font-size: 9px; font-weight: 600;
          letter-spacing: 0.15em; transition: color 0.3s;
        }

        /* Use case */
        .use-case-group { display: flex; flex-direction: column; gap: 10px; }
        .use-case-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .use-case-card {
          position: relative;
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 16px 12px;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .use-case-card:hover {
          border-color: rgba(0,229,255,0.3);
        }
        .use-case-card--selected {
          border-color: var(--color-cyan);
          background: rgba(0,229,255,0.06);
          box-shadow: 0 0 16px rgba(0,229,255,0.1);
        }
        .use-case-icon { font-size: 20px; }
        .use-case-label {
          font-family: var(--font-mono); font-size: 9px; font-weight: 600;
          letter-spacing: 0.15em; color: var(--color-text-secondary);
        }
        .use-case-card--selected .use-case-label { color: var(--color-cyan); }
        .use-case-desc {
          font-size: 10px; color: var(--color-text-muted); line-height: 1.3;
        }
        .use-case-check {
          position: absolute; top: 6px; right: 8px;
          font-size: 10px; color: var(--color-cyan);
          font-family: var(--font-mono); font-weight: 700;
        }

        /* Terms */
        .terms-row {
          display: flex; align-items: flex-start; gap: 10px;
        }
        .terms-checkbox {
          margin-top: 2px; width: 14px; height: 14px;
          accent-color: var(--color-cyan);
          flex-shrink: 0; cursor: pointer;
        }
        .terms-label { font-size: 12px; color: var(--color-text-muted); line-height: 1.5; }

        /* Buttons */
        .btn-row { display: flex; gap: 10px; align-items: stretch; }
        .btn-back {
          display: flex; align-items: center; gap: 6px;
          padding: 14px 16px;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 600;
          letter-spacing: 0.15em; color: var(--color-text-muted);
          cursor: pointer; transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-back:hover { border-color: rgba(0,229,255,0.2); color: var(--color-text-secondary); }

        .btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 14px 24px;
          background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,229,255,0.08));
          border: 1px solid var(--color-cyan);
          border-radius: 6px;
          font-family: var(--font-mono); font-size: 12px; font-weight: 600;
          letter-spacing: 0.2em; color: var(--color-cyan);
          cursor: pointer; transition: all 0.25s;
          position: relative; overflow: hidden;
        }
        .btn-primary--grow { flex: 1; width: auto; }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(0,229,255,0.2), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .btn-primary:hover:not(:disabled)::before { opacity: 1; }
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 0 24px rgba(0,229,255,0.25);
          transform: translateY(-1px);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-loading { display: flex; gap: 6px; align-items: center; }
        .loading-dot {
          width: 5px; height: 5px; border-radius: 50%; background: var(--color-cyan);
          animation: loadingPulse 1s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.15s; }
        .loading-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes loadingPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        .divider { display: flex; align-items: center; gap: 12px; }
        .divider-line { flex: 1; height: 1px; background: var(--color-border); }
        .divider-text {
          font-family: var(--font-mono); font-size: 9px;
          letter-spacing: 0.15em; color: var(--color-text-muted); white-space: nowrap;
        }

        .btn-google {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 12px 24px;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-family: var(--font-body); font-size: 14px;
          color: var(--color-text-secondary);
          cursor: pointer; transition: all 0.2s;
        }
        .btn-google:hover:not(:disabled) { border-color: rgba(0,229,255,0.2); color: var(--color-text-primary); }
        .btn-google:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-switch { text-align: center; font-size: 13px; color: var(--color-text-muted); }
        .auth-link { color: var(--color-cyan); text-decoration: none; font-weight: 500; transition: text-shadow 0.2s; }
        .auth-link:hover { text-shadow: 0 0 12px rgba(0,229,255,0.5); }

        .status-bar { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot--active { background: var(--color-green); box-shadow: 0 0 8px var(--color-green); animation: blink 2s ease-in-out infinite; }
        .status-text { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.15em; color: var(--color-text-muted); }
        .status-sep { color: var(--color-border); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media (max-width: 480px) {
          .auth-card { padding: 24px; }
          .card-title { font-size: 26px; }
          .use-case-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function AdminRegister() {
  const { register, verifyCode, resendCode, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Step 1 = Admin Form, Step 2 = Enter 6-digit Email Authentication Code
  const [step, setStep] = useState(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Code Verification
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [devCode, setDevCode] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const codeInputRef = useRef(null);

  // If already authenticated as staff, redirect to admin
  useEffect(() => {
    if (isAuthenticated && !verifiedSuccess) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate, verifiedSuccess]);

  // Timer for resend code
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  useEffect(() => {
    if (step === 2 && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  // Handle Step 1: Submit Admin Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      if (res.dev_code) {
        setDevCode(res.dev_code);
      }
      setInfoMsg(res.message || 'Authentication code sent to your email.');
      setStep(2);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      const errMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Registration failed. Please check your information and try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify 6-digit code
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    const cleanCode = code.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) {
      setError('Please enter the full 6-digit authentication code.');
      return;
    }

    setLoading(true);

    try {
      await verifyCode(email.trim().toLowerCase(), cleanCode);
      setVerifiedSuccess(true);
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 1400);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.code?.[0] ||
        'Invalid or expired authentication code.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend
  const handleResend = async () => {
    if (!canResend || loading) return;
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      const res = await resendCode(email.trim().toLowerCase(), 'signup');
      if (res.dev_code) {
        setDevCode(res.dev_code);
      }
      setInfoMsg(`A fresh 6-digit authentication code was sent to ${email}`);
      setCountdown(60);
      setCanResend(false);
      setCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to resend code right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0E1B13',
        backgroundImage: `radial-gradient(rgba(201, 168, 106, 0.08) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#A2B4AA',
            fontSize: '0.85rem',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Return to Public Resort Site
        </Link>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: 'clamp(1.5rem, 5vw, 2.5rem)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <BrandLogo to="/" size="md" />
          </div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#B45309',
              backgroundColor: '#FEF3C7',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              marginBottom: '0.5rem',
            }}
          >
            Staff & Admin Portal
          </span>

          {step === 1 ? (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#111827' }}>
                New Admin Registration
              </h1>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '0.88rem' }}>
                Sign up as a resort administrator. An authentication code will be sent to your email to activate access.
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Mail size={24} />
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#111827' }}>
                Verify Admin Email
              </h1>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '0.88rem', lineHeight: 1.5 }}>
                We sent a 6-digit authentication code to<br />
                <strong style={{ color: '#111827' }}>{email}</strong>
              </p>
            </>
          )}
        </div>

        {/* Feedback Messages */}
        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && !error && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                <User size={15} style={{ color: 'var(--color-primary-700)' }} /> Administrator Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Resort Manager"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                <Mail size={15} style={{ color: 'var(--color-primary-700)' }} /> Staff Email Address
              </label>
              <input
                type="email"
                placeholder="admin@villula.co.ke"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                <Phone size={15} style={{ color: 'var(--color-primary-700)' }} /> Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+254 700 000 000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                <Lock size={15} style={{ color: 'var(--color-primary-700)' }} /> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                <Lock size={15} style={{ color: 'var(--color-primary-700)' }} /> Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-type password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                justifyContent: 'center',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Sending Code...' : (
                <>
                  Send 6-Digit Email Code <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
              Already registered as staff?{' '}
              <Link to="/admin/login" style={{ color: 'var(--color-primary-700)', fontWeight: 700 }}>
                Sign In
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Enter 6-Digit Email Code */}
        {step === 2 && (
          <form onSubmit={handleVerifySubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            {verifiedSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle2 size={54} style={{ color: '#059669', marginBottom: '0.75rem' }} />
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#111827' }}>
                  Admin Email Verified!
                </h3>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
                  Opening Staff Property Management Dashboard…
                </p>
              </div>
            ) : (
              <>
                {devCode && (
                  <div
                    style={{
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FCD34D',
                      color: '#92400E',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      marginBottom: '1.25rem',
                      textAlign: 'center',
                    }}
                  >
                    <div><strong>Development Notice:</strong> Live email sending (SMTP) requires email credentials in <code>backend/.env</code>, so emails are logged to the console in dev mode.</div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>Your code:</span>
                      <strong style={{ fontSize: '1.3rem', letterSpacing: '4px', color: '#78350F', backgroundColor: '#FDE68A', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{devCode}</strong>
                      <button
                        type="button"
                        onClick={() => setCode(devCode)}
                        style={{
                          backgroundColor: '#92400E',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        Auto-fill Code
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Enter 6-Digit Authentication Code
                  </label>

                  <input
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.9rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #C9A86A',
                      textAlign: 'center',
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      letterSpacing: '8px',
                      fontFamily: 'monospace',
                      backgroundColor: '#FBFBFA',
                      color: '#163323',
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#6B7280', display: 'block', textAlign: 'center', marginTop: '0.5rem' }}>
                    Check your inbox or spam folder for an email from Villula Cabins Resort
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    justifyContent: 'center',
                  }}
                >
                  {loading ? 'Verifying...' : (
                    <>
                      <ShieldCheck size={18} /> Verify & Access Admin Dashboard
                    </>
                  )}
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setInfoMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6B7280',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      padding: 0,
                    }}
                  >
                    ← Edit staff email
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: canResend ? 'var(--color-primary-700)' : '#9CA3AF',
                      fontWeight: 600,
                      cursor: canResend ? 'pointer' : 'default',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.85rem',
                      padding: 0,
                    }}
                  >
                    <RefreshCw size={13} />
                    {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

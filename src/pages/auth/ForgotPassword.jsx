// pages/auth/ForgotPassword.jsx – multi-step: Email → OTP → New Password → Success
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Coffee, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import DecorativeBg from '../../components/DecorativeBg';

const OTP_LENGTH = 6;
const STEPS = ['email', 'otp', 'password', 'success'];

export default function ForgotPassword() {
  const [step,        setStep]        = useState('email');
  const [email,       setEmail]       = useState('');
  const [otp,         setOtp]         = useState(Array(OTP_LENGTH).fill(''));
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);

  const inputRefs = useRef([]);
  const addToast  = useToast();
  const navigate  = useNavigate();

  const stepVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -30 },
  };

  // ── Step 1: Send OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      addToast('OTP sent! Check your inbox.', 'success');
      setStep('otp');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ──
  const handleOtpChange = (i, val) => {
    const digit = val.replace(/\D/, '').slice(-1);
    const next  = [...otp];
    next[i]     = digit;
    setOtp(next);
    if (digit && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async () => {
    if (otp.join('').length < OTP_LENGTH) return addToast('Enter all 6 digits.', 'error');
    setStep('password');
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) return addToast('Passwords do not match.', 'error');
    if (newPass.length < 6)      return addToast('Password must be ≥ 6 characters.', 'error');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: otp.join(''), newPassword: newPass });
      setStep('success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '20px 16px' }}>
      <DecorativeBg />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(170,132,114,0.30)', marginBottom: 12 }}>
            <Coffee size={22} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Reset Password
          </h1>
        </div>

        <div className="card" style={{ padding: '36px 32px 30px', borderRadius: 28, overflow: 'hidden' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 99,
                background: STEPS.indexOf(step) >= i ? 'var(--color-primary)' : 'var(--border)',
                transition: 'background 0.35s ease',
              }} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Email ── */}
            {step === 'email' && (
              <motion.div key="email" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: '0.8375rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 22 }}>
                  <ArrowLeft size={14} /> Back to login
                </Link>
                <p className="section-label" style={{ marginBottom: 6 }}>✦ Step 1 of 3</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px' }}>Enter your email</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 22 }}>
                  We'll send a one-time code to reset your password.
                </p>
                <form onSubmit={handleSendOtp}>
                  <div style={{ position: 'relative', marginBottom: 20 }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" style={{ paddingLeft: 38 }} required autoFocus />
                  </div>
                  <button id="forgot-send" type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px 0', fontSize: '0.9375rem', borderRadius: 14 }}>
                    {loading ? <span className="spin" style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' }} /> : 'Send Code →'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <button onClick={() => setStep('email')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: '0.8375rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 22 }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <p className="section-label" style={{ marginBottom: 6 }}>✦ Step 2 of 3</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px' }}>Enter OTP</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                  Check your inbox at <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
                <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginBottom: 24 }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      style={{
                        width: 46, height: 56, textAlign: 'center',
                        fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-sans)',
                        color: 'var(--text-primary)', background: 'var(--bg-subtle)',
                        border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--border)'}`,
                        borderRadius: 12, outline: 'none', transition: 'border-color 0.2s',
                      }}
                    />
                  ))}
                </div>
                <button id="forgot-verify" onClick={handleVerifyOtp} className="btn btn-primary" style={{ width: '100%', padding: '13px 0', fontSize: '0.9375rem', borderRadius: 14 }}>
                  Verify Code →
                </button>
              </motion.div>
            )}

            {/* ── Step 3: New Password ── */}
            {step === 'password' && (
              <motion.div key="password" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <button onClick={() => setStep('otp')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: '0.8375rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 22 }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <p className="section-label" style={{ marginBottom: 6 }}>✦ Step 3 of 3</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px' }}>New Password</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 22 }}>
                  Choose a strong password.
                </p>
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input id="new-pass" type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password" className="input" style={{ paddingLeft: 38, paddingRight: 40 }} required />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input id="confirm-pass" type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm password" className="input" style={{ paddingLeft: 38 }} required />
                  </div>
                  <button id="reset-submit" type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px 0', fontSize: '0.9375rem', borderRadius: 14 }}>
                    {loading ? <span className="spin" style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' }} /> : 'Reset Password →'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step 4: Success ── */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle size={52} color="var(--color-success)" style={{ marginBottom: 16 }} />
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Password reset!
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 28 }}>
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%', padding: '13px 0', fontSize: '0.9375rem', borderRadius: 14 }}>
                  Go to Login →
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

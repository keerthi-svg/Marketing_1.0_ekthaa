// pages/auth/OtpVerification.jsx – 6-digit OTP page with countdown & resend
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import DecorativeBg from '../../components/DecorativeBg';

const OTP_LENGTH  = 6;
const RESEND_WAIT = 30; // seconds before resend is allowed

export default function OtpVerification() {
  const [otp,       setOtp]       = useState(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(5 * 60); // 5 min timer
  const [resendCD,  setResendCD]  = useState(RESEND_WAIT);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs   = useRef([]);
  const { verifyOtp } = useAuth();
  const addToast    = useToast();
  const navigate    = useNavigate();
  const location    = useLocation();
  const email       = location.state?.email || '';
  const devOtp      = location.state?.devOtp || '';

  // Auto-fill OTP boxes in dev mode
  useEffect(() => {
    if (devOtp && devOtp.length === OTP_LENGTH) {
      setOtp(devOtp.split(''));
    }
  }, [devOtp]);

  // ── OTP 5-min countdown ──
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // ── Resend cooldown ──
  useEffect(() => {
    if (resendCD <= 0) return;
    const t = setInterval(() => setResendCD(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCD]);

  const fmt = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Input handling: auto-advance on type, back on delete ──
  const handleChange = (i, val) => {
    const digit = val.replace(/\D/, '').slice(-1);
    const next  = [...otp];
    next[i]     = digit;
    setOtp(next);
    if (digit && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next   = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  // ── Submit ──
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return addToast('Please enter all 6 digits.', 'error');
    if (!email) return addToast('Email not found. Please restart registration.', 'error');

    setLoading(true);
    try {
      const data = await verifyOtp(email, code);
      if (data.success) {
        addToast('Email verified! Welcome to Ekthaa ✦', 'success');
        navigate('/', { replace: true });
      }
    } catch (err) {
      addToast(err.message, 'error');
      // Clear OTP boxes on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ──
  const handleResend = async () => {
    if (resendCD > 0) return;
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      addToast('New OTP sent to your email.', 'success');
      setCountdown(5 * 60);
      setResendCD(RESEND_WAIT);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setResending(false);
    }
  };

  const isExpired = countdown <= 0;

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
            Verify Email
          </h1>
        </div>

        <div className="card" style={{ padding: '36px 32px 30px', borderRadius: 28 }}>
          {/* Back */}
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: '0.8375rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 22 }}>
            <ArrowLeft size={14} /> Back to login
          </Link>

          <p className="section-label" style={{ marginBottom: 6 }}>✦ One-time code</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 26 }}>
            We sent a 6-digit code to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{email || 'your email'}</strong>.
            It expires in 5 minutes.
          </p>

          {/* OTP Boxes */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                style={{
                  width: 50, height: 60,
                  textAlign: 'center',
                  fontSize: '1.6rem', fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-subtle)',
                  border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--border)'}`,
                  borderRadius: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: digit ? '0 0 0 3px rgba(170,132,114,0.12)' : 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = digit ? 'var(--color-primary)' : 'var(--border)'}
              />
            ))}
          </div>

          {/* Countdown */}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            {isExpired ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-error)' }}>
                OTP expired. Please request a new one.
              </p>
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Expires in{' '}
                <span style={{ fontWeight: 700, color: countdown <= 60 ? 'var(--color-error)' : 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(countdown)}
                </span>
              </p>
            )}
          </div>

          {/* Verify button */}
          <button
            id="otp-verify"
            onClick={handleVerify}
            disabled={loading || isExpired || otp.join('').length < OTP_LENGTH}
            className="btn btn-primary"
            style={{
              width: '100%', padding: '13px 0', fontSize: '0.9375rem', borderRadius: 14, marginBottom: 16,
              opacity: (isExpired || otp.join('').length < OTP_LENGTH) ? 0.5 : 1,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spin" style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' }} />
                Verifying…
              </span>
            ) : 'Verify →'}
          </button>

          {/* Resend */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Didn't receive it?{' '}
            </span>
            <button
              id="otp-resend"
              onClick={handleResend}
              disabled={resendCD > 0 || resending}
              style={{
                background: 'none', border: 'none', cursor: resendCD > 0 ? 'default' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                color: resendCD > 0 ? 'var(--text-muted)' : 'var(--color-primary)',
                fontWeight: 600, padding: 0,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              {resending ? <span className="spin" style={{ width: 12, height: 12, border: '2px solid rgba(170,132,114,0.3)', borderTop: '2px solid var(--color-primary)', borderRadius: '50%', display: 'inline-block' }} /> : <RefreshCw size={13} />}
              {resendCD > 0 ? `Resend in ${resendCD}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

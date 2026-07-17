// pages/auth/Register.jsx – Ekthaa registration page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AtSign, Coffee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import DecorativeBg from '../../components/DecorativeBg';

// ─────────────────────────────────────────────────────────────
// IMPORTANT: Field and ToggleBtn are defined OUTSIDE Register.
// If they were inside, React would see a new component type on
// every render (every keystroke), unmount+remount the input,
// and lose focus + value after the first character.
// ─────────────────────────────────────────────────────────────

function Field({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, rightEl }) {
  return (
    <div>
      <label style={{
        display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
        fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.02em',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon
          size={15}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input"
          style={{ paddingLeft: 38, paddingRight: rightEl ? 40 : undefined }}
          required
        />
        {rightEl}
      </div>
    </div>
  );
}

function ToggleBtn({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', display: 'flex',
      }}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '',
    email: '', password: '', confirmPassword: '',
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading,     setLoading]     = useState(false);

  const { register } = useAuth();
  const addToast     = useToast();
  const navigate     = useNavigate();

  // Stable updater: uses functional setState + computed key
  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting registration", form);
    
    if (!acceptTerms) return addToast('Please accept the terms to continue.', 'error');
    if (form.password !== form.confirmPassword) return addToast('Passwords do not match.', 'error');
    if (form.password.length < 6) return addToast('Password must be at least 6 characters.', 'error');

    setLoading(true);
    try {
      const data = await register(form);
      if (data.success) {
        if (data.devOtp) {
          addToast(`Dev mode – OTP: ${data.devOtp} (auto-filled)`, 'info', 8000);
        } else {
          addToast('Account created! Check your email for the OTP.', 'success');
        }
        navigate('/verify-otp', { state: { email: form.email, devOtp: data.devOtp } });
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '24px 16px' }}>
      <DecorativeBg />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: 'var(--color-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(170,132,114,0.30)', marginBottom: 12,
          }}>
            <Coffee size={22} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Join Ekthaa
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 5, fontStyle: 'italic' }}>
            Share ideas that matter
          </p>
        </div>

        <div className="card" style={{ padding: '32px 32px 28px', borderRadius: 28 }}>
          <p className="section-label" style={{ marginBottom: 18 }}>✦ Create your account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field
                id="reg-firstname"
                label="First Name"
                value={form.firstName}
                onChange={set('firstName')}
                placeholder="Aanya"
                icon={User}
              />
              <Field
                id="reg-lastname"
                label="Last Name"
                value={form.lastName}
                onChange={set('lastName')}
                placeholder="Sharma"
                icon={User}
              />
            </div>

            {/* Username */}
            <Field
              id="reg-username"
              label="Username"
              value={form.username}
              onChange={set('username')}
              placeholder="aanya.s"
              icon={AtSign}
            />

            {/* Email */}
            <Field
              id="reg-email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              icon={Mail}
            />

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.02em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="input"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  required
                />
                <ToggleBtn show={showPass} onToggle={() => setShowPass(v => !v)} />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.02em' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Re-enter password"
                  className="input"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  required
                />
                <ToggleBtn show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
              </div>
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', marginTop: 2 }}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)', width: 15, height: 15, marginTop: 1, flexShrink: 0 }}
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                I agree to Ekthaa's{' '}
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Privacy Policy</span>
              </span>
            </label>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px 0', fontSize: '0.9375rem', borderRadius: 14, marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spin" style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' }} />
                  Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '20px 0 0' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

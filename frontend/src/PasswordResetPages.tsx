import { useEffect, useState, type ReactNode } from 'react'
import { confirmPasswordReset, sendPasswordResetEmail, verifyPasswordResetCode } from 'firebase/auth'
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, Mail } from 'lucide-react'
import { auth } from './firebase'
import { Brand } from './SiteHeader'

function AuthPageShell({ children }: { children: ReactNode }) {
  return <div className="account-page"><header><a href="/"><Brand /></a></header><main>{children}</main></div>
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [error, setError] = useState('')
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/reset-password` }); setSent(true) } catch { setError('We could not send the reset email. Check the address and try again.') } finally { setBusy(false) } }
  return <AuthPageShell><section className="account-card">{sent ? <><CheckCircle2 className="account-icon"/><span className="step-label">EMAIL SENT</span><h1>Check your inbox.</h1><p>If an account exists for <strong>{email}</strong>, you’ll receive an email with a “Reset Password” link. Check your spam folder too.</p><a className="primary-button" href="/">Return home</a></> : <><Mail className="account-icon"/><span className="step-label">ACCOUNT RECOVERY</span><h1>Forgot your password?</h1><p>Enter your account email and we’ll send you a secure link to reset your password.</p>{error && <div className="alert">{error}</div>}<form onSubmit={submit}><label>Email address<input autoFocus required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/></label><button className="primary-button" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16}/> Sending…</> : 'Send reset link'}</button></form><a className="account-back" href="/"><ArrowLeft size={14}/> Back to sign in</a></>}</section></AuthPageShell>
}

export function ResetPasswordPage() {
  const code = new URLSearchParams(window.location.search).get('oobCode') ?? ''
  const [checking, setChecking] = useState(true), [valid, setValid] = useState(false), [done, setDone] = useState(false)
  const [password, setPassword] = useState(''), [confirm, setConfirm] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('')
  useEffect(() => { if (!code) { setChecking(false); return } verifyPasswordResetCode(auth, code).then(() => setValid(true)).catch(() => setValid(false)).finally(() => setChecking(false)) }, [code])
  async function submit(e: React.FormEvent) { e.preventDefault(); setError(''); if (password !== confirm) { setError('The passwords do not match.'); return } setBusy(true); try { await confirmPasswordReset(auth, code, password); setDone(true) } catch { setError('This reset link is invalid or has expired. Please request a new one.') } finally { setBusy(false) } }
  return <AuthPageShell><section className="account-card"><KeyRound className="account-icon"/>{checking ? <div className="account-loading"><LoaderCircle className="spin"/> Checking your reset link…</div> : done ? <><span className="step-label">PASSWORD UPDATED</span><h1>You’re all set.</h1><p>Your password has been changed. You can now sign in using your new password.</p><a className="primary-button" href="/">Go to sign in</a></> : !valid ? <><span className="step-label">LINK UNAVAILABLE</span><h1>This link isn’t valid.</h1><p>The password reset link is invalid, has already been used, or has expired.</p><a className="primary-button" href="/forgot-password">Request a new link</a></> : <><span className="step-label">NEW PASSWORD</span><h1>Reset your password.</h1><p>Choose a strong password with at least six characters.</p>{error && <div className="alert">{error}</div>}<form onSubmit={submit}><label>New password<input autoFocus required minLength={6} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}/></label><label>Confirm password<input required minLength={6} type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)}/></label><button className="primary-button" disabled={busy}>{busy ? 'Updating…' : 'Reset password'}</button></form></>}</section></AuthPageShell>
}

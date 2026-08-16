import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from 'firebase/auth'
import { CalendarCheck, Eye, EyeOff, History, LogIn, LogOut, X } from 'lucide-react'
import { api, type UserProfile } from './api'
import { auth, googleProvider } from './firebase'
import { useLanguage } from './LanguageContext'

export default function AuthButton({ onSession }: { onSession: (user: User | null, profile: UserProfile | null) => void }) {
  const { language } = useLanguage()
  const id = language === 'id'
  const [user, setUser] = useState<User | null>(null), [profile, setProfile] = useState<UserProfile | null>(null)
  const [open, setOpen] = useState(false), [signup, setSignup] = useState(false), [needsProfile, setNeedsProfile] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [username, setUsername] = useState(''), [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => onAuthStateChanged(auth, async current => {
    setUser(current)
    if (!current) { setProfile(null); onSession(null, null); setAuthReady(true); return }
    try { const value = await api.getProfile(); setProfile(value); onSession(current, value) }
    catch { setNeedsProfile(true); setOpen(true); onSession(current, null) }
    finally { setAuthReady(true) }
  }), [onSession])

  async function emailSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const credential = signup ? await createUserWithEmailAndPassword(auth, email, password) : await signInWithEmailAndPassword(auth, email, password)
      setUser(credential.user)
      if (signup) { const value = await api.saveProfile({ username, phoneNumber }); setProfile(value); onSession(credential.user, value); setOpen(false) }
      else { try { const value = await api.getProfile(); setProfile(value); onSession(credential.user, value); setOpen(false) } catch { setNeedsProfile(true) } }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Authentication failed.') }
    finally { setBusy(false) }
  }

  async function googleLogin() {
    setBusy(true); setError('')
    try { const credential = await signInWithPopup(auth, googleProvider); setUser(credential.user); try { const value = await api.getProfile(); setProfile(value); onSession(credential.user, value); setOpen(false) } catch { setNeedsProfile(true) } }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Google login failed.') }
    finally { setBusy(false) }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try { const value = await api.saveProfile({ username, phoneNumber }); setProfile(value); setNeedsProfile(false); setOpen(false); onSession(user, value) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save profile.') }
    finally { setBusy(false) }
  }

  async function logout() {
    setBusy(true)
    try { await signOut(auth); setUser(null); setProfile(null); onSession(null, null); setConfirmLogout(false) }
    finally { setBusy(false) }
  }

  if (!authReady) return <span className="account-avatar account-avatar-loading" aria-label={id ? 'Memulihkan akun' : 'Restoring account'}/>

  if (user && profile) return <>
    <div className="account-menu-wrap">
      <button className="account-avatar" aria-label={`Open ${profile.username}'s account menu`} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{profile.username.trim().charAt(0).toUpperCase()}</button>
      {menuOpen && <div className="account-dropdown">
        <div className="account-dropdown-user"><strong>{profile.username}</strong><small>JSport {profile.role.toLowerCase()}</small></div>
        <a href="/history"><History size={16}/> {id ? 'Riwayat' : 'History'}</a>
        {profile.role.toLowerCase() === 'admin' && <a href="/bookings"><CalendarCheck size={16}/> {id ? 'Pemesanan' : 'Bookings'}</a>}
        <button onClick={() => { setMenuOpen(false); setConfirmLogout(true) }}><LogOut size={16}/> {id ? 'Keluar' : 'Log out'}</button>
      </div>}
    </div>
    {confirmLogout && <div className="auth-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-title"><div className="auth-card confirm-card"><button className="auth-close" aria-label={id ? 'Tutup' : 'Close'} onClick={() => setConfirmLogout(false)}><X size={18}/></button><p className="overline gold">{id ? 'Akun JSport' : 'JSport account'}</p><h2 id="logout-title">{id ? 'Keluar?' : 'Sign out?'}</h2><p>{id ? 'Anda perlu masuk kembali untuk mengakses akun dan pemesanan.' : 'You’ll need to sign in again to access your account and bookings.'}</p><div className="confirm-actions"><button className="secondary-button" onClick={() => setConfirmLogout(false)}>{id ? 'Batal' : 'Cancel'}</button><button className="primary-button" disabled={busy} onClick={logout}>{busy ? (id ? 'Sedang keluar…' : 'Signing out…') : (id ? 'Keluar' : 'Sign out')}</button></div></div></div>}
  </>

  return <><button className="auth-trigger" onClick={() => setOpen(true)}><LogIn size={15} /> {id ? 'Masuk / Daftar' : 'Login / Sign up'}</button>{open && <div className="auth-backdrop"><div className="auth-card"><button className="auth-close" onClick={() => !needsProfile && setOpen(false)}><X size={18}/></button><p className="overline gold">{id ? 'Akun JSport' : 'JSport account'}</p><h2>{needsProfile ? (id ? 'Lengkapi profil Anda' : 'Complete your profile') : signup ? (id ? 'Buat akun' : 'Create an account') : (id ? 'Selamat datang kembali' : 'Welcome back')}</h2>{error && <div className="alert">{error}</div>}{needsProfile ? <form onSubmit={saveProfile}><label>{id ? 'Nama pengguna' : 'Username'}<input required minLength={3} maxLength={50} value={username} onChange={e => setUsername(e.target.value)}/></label><label>{id ? 'Nomor telepon' : 'Phone number'}<input required type="tel" maxLength={30} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}/></label><button className="primary-button" disabled={busy}>{id ? 'Simpan profil' : 'Save profile'}</button></form> : <><form onSubmit={emailSubmit}><label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)}/></label><label>{id ? 'Kata sandi' : 'Password'}<span className="password-field"><input required type={showPassword ? 'text' : 'password'} minLength={6} value={password} onChange={e => setPassword(e.target.value)}/><button type="button" className="password-toggle" aria-label={showPassword ? (id ? 'Sembunyikan kata sandi' : 'Hide password') : (id ? 'Tampilkan kata sandi' : 'Show password')} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>{!signup && <a className="forgot-link" href="/forgot-password">{id ? 'Lupa kata sandi?' : 'Forgot password?'}</a>}{signup && <><label>{id ? 'Nama pengguna' : 'Username'}<input required minLength={3} maxLength={50} value={username} onChange={e => setUsername(e.target.value)}/></label><label>{id ? 'Nomor telepon' : 'Phone number'}<input required type="tel" maxLength={30} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}/></label></>}<button className="primary-button" disabled={busy}>{signup ? (id ? 'Daftar' : 'Sign up') : (id ? 'Masuk' : 'Login')}</button></form><div className="auth-divider">{id ? 'atau' : 'or'}</div><button className="google-button" onClick={googleLogin} disabled={busy}>{id ? 'Lanjutkan dengan Google' : 'Continue with Google'}</button><button className="auth-switch" onClick={() => setSignup(!signup)}>{signup ? (id ? 'Sudah terdaftar? Masuk' : 'Already registered? Login') : (id ? 'Baru di sini? Daftar' : 'New here? Sign up')}</button></>}</div></div>}</>
}

import { ArrowRight } from 'lucide-react'
import type { User } from 'firebase/auth'
import AuthButton from './AuthButton'
import type { UserProfile } from './api'
import { useLanguage, type Language } from './LanguageContext'

export function Brand() {
  return <span className="brand"><span className="brand-shuttle"><i /><i /><i /></span><span>JSPORT<small>RACQUET CLUB</small></span></span>
}

type SiteHeaderProps = {
  active: 'home' | 'events' | 'facilities' | 'rules'
  onReserve?: () => void
  onSession?: (user: User | null, profile: UserProfile | null) => void
}

const navigation = [
  { id: 'home', label: { en: 'Home', id: 'Beranda' }, href: '/' },
  { id: 'events', label: { en: 'Events', id: 'Acara' }, href: '/events' },
  { id: 'facilities', label: { en: 'Facilities', id: 'Fasilitas' }, href: '/facilities' },
  { id: 'rules', label: { en: 'Rules', id: 'Peraturan' }, href: '/rules' },
] as const

export default function SiteHeader({ active, onReserve, onSession = () => {} }: SiteHeaderProps) {
  const { language, setLanguage } = useLanguage()
  function navigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (window.location.pathname === href) return
    const changeRoute = () => {
      window.history.pushState({}, '', href)
      window.dispatchEvent(new PopStateEvent('popstate'))
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    const transitionDocument = document as Document & { startViewTransition?: (update: () => void) => void }
    if (transitionDocument.startViewTransition) transitionDocument.startViewTransition(changeRoute)
    else changeRoute()
  }

  function reserve() {
    if (onReserve) onReserve()
    else window.location.href = '/?reserve=1'
  }

  return <header className="site-header">
    <a href="/" aria-label="JSport home"><Brand /></a>
    <nav className="header-tabs" aria-label="Primary navigation">
      {navigation.map(item => <a key={item.id} className={active === item.id ? 'active' : ''} href={item.href} onClick={event => navigate(event, item.href)}>{item.label[language]}</a>)}
    </nav>
    <div className="header-actions">
      <div className="language-toggle" role="group" aria-label={language === 'id' ? 'Pilih bahasa' : 'Choose language'}>
        {(['id', 'en'] as Language[]).map(option => <button key={option} type="button" className={language === option ? 'active' : ''} aria-pressed={language === option} onClick={() => setLanguage(option)}>{option.toUpperCase()}</button>)}
      </div>
      <button className="header-cta" onClick={reserve}>{language === 'id' ? 'Pesan lapangan' : 'Reserve a court'} <ArrowRight size={16} /></button>
      <AuthButton onSession={onSession} />
    </div>
  </header>
}

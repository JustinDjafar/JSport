import { ArrowRight } from 'lucide-react'
import type { User } from 'firebase/auth'
import AuthButton from './AuthButton'
import type { UserProfile } from './api'

export function Brand() {
  return <span className="brand"><span className="brand-shuttle"><i /><i /><i /></span><span>JSPORT<small>RACQUET CLUB</small></span></span>
}

type SiteHeaderProps = {
  active: 'home' | 'events' | 'facilities' | 'rules'
  onReserve?: () => void
  onSession?: (user: User | null, profile: UserProfile | null) => void
}

const navigation = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'events', label: 'Events', href: '/events' },
  { id: 'facilities', label: 'Facilities', href: '/facilities' },
  { id: 'rules', label: 'Rules', href: '/rules' },
] as const

export default function SiteHeader({ active, onReserve, onSession = () => {} }: SiteHeaderProps) {
  function navigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (window.location.pathname === href) return
    const changeRoute = () => {
    const changeRoute = () => {
      window.history.pushState({}, '', href)
      window.dispatchEvent(new PopStateEvent('popstate'))
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    const transitionDocument = document as Document & { startViewTransition?: (update: () => void) => void }
    if (transitionDocument.startViewTransition) transitionDocument.startViewTransition(changeRoute)
    else changeRoute()
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
      {navigation.map(item => <a key={item.id} className={active === item.id ? 'active' : ''} href={item.href} onClick={event => navigate(event, item.href)}>{item.label}</a>)}
    </nav>
    <div className="header-actions">
      <button className="header-cta" onClick={reserve}>Reserve a court <ArrowRight size={16} /></button>
      <AuthButton onSession={onSession} />
    </div>
  </header>
}

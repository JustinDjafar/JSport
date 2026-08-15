import { Ban, Briefcase, Clock3, Footprints, GlassWater, HandHeart, ShieldCheck, Users } from 'lucide-react'
import SiteHeader from './SiteHeader'

const rules = [
  { tone: 'required', icon: Footprints, sign: 'REQUIRED', title: 'Court shoes on', detail: 'Clean indoor badminton shoes with non-marking soles are mandatory. Leave outdoor and hard-soled shoes off the playing surface.' },
  { tone: 'prohibited', icon: Ban, sign: 'NO FOOD', title: 'Keep food off court', detail: 'Food, chewing gum, and open drinks belong in the café or lounge—not inside the court area.' },
  { tone: 'allowed', icon: GlassWater, sign: 'WATER OK', title: 'Hydrate safely', detail: 'Closed water bottles are welcome beside the court. Keep them upright and outside the boundary lines.' },
  { tone: 'timing', icon: Clock3, sign: 'ON TIME', title: 'Respect every session', detail: 'Enter when your booking begins and finish promptly so the next group receives its full court time.' },
  { tone: 'safety', icon: Briefcase, sign: 'KEEP CLEAR', title: 'Bags stay courtside', detail: 'Store rackets, bags, and loose belongings away from boundaries and walkways to prevent trips.' },
  { tone: 'respect', icon: HandHeart, sign: 'PLAY KIND', title: 'Good games, good manners', detail: 'Use respectful language, manage noise, and be considerate of players on neighbouring courts.' },
  { tone: 'safety', icon: Users, sign: 'SUPERVISE', title: 'Watch younger players', detail: 'Children must remain with a responsible adult throughout their visit to the club.' },
  { tone: 'required', icon: ShieldCheck, sign: 'PROTECT', title: 'Look after the club', detail: 'Report spills or damage promptly and follow staff directions whenever safety is involved.' },
]

export default function RulesPage() {
  return <div className="rules-page"><SiteHeader active="rules"/><main><section className="rules-hero"><span className="step-label">PLAY WELL</span><h1>Good games start with good habits.</h1><p>Eight simple signs to keep every session safe, clean, and enjoyable.</p></section><section className="rule-sign-grid">{rules.map(({ tone, icon: Icon, sign, title, detail }, index) => <article className={`rule-sign ${tone}`} key={title}><div className="rule-symbol"><Icon size={27}/>{tone === 'prohibited' && <span className="prohibition-slash"/>}</div><div className="rule-copy"><span>{String(index + 1).padStart(2, '0')} · {sign}</span><h2>{title}</h2><p>{detail}</p></div></article>)}</section><p className="rules-footer-note">Not sure about something? Ask our club team before stepping onto court.</p></main></div>
}

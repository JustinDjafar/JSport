import { Coffee, HeartPulse, MoonStar, Sparkles, Trophy } from 'lucide-react'
import SiteHeader from './SiteHeader'

const facilities = [
  { name: 'Olympic-standard courts', detail: 'Purpose-built badminton courts with professional-grade carpet for dependable grip, comfort, and consistent play.', image: '/images/facilities/badminton-court.jpg', icon: Trophy },
  { name: 'Sauna', detail: 'A calm recovery space to loosen up, reset, and unwind after your session.', image: '/images/facilities/sauna.jpg', icon: HeartPulse },
  { name: 'Prayer room', detail: 'A quiet, clean, and dedicated room for prayer during your visit.', image: '/images/facilities/prayer-room.jpg', icon: MoonStar },
  { name: 'Club café', detail: 'Refreshments and a comfortable place to meet, wait, or catch up after a match.', image: '/images/facilities/cafe.jpg', icon: Coffee },
]

export default function FacilitiesPage() {
  return <div className="facilities-page"><SiteHeader active="facilities"/><main>
    <section className="facilities-hero"><div><p className="overline">BEYOND THE COURT</p><h1>Everything your game needs.</h1><p>Professional playing conditions, thoughtful recovery spaces, and the small comforts that make every visit feel effortless.</p></div></section>
    <section className="facility-section"><div className="facility-grid">{facilities.map(({ name, detail, image, icon: Icon }, index) => <article key={name}><div className="facility-image" style={{ backgroundImage: `linear-gradient(180deg,transparent 45%,rgba(4,18,13,.66)),url(${image})` }}><span>0{index + 1}</span></div><div><Icon size={20}/><h3>{name}</h3><p>{detail}</p></div></article>)}</div><p className="facility-note"><Sparkles size={16}/> Clean changing areas and restrooms are available for every guest.</p></section>
  </main></div>
}

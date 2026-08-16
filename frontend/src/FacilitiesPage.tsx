import { Coffee, HeartPulse, MoonStar, Trophy } from 'lucide-react'
import SiteHeader from './SiteHeader'
import { useLanguage } from './LanguageContext'

const facilities = [
  { name: { en: 'Olympic-standard courts', id: 'Lapangan berstandar Olimpiade' }, detail: { en: 'Purpose-built badminton courts with professional-grade carpet for dependable grip, comfort, and consistent play.', id: 'Lapangan bulu tangkis khusus dengan karpet profesional untuk cengkeraman, kenyamanan, dan permainan yang konsisten.' }, image: '/images/facilities/badminton-court.jpg', icon: Trophy },
  { name: { en: 'Sauna', id: 'Sauna' }, detail: { en: 'A calm recovery space to loosen up, reset, and unwind after your session.', id: 'Ruang pemulihan yang tenang untuk merilekskan tubuh dan melepas penat setelah bermain.' }, image: '/images/facilities/sauna.jpg', icon: HeartPulse },
  { name: { en: 'Prayer room', id: 'Ruang ibadah' }, detail: { en: 'A quiet, clean, and dedicated room for prayer during your visit.', id: 'Ruang khusus yang tenang dan bersih untuk beribadah selama kunjungan Anda.' }, image: '/images/facilities/prayer-room.jpg', icon: MoonStar },
  { name: { en: 'Club café', id: 'Kafe klub' }, detail: { en: 'Refreshments and a comfortable place to meet, wait, or catch up after a match.', id: 'Minuman segar dan tempat nyaman untuk bertemu, menunggu, atau bersantai setelah pertandingan.' }, image: '/images/facilities/cafe.jpg', icon: Coffee },
] as const

export default function FacilitiesPage() {
  const { language } = useLanguage()
  return <div className="facilities-page"><SiteHeader active="facilities"/><main>
    <section className="facilities-hero"><div><p className="overline">{language === 'id' ? 'LEBIH DARI SEKADAR LAPANGAN' : 'BEYOND THE COURT'}</p><h1>{language === 'id' ? 'Semua yang permainan Anda butuhkan.' : 'Everything your game needs.'}</h1><p>{language === 'id' ? 'Kondisi bermain profesional, ruang pemulihan yang nyaman, dan fasilitas lengkap untuk setiap kunjungan.' : 'Professional playing conditions, thoughtful recovery spaces, and the small comforts that make every visit feel effortless.'}</p></div></section>
    <section className="facility-section"><div className="facility-grid">{facilities.map(({ name, detail, image, icon: Icon }, index) => <article key={name.en}><div className="facility-image" style={{ backgroundImage: `linear-gradient(180deg,transparent 45%,rgba(4,18,13,.66)),url(${image})` }}><span>0{index + 1}</span></div><div><Icon size={20}/><h3>{name[language]}</h3><p>{detail[language]}</p></div></article>)}</div></section>
  </main></div>
}

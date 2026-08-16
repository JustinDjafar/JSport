import { Brand } from './SiteHeader'
import { useLanguage } from './LanguageContext'

export default function SiteFooter() {
  const { language } = useLanguage()
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL
  return <footer className="site-footer" id="contact">
    <Brand />
    <p>{language === 'id' ? 'Lapangan privat. Permainan istimewa.' : 'Private courts. Exceptional play.'}</p>
    <div className="footer-contact">
      <span>{language === 'id' ? 'Hubungi kami' : 'Contact'}</span>
      <a href="tel:+6281289938244">+62 812 8993 8244</a>
      <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
    </div>
    <div className="footer-meta"><a className="footer-reserve" href="/?reserve=1">{language === 'id' ? 'Reservasi' : 'Reservations'}</a><span>© 2026 JSport</span></div>
  </footer>
}

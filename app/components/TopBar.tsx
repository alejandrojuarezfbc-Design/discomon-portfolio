import { Phone, Mail, MessageCircle } from 'lucide-react'
import styles from './TopBar.module.css'

export default function TopBar() {
  return (
    <div className={styles.topbar}>
      <div className="container">
        <a href="tel:+34687498000">
          <Phone size={15} /> +34 687 498 000
        </a>
        <span className={styles.dot}>·</span>
        <a href="mailto:info@discomon.com">
          <Mail size={15} /> info@discomon.com
        </a>
        <span className={styles.dot}>·</span>
        <a href="https://wa.me/34687498000" target="_blank" rel="noopener noreferrer">
          <MessageCircle size={15} /> WhatsApp
        </a>
      </div>
    </div>
  )
}

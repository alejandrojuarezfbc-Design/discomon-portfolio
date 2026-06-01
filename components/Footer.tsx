import Link from 'next/link'
import { Phone, Mail } from 'lucide-react'
import styles from './Footer.module.css'

const CATEGORIAS = [
  { label: 'Gestión municipal digital', slug: 'gestion-municipal-digital' },
  { label: 'Movilidad y tráfico',       slug: 'movilidad-y-trafico' },
  { label: 'Medio ambiente',            slug: 'medio-ambiente' },
  { label: 'Espacio público',           slug: 'espacio-publico' },
  { label: 'Instalación y obra',        slug: 'instalacion-y-obra' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.cols}>

          {/* Columna 1 — Marca */}
          <div>
            <h4>DISCOMON</h4>
            <p className={styles.tagline}>
              Tecnología IoT con impacto medioambiental para ayuntamientos y municipios inteligentes.
            </p>
          </div>

          {/* Columna 2 — Soluciones */}
          <div>
            <p className={styles.colLabel}>Soluciones</p>
            <ul>
              {CATEGORIAS.map(cat => (
                <li key={cat.slug}>
                  <Link href={`/categoria/${cat.slug}`}>{cat.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Contacto */}
          <div>
            <p className={styles.colLabel}>Contacto</p>
            <div className={styles.contactLine}>
              <Phone size={16} /> +34 687 498 000
            </div>
            <div className={styles.contactLine}>
              <Mail size={16} />
              <a href="mailto:info@discomon.com">info@discomon.com</a>
            </div>

            <div className={styles.socials}>
              {/* TikTok */}
              <a href="#" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
                  <path d="M16.5 8.6a6.6 6.6 0 0 0 3.5 1.02V6.86a3.6 3.6 0 0 1-3.5-3.6h-2.83v11.36a2.16 2.16 0 1 1-2.16-2.16c.2 0 .4.03.6.08V9.6a5.1 5.1 0 1 0 4.39 5.05z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/discomon_greentech/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <path d="m10 15 5-3-5-3z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        <div className={styles.divider} />
        <p className={styles.copyLine}>© 2025 Discomon. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

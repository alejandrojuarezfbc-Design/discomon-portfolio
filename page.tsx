import Link from 'next/link'
import {
  Building2, Car, Leaf, Trees, Wrench, ArrowRight,
  ChevronDown, Bell, MapPin, BarChart3, MessageSquare,
  Phone, Mail, MessageCircle,
} from 'lucide-react'
import TopBar from './components/TopBar'
import Footer from './components/Footer'
import styles from './page.module.css'

/* ── Datos de categorías ─────────────────────────────────── */
const CATEGORIAS = [
  {
    slug: 'gestion-municipal-digital',
    icono: Building2,
    titulo: 'Gestión municipal digital',
    desc: 'Digitaliza los servicios de tu municipio',
  },
  {
    slug: 'movilidad-y-trafico',
    icono: Car,
    titulo: 'Movilidad y tráfico',
    desc: 'Control inteligente del tráfico urbano',
  },
  {
    slug: 'medio-ambiente',
    icono: Leaf,
    titulo: 'Medio ambiente',
    desc: 'Monitoriza y mejora el entorno natural',
  },
  {
    slug: 'espacio-publico',
    icono: Trees,
    titulo: 'Espacio público',
    desc: 'Mobiliario urbano sostenible e inteligente',
  },
  {
    slug: 'instalacion-y-obra',
    icono: Wrench,
    titulo: 'Instalación y obra',
    desc: 'Señalización y alumbrado profesional',
  },
]

/* ── Instagramt tiles placeholder ───────────────────────── */
const INSTA_TILES = Array.from({ length: 6 })

/* ── Componente ─────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <TopBar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>DISCOMON</h1>
          <p className={styles.subtitle}>Tecnología con impacto medioambiental</p>
        </div>
        <a href="#categorias" className={styles.scrollCue} aria-label="Bajar">
          <ChevronDown size={28} />
        </a>
      </header>

      {/* ── CATEGORÍAS ───────────────────────────────────── */}
      <section className={styles.categories} id="categorias">
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>Soluciones para tu municipio</h2>
            <p className={styles.sub}>Organizadas por necesidad, no por tecnología</p>
          </div>
          <div className={styles.catGrid}>
            {CATEGORIAS.map(cat => {
              const Icon = cat.icono
              return (
                <article key={cat.slug} className={styles.catCard}>
                  <div className={styles.catIcon}>
                    <Icon size={28} />
                  </div>
                  <h3>{cat.titulo}</h3>
                  <p className={styles.catDesc}>{cat.desc}</p>
                  <Link className={styles.catCta} href={`/categoria/${cat.slug}`}>
                    Ver soluciones <ArrowRight size={16} />
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CITY HALL APP ────────────────────────────────── */}
      <section className={styles.starapp}>
        <div className="container">
          <div className={styles.copy}>
            <span className={styles.badgeOutline}>Producto estrella</span>
            <h2>City Hall App</h2>
            <p>
              La plataforma que conecta a tu ayuntamiento con la ciudadanía.
              Gestiona incidencias, avisos y servicios municipales desde una sola
              aplicación, con datos en tiempo real de toda tu infraestructura inteligente.
            </p>
            <a href="#contacto" className="btn-white">
              Solicitar demo <ArrowRight size={16} />
            </a>
          </div>
          <div className={styles.visual}>
            <div className={styles.phone} aria-hidden="true">
              <div className={styles.phoneScreen}>
                <div className={styles.phoneTopbar}>
                  <div className={styles.pname}>City Hall App</div>
                  <div className={styles.pmuni}>Ayuntamiento</div>
                </div>
                <div className={styles.phoneBody}>
                  {[Bell, MapPin, BarChart3, Leaf, MessageSquare].map((Icon, i) => (
                    <div key={i} className={styles.phoneRow}>
                      <div className={styles.pico}><Icon size={16} /></div>
                      <div className={styles.phoneCol}>
                        <div className={`${styles.phoneLine} ${i % 2 === 0 ? styles.short : ''}`} />
                        <div className={`${styles.phoneLine} ${styles.tiny}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACTO ─────────────────────────────────────── */}
      <section className={styles.contact} id="contacto">
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>¿Hablamos?</h2>
            <p className={styles.sub}>Cuéntanos qué necesita tu municipio</p>
          </div>
          <form className={styles.formCard}>
            <div className={styles.field}>
              <label htmlFor="nombre">Nombre completo</label>
              <input id="nombre" type="text" placeholder="Tu nombre" />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="tu@email.com" />
            </div>
            <div className={styles.field}>
              <label htmlFor="muni">Municipio o Ayuntamiento</label>
              <input id="muni" type="text" placeholder="Nombre del municipio" />
            </div>
            <div className={styles.field}>
              <label htmlFor="msg">Mensaje</label>
              <textarea id="msg" rows={4} placeholder="Cuéntanos en qué podemos ayudarte" />
            </div>
            <button className={styles.btnSubmit} type="submit">Enviar mensaje</button>
          </form>
        </div>
      </section>

      {/* ── INSTAGRAM ────────────────────────────────────── */}
      <section className={styles.insta}>
        <div className="container">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={26} height={26}>
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/>
            </svg>
            Síguenos en Instagram
          </h2>
          <div>
            <a className={styles.handle} href="https://www.instagram.com/discomon_greentech/" target="_blank" rel="noopener noreferrer">
              @discomon_greentech
            </a>
          </div>
          <div className={styles.instaGrid}>
            {INSTA_TILES.map((_, i) => (
              <a key={i} className={styles.instaTile} href="https://www.instagram.com/discomon_greentech/" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            ))}
          </div>
          <a className={styles.btnOutline} href="https://www.instagram.com/discomon_greentech/" target="_blank" rel="noopener noreferrer">
            Ver perfil completo <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}

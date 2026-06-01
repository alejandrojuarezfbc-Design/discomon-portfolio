import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import TopBar from '../../components/TopBar'
import Footer from '../../components/Footer'
import styles from './page.module.css'

/* ── Tipo de producto ────────────────────────────────────── */
type Producto = {
  nombre: string
  marca: string
  categoriaSlug: string
  categoriaNombre: string
  gancho: string
  quéHace: { icono: string; titulo: string; desc: string }[]
  comoFunciona: { titulo: string; desc: string }[]
  paraQuien: { titulo: string; desc: string }[]
  fichaTecnica?: { campo: string; valor: string }[]
}

/* ── Datos placeholder ───────────────────────────────────── */
// Este objeto se reemplazará con una llamada a Supabase cuando
// las fichas de producto estén cargadas. Por ahora contiene
// datos de ejemplo para Smart Parking.

const PRODUCTOS: Record<string, Producto> = {
  'smart-parking': {
    nombre: 'Smart Parking',
    marca: 'Discomon IoT',
    categoriaSlug: 'movilidad-y-trafico',
    categoriaNombre: 'Movilidad y tráfico',
    gancho: 'Los ciudadanos pierden tiempo buscando aparcamiento. Tu municipio puede solucionar eso.',
    quéHace: [
      { icono: 'parking',   titulo: 'Detecta plazas libres',  desc: 'Sensores en cada plaza actualizados cada segundo' },
      { icono: 'nav',       titulo: 'Guía al conductor',      desc: 'El conductor ve en su móvil dónde aparcar antes de llegar' },
      { icono: 'leaf',      titulo: 'Reduce el tráfico',      desc: 'Menos coches dando vueltas significa menos contaminación' },
      { icono: 'dashboard', titulo: 'Panel de control',       desc: 'El ayuntamiento ve la ocupación en tiempo real' },
    ],
    comoFunciona: [
      { titulo: 'El sensor detecta',     desc: 'Un sensor en cada plaza detecta si hay un vehículo. Sin obras, sin cables.' },
      { titulo: 'La app lo muestra',     desc: 'El conductor abre la app o ve el panel de la calle y localiza plaza libre al instante.' },
      { titulo: 'El municipio controla', desc: 'El ayuntamiento accede al dashboard y ve estadísticas de ocupación en tiempo real.' },
    ],
    paraQuien: [
      { titulo: 'Municipios con zona azul o ORA',           desc: 'Optimiza la rotación de las plazas reguladas y mejora el servicio al ciudadano sin ampliar plantilla.' },
      { titulo: 'Ayuntamientos que quieren reducir tráfico', desc: 'Menos vehículos buscando sitio significa calles más despejadas y un centro urbano más habitable.' },
    ],
    fichaTecnica: [
      { campo: 'Tecnología de sensor',  valor: 'Magnético / infrarrojo dual' },
      { campo: 'Conectividad',          valor: 'NB-IoT / LoRaWAN' },
      { campo: 'Autonomía de batería',  valor: 'Hasta 5 años' },
      { campo: 'Tiempo de detección',   valor: '< 1 segundo' },
      { campo: 'Instalación',           valor: 'Superficial, sin obra' },
      { campo: 'Grado de protección',   valor: 'IP68' },
      { campo: 'Integración',           valor: 'API REST + dashboard web' },
    ],
  },
  // El resto de productos se añadirá cuando se carguen las fichas en Supabase.
}

/* ── Iconos SVG inline ligeros ───────────────────────────── */
function KpIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    parking: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
      </svg>
    ),
    nav: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
    leaf: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
        <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
      </svg>
    ),
  }
  return <>{icons[name] ?? icons.dashboard}</>
}

/* ── Page ────────────────────────────────────────────────── */
export default function ProductoPage({
  params,
}: {
  params: { slug: string }
}) {
  const prod = PRODUCTOS[params.slug]

  // Si el producto no está en el catálogo placeholder, mostramos
  // una página "próximamente" en lugar de 404, para no romper
  // los enlaces de categoría mientras se cargan los datos.
  if (!prod) {
    return (
      <>
        <TopBar />
        <div className={styles.proximamente}>
          <div className="container">
            <p className={styles.eyebrow}>Ficha de producto</p>
            <h1>Próximamente</h1>
            <p>Esta ficha de producto estará disponible en breve.</p>
            <Link href="/" className={styles.backBtn}>
              ← Volver al portfolio
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <TopBar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className={styles.productHero}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/">Portfolio</Link>
            <span className={styles.sep}>→</span>
            <Link href={`/categoria/${prod.categoriaSlug}`}>{prod.categoriaNombre}</Link>
            <span className={styles.sep}>→</span>
            <span className={styles.current}>{prod.nombre}</span>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <span className={styles.brandBadge}>{prod.marca}</span>
              <h1>{prod.nombre}</h1>
              <p className={styles.hook}>{prod.gancho}</p>
              <div className={styles.heroActions}>
                <a href="#cta" className={`${styles.btn} ${styles.btnSolid}`}>Solicitar información</a>
                <a href="#cta" className={`${styles.btn} ${styles.btnGhost}`}>Pedir una demo</a>
              </div>
            </div>
            <div className={styles.heroImage}>
              {/* Placeholder foto */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={48} height={48}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* ── QUÉ HACE ─────────────────────────────────────── */}
      <section className={styles.whatdoes}>
        <div className="container">
          <p className={styles.eyebrow}>Qué hace</p>
          <h2 className={styles.sectionTitle}>¿Para qué sirve exactamente?</h2>
          <div className={styles.kpGrid}>
            {prod.quéHace.map((kp, i) => (
              <div key={i} className={styles.kp}>
                <div className={styles.kpIcon}>
                  <KpIcon name={kp.icono} />
                </div>
                <div>
                  <h4>{kp.titulo}</h4>
                  <p>{kp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────── */}
      <section className={styles.howto}>
        <div className="container">
          <p className={styles.eyebrow}>Cómo funciona</p>
          <h2 className={styles.sectionTitle}>Así de simple</h2>
          <div className={styles.steps}>
            {prod.comoFunciona.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.num}>{i + 1}</div>
                <h4>{step.titulo}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ES ────────────────────────────────── */}
      <section className={styles.forwho}>
        <div className="container">
          <p className={styles.eyebrow}>Para quién es</p>
          <h2 className={styles.sectionTitle}>¿Es esto para tu municipio?</h2>
          <div className={styles.whoGrid}>
            {prod.paraQuien.map((who, i) => (
              <div key={i} className={styles.whoCard}>
                <div className={styles.whoIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h4>{who.titulo}</h4>
                <p>{who.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERÍA ──────────────────────────────────────── */}
      <section className={styles.gallery}>
        <div className="container">
          <p className={styles.eyebrow}>Galería</p>
          <h2 className={styles.sectionTitle}>Velo en funcionamiento</h2>
          <div className={styles.galGrid}>
            {[0, 1, 2].map(i => (
              <div key={i} className={styles.galTile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={32} height={32}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FICHA TÉCNICA ────────────────────────────────── */}
      {prod.fichaTecnica && (
        <section className={styles.techspec}>
          <div className="container">
            <div className={styles.spec}>
              <div className={styles.specHead}>
                <span className={styles.specTitle}>Ficha técnica</span>
              </div>
              <div className={styles.specBody}>
                <p className={styles.specNote}>Para perfiles técnicos — información detallada del producto</p>
                <table className={styles.specTable}>
                  <tbody>
                    {prod.fichaTecnica.map(row => (
                      <tr key={row.campo}>
                        <td>{row.campo}</td>
                        <td>{row.valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className={styles.ctaFinal} id="cta">
        <div className="container">
          <h2>¿Te interesa el {prod.nombre}?</h2>
          <p>Cuéntanos las necesidades de tu municipio y te preparamos una propuesta.</p>
          <div className={styles.ctaActions}>
            <Link href="/#contacto" className={`${styles.btn} ${styles.btnTealCta}`}>
              Solicitar información
            </Link>
            <Link href="/#contacto" className={styles.btnOutlineW}>
              Pedir una demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

/* ── generateStaticParams ────────────────────────────────── */
export function generateStaticParams() {
  return Object.keys(PRODUCTOS).map(slug => ({ slug }))
}

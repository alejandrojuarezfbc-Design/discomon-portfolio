import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import TopBar from '../../components/TopBar'
import Footer from '../../components/Footer'
import { getProductoPorSlug } from '../../lib/queries'
import styles from './page.module.css'

export const revalidate = 60

/* Convierte texto plano en líneas limpias (una línea = un paso/tarjeta) */
function lineas(texto: string | null): string[] {
  return (texto ?? '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const prod = await getProductoPorSlug(slug)

  if (!prod) {
    return (
      <>
        <TopBar />
        <div className={styles.proximamente}>
          <div className="container">
            <p className={styles.eyebrow}>Ficha de producto</p>
            <h1>Próximamente</h1>
            <p>Esta ficha de producto estará disponible en breve.</p>
            <Link href="/" className={styles.backBtn}>← Volver al portfolio</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  /* ── Datos derivados ──────────────────────────────────── */
  const queHace = prod.que_hace ?? []
  const pasos = lineas(prod.como_funciona)
  const publicos = lineas(prod.para_quien)
  const fichaLineas = lineas(prod.ficha_tecnica)
  const fotos = prod.fotos_urls ?? []
  const videos = prod.videos_urls ?? []
  const ctaBotones = (prod.cta_texto ?? '')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean)
  const ctaHref = prod.cta_email ? `mailto:${prod.cta_email}` : '/#contacto'

  return (
    <>
      <TopBar />

      <header className={styles.productHero}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/">Portfolio</Link>
            <span className={styles.sep}>→</span>
            {prod.categoria && (
              <>
                <Link href={`/categoria/${prod.categoria.slug}`}>{prod.categoria.nombre}</Link>
                <span className={styles.sep}>→</span>
              </>
            )}
            <span className={styles.current}>{prod.nombre}</span>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              {prod.marca && <span className={styles.brandBadge}>{prod.marca}</span>}
              <h1>{prod.nombre}</h1>
              <p className={styles.hook}>{prod.gancho}</p>
              <div className={styles.heroActions}>
                <a href="#cta" className={`${styles.btn} ${styles.btnSolid}`}>Solicitar información</a>
                <a href="#cta" className={`${styles.btn} ${styles.btnGhost}`}>Pedir una demo</a>
              </div>
            </div>
            <div className={styles.heroImage}>
              {fotos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotos[0]} alt={prod.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={48} height={48}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
              )}
            </div>
          </div>
        </div>
      </header>

      {queHace.length > 0 && (
        <section className={styles.whatdoes}>
          <div className="container">
            <p className={styles.eyebrow}>Qué hace</p>
            <h2 className={styles.sectionTitle}>¿Para qué sirve exactamente?</h2>
            <div className={styles.kpGrid}>
              {queHace.map((kp, i) => (
                <div key={i} className={styles.kp}>
                  <div className={styles.kpIcon}><CheckCircle2 size={22} /></div>
                  <div>
                    <h4>{kp.texto}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {pasos.length > 0 && (
        <section className={styles.howto}>
          <div className="container">
            <p className={styles.eyebrow}>Cómo funciona</p>
            <h2 className={styles.sectionTitle}>Así de simple</h2>
            <div className={styles.steps}>
              {pasos.map((paso, i) => (
                <div key={i} className={styles.step}>
                  <div className={styles.num}>{i + 1}</div>
                  <p>{paso}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {publicos.length > 0 && (
        <section className={styles.forwho}>
          <div className="container">
            <p className={styles.eyebrow}>Para quién es</p>
            <h2 className={styles.sectionTitle}>¿Es esto para tu municipio?</h2>
            <div className={styles.whoGrid}>
              {publicos.map((who, i) => (
                <div key={i} className={styles.whoCard}>
                  <div className={styles.whoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <p>{who}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(fotos.length > 0 || videos.length > 0) && (
        <section className={styles.gallery}>
          <div className="container">
            <p className={styles.eyebrow}>Galería</p>
            <h2 className={styles.sectionTitle}>Velo en funcionamiento</h2>
            {fotos.length > 0 && (
              <div className={styles.galGrid}>
                {fotos.map((url, i) => (
                  <div key={i} className={styles.galTile}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`${prod.nombre} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
            {videos.length > 0 && (
              <div className={styles.galGrid}>
                {videos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={styles.galTile}>
                    ▶ Ver vídeo {i + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {fichaLineas.length > 0 && (
        <section className={styles.techspec}>
          <div className="container">
            <div className={styles.spec}>
              <div className={styles.specHead}>
                <span className={styles.specTitle}>Ficha técnica</span>
              </div>
              <div className={styles.specBody}>
                <p className={styles.specNote}>Para perfiles técnicos — información detallada del producto</p>
                {fichaLineas.map((linea, i) => (
                  <p key={i}>{linea}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={styles.ctaFinal} id="cta">
        <div className="container">
          <h2>¿Te interesa el {prod.nombre}?</h2>
          <p>Cuéntanos las necesidades de tu municipio y te preparamos una propuesta.</p>
          <div className={styles.ctaActions}>
            {(ctaBotones.length > 0 ? ctaBotones : ['Solicitar información']).map((texto, i) => (
              <a
                key={i}
                href={ctaHref}
                className={i === 0 ? `${styles.btn} ${styles.btnTealCta}` : styles.btnOutlineW}
              >
                {texto}
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react'
import TopBar from '../../components/TopBar'
import Footer from '../../components/Footer'
import styles from './page.module.css'

/* ── Datos de categorías ─────────────────────────────────── */
// Aquí irán los datos de Supabase cuando estén listos.
// Por ahora, datos de ejemplo para que el diseño funcione.

const CATEGORIAS: Record<string, {
  titulo: string
  desc: string
  productos: { slug: string; marca: string; nombre: string; gancho: string }[]
}> = {
  'gestion-municipal-digital': {
    titulo: 'Gestión municipal digital',
    desc: 'Digitaliza los servicios de tu municipio',
    productos: [
      { slug: 'city-hall-app',  marca: 'Discomon IoT', nombre: 'City Hall App',   gancho: 'Tu municipio sigue gestionando incidencias por teléfono y papel. Hay una forma mejor.' },
      { slug: 'plataforma-onroll', marca: 'Discomon IoT', nombre: 'Plataforma Onroll', gancho: 'La comunicación con el ciudadano está fragmentada. Una plataforma puede unirlo todo.' },
      { slug: 'panel-led',      marca: 'Discomon IoT', nombre: 'Panel LED',        gancho: 'La información municipal llega tarde y mal. Un panel en el lugar adecuado lo cambia todo.' },
    ],
  },
  'movilidad-y-trafico': {
    titulo: 'Movilidad y tráfico',
    desc: 'Control inteligente del tráfico urbano',
    productos: [
      { slug: 'smart-parking',        marca: 'Discomon IoT', nombre: 'Smart Parking',               gancho: 'Los ciudadanos pierden tiempo buscando aparcamiento. Tu municipio puede solucionar eso.' },
      { slug: 'parking-autocaravanas', marca: 'Discomon IoT', nombre: 'Parking Autocaravanas',        gancho: 'Las autocaravanas aparcan donde pueden. Un área regulada atrae turistas y evita conflictos.' },
      { slug: 'radar-pedagogico',     marca: 'Discomon IoT', nombre: 'Radar Pedagógico',             gancho: 'Los coches superan el límite de velocidad cerca de colegios. Hay una forma de frenarlo.' },
      { slug: 'radar-de-tramo',       marca: 'Discomon IoT', nombre: 'Radar de Tramo',               gancho: 'La velocidad puntual no refleja el peligro real. El tramo completo sí lo hace.' },
      { slug: 'paso-de-peatones',     marca: 'Discomon IoT', nombre: 'Paso de Peatones Inteligente', gancho: 'Los peatones cruzan sin visibilidad. La tecnología puede avisar antes de que pase algo.' },
      { slug: 'cruce-inteligente',    marca: 'Discomon IoT', nombre: 'Cruce Inteligente',            gancho: 'Los cruces sin semáforo son peligrosos. Un sistema adaptativo puede salvar vidas.' },
      { slug: 'cargadores-ve',        marca: 'Discomon IoT', nombre: 'Cargadores para Vehículos Eléctricos', gancho: 'Tu municipio aún no tiene puntos de carga. Los ciudadanos con coche eléctrico lo necesitan ya.' },
      { slug: 'taquillas-patinetes',  marca: 'Discomon IoT', nombre: 'Taquillas para Patinetes',     gancho: 'Los patinetes eléctricos acaban en aceras y portales. Una red de aparcamiento lo soluciona.' },
      { slug: 'marquesinas',          marca: 'DOYS',         nombre: 'Marquesinas de Autobús',       gancho: 'Las paradas de autobús no protegen del sol ni de la lluvia. Pueden ser mucho más que un tejado.' },
    ],
  },
  'medio-ambiente': {
    titulo: 'Medio ambiente',
    desc: 'Monitoriza y mejora el entorno natural',
    productos: [
      { slug: 'sensores-oizom',        marca: 'Discomon IoT', nombre: 'Estación Ambiental OIZOM',     gancho: 'No sabes qué calidad del aire respiran tus ciudadanos. Es hora de medirlo.' },
      { slug: 'control-ruido',         marca: 'Discomon IoT', nombre: 'Control de Ruido',             gancho: 'El ruido urbano afecta la salud. Medir es el primer paso para actuar.' },
      { slug: 'contadores-agua',       marca: 'Discomon IoT', nombre: 'Contadores de Agua Inteligentes', gancho: 'Las fugas de agua se detectan tarde y cuestan caro. Los sensores las detectan al instante.' },
      { slug: 'control-contenedores',  marca: 'Discomon IoT', nombre: 'Control de Contenedores',       gancho: 'El camión de basura pasa aunque el contenedor esté medio vacío. Hay una ruta más inteligente.' },
      { slug: 'caseta-deposito',       marca: 'Discomon IoT', nombre: 'Caseta Depósito de Basuras',    gancho: 'Los residuos en la calle generan conflictos. Una caseta regulada los elimina.' },
      { slug: 'bosques-inteligentes',  marca: 'Discomon IoT', nombre: 'Bosques Inteligentes',          gancho: 'Tu patrimonio forestal necesita vigilancia continua. La tecnología puede hacerlo.' },
      { slug: 'mapa-ambiental',        marca: 'Discomon IoT', nombre: 'Mapa Ambiental',                gancho: 'Los datos ambientales están dispersos. Un mapa los pone en contexto.' },
    ],
  },
  'espacio-publico': {
    titulo: 'Espacio público',
    desc: 'Mobiliario urbano sostenible e inteligente',
    productos: [
      { slug: 'mobiliario-doys',       marca: 'DOYS',         nombre: 'Mobiliario Urbano DOYS',      gancho: 'El mobiliario urbano de tu municipio está envejecido. Hay alternativas sostenibles.' },
      { slug: 'parques-infantiles',    marca: 'DOYS',         nombre: 'Parques Infantiles',          gancho: 'Los parques infantiles viejos suponen un riesgo. Los nuevos invitan a jugar y crecer.' },
      { slug: 'fuente-urbana',         marca: 'DOYS',         nombre: 'Fuente Urbana',              gancho: 'En verano, los ciudadanos necesitan agua potable en la calle. Una fuente moderna lo resuelve.' },
      { slug: 'aparcamiento-bici',     marca: 'DOYS',         nombre: 'Aparcamientos para Bici',    gancho: 'Las bicis se atan a farolas y señales. Un aparcamiento digno fomenta la movilidad sostenible.' },
      { slug: 'modulo-cargador-movil', marca: 'DOYS',         nombre: 'Módulo Cargador Móvil',       gancho: 'Los ciudadanos necesitan carga en zonas de ocio. Un módulo solar lo ofrece sin obra.' },
      { slug: 'solmaforo-uv',          marca: 'Discomon IoT', nombre: 'Solmáforo UV',               gancho: 'Los ciudadanos no saben cuándo protegerse del sol. Un semáforo UV les avisa en tiempo real.' },
      { slug: 'smart-buildings',       marca: 'Discomon IoT', nombre: 'Edificios Inteligentes',      gancho: 'El consumo energético de los edificios municipales es incontrolado. Los sensores lo cambian.' },
    ],
  },
  'instalacion-y-obra': {
    titulo: 'Instalación y obra',
    desc: 'Señalización y alumbrado profesional',
    productos: [
      { slug: 'senalizacion', marca: 'Discomon IoT', nombre: 'Señalización Vial',     gancho: 'La señalización obsoleta genera confusión y accidentes. La renovación es una inversión en seguridad.' },
      { slug: 'alumbrado',    marca: 'Discomon IoT', nombre: 'Alumbrado Público LED', gancho: 'El alumbrado antiguo consume el doble y da peor luz. El LED reduce la factura a la mitad.' },
    ],
  },
}

/* ── Page ────────────────────────────────────────────────── */
export default function CategoriaPage({
  params,
}: {
  params: { slug: string }
}) {
  const cat = CATEGORIAS[params.slug]
  if (!cat) notFound()

  const total = cat.productos.length

  return (
    <>
      <TopBar />

      {/* ── CATEGORY HEADER ──────────────────────────────── */}
      <header className={styles.catHeader}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/">Portfolio</Link>
            <span className={styles.sep}>→</span>
            <span>{cat.titulo}</span>
          </nav>
          <h1>{cat.titulo}</h1>
          <p className={styles.lead}>{cat.desc}</p>
          <div>
            <span className={styles.countBadge}>{total} soluciones disponibles</span>
          </div>
        </div>
      </header>

      {/* ── PRODUCT LIST ─────────────────────────────────── */}
      <section className={styles.products}>
        <div className="container">
          <div className={styles.productList}>
            {cat.productos.map(producto => (
              <article key={producto.slug} className={styles.productRow}>
                <div className={styles.productPhoto}>
                  {/* Placeholder hasta que lleguen las fotos reales */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={34} height={34}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
                <div className={styles.productBody}>
                  <p className={styles.brandTag}>{producto.marca}</p>
                  <h3 className={styles.productName}>{producto.nombre}</h3>
                  <p className={styles.productHook}>{producto.gancho}</p>
                  <Link href={`/producto/${producto.slug}`} className={styles.btnSolution}>
                    Ver solución <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <h2>¿No encuentras lo que buscas?</h2>
          <p>Cuéntanos tu necesidad y te proponemos la solución adecuada.</p>
          <Link href="/#contacto" className="btn-teal">
            Contactar con Discomon
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}

/* ── generateStaticParams ────────────────────────────────── */
export function generateStaticParams() {
  return Object.keys(CATEGORIAS).map(slug => ({ slug }))
}

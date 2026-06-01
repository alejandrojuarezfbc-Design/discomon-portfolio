import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import TopBar from '../../components/TopBar'
import Footer from '../../components/Footer'
import { getCategoriaPorSlug, getProductosPorCategoria } from '../../lib/queries'
import styles from './page.module.css'

export const revalidate = 60

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cat = await getCategoriaPorSlug(slug)
  if (!cat) notFound()

  const productos = await getProductosPorCategoria(cat.id)
  const total = productos.length

  return (
    <>
      <TopBar />

      <header className={styles.catHeader}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/">Portfolio</Link>
            <span className={styles.sep}>→</span>
            <span>{cat.nombre}</span>
          </nav>
          <h1>{cat.nombre}</h1>
          <p className={styles.lead}>{cat.descripcion}</p>
          <div>
            <span className={styles.countBadge}>{total} soluciones disponibles</span>
          </div>
        </div>
      </header>

      <section className={styles.products}>
        <div className="container">
          <div className={styles.productList}>
            {productos.map(producto => (
              <article key={producto.slug} className={styles.productRow}>
                <div className={styles.productPhoto}>
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

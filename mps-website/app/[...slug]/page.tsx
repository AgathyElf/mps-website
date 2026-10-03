import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { PlaceholderNote } from "@/components/placeholder-note";
import { ProgramCard } from "@/components/public-ui";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getPublicPage, publicPages, publicRoutes } from "@/lib/site-content";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return publicRoutes.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPublicPage(slug);
  return {
    title: page ? page.title : "Halaman tidak ditemukan",
    description: page?.intro ?? "Informasi MPS Adyaveda.",
  };
}

export default async function PublicPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = getPublicPage(slug);

  if (!page) {
    return (
      <>
        <SiteHeader />
        <main className="not-found-page">
          <div className="container">
            <span className="section-kicker">404 · Halaman tidak ditemukan</span>
            <h1>Sepertinya halaman ini belum ada.</h1>
            <Link className="button button-primary" href="/">
              Kembali ke beranda <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const isPrograms = slug.length === 1 && slug[0] === "programs";

  return (
    <>
      <a className="skip-link" href="#main-content">
        Langsung ke konten utama
      </a>
      <SiteHeader />
      <main id="main-content" className="inner-page">
        <section className="page-hero">
          <div className="container">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Beranda</Link>
              <ChevronRight size={14} aria-hidden="true" />
              {isPrograms ? (
                <span aria-current="page">Program</span>
              ) : (
                <span aria-current="page">{page.shortTitle}</span>
              )}
            </nav>
            <div className="page-hero-grid">
              <div>
                <span className="section-kicker">
                  MPS Adyaveda · Majelis Permusyawaratan Siswa
                </span>
                <h1>{page.title}</h1>
                <p className="page-intro">{page.intro}</p>
              </div>
              <div className="page-hero-aside">
                <PlaceholderNote />
                <span>Informasi resmi belum tersedia</span>
              </div>
            </div>
            <div className="page-hero-bottom">
              <span>MPS Adyaveda</span>
              <span>Konten publik organisasi</span>
            </div>
          </div>
        </section>

        <section className="page-content section-pad">
          <div className="container page-content-grid">
            <div className="page-content-label">
              <span className="section-kicker">Informasi</span>
              <span className="content-index">01 / 01</span>
            </div>
            <div className="page-content-main">
              <PlaceholderNote />
              <h2>{page.sectionTitle}</h2>
              <p className="page-body-copy">{page.sectionBody}</p>

              {isPrograms ? (
                <div className="program-grid">
                  <ProgramCard
                    href="/programs/detail-program"
                    title="Detail program (placeholder)"
                    description="Contoh halaman detail saja. Nama, tujuan, dan jadwal program belum tersedia."
                  />
                </div>
              ) : null}

              {slug[0] === "structure" ? (
                <div className="placeholder-panel">
                  <span className="placeholder-panel-icon" aria-hidden="true">
                    —
                  </span>
                  <div>
                    <strong>Bagan organisasi</strong>
                    <p>
                      Bagan kepengurusan akan ditampilkan setelah data resmi
                      tersedia.
                    </p>
                  </div>
                </div>
              ) : null}

              {slug[0] === "contact" ? (
                <div className="placeholder-panel">
                  <span className="placeholder-panel-icon" aria-hidden="true">
                    @
                  </span>
                  <div>
                    <strong>Informasi narahubung</strong>
                    <p>
                      Kanal komunikasi resmi akan diumumkan setelah
                      dikonfirmasi.
                    </p>
                  </div>
                </div>
              ) : null}

              {slug[0] === "ad-art" ? (
                <div className="placeholder-panel">
                  <span className="placeholder-panel-icon" aria-hidden="true">
                    §
                  </span>
                  <div>
                    <strong>Dokumen belum tersedia</strong>
                    <p>
                      Dokumen yang belum disahkan atau diverifikasi tidak
                      ditampilkan sebagai dokumen resmi.
                    </p>
                  </div>
                </div>
              ) : null}

              <Link className="inline-link page-next-link" href={page.nextHref}>
                {page.nextLabel}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="related-pages">
          <div className="container related-inner">
            <span className="section-kicker">Jelajahi MPS</span>
            <div className="related-links">
              {Object.entries(publicPages)
                .filter(([path]) => path !== slug[0])
                .slice(0, 4)
                .map(([path, item]) => (
                  <Link href={`/${path}`} key={path}>
                    {item.shortTitle}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

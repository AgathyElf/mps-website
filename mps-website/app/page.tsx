import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  FileText,
  MoveUpRight,
  ScrollText,
  UsersRound,
} from "lucide-react";
import { PlaceholderNote } from "@/components/placeholder-note";
import {
  ActionLink,
  ContentCard,
  ProgramCard,
  Section,
  SectionHeading,
} from "@/components/public-ui";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

const resourceLinks = [
  { href: "/structure", label: "Struktur organisasi", icon: UsersRound },
  { href: "/documentation", label: "Dokumentasi", icon: FileText },
  { href: "/achievements", label: "Pencapaian", icon: ArrowUpRight },
  { href: "/ad-art", label: "AD/ART", icon: ScrollText },
  { href: "/reports", label: "Laporan kegiatan", icon: FileText },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Langsung ke konten utama
      </a>
      <SiteHeader />
      <main id="main-content">
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                Majelis Permusyawaratan Siswa
              </span>
              <h1>
                MPS
                <br />
                <span>Adyaveda.</span>
              </h1>
              <p className="hero-description">
                Situs publik MPS Adyaveda. Informasi organisasi akan
                diperbarui setelah materi resminya tersedia.
              </p>
              <PlaceholderNote />
              <div className="hero-actions">
                <ActionLink href="/about">
                  Tentang MPS <ArrowRight size={17} aria-hidden="true" />
                </ActionLink>
                <Link className="text-link" href="/programs">
                  Program kerja <ArrowDownRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="hero-art">
              <span className="hero-art-label">Lambang organisasi</span>
              <Image
                className="hero-logo"
                src="/mps-adyaveda-logo.jpeg"
                width={328}
                height={328}
                alt="Lambang resmi MPS Adyaveda"
                priority
              />
              <span className="hero-art-caption">
                MPS Adyaveda
                <span>Majelis Permusyawaratan Siswa</span>
              </span>
            </div>
          </div>
          <div className="container hero-bottom">
            <span>MPS Adyaveda</span>
            <span className="hero-bottom-rule" aria-hidden="true" />
            <span>Informasi publik organisasi</span>
          </div>
        </section>

        <Section className="intro-section" id="about">
          <div className="container intro-grid">
            <div>
              <span className="section-kicker">Tentang MPS Adyaveda</span>
              <h2 className="section-title">
                Informasi organisasi
                <br />
                <em>segera hadir.</em>
              </h2>
            </div>
            <div className="intro-copy">
              <PlaceholderNote />
              <p>
                Profil, tujuan, dan informasi resmi MPS Adyaveda belum
                diberikan. Bagian ini akan diperbarui setelah kontennya
                dikonfirmasi.
              </p>
              <Link className="inline-link" href="/about">
                Baca tentang MPS Adyaveda
                <MoveUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Section>

        <Section className="explore-section" id="programs">
          <div className="container">
            <SectionHeading
              eyebrow="Program kerja"
              title={
                <>
                  Informasi program
                  <br />
                  <em>akan tersedia.</em>
                </>
              }
              description="Belum ada daftar program resmi yang diberikan."
            />
            <div className="quick-grid program-grid">
              <ProgramCard
                href="/programs/detail-program"
                title="Detail program (placeholder)"
                description="Contoh halaman detail saja. Nama, tujuan, dan jadwal program belum tersedia."
              />
            </div>
            <Link className="inline-link section-more-link" href="/programs">
              Lihat halaman program kerja
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Section>

        <Section className="resources-section" id="documentation">
          <div className="container resources-grid">
            <div className="resources-intro">
              <SectionHeading
                eyebrow="Dokumentasi"
                title={
                  <>
                    Arsip kegiatan
                    <br />
                    <em>akan hadir.</em>
                  </>
                }
              />
              <PlaceholderNote />
              <p>
                Belum ada foto atau materi dokumentasi yang disediakan untuk
                dipublikasikan.
              </p>
              <Link className="inline-link" href="/documentation">
                Buka dokumentasi
                <MoveUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ContentCard
              title="Dokumentasi kegiatan"
              description="Foto dan catatan kegiatan akan ditampilkan setelah materi resmi tersedia."
              note="Konten sementara — belum ada kegiatan yang ditambahkan."
            />
          </div>
        </Section>

        <Section className="organization-section">
          <div className="container organization-grid">
            <SectionHeading
              eyebrow="Informasi organisasi"
              title={
                <>
                  Halaman publik
                  <br />
                  <em>MPS Adyaveda.</em>
                </>
              }
              description="Halaman organisasi yang informasinya akan dilengkapi setelah dikonfirmasi."
            />
            <div className="resource-list">
              {resourceLinks.map(({ href, label, icon: Icon }, index) => (
                <Link className="resource-item" href={href} key={href}>
                  <span className="resource-index">
                    0{index + 1}
                    <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <span className="resource-label">{label}</span>
                  <ArrowUpRight
                    className="resource-arrow"
                    size={19}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </Section>

        <section className="contact-banner">
          <div className="container contact-banner-inner">
            <div>
              <span className="section-kicker">Kontak</span>
              <h2>
                Informasi kontak
                <br />
                <em>akan tersedia.</em>
              </h2>
            </div>
            <ActionLink href="/contact" variant="light">
              Halaman kontak <ArrowRight size={17} aria-hidden="true" />
            </ActionLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { getAuthProfile, type AuthProfile } from "@/lib/auth/session";

const primaryLinks = [
  { href: "/about", label: "Tentang MPS" },
  { href: "/structure", label: "Struktur" },
  { href: "/programs", label: "Program" },
  { href: "/documentation", label: "Dokumentasi" },
];

const moreLinks = [
  { href: "/achievements", label: "Pencapaian" },
  { href: "/ad-art", label: "AD/ART" },
  { href: "/reports", label: "Laporan kegiatan" },
];

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="MPS Adyaveda — Beranda">
      <Image
        className="brand-logo"
        src="/mps-adyaveda-logo.jpeg"
        width={52}
        height={52}
        alt="Logo resmi MPS Adyaveda"
      />
      <span className="brand-name">
        <strong>MPS Adyaveda</strong>
        <span>Majelis Permusyawaratan Siswa</span>
      </span>
    </Link>
  );
}

function SiteHeaderContent({ profile }: { profile: AuthProfile | null }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {primaryLinks.map(({ href, label }) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
          <details className="nav-more">
            <summary>
              Lainnya <ChevronDown size={14} aria-hidden="true" />
            </summary>
            <div className="nav-dropdown">
              {moreLinks.map(({ href, label }) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
            </div>
          </details>
        </nav>
        <div className="header-actions">
          <Link className="header-contact" href="/contact">
            Kontak <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <AuthButton profile={profile} />
        </div>
        <details className="mobile-nav">
          <summary aria-label="Buka navigasi">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="Navigasi seluler">
            {[...primaryLinks, ...moreLinks, { href: "/contact", label: "Kontak" }].map(
              ({ href, label }) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ),
            )}
            <AuthButton profile={profile} mobile />
          </nav>
        </details>
      </div>
    </header>
  );
}

async function AuthenticatedSiteHeader() {
  const profile = await getAuthProfile();
  return <SiteHeaderContent profile={profile} />;
}

export function SiteHeader() {
  return (
    <Suspense fallback={<SiteHeaderContent profile={null} />}>
      <AuthenticatedSiteHeader />
    </Suspense>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Brand />
          <p>
            Situs publik MPS Adyaveda. Informasi resmi akan ditambahkan setelah
            tersedia.
          </p>
        </div>
        <div className="footer-links">
          <span className="footer-label">Jelajahi</span>
          <Link href="/about">Tentang MPS</Link>
          <Link href="/structure">Struktur organisasi</Link>
          <Link href="/programs">Program kerja</Link>
          <Link href="/documentation">Dokumentasi</Link>
        </div>
        <div className="footer-links">
          <span className="footer-label">Informasi</span>
          <Link href="/achievements">Pencapaian</Link>
          <Link href="/ad-art">AD/ART</Link>
          <Link href="/reports">Laporan kegiatan</Link>
          <Link href="/contact">Kontak</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© MPS Adyaveda</span>
        <span>Majelis Permusyawaratan Siswa</span>
        <Link href="/" aria-label="Kembali ke beranda">
          Kembali ke atas ↑
        </Link>
      </div>
    </footer>
  );
}

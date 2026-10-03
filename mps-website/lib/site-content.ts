export type PublicPage = {
  title: string;
  shortTitle: string;
  intro: string;
  sectionTitle: string;
  sectionBody: string;
  nextHref: string;
  nextLabel: string;
};

const placeholderIntro =
  "Informasi resmi untuk halaman ini belum tersedia dan akan ditambahkan setelah dikonfirmasi oleh MPS Adyaveda.";

export const publicPages: Record<string, PublicPage> = {
  about: {
    title: "Tentang MPS Adyaveda",
    shortTitle: "Tentang MPS",
    intro: placeholderIntro,
    sectionTitle: "Profil organisasi",
    sectionBody:
      "Profil, visi, misi, dan informasi resmi MPS Adyaveda akan dimuat di sini setelah tersedia.",
    nextHref: "/structure",
    nextLabel: "Struktur organisasi",
  },
  structure: {
    title: "Struktur Organisasi",
    shortTitle: "Struktur",
    intro: placeholderIntro,
    sectionTitle: "Susunan organisasi",
    sectionBody:
      "Bagan, nama anggota, dan pembagian peran belum tersedia. Informasi akan ditambahkan setelah susunan resmi dikonfirmasi.",
    nextHref: "/programs",
    nextLabel: "Program kerja",
  },
  programs: {
    title: "Program Kerja",
    shortTitle: "Program",
    intro: placeholderIntro,
    sectionTitle: "Program MPS Adyaveda",
    sectionBody:
      "Daftar program, tujuan, dan jadwal belum tersedia. Tidak ada program resmi yang dicantumkan sebagai contoh.",
    nextHref: "/documentation",
    nextLabel: "Dokumentasi",
  },
  documentation: {
    title: "Dokumentasi",
    shortTitle: "Dokumentasi",
    intro: placeholderIntro,
    sectionTitle: "Dokumentasi kegiatan",
    sectionBody:
      "Foto dan dokumentasi kegiatan akan ditambahkan setelah materi resmi tersedia dan disetujui untuk dipublikasikan.",
    nextHref: "/achievements",
    nextLabel: "Pencapaian",
  },
  achievements: {
    title: "Pencapaian",
    shortTitle: "Pencapaian",
    intro: placeholderIntro,
    sectionTitle: "Pencapaian MPS",
    sectionBody:
      "Informasi pencapaian belum tersedia. Halaman ini tidak mencantumkan hasil atau penghargaan yang belum diverifikasi.",
    nextHref: "/ad-art",
    nextLabel: "AD/ART",
  },
  "ad-art": {
    title: "AD/ART",
    shortTitle: "AD/ART",
    intro: placeholderIntro,
    sectionTitle: "Dokumen organisasi",
    sectionBody:
      "Dokumen Anggaran Dasar dan Anggaran Rumah Tangga akan ditampilkan setelah berkas resmi tersedia.",
    nextHref: "/reports",
    nextLabel: "Laporan kegiatan",
  },
  reports: {
    title: "Laporan Kegiatan",
    shortTitle: "Laporan",
    intro: placeholderIntro,
    sectionTitle: "Laporan dan aktivitas",
    sectionBody:
      "Laporan dan informasi aktivitas belum tersedia. Konten akan dimuat setelah dikonfirmasi oleh MPS Adyaveda.",
    nextHref: "/contact",
    nextLabel: "Kontak",
  },
  contact: {
    title: "Kontak",
    shortTitle: "Kontak",
    intro: placeholderIntro,
    sectionTitle: "Informasi kontak",
    sectionBody:
      "Informasi kontak resmi belum tersedia. Kanal komunikasi akan ditambahkan setelah dikonfirmasi.",
    nextHref: "/about",
    nextLabel: "Tentang MPS Adyaveda",
  },
};

export const programDetailPage: PublicPage = {
  title: "Detail Program (Placeholder)",
  shortTitle: "Program",
  intro:
    "Halaman detail sementara. Nama dan informasi program belum diberikan.",
  sectionTitle: "Informasi program",
  sectionBody:
    "Deskripsi, tujuan, jadwal, dan informasi program lainnya akan ditambahkan setelah detail resmi tersedia. Halaman ini bukan informasi tentang program yang sudah ditetapkan.",
  nextHref: "/programs",
  nextLabel: "Kembali ke program kerja",
};

export const publicRoutes = [
  ["about"],
  ["structure"],
  ["programs"],
  ["programs", "detail-program"],
  ["documentation"],
  ["achievements"],
  ["ad-art"],
  ["reports"],
  ["contact"],
];

export function getPublicPage(slug: string[]) {
  if (
    slug.length === 2 &&
    slug[0] === "programs" &&
    slug[1] === "detail-program"
  ) {
    return programDetailPage;
  }
  return slug.length === 1 ? publicPages[slug[0]] : undefined;
}

# HAKKU Design System & Direction

> **Project**: HAKKU (Digital Legal Companion)  
> **Target Audience**: Masyarakat Indonesia pencari keadilan dan kepastian hukum  
> **Brand Persona**: Berwibawa, objektif, menenangkan, terstruktur, berbasis peraturan perundang-undangan Republik Indonesia

---

## 1. Dial Liveliness (Antislop Direction)

- **ENERGY**: `2` (Seimbang, profesional hukum, bukan landing page startup mencolok atau template gelap tanpa alasan).
- **RHYTHM**: `2` (Struktur bertahap mengikuti langkah formil hukum: Cerita Masalah -> Klarifikasi Fakta -> Ringkasan Kasus -> Opsi & Checklist Tindakan).
- **MOTION**: `1` (Animasi fungsional dan halus hanya saat transisi status atau pergantian langkah, zero endless loops/spins).

---

## 2. Palet Warna (Color System)

- **Primary Brand**: `#005bbb` (Biru Institusional Terpercaya, rasio kontras 6.28:1 terhadap latar putih, memenuhi WCAG AA).
- **Primary Hover**: `#004691`
- **Primary Light**: `#e8f0fe` (Latar aksen lembut, kontras 5.5:1 terhadap teks primer).
- **Accent**: `#ff8c00` (Oranye Penegas untuk batas perhatian penting).
- **Latar Belakang**: `#f9fafb` (Netral lembut, ramah di mata).
- **Permukaan (Card/Modal)**: `#ffffff`
- **Teks Utama**: `#202124` (Kontras 16.0:1 terhadap latar putih).
- **Teks Pendukung (Muted)**: `#5f6368` (Kontras 6.03:1 terhadap latar putih).
- **Border**: `#dadce0`
- **Status Hijau (Sukses/Sah)**: `#137333` / `#e6f4ea`
- **Status Kuning (Peringatan/Perhatian)**: `#8a4b08` / `#fef7e0`
- **Status Merah (Bahaya/Kedaruratan)**: `#b3261e` / `#fce8e6`

---

## 3. Tipografi

- **Font Family**: System UI sans-serif (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
- **Skala Ukuran**:
  - H1 / Hero: `text-2xl` s.d. `text-4xl`, `font-extrabold`, `tracking-tight`
  - H2 / Section: `text-xl` s.d. `text-2xl`, `font-bold`
  - H3 / Card: `text-base` s.d. `text-lg`, `font-bold`
  - Body: `text-sm` / `text-base`, `leading-relaxed`
  - Caption / Legal Note: `text-xs` / `text-[11px]`, `text-brand-muted`
- **Prinsip**: Tipografi mengutamakan keterbacaan (*legibility*) dokumen hukum bagi masyarakat awam tanpa trik monospace dekoratif.

---

## 4. Komponen & Aksesibilitas

- **Sentuhan Mobile (Tap Targets)**: Semua elemen interaktif wajib memenuhi batas sentuh minimum 44 x 44 px (`.min-touch-target`).
- **Fokus Keyboard**: Setiap elemen input/tombol memiliki indikator fokus `:focus-visible` (ring 2px solid) untuk pengguna keyboard.
- **Hierarki Kartu**: Kartu draf dan kalkulator disusun berbasis konten nyata (bukan bento-grid generic atau template 3 kolom tanpa dasar).
- **Ikonografi**: Menggunakan ikon domain hukum nyata (`Scale`, `FileText`, `Calculator`, `ShieldCheck`, `CheckCircle2`), menolak glif generik AI (`Sparkles`).

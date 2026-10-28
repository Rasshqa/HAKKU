<div align="center">

# ⚖️ HAKKU (V2) — Digital Legal Companion

### *Pahami Hakmu. Tentukan Langkahmu.*

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5-Flash_API-8E75C2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-48%20Passed-success?style=for-the-badge)](https://nodejs.org/)
[![Code Quality](https://img.shields.io/badge/ESLint-0%20Errors-success?style=for-the-badge)](https://eslint.org/)

**Platform Pendamping Hukum Digital Berbasis AI & Basis Regulasi Terverifikasi Republik Indonesia**  
*Dirancang Khusus untuk Traspac Competition 2027 — Kategori Web/Mobile Apps (Bidang Sosial)*

---

</div>

## 📌 1. Latar Belakang & Masalah (*Justice Gap*)

Di Indonesia, jutaan masyarakat rentan (pekerja kontrak, korban penipuan daring, penyewa rumah) seringkali mengalami pelanggaran hak perdata dan ketenagakerjaan, namun urung mencari keadilan karena:

1. **Barier Bahasa Hukum (*Legalese*):** Peraturan perundang-undangan sulit dipahami oleh masyarakat awam.
2. **Ketiadaan Struktur Bukti & Kronologi:** Korban melapor ke dinas atau kepolisian hanya dengan "cerita lisan" tanpa matriks alat bukti yang sah menurut hukum acara.
3. **Biaya Konsultasi Hukum Mahal:** Tarif jasa advokat di awal seringkali melampaui kemampuan finansial masyarakat.
4. **Bahaya Halusinasi AI Generik:** Menggunakan chatbot umum (seperti ChatGPT atau model standar) berisiko tinggi menghasilkan nomor pasal palsu, tanggal kedaluwarsa keliru, dan rujukan fiktif yang merugikan perkara di pengadilan.

**HAKKU hadir sebagai jembatan inklusif.** HAKKU memandu pengguna dari kebingungan awal dengan bahasa sehari-hari menjadi kronologi fakta terstruktur, kalkulasi hak statuter presisi, dokumen hukum formil siap cetak, dan matriks bukti yang siap diserahkan ke advokat atau Pos Bantuan Hukum (Posbankum).

---

## 🚀 2. Enam Modul Inovasi Utama (*Key Innovations*)

HAKKU menghadirkan 6 modul inovatif yang saling terintegrasi dalam alur *modular monolith*:

```
                        ┌──────────────────────────────────────────────┐
                        │              ALUR HAKKU V2                   │
                        └──────────────────────┬───────────────────────┘
                                               │
               1. INTAKE & TRIASE KESELAMATAN  ▼  (/pendampingan)
             ┌─────────────────────────────────────────────────────────┐
             │ Deteksi Kedaruratan • Redaksi Fakta vs Ketidaktahuan    │
             └─────────────────────────┬───────────────────────────────┘
                                       │
               2. TANYA AI & ASESMEN   ▼  (/konsultasi)
             ┌─────────────────────────────────────────────────────────┐
             │ Wawancara Interaktif • Ekstraksi Pasal • Smart Prompts  │
             └─────────────────────────┬───────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     │                                 │                                 │
     ▼ 3. GENERATOR SURAT FORMIL       ▼ 4. KALKULATOR STATUTER          ▼ 5. AUDIT MATRIKS BUKTI
    (/dokumen)                        (/kalkulator)                     (/bukti)
┌───────────────────────────┐     ┌───────────────────────────┐     ┌───────────────────────────┐
│ • Draf Bipartit UU 2/2004 │     │ • PP 35/2021 Pasal 40-52  │     │ • KUHAP 184 / HIR Matrix  │
│ • Somasi KUHPerdata 1238  │     │ • Kompensasi PKWT Ps 15   │     │ • Skor Kesiapan Bukti     │
│ • Lembar Fakta Posbankum  │     │ • Ganti Rugi Sisa Kontrak │     │ • Draf Laporan Pengaduan  │
└───────────────────────────┘     └───────────────────────────┘     └───────────────────────────┘
                                       │
               6. STATUTORY COUNTDOWN  ▼  (/kasus/[code])
             ┌─────────────────────────────────────────────────────────┐
             │ Masa Tunggu 14 Hari Bipartit • Unlocking Disnaker Step  │
             └─────────────────────────────────────────────────────────┘
```

### 1. Modul Intake & Triase Keselamatan (`/pendampingan`)
- **Triage Otomatis:** Memindai potensi kekerasan fisik, ancaman pidana langsung, atau situasi darurat untuk segera menampilkan kontak darurat resmi (*SAPPA 129, Polisi 110, YLBHI*).
- **Protokol Pemisahan Fakta (*Fact Separation*):** Secara tegas memisahkan fakta yang telah diketahui (`knownFacts`) dengan celah informasi yang belum terjawab (`unknownFacts`).
- **Penyaring Permintaan Ilegal:** Secara otomatis menolak dan memperingatkan permintaan kejahatan (seperti instruksi meretas, membuat surat palsu, dsb.).

### 2. Wawancara Tanya AI & Asesmen Real-Time (`/konsultasi`)
- **Pendampingan Interaktif Hakki:** Maskot Kancil Bijak menyertai proses wawancara dengan 4 ekspresi dinamis (*welcoming, listening, thinking, advising*).
- **Real-Time Statutory Assessment Card:** Mengekstraksi secara langsung kategori perkara, pasal relevan, potensi nilai klaim, kelengkapan berkas, dan menyajikan tombol aksi cepat (*quick action chips*).
- **Mode Dual-Engine:** Mendukung koneksi frontier Google Gemini 2.5 Flash API dengan fallback otomatis ke *deterministic rule engine* jika tanpa internet atau tanpa API key.

### 3. Generator Draf Surat Formil Siap Pakai (`/dokumen`)
- **Permohonan Perundingan Bipartit:** Sesuai mandat Pasal 3 ayat 1 UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial (PPHI).
- **Surat Peringatan / Somasi Perdata:** Sesuai Pasal 1238 KUHPerdata dengan klausul batas waktu pemenuhan prestasi (7–14 hari).
- **Lembar Fakta & Kronologi Bantuan Hukum:** Standar ringkasan kronologis untuk diserahkan ke Pos Bantuan Hukum (Posbankum) pengadilan atau kantor advokat.
- **Produktivitas Tinggi:** Dilengkapi tombol salin teks, unduh format `.txt` (dengan shortcut `Ctrl+S`), dan cetak siap tanda tangan (`window.print`).

### 4. Kalkulator Kompensasi Ketenagakerjaan Statuter (`/kalkulator`)
- **Perhitungan Deterministik:** Menghitung hak finansial pekerja sesuai **PP No. 35 Tahun 2021**:
  - *Uang Pesangon (UP):* Pasal 40 ayat 2 (1 s.d. 9 bulan upah).
  - *Uang Penghargaan Masa Kerja (UPMK):* Pasal 40 ayat 3 (2 s.d. 10 bulan upah).
  - *Uang Penggantian Hak (UPH):* Pasal 40 ayat 4 (cuti tahunan belum gugur, ongkos pulang).
  - *Kompensasi PKWT (Karyawan Kontrak):* Pasal 15 dengan rumus eksak `(Masa Kerja / 12) * Upah Bulanan`.
  - *Ganti Rugi Pemutusan PKWT Sepihak:* Pasal 17 (sisa bulan kontrak + uang kompensasi).
  - *Multiplier Alasan PHK:* Pasal 43–52 (efisiensi rugi 0.5x, efisiensi laba 1x, pailit 0.5x, pensiun 1.75x, meninggal 2x, resign sukarela 0x).

### 5. Audit Matriks Bukti & Laporan Pengaduan (`/bukti`)
- **Klasifikasi Alat Bukti Hukum Indonesia:** Berdasarkan Pasal 184 KUHAP dan HIR/RBg (Surat/Dokumen Tertulis, Bukti Elektronik, Keterangan Saksi, Keterangan Pelapor, Kuitansi Finansial).
- **Skor Kesiapan Berkas (*Readiness Score*):** Menilai kekuatan berkas (0 s.d. 100%) dan memberikan diagnosa konkret terhadap bukti vital yang belum terpenuhi.
- **Generator Laporan Pengaduan:** Menyusun naskah formal laporan pengaduan lengkap dengan kode pembuktian formil (`[P-1]`, `[P-2]`, `[P-3]`, dst.).

### 6. Statutory Response Countdown Tracker (`/kasus/[code]`)
- **Pengawalan Masa Tunggu Hukum:** Menghitung mundur batas waktu 14 hari kerja untuk tanggapan bipartit (UU 2/2004) atau 7–14 hari somasi perdata (KUHPerdata 1238).
- **Unlocking Langkah Berikutnya:** Saat masa tunggu habis tanpa tanggapan iktikad baik, sistem otomatis mengaktifkan panduan langkah eskalasi hukum (misal: pendaftaran mediasi ke Suku Dinas Tenaga Kerja / Tripartit).
- **Arsitektur React 19:** Menggunakan `useSyncExternalStore` untuk memastikan sinkronisasi multi-tab dan penyimpanan `localStorage` tanpa efek samping re-render.

---

## 📚 3. Korpus Hukum Terverifikasi (*Verified Legal Corpus*)

HAKKU menjamin prinsip **Zero Hallucination** dengan membatasi analisis hukum pada korpus regulasi resmi Republik Indonesia yang terdaftar di [`src/modules/legal/corpus.ts`](src/modules/legal/corpus.ts):

| Peraturan Perundang-Undangan | Pasal Rujukan | Relevansi Hukum |
| :--- | :--- | :--- |
| **PP No. 35 Tahun 2021** | Pasal 15, 17, 40, 43, 50 | Kompensasi PKWT, pesangon, penghargaan masa kerja, dan multiplier PHK. |
| **UU No. 13 Tahun 2003** | Pasal 156, 160 | Ketenagakerjaan dan perlindungan hak dasar pekerja. |
| **UU No. 2 Tahun 2004 (PPHI)** | Pasal 3 ayat 1 & 2 | Kewajiban perundingan Bipartit (maks 30 hari kerja) sebelum mediasi/konsiliasi. |
| **Kitab Undang-Undang Hukum Perdata (KUHPerdata)** | Pasal 1238, 1243 | Somasi tertulis penetapan batas waktu pemenuhan prestasi dan ganti rugi wanprestasi. |
| **UU No. 8 Tahun 1999 (UUPK)** | Pasal 4, 7, 19 | Hak konsumen atas informasi jujur, ganti rugi barang rusak/fiktif, dan transaksi digital. |
| **Kitab Undang-Undang Hukum Acara Pidana (KUHAP)** | Pasal 184 | 5 alat bukti yang sah dalam hukum pembuktian Indonesia. |
| **UU No. 27 Tahun 2022 (UU PDP)** | Pasal 5, 8, 35 | Perlindungan data pribadi pengguna dan hak penghapusan data secara permanen. |

---

## 🛠️ 4. Stack Teknologi & Arsitektur

- **Framework:** Next.js 16.4.2 (App Router, Turbopack, Partial Prerendering / Cache Components).
- **UI & Runtime:** React 19.3.0, Tailwind CSS v4, Lucide React Icons.
- **Bahasa Pemrograman:** TypeScript 5 (Strict Mode, 100% Type Checked).
- **Basis Data:** Neon Serverless Postgres (`pg.Pool` connection pooling).
- **Otentikasi:** Neon Auth (`@neondatabase/auth` Managed Better Auth).
- **Kecerdasan Buatan:** Google Gemini 2.5 Flash API via REST (`generateContent`) dengan cadangan *Mock Rule-Based Engine*.
- **Validasi Data:** Zod v4 (Strict schema parsing & bounds validation).
- **Testing:** Node.js Native Test Runner (`tsx --test`) — 48 Unit & Integration Tests.

---

## 🗄️ 5. Skema Basis Data (Neon Postgres)

Aplikasi mengadopsi skema database relasional terisolasi di [`src/modules/db/migrate.ts`](src/modules/db/migrate.ts):

```sql
-- Tabel Perkara Pengguna
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_code VARCHAR(32) NOT NULL UNIQUE,
  user_id VARCHAR(128),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  category_label VARCHAR(128) NOT NULL,
  urgency_level VARCHAR(32) NOT NULL DEFAULT 'normal',
  original_story TEXT NOT NULL,
  structured_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Checklist Tindakan Kasus
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_code_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  item_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

*Catatan: Jika `DATABASE_URL` tidak diisi (misal dalam lingkungan offline), aplikasi secara mulus beralih ke `InMemoryCaseRepository` tanpa menimbulkan crash.*

---

## 📡 6. Referensi REST API

| Endpoint | Method | Deskripsi | Validasi / Keamanan |
| :--- | :--- | :--- | :--- |
| `/api/intake/analyze` | `POST` | Menganalisis cerita awal, safety triage, dan menyusun fakta. | Zod schema, min 10 karakter, max 10.000 karakter. |
| `/api/consultation/chat` | `POST` | Sesi percakapan AI, ekstraksi pasal hukum, dan rekomendasi aksi. | Zod validation, max 50 pesan riwayat, dipotong ke 20 pesan terakhir. |
| `/api/documents/generate` | `POST` | Menghasilkan draf dokumen hukum formil lengkap. | Template enum checking, validasi entitas pengirim/penerima. |
| `/api/calculator` | `POST` | Menghitung nominal kompensasi pesangon/PKWT statuter. | Cap upah bulanan (max Rp 10 Miliar), validasi masa kerja. |
| `/api/evidence/audit` | `POST` | Mengevaluasi inventaris bukti dan skor kesiapan berkas. | Validasi tipe bukti KUHAP 184, validasi minimal 1 bukti. |
| `/api/cases` | `GET` | Mengambil daftar perkara terdaftar (untuk halaman `/akun`). | Filter user ID, pagination aman. |
| `/api/cases` | `POST` | Menyimpan perkara baru ke Neon Postgres / In-Memory. | `generateCaseCode` via `crypto.randomBytes(2)`. |
| `/api/cases/[idOrCode]` | `GET` | Mengambil detail lengkap suatu perkara berdasarkan kode. | Regex check `^[a-zA-Z0-9_-]{1,64}$`. |
| `/api/cases/[idOrCode]` | `DELETE` | Menghapus perkara secara permanen (Hak Hapus UU PDP). | Regex check `^[a-zA-Z0-9_-]{1,64}$`. |
| `/api/cases/[idOrCode]/checklist` | `PATCH` | Memperbarui status centang checklist langkah hukum. | Validasi payload `itemId` dan `completed` boolean. |
| `/api/auth/[...path]` | `ALL` | Handler integrasi otentikasi Neon Auth / Better Auth. | Delegasi aman ke `@neondatabase/auth`. |

---

## 🛡️ 7. Pengerasan Keamanan (*Security Hardening*)

HAKKU menerapkan arsitektur *Zero Trust* pada setiap lapisan:

1. **HTTP Security Headers (`next.config.ts`):**
   - `X-Content-Type-Options: nosniff` (Mencegah sniffing tipe MIME).
   - `X-Frame-Options: SAMEORIGIN` (Mencegah serangan *Clickjacking*).
   - `X-XSS-Protection: 1; mode=block`.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
2. **Kriptografi Kode Kasus:**
   - Menggunakan `crypto.randomBytes(2)` menghasilkan kode acak `HK-YYYY-XXXX` (misal: `HK-2026-A8F2`) untuk mencegah serangan *Insecure Direct Object Reference* (IDOR) dan *parameter enumeration*.
3. **Pencegahan Denial of Service (DoS):**
   - Pembatasan konteks LLM maksimum 20 pesan terakhir dengan batas teks 5.000 karakter per pesan.
   - Pembatasan nilai numerik kalkulator untuk mencegah *integer overflow* atau eksekusi *denial-of-service*.
4. **Kepatuhan Privasi Data Pribadi (UU PDP No. 27/2022):**
   - Mendukung penghapusan permanen data kasus (*Right to Erasure*) melalui `DELETE /api/cases/[idOrCode]`.
   - Tidak mencatat data pribadi atau fakta perkara ke terminal console logs publik.

---

## 🚀 8. Panduan Menjalankan Sistem (*Getting Started*)

### 1. Prasyarat Lingkungan
- **Node.js:** Versi `>= 20.0.0` (Direkomendasikan v22 atau v26 LTS)
- **NPM:** Versi `>= 10.0.0`
- **Git**

### 2. Kloning & Pemasangan Dependensi
```bash
git clone https://github.com/username/HAKKU-V2.git
cd HAKKU-V2
npm install
```

### 3. Konfigurasi Lingkungan (`.env.local`)
Salin berkas template lingkungan:
```bash
cp .env.example .env.local
```
Sesuaikan konfigurasi pada `.env.local`:
```env
# Mode LLM: 'mock' (default offline) atau 'gemini'
LLM_PROVIDER=mock
GEMINI_API_KEY=your_gemini_api_key_here

# Basis Data Neon Postgres (Opsional, fallback otomatis ke in-memory jika kosong)
DATABASE_URL=postgres://user:your_password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Neon Auth (Opsional untuk login/daftar terkelola)
NEON_AUTH_BASE_URL=https://auth.neon.tech
```

### 4. Menjalankan Mode Pengembangan (Local Dev Server)
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 5. Skrip Pengujian & Verifikasi Kualitas
Repositori ini dilengkapi dengan standar verifikasi ketat:

```bash
# 1. Jalankan Typechecker TypeScript tanpa kompilasi
npm run typecheck

# 2. Jalankan Linter ESLint (Harus 0 error, 0 warning)
npm run lint

# 3. Jalankan Seluruh Test Suite (48 tests pada 11 suites)
npm test

# 4. Jalankan Uji Koneksi End-to-End Neon Database
npm run test:e2e

# 5. Kompilasi Produksi Next.js Turbopack (20/20 Routes Prerendered)
npm run build
```

---

## 📁 9. Struktur Direktori Proyek

```text
HAKKU-V2/
├── .env.example             # Template konfigurasi environment tanpa kredensial
├── next.config.ts           # Konfigurasi Next.js 16 (Security Headers, Turbopack Root)
├── package.json             # Dependensi dan skrip eksekusi
├── tsconfig.json            # Konfigurasi TypeScript strict mode
├── docs/                    # Dokumentasi arsitektur dan spesifikasi mendalam
│   └── ARCHITECTURE.md      # Spesifikasi arsitektur teknis lengkap sistem
├── src/
│   ├── app/                 # Next.js App Router (Layouts & Pages)
│   │   ├── layout.tsx       # Root Layout (Navigasi Header & Footer Berdisclaimer)
│   │   ├── page.tsx         # Beranda interaktif & launcher intake
│   │   ├── pendampingan/    # Alur intake & konfirmasi fakta bertahap
│   │   ├── konsultasi/      # Halaman Wawancara Tanya AI dengan Maskot Hakki
│   │   ├── dokumen/         # Generator Draf Surat Formil
│   │   ├── kalkulator/      # Kalkulator Kompensasi Ketenagakerjaan Statuter
│   │   ├── bukti/           # Audit Matriks Bukti & Laporan Pengaduan
│   │   ├── kasus/[code]/    # Detail Perkara & Statutory Countdown Tracker
│   │   ├── akun/            # Portal Riwayat & Manajemen Perkara Tersimpan
│   │   ├── rujukan/         # Direktori Lembaga Bantuan Hukum (LBH & Posbankum)
│   │   ├── tentang/         # Profil HAKKU, Batasan Layanan, & Kebijakan Privasi
│   │   └── api/             # REST Endpoints (Intake, Chat, Doc, Calc, Evidence, Cases)
│   ├── components/          # Komponen UI Terisolasi
│   │   ├── case/            # StatutoryCountdownTracker, CaseDetail, dsb.
│   │   ├── consultation/    # ConsultationChatInterface, AssessmentCard, QuickPrompts
│   │   ├── document/        # LegalDocumentGenerator, Preview, CustomFieldsForm
│   │   ├── calculator/      # CompensationCalculator, BreakdownCard
│   │   ├── evidence/        # EvidenceAuditWorkspace, EvidenceItemRow, IncidentReport
│   │   ├── mascot/          # MascotHakki (Kancil Bijak 4 state emosi)
│   │   └── layout/          # Header, Footer, MobileNav
│   ├── lib/                 # Utilitas Inti
│   │   ├── formatters.ts    # Format mata uang Rupiah, tanggal resmi, & kode kasus
│   │   ├── confetti.ts      # Efek micro-interaction perayaan aksi hukum
│   │   └── utils.ts         # ClassNames combiner (clsx + tailwind-merge)
│   └── modules/             # Domain Logic & Business Rules
│       ├── ai/              # Provider abstraction (Gemini 2.5 & Mock Rule Provider)
│       ├── calculator/      # PP 35/2021 Statutory Compensation Rules & Formulas
│       ├── consultation/    # Chat analysis, prompt generation, extraction engine
│       ├── db/              # Neon Postgres Pool, Schema Migrations, & Repository
│       ├── document/        # Legal document generator & templates
│       ├── evidence/        # KUHAP 184 evaluator, scoring, & incident report generator
│       ├── intake/          # Safety triage, fact separation, & story structuring
│       └── legal/           # Verified legal corpus data (UU, PP, KUHPerdata, KUHAP)
└── tests/                   # Test Suite Lengkap
    ├── ai.test.ts           # Pengujian validasi Zod & fallback AI engine
    ├── calculator.test.ts   # Pengujian matematis kompensasi PP 35/2021
    ├── consultation.test.ts # Pengujian ekstraksi pasal & asesmen konsultasi
    ├── database.test.ts     # Pengujian repository pattern & persistensi
    ├── document.test.ts     # Pengujian generasi draf surat formil
    ├── domain.test.ts       # Pengujian alur intake & pemisahan fakta
    ├── evidence.test.ts     # Pengujian skor bukti KUHAP 184 & laporan
    └── tracker.test.ts      # Pengujian countdown masa tunggu hukum
```

---

## ⚖️ 10. Pernyataan Batasan Layanan (*Legal Disclaimer*)

> **PENTING DIBACA:**  
> HAKKU adalah platform teknologi pendamping hukum digital (*digital legal companion*) yang bertujuan untuk memberikan edukasi awal, merapikan kronologi fakta, dan memfasilitasi navigasi langkah hukum awal bagi masyarakat.  
> **HAKKU bukan kantor hukum, bukan advokat berlisensi, dan tidak bertindak mewakili pengguna di hadapan lembaga peradilan atau kepolisian.**  
> Informasi yang dihasilkan oleh HAKKU tidak menjamin hasil akhir perkara dan tidak boleh ditafsirkan sebagai nasihat hukum formal yang mengikat. Setiap perkara hukum memiliki keunikan fakta yang memerlukan konsultasi langsung dengan advokat resmi atau Lembaga Bantuan Hukum (LBH) terakreditasi.

---

<div align="center">

**Dikembangkan dengan integritas untuk Traspac Competition 2027**  
*Mewujudkan Keadilan yang Aksesibel, Transparan, dan Terpercaya bagi Seluruh Rakyat Indonesia.*

</div>

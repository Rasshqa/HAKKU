# Standarisasi Tata Naskah Surat Resmi Indonesia & Pemeriksa Klausul Kontrak (HAKKU)

Pembaruan ini menyempurnakan akurasi tata letak draf surat formil agar sesuai dengan standar Tata Naskah Surat Resmi Indonesia (sebagaimana pada gambar referensi), menambahkan template eskalasi pengaduan resmi ke instansi negara (Mediasi Tripartit Disnaker dan BPSK), serta menghadirkan fitur baru **Pemeriksa Klausul Kontrak & Perjanjian (Contract Red-Flag Scanner)**.

## User Review & Critical Decisions

> [!IMPORTANT]
> Seluruh preferensi yang Anda konfirmasi telah dikunci ke dalam rencana implementasi ini:

- **Mode Kop Surat Fleksibel (Instansi/Organisasi vs. Perorangan)**: Pengguna dapat beralih antara **Mode Kop Instansi/Serikat/Kuasa** (dilengkapi logo di sisi kiri, nama instansi/lembaga rata tengah dengan huruf kapital tebal, alamat & telepon, serta garis ganda tebal-tipis) dan **Mode Surat Perorangan** (tanpa kop instansi untuk warga yang mengirim surat atas nama pribadi).
- **Tata Letak & Kaki Surat Autentik (Tanpa Stempel HAKKU)**: Stempel bundar *"HAKKU RI Verified"* dihapus sepenuhnya dan digantikan oleh anatomi surat resmi Indonesia: titimangsa (tempat & tanggal) di kanan atas, blok `Nomor / Lampiran / Perihal` sejajar titik dua (`:`), rincian jadwal/agenda sejajar titik dua, **blok tanda tangan di kanan bawah** (jabatan/peran, ruang tanda tangan/materai, nama terang), serta daftar **Tembusan** resmi di kiri bawah.
- **Ekspansi Template Surat Pengaduan Instansi**: Menambahkan template **Surat Permohonan Pencatatan Perselisihan Hubungan Industrial (Mediasi Tripartit Disnaker)** dan **Surat Pengaduan Sengketa Konsumen ke BPSK**.
- **Fitur Baru — Pemeriksa Klausul Kontrak Berbahaya**: Modul analisis klausul kontrak kerja (PKWT), sewa-menyewa, dan pinjaman untuk mendeteksi klausul yang timpang atau batal demi hukum beserta rekomendasi kalimat negosiasinya.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Menyusun dokumen surat hukum yang tercetak persis seperti surat dinas/resmi Indonesia (tata letak HTML/CSS terstruktur untuk layar, cetak A4, dan unduhan PDF).
  2. Memeriksa draf kontrak kerja (PKWT/PKWTT), perjanjian sewa, atau pinjaman sebelum ditandatangani warga untuk mendeteksi klausul berbahaya (seperti penahanan ijazah asli, denda pinalti sepihak, penghapusan uang kompensasi PKWT, atau pelepasan hak gugat).
- **Target Audience / Persona**: Pekerja kontrak/tetap, penyewa properti, konsumen, serta pengurus serikat pekerja atau pendamping komunitas yang membutuhkan naskah surat resmi yang sah secara formil dan telaah kontrak yang mudah dipahami.
- **Key Value**: Menghindari penolakan berkas akibat format surat yang tidak lazim sekaligus mencegah warga terjebak menandatangani perjanjian yang merugikan posisi hukumnya.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Alur Penyusunan Surat Resmi (`/dokumen` & Tab Ruang Perkara)**:
     - Pengguna memilih jenis surat dari 5 template formil: *(1) Permohonan Bipartit, (2) Pengaduan Mediasi Tripartit Disnaker, (3) Somasi Wanprestasi Perdata, (4) Pengaduan Sengketa BPSK, (5) Kronologi Bantuan Hukum LBH*.
     - Pengguna memilih **Mode Kop Surat**: *Mode Kop Instansi / Organisasi* (dengan isian nama instansi/serikat, sub-unit, alamat kop, dan telepon) atau *Mode Perorangan*.
     - Pratinjau kertas A4 merender tata letak surat resmi secara presisi: garis ganda kop surat, tanggal rata kanan, tabulasi titik dua (`:`) untuk `Nomor`, `Lampiran`, `Perihal`, tujuan `Kepada Yth. ... di tempat`, isi paragraf rata kiri-kanan (*justify*), rincian `Tanggal / Pukul / Hari / Tempat` sejajar titik dua, tanda tangan kanan bawah, dan `Tembusan` di kiri bawah.
  2. **Alur Pemeriksa Klausul Kontrak (`/kontrak`)**:
     - Pengguna memilih kategori perjanjian (*Kontrak Kerja PKWT/PKWTT*, *Perjanjian Sewa Properti*, atau *Perjanjian Pinjaman/Jasa*) lalu menempelkan teks klausul kontrak atau memuat contoh kontrak uji.
     - Saat tombol **Periksa Klausul Kontrak** ditekan, sistem membedah setiap pasal/klausul di dalam teks dan menampilkan ringkasan tingkat keamanan kontrak beserta kartu rincian per klausul (*Klausul Berbahaya / Batal Demi Hukum*, *Klausul Perlu Negosiasi*, dan *Klausul Wajar*).
     - Setiap temuan menampilkan kutipan kalimat asli, pasal undang-undang yang dilanggar, penjelasan risiko secara lugas, dan tombol **Salin Usulan Revisi Klausul** untuk diajukan ke HRD atau pemilik sewa.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: *Institutional Legal Workspace* — bersih, berwibawa, dan berfokus pada keterbacaan dokumen cetak maupun tabel pemeriksaan.
  - *Color Palette & Mood*: Kanvas netral terang (`#F8F9FA`) dan permukaan kertas putih bersih (`#FFFFFF`), dipadukan dengan aksen utama biru tua (`#1B365D`), garis struktural tegas, serta indikator semantik terukur: merah (`#DC2626`) untuk klausul batal demi hukum/berisiko tinggi, kuning kecokelatan (`#D97706`) untuk klausul timpang yang perlu dinegosiasikan, dan hijau (`#16A34A`) untuk klausul yang sesuai regulasi.
  - *Typography & Hierarchy*: `Plus Jakarta Sans` untuk navigasi dan kontrol antarmuka, `Georgia / Times New Roman` (serif formal) khusus pada lembar kertas surat A4 agar identik dengan dokumen dinas/hukum standar Indonesia, serta `JetBrains Mono` (`tabular-nums`) untuk nomor surat, nilai rupiah, dan pasal.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Struktur Kertas Surat Berbasis Layout Terstruktur vs. Teks Polos (`pre-wrap`)**
  - *Chosen Approach*: Merender pratinjau surat menggunakan komponen tata letak terstruktur (flexbox/grid tabel titik dua, perataan kanan untuk tanggal dan tanda tangan, serta perataan *justify* untuk paragraf) namun tetap menyediakan mode edit teks penuh bila pengguna ingin mengubah kalimat secara manual.
  - *Why*: Teks polos dengan spasi manual tidak pernah menghasilkan penjajaran titik dua (`:`), garis ganda kop surat, maupun blok tanda tangan kanan bawah yang rapi seperti pada gambar referensi ketika diunduh sebagai PDF A4.
- **Decision 2: Mesin Analisis Klausul Kontrak Hibrida (Aturan Regulasi Deterministik + Analisis Kontekstual Server)**
  - *Chosen Approach*: Menggabungkan pemindai pola klausul hukum positif Indonesia (UU No. 13/2003 jo. UU No. 6/2023, PP No. 35/2021, Pasal 1320 & 1338 KUHPerdata, POJK 10/2022) dengan endpoint analisis server `/api/contract/analyze`.
  - *Why*: Menjamin kecepatan respons instan, kutipan pasal yang 100% terverifikasi tanpa mengarang nomor undang-undang, dan tetap bekerja andal baik saat online maupun offline.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        HAKKU FRONTEND WORKSPACE                            │
├──────────────────────────────────────┬─────────────────────────────────────┤
│   Generator Surat Resmi (/dokumen)   │  Pemeriksa Kontrak (/kontrak)       │
│  ┌────────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ Pilihan Mode:                  │  │  │ Input Teks Kontrak & Preset   │  │
│  │ • Mode Kop Instansi/Organisasi │  │  │ (PKWT / Sewa / Pinjaman)      │  │
│  │ • Mode Surat Perorangan        │  │  └──────────────┬────────────────┘  │
│  └───────────────┬────────────────┘  │                 ▼                   │
│                  ▼                   │  ┌───────────────────────────────┐  │
│  ┌────────────────────────────────┐  │  │ Peta Risiko Klausul:          │  │
│  │ 5 Template Formil:             │  │  │ • Batal Demi Hukum (Merah)    │  │
│  │ 1. Perundingan Bipartit        │  │  │ • Perlu Negosiasi (Kuning)    │  │
│  │ 2. Pengaduan Tripartit Disnaker│  │  │ • Sesuai Regulasi (Hijau)     │  │
│  │ 3. Somasi Wanprestasi          │  │  │ + Salin Draf Revisi Klausul   │  │
│  │ 4. Pengaduan Sengketa BPSK     │  │  └──────────────┬────────────────┘  │
│  │ 5. Permohonan Konsultasi LBH   │  │                 │                   │
│  └───────────────┬────────────────┘  └─────────────────┼───────────────────┘
│                  ▼                                     ▼                   │
│  ┌────────────────────────────────┐     ┌───────────────────────────────┐  │
│  │ Kanvas Kertas A4 Tata Naskah   │     │ Server Endpoint & Rule Engine │  │
│  │ • Kop & Garis Ganda Tebal-Tipis│     │ • POST /api/contract/analyze  │  │
│  │ • Tanggal Rata Kanan           │     │ • Evaluasi Pasal UU 13/2003,  │  │
│  │ • Tabel Nomor/Lampiran/Perihal │     │   PP 35/2021, KUHPerdata      │  │
│  │ • Tanda Tangan Kanan Bawah     │     └───────────────────────────────┘  │
│  │ • Tembusan Resmi & Ekspor PDF  │                                        │
│  └────────────────────────────────┘                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

1. **Struktur Data Surat Resmi (`StructuredLegalLetter`)**:
   - `headerMode`: `"institutional"` | `"personal"`
   - `letterhead`: `{ institutionLine1, institutionLine2, address, phone }`
   - `letterNumber`, `attachmentCount`, `subject`
   - `city`, `dateFormatted`
   - `recipient`: `{ title, name, roleOrUnit, locationLabel }`
   - `openingParagraph`, `factItems`, `legalBasisParagraph`
   - `scheduleTable`: array pasangan `{ label, value }` untuk merender bagian `Tanggal`, `Pukul`, `Hari`, `Tempat`, dan `Agenda / Tuntutan Pokok` dengan titik dua sejajar seperti gambar referensi.
   - `closingParagraph`
   - `signatory`: `{ roleTitle, fullName, idLabel }`
   - `ccList` (*Tembusan*): daftar instansi tembusan (opsional/dapat diedit).

2. **Struktur Analisis Klausul Kontrak (`ContractAuditResult`)**:
   - `contractType`: `"pkwt_labor"` | `"tenancy_lease"` | `"loan_service"`
   - `overallRiskLevel`: `"high_risk"` | `"moderate_risk"` | `"safe"`
   - `summaryText`: ringkasan temuan keseluruhan
   - `findings`: daftar temuan berisi `{ id, clauseExcerpt, title, severity, legalBasis, explanation, recommendedRevision }`.

### Interactive Component & State Mapping

- **Pemilih Mode Kop & Template Surat**: Mengubah state `headerMode` dan `selectedType` secara reaktif, memperbarui struktur tabel `Nomor / Lampiran / Perihal`, jadwal kegiatan, serta daftar tembusan tanpa merusak isian identitas pengguna.
- **Ekspor PDF A4 & Cetak**: Menangkap elemen `#hakku-legal-document-paper` yang telah diformat sesuai Tata Naskah Surat Resmi Indonesia menjadi berkas PDF A4 bersih tanpa elemen dekoratif palsu.
- **Pemindai Klausul Kontrak (`/kontrak`)**: Memvalidasi input teks kontrak, memanggil `/api/contract/analyze` (dengan fallback deterministik instan), menyediakan filter berdasarkan tingkat bahaya klausul, tombol penyalin kalimat negosiasi, serta pintasan langsung untuk membuka Generator Surat Bipartit/Somasi berdasarkan temuan kontrak.

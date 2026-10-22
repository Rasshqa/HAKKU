# HAKKU --- Backend Scheme dan Data Model

**Versi:** 1.1\
**Status:** Skema konseptual baseline; detail implementasi menunggu
pilihan stack\
**Mengacu pada:** `00-spesifikasi-induk.md`,
`02-technical-requirements.md`

## 0. Batas backend untuk prototype lomba

Backend perlu cukup nyata untuk menunjukkan logika aplikasi, penggunaan database, dan keamanan, tetapi tidak perlu mengimplementasikan semua visi jangka panjang. Untuk demo, utamakan alur intake → ringkasan → jawaban bersumber → checklist. Jika penyimpanan akun/kasus belum lolos uji otorisasi, gunakan sesi demo sintetis tanpa menyimpan perkara nyata.

Skema dan endpoint di dokumen ini bersifat rancangan. Hanya klaim fitur yang telah diimplementasikan dan diuji yang boleh ditampilkan sebagai fitur aktif dalam pitch deck atau video.

## 1. Prinsip data

-   Simpan hanya data yang dibutuhkan untuk fungsi yang aktif.
-   Setiap data perkara memiliki pemilik dan aturan akses yang
    eksplisit.
-   Semua otorisasi diperiksa di server pada setiap request.
-   Dokumen bersifat privat secara default.
-   Perubahan penting dicatat sebagai audit event minimal.
-   Jangan menyimpan teks penuh perkara ke log operasional.
-   Data demo harus sintetis dan tidak dapat mengidentifikasi orang
    nyata.

## 2. Entitas utama

### `users`

  -----------------------------------------------------------------------
  Kolom                   Tipe konseptual         Catatan
  ----------------------- ----------------------- -----------------------
  `id`                    UUID                    PK, berasal dari auth
                                                  system atau dipetakan

  `display_name`          text nullable           Minimalkan data

  `created_at`            timestamp               UTC

  `updated_at`            timestamp               UTC

  `deleted_at`            timestamp nullable      Soft-delete hanya jika
                                                  kebijakan mengharuskan
  -----------------------------------------------------------------------

Jangan menyimpan password plaintext atau mengimplementasikan hashing
autentikasi sendiri bila menggunakan provider auth.

### `cases`

  -----------------------------------------------------------------------
  Kolom                   Tipe konseptual         Catatan
  ----------------------- ----------------------- -----------------------
  `id`                    UUID                    PK

  `owner_user_id`         UUID                    FK `users.id`

  `title`                 text                    Judul singkat

  `category`              text nullable           Klasifikasi awal, bukan
                                                  putusan hukum

  `status`                enum/text terbatas      `draft`, `active`,
                                                  `awaiting_help`,
                                                  `closed_by_user`,
                                                  `deleted`

  `urgency_level`         enum nullable           Harus berasal dari
                                                  kebijakan tervalidasi

  `created_at`            timestamp               UTC

  `updated_at`            timestamp               UTC

  `deleted_at`            timestamp nullable      Ikuti retensi
  -----------------------------------------------------------------------

### `case_intakes`

  -----------------------------------------------------------------------
  Kolom                   Tipe konseptual         Catatan
  ----------------------- ----------------------- -----------------------
  `id`                    UUID                    PK

  `case_id`               UUID                    FK `cases.id`

  `user_statement`        text                    Sensitif; minimalkan
                                                  dan batasi retensi

  `clarification_data`    JSONB                   Validasi schema; jangan
                                                  menyimpan field
                                                  berlebihan

  `facts_summary`         JSONB/text              Tandai sumber fakta dan
                                                  status konfirmasi

  `confirmed_at`          timestamp nullable      Waktu konfirmasi
                                                  pengguna

  `created_at`            timestamp               UTC
  -----------------------------------------------------------------------

### `legal_sources`

  -----------------------------------------------------------------------
  Kolom                   Tipe konseptual         Catatan
  ----------------------- ----------------------- -----------------------
  `id`                    UUID                    PK

  `title`                 text                    Judul sumber

  `source_type`           text                    Peraturan, putusan,
                                                  panduan institusi, dll.

  `issuer`                text nullable           Institusi penerbit

  `source_url`            text                    URL sumber

  `published_at`          date nullable           Jika diketahui

  `effective_from`        date nullable           Jika diketahui

  `effective_to`          date nullable           Jika diketahui

  `legal_status`          text                    `verified_current`,
                                                  `historical`,
                                                  `unknown`,
                                                  `needs_review`

  `retrieved_at`          timestamp               Waktu pengambilan

  `version_label`         text nullable           Versi/identitas dokumen

  `content_hash`          text nullable           Deteksi perubahan

  `reviewed_at`           timestamp nullable      Tanggal tinjauan

  `reviewed_by`           text nullable           Identitas reviewer
                                                  internal/ahli, sesuai
                                                  kebijakan
  -----------------------------------------------------------------------

Metadata status tidak boleh diasumsikan otomatis benar hanya dari
tanggal pengambilan.

### `legal_chunks`

  -----------------------------------------------------------------------
  Kolom                   Tipe konseptual         Catatan
  ----------------------- ----------------------- -----------------------
  `id`                    UUID                    PK

  `legal_source_id`       UUID                    FK `legal_sources.id`

  `section_label`         text nullable           Pasal/ayat/bagian

  `content`               text                    Konten yang boleh
                                                  diindeks

  `embedding`             vector nullable         Aktif hanya bila vector
                                                  search dipilih

  `metadata`              JSONB                   Halaman, bahasa,
                                                  yurisdiksi, dsb.

  `created_at`            timestamp               UTC
  -----------------------------------------------------------------------

### `ai_responses`

  Kolom                 Tipe konseptual   Catatan
  --------------------- ----------------- -----------------------------------
  `id`                  UUID              PK
  `case_id`             UUID nullable     FK `cases.id`
  `request_id`          text              Korelasi operasional
  `model_provider`      text              Nama provider/model
  `prompt_version`      text              Versi konfigurasi
  `response_summary`    text              Hindari menyimpan data berlebihan
  `uncertainty_flags`   JSONB             Ketidakpastian/eskalasi
  `created_at`          timestamp         UTC

Jika penyimpanan jawaban lengkap tidak diperlukan, simpan
ringkasan/metadata saja. Kebijakan retensi harus eksplisit.

### `ai_response_sources`

  Kolom               Tipe konseptual   Catatan
  ------------------- ----------------- -----------------------
  `ai_response_id`    UUID              FK `ai_responses.id`
  `legal_source_id`   UUID              FK `legal_sources.id`
  `legal_chunk_id`    UUID nullable     Chunk yang digunakan
  `rank`              integer           Urutan retrieval
  `citation_label`    text nullable     Label untuk UI

### `case_tasks`

  -----------------------------------------------------------------------
  Kolom                   Tipe konseptual         Catatan
  ----------------------- ----------------------- -----------------------
  `id`                    UUID                    PK

  `case_id`               UUID                    FK `cases.id`

  `title`                 text                    Tindakan/checklist

  `description`           text nullable           Instruksi umum

  `status`                enum                    `todo`, `done`,
                                                  `skipped`

  `due_date`              date nullable           Jangan isi otomatis
                                                  tanpa dasar
                                                  terverifikasi

  `created_at`            timestamp               UTC

  `updated_at`            timestamp               UTC
  -----------------------------------------------------------------------

### `case_documents` (aktifkan setelah keamanan file siap)

  Kolom                   Tipe konseptual      Catatan
  ----------------------- -------------------- ----------------------------------------------
  `id`                    UUID                 PK
  `case_id`               UUID                 FK `cases.id`
  `uploaded_by_user_id`   UUID                 FK `users.id`
  `storage_key`           text                 Private key, bukan public URL
  `original_filename`     text                 Sanitasi; pertimbangkan privasi
  `mime_type`             text                 Allowlist
  `size_bytes`            bigint               Batas ukuran
  `scan_status`           text                 `pending`, `clean`, `blocked`, `unavailable`
  `created_at`            timestamp            UTC
  `deleted_at`            timestamp nullable   Retensi

### `referral_services`

  -----------------------------------------------------------------------
  Kolom                   Tipe konseptual         Catatan
  ----------------------- ----------------------- -----------------------
  `id`                    UUID                    PK

  `name`                  text                    Nama layanan

  `service_type`          text                    LBH, Posbankum, layanan
                                                  instansi, dll.

  `jurisdiction`          text nullable           Wilayah layanan

  `contact_url`           text nullable           URL terverifikasi

  `contact_details`       JSONB nullable          Data publik yang sesuai

  `verification_status`   text                    `verified`,
                                                  `unverified`,
                                                  `needs_review`,
                                                  `inactive`

  `verified_at`           timestamp nullable      Tanggal verifikasi

  `source_url`            text nullable           Sumber data

  `updated_at`            timestamp               UTC
  -----------------------------------------------------------------------

### `audit_events`

  Kolom                 Tipe konseptual   Catatan
  --------------------- ----------------- ---------------------------------------------
  `id`                  UUID              PK
  `actor_user_id`       UUID nullable     Null untuk proses sistem
  `case_id`             UUID nullable     Referensi bila relevan
  `action`              text              Misalnya `case.updated`, `document.deleted`
  `request_id`          text nullable     Korelasi
  `created_at`          timestamp         UTC
  `metadata_redacted`   JSONB             Tanpa teks perkara atau secrets

## 3. Relasi utama

``` mermaid
erDiagram
    USERS ||--o{ CASES : owns
    CASES ||--o{ CASE_INTAKES : contains
    CASES ||--o{ CASE_TASKS : tracks
    CASES ||--o{ CASE_DOCUMENTS : stores
    CASES ||--o{ AI_RESPONSES : receives
    AI_RESPONSES ||--o{ AI_RESPONSE_SOURCES : cites
    LEGAL_SOURCES ||--o{ LEGAL_CHUNKS : contains
    LEGAL_SOURCES ||--o{ AI_RESPONSE_SOURCES : referenced_by
    LEGAL_CHUNKS ||--o{ AI_RESPONSE_SOURCES : retrieved_as
```

## 4. API konseptual

Prefix: `/api/v1`

  Method     Endpoint                     Tujuan
  ---------- ---------------------------- --------------------------------------------
  `POST`     `/cases`                     Membuat draft kasus
  `GET`      `/cases`                     Daftar kasus milik pengguna
  `GET`      `/cases/:id`                 Detail kasus yang diotorisasi
  `PATCH`    `/cases/:id`                 Memperbarui judul/status yang diizinkan
  `DELETE`   `/cases/:id`                 Memulai penghapusan sesuai kebijakan
  `POST`     `/cases/:id/intake`          Menyimpan input/klarifikasi
  `POST`     `/cases/:id/summary`         Menghasilkan ringkasan fakta
  `POST`     `/cases/:id/ask`             Jawaban AI bersumber
  `GET`      `/legal-sources/search?q=`   Cari sumber yang diizinkan
  `GET`      `/referrals`                 Daftar rujukan dengan filter wilayah/jenis
  `POST`     `/cases/:id/tasks`           Menambah checklist
  `PATCH`    `/cases/:id/tasks/:taskId`   Mengubah status checklist

Endpoint di atas adalah rancangan, bukan klaim bahwa API telah tersedia.
Semua endpoint harus memvalidasi input, autentikasi, otorisasi objek,
rate limit, dan output.

## 5. Kontrak respons AI yang disarankan

``` json
{
  "summary": "Ringkasan singkat",
  "known_facts": ["Fakta yang dinyatakan pengguna"],
  "unknowns": ["Informasi yang belum tersedia"],
  "general_options": [
    {
      "title": "Opsi",
      "rationale": "Alasan umum",
      "preparation": ["Informasi/dokumen yang mungkin relevan"]
    }
  ],
  "sources": [
    {
      "source_id": "uuid",
      "title": "Judul sumber",
      "section": "Bagian/pasal",
      "url": "https://...",
      "status": "verified_current"
    }
  ],
  "uncertainty": ["Hal yang belum bisa dipastikan"],
  "escalation_needed": false,
  "disclaimer": "Informasi awal; bukan pengganti nasihat profesional."
}
```

Validasi schema sebelum UI. `sources` tidak boleh dibuat oleh model
tanpa pencocokan ke database sumber.

## 6. Otorisasi dan isolasi data

-   Periksa `owner_user_id` atau grant akses yang eksplisit untuk setiap
    operasi.
-   Jangan mengandalkan penyembunyian tombol di frontend.
-   Jika menggunakan PostgreSQL RLS, aktifkan policy per tabel dan uji
    dengan role nyata.
-   Hindari akses langsung dari client ke tabel sensitif kecuali policy
    benar-benar membatasi.
-   Akses mitra/administrator harus melalui role dan hubungan kasus yang
    eksplisit.
-   Tambahkan tes negatif: pengguna A tidak dapat membaca, mengubah,
    menghapus, atau memperoleh signed URL milik pengguna B.

## 7. Indeks dan retensi

Indeks awal: - `cases(owner_user_id, updated_at DESC)` -
`case_tasks(case_id, status)` -
`legal_sources(legal_status, source_type)` - indeks pencarian pada
judul/konten sesuai teknologi yang dipilih.

Retensi: - Tetapkan jadwal untuk intake, respons AI, dokumen, dan audit
event. - Penghapusan harus mencakup storage object dan salinan turunan
sesuai kebijakan. - Jangan menetapkan masa retensi final sebelum
peninjauan hukum dan kebutuhan operasional.

## 8. Migrasi dan seed

-   Semua perubahan skema melalui migration files.
-   Seed hanya memuat data sintetis atau sumber yang boleh digunakan.
-   Simpan sumber hukum beserta metadata dan tanggal pengambilan.
-   Jangan menaruh data pengguna nyata di seed, fixture, atau screenshot
    demo.

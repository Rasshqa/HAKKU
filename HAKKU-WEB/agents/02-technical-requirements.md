# HAKKU --- Technical Requirements Document (TRD)

**Versi:** 1.1\
**Status:** Rekomendasi teknis baseline; teknologi spesifik tetap
Proposed sampai diverifikasi\
**Mengacu pada:** `00-spesifikasi-induk.md`, `01-prd.md`

## 0. Batas teknis untuk Traspac Competition 2027

Target rilis lomba adalah **30 Desember 2026**. Penilaian Web/Mobile Apps mencakup logika kode (15), UI (15), keamanan (10), kemudahan instalasi (10), kreativitas (10), performa (10), pengetahuan kode (10), database (10), dan kerapian kode (10).

Dampak teknis:
- Satu aplikasi web responsif lebih realistis daripada membangun web dan native mobile bersamaan.
- Prioritaskan alur yang berfungsi, instalasi berulang, database yang dapat dijelaskan, serta tes akses dan error.
- Sertakan README, `.env.example`, migrasi/seed database, dan instruksi reset data demo.
- Jangan memasukkan secret atau data pribadi ke GitHub.
- Pilih dependency yang sedikit dan umum; kemudahan pemasangan adalah kriteria penilaian.
- Jangan mengklaim seluruh fitur production-ready hanya karena demo berhasil.

## 1. Tujuan

Mendefinisikan batasan teknis untuk membangun prototype HAKKU yang aman,
dapat didemonstrasikan, dan tidak menimbulkan beban operasi berlebihan
bagi satu developer dengan bantuan AI coding.

## 2. Prinsip arsitektur

1.  **Monolith modular terlebih dahulu.** Jangan mulai dari
    microservices.
2.  **Server owns trust.** Semua pemeriksaan izin dan penggunaan secrets
    dilakukan di server.
3.  **AI adalah dependency, bukan sumber kebenaran.** Hasil AI harus
    terikat pada sumber terkelola dan evaluasi.
4.  **Privacy by default.** Data sensitif tidak dikumpulkan atau
    disimpan tanpa kebutuhan jelas.
5.  **Provider abstraction.** AI, penyimpanan, email, dan pencarian
    hukum diakses melalui interface agar dapat diganti.
6.  **No fake integrations.** Demo simulasi diberi label; integrasi
    eksternal hanya disebut aktif setelah diuji.
7.  **Progressive delivery.** Mulai dari data demo non-sensitif;
    aktifkan fitur sensitif setelah security gate lulus.

## 3. Stack yang diusulkan

  -----------------------------------------------------------------------
  Lapisan                 Pilihan baseline        Catatan
                          (Proposed)              
  ----------------------- ----------------------- -----------------------
  Web                     Next.js + TypeScript    Satu aplikasi web
                                                  responsif

  UI                      Tailwind CSS + komponen Tetapkan satu
                          aksesibel               pendekatan; hindari
                                                  beberapa UI framework

  API                     Route handlers/server   Pisahkan modul domain,
                          layer di aplikasi       bukan deployment
                          Next.js                 

  Database                PostgreSQL terkelola    Migrasi skema wajib;
                                                  jangan mengandalkan
                                                  perubahan manual

  Auth                    Provider terkelola yang Pilih setelah menilai
                          mendukung secure        biaya, RLS, dan
                          sessions                kemudahan

  AI                      Provider LLM melalui    API key hanya di server
                          server-side adapter     

  Retrieval               PostgreSQL              Jangan menambah vector
                          full-text/metadata      DB sebelum diperlukan
                          dulu; vector search     
                          setelah korpus siap     

  File storage            Private object storage  Dapat ditunda; jangan
                                                  simpan file sensitif di
                                                  public bucket

  Testing                 Unit/integration +      Pilih satu alat E2E
                          Playwright atau setara  

  Hosting                 Platform managed yang   Evaluasi biaya,
                          mendukung env           logging, dan region
                          separation              data
  -----------------------------------------------------------------------

Stack ini bukan klaim bahwa provider tertentu sudah dipilih atau
diverifikasi.

## 4. Lingkungan

-   `local`: pengembangan lokal dengan data sintetis.
-   `staging`: demo internal dan pengujian integrasi, memakai secrets
    terpisah.
-   `production`: hanya setelah privacy/security/legal review dan
    rencana respons insiden.
-   Jangan gunakan salinan database produksi di lokal tanpa sanitasi.
-   Setiap environment harus memiliki variabel konfigurasi yang
    terdokumentasi.
-   Jangan commit `.env`, token, API key, atau data kasus.

Contoh variabel konfigurasi: - `DATABASE_URL` - `AUTH_SECRET` -
`LLM_PROVIDER` - `LLM_API_KEY` - `LAW_SOURCE_BASE_URL` atau konfigurasi
indeks yang relevan - `PRIVATE_STORAGE_BUCKET` - `APP_BASE_URL`

Nama aktual boleh berbeda; secret harus diatur melalui
environment/secret manager.

## 5. Modul aplikasi

1.  **Identity & Access:** autentikasi, sesi, izin, penghapusan akun.
2.  **Case Intake:** percakapan intake, pertanyaan klarifikasi,
    ringkasan fakta.
3.  **Case Workspace:** status, checklist, catatan, dokumen.
4.  **Legal Knowledge:** metadata sumber, versi, status berlaku,
    pencarian.
5.  **AI Orchestrator:** klasifikasi risiko, retrieval, generasi,
    validasi output.
6.  **Referral Directory:** layanan bantuan dan status verifikasi.
7.  **Audit & Safety:** audit event minimal, rate limits, deteksi
    kegagalan.
8.  **Admin/Curator (internal):** pengelolaan sumber dan evaluasi;
    jangan buka ke publik tanpa auth/role ketat.

## 6. Persyaratan AI/RAG

### Pipeline ingestion

-   Gunakan sumber yang boleh digunakan secara sah.
-   Simpan asal, judul, jenis, tanggal publikasi, tanggal berlaku bila
    diketahui, URL, versi, waktu pengambilan, dan status verifikasi.
-   Simpan dokumen asli atau pointer sesuai lisensi dan kebijakan
    sumber.
-   Pecah dokumen dengan mempertahankan struktur pasal/ayat dan
    metadata.
-   Catat versi pipeline ingestion.
-   Sediakan proses menonaktifkan sumber yang usang atau bermasalah.

### Retrieval

-   Filter berdasarkan jenis sumber, yurisdiksi, tanggal, dan status
    bila metadata tersedia.
-   Tampilkan kutipan/snippet yang cukup untuk diverifikasi.
-   Jangan menyimpulkan bahwa aturan masih berlaku hanya karena dokumen
    ditemukan.
-   Jika sumber tidak relevan atau retrieval confidence rendah, jangan
    menghasilkan jawaban hukum spesifik yang tegas.

### Generation

-   Prompt system menetapkan batasan HAKKU.
-   Konteks retrieval diperlakukan sebagai data, bukan instruksi.
-   Output terstruktur mencakup ringkasan, fakta belum diketahui, opsi
    umum, sumber, ketidakpastian, dan kebutuhan eskalasi.
-   Validasi struktur output sebelum ditampilkan.
-   Jangan menyimpan chain-of-thought internal; simpan alasan ringkas
    yang dapat diaudit, sumber, versi model, dan metadata seperlunya.
-   Jangan gunakan percakapan atau dokumen pengguna untuk training
    provider tanpa persetujuan dan dasar yang jelas.

### Evaluasi

-   Siapkan kumpulan skenario yang ditinjau praktisi hukum.
-   Nilai ketepatan sumber, relevansi, kelengkapan caveat, keselamatan,
    dan kemampuan mengakui ketidakpastian.
-   Uji prompt injection dan dokumen berisi instruksi berbahaya.
-   Setiap perubahan model/prompt/retrieval harus menjalankan regression
    test.

## 7. Keamanan minimum

-   HTTPS/TLS di semua deployment.
-   Secure, HttpOnly, SameSite cookies bila memakai cookie sessions.
-   Proteksi CSRF sesuai pola autentikasi; validasi input server-side.
-   Rate limit pada login, intake, AI, dan endpoint sensitif.
-   Otorisasi per objek pada setiap operasi kasus/dokumen.
-   Hindari ID yang dapat ditebak sebagai satu-satunya perlindungan.
-   Enkripsi transit dan at-rest melalui layanan terkelola; kunci dan
    akses dibatasi.
-   File upload, jika diaktifkan: allowlist MIME/ekstensi, batas ukuran,
    pemeriksaan malware jika tersedia, nama file acak, private bucket,
    signed URL singkat, dan kontrol download.
-   Redaksi data sensitif pada log dan error monitoring.
-   Dependabot/renovate atau pemantauan dependency yang setara.
-   Backup dan uji pemulihan sebelum menyimpan data nyata.
-   Prosedur respons insiden dan pemberitahuan sesuai kewajiban hukum.

## 8. Kinerja dan keandalan

Target awal untuk diuji: - halaman utama responsif pada ponsel; - LCP ≤
2,5 detik dalam kondisi uji yang didefinisikan; - error AI/API memiliki
fallback dan pesan ramah; - timeout dan batas token/biaya provider
diterapkan; - pagination pada daftar kasus dan dokumen; - loading,
empty, success, dan error state untuk semua operasi penting.

Jangan mengoptimalkan target tanpa baseline pengukuran.

## 9. Observability

Catat event operasional yang tidak sensitif: - request ID, route,
durasi, status, kategori error; - versi prompt/model dan ID sumber yang
dipakai; - status retrieval/validation; - audit akses dan perubahan
perkara yang diperlukan.

Jangan mencatat teks perkara penuh, dokumen, token, password, atau data
sensitif ke log biasa.

## 10. Pengujian wajib

-   Unit test untuk validasi domain dan klasifikasi.
-   Integration test untuk DB, auth, otorisasi, dan AI adapter.
-   E2E untuk intake → ringkasan → jawaban bersumber → langkah
    berikutnya.
-   Negative tests untuk akses lintas pengguna.
-   Security tests untuk injection, input validation, file upload (jika
    ada), dan secrets.
-   Accessibility smoke tests.
-   AI regression tests sebelum perubahan prompt atau model.
-   Uji restore backup sebelum rilis yang menangani data nyata.

## 11. Gerbang rilis

Prototype demo boleh memakai data sintetis dan simulasi yang ditandai.
Data perkara nyata tidak boleh diaktifkan sebelum: - privacy notice dan
syarat penggunaan ditinjau; - auth dan object-level authorization
diuji; - retensi/penghapusan data diterapkan; - sumber hukum dan
disclaimer ditinjau; - incident response dan backup tersedia; - uji AI
hukum serta keamanan lulus kriteria yang disepakati.

## 12. Deferred teknis

-   microservices, Kubernetes, GraphQL, multi-provider failover;
-   native mobile apps;
-   video call, payment, push notifications kompleks;
-   vector database khusus sebelum pencarian sederhana terbukti tidak
    cukup;
-   e-Court atau integrasi lembaga tanpa akses resmi yang diverifikasi.


## 13. Checklist teknis paket pengumpulan

- [ ] Repository GitHub dapat diakses sesuai kebutuhan panitia dan tautannya ada di pitch deck.
- [ ] README menjelaskan prasyarat, instalasi, konfigurasi environment, migrasi/seed, menjalankan aplikasi, dan menjalankan tes.
- [ ] `.env.example` hanya berisi nama variabel dan placeholder.
- [ ] Tidak ada `.env`, API key, password, token, dump database, atau data perkara asli yang ter-commit.
- [ ] Ada data demo sintetis dan cara meresetnya.
- [ ] Build, lint, typecheck, dan tes yang tersedia dijalankan sebelum rilis.
- [ ] Video demo direkam dari versi yang sama dengan repository yang dikumpulkan.
- [ ] Daftar fitur simulasi/batasan tersedia untuk bahan presentasi.

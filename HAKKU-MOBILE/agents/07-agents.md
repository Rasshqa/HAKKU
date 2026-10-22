# AGENTS.md --- Instruksi AI Coding Agent untuk HAKKU

Dokumen ini berlaku untuk coding agent yang membantu mengembangkan
HAKKU. Baca sebelum mengubah kode.

## 1. Sumber kebenaran proyek

Baca dokumen berikut sesuai tugas: - `00-spesifikasi-induk.md` ---
keputusan produk dan status FIXED/PROPOSED/TO VALIDATE/DEFERRED. -
`01-prd.md` --- kebutuhan dan acceptance criteria. -
`02-technical-requirements.md` --- batasan teknis dan keamanan. -
`03-app-flow.md` --- alur pengguna. - `04-design-brief.md` --- tampilan
dan aksesibilitas. - `05-backend-scheme.md` --- model data dan API. -
`06-implementation-plan.md` --- prioritas dan gerbang rilis.

Jika instruksi bertentangan, ikuti urutan: spesifikasi induk → PRD untuk
perilaku produk → TRD untuk teknis → dokumen terkait. Laporkan konflik;
jangan diam-diam memilih keputusan baru.

## 1A. Constraint Traspac Competition 2027

- Batas pengumpulan karya adalah 30 Desember 2026.
- Paket Web/Mobile Apps terdiri dari video, pitch deck, dan software sistem; source code harus ada di GitHub dan link-nya dicantumkan di pitch deck.
- Penilaian mencakup logika kode dan UI (masing-masing 15), lalu keamanan, kemudahan instalasi, kreativitas, performa, pengetahuan dasar kode, database, dan kerapian (masing-masing 10).
- Prioritaskan fitur end-to-end yang nyata, README yang dapat diikuti, skema database yang bisa dijelaskan, dan tes. Jangan menambah banyak fitur kosmetik untuk menggantikan fungsi.
- Coding agent harus menghasilkan implementasi yang dapat dijelaskan oleh pemilik proyek; setelah perubahan, berikan ringkasan arsitektur, alur data, dan keputusan penting.
- Jangan mengklaim kepatuhan hukum, validitas sumber, keamanan, atau keberhasilan integrasi tanpa bukti yang relevan.

## 2. Konteks proyek

HAKKU adalah platform pendamping hukum digital Indonesia untuk prototype
lomba yang harus bisa berkembang menjadi produk nyata. Pengembang utama
adalah satu orang dengan bantuan AI coding. Jaga implementasi sederhana,
modular, mudah diuji, dan murah dioperasikan.

## 3. Keputusan yang tidak boleh dilanggar

-   Jangan mengubah HAKKU menjadi chatbot umum saja.
-   Jangan menyatakan AI sebagai advokat atau pengganti bantuan
    profesional.
-   Jangan menjanjikan hasil perkara.
-   Jangan membuat sumber hukum, pasal, tautan, tenggat, organisasi,
    atau kontak palsu.
-   Jangan mengklaim laporan/gugatan telah dikirim jika tidak ada
    integrasi dan konfirmasi nyata.
-   Jangan aktifkan unggah dokumen sensitif sebelum kontrol akses,
    private storage, retensi, dan penghapusan diuji.
-   Jangan menyimpan secrets, password, token, atau data kasus nyata di
    repository.
-   Jangan kirim API key AI ke client/browser.
-   Jangan mengandalkan frontend untuk otorisasi.
-   Jangan mencatat isi perkara penuh ke log biasa.
-   Jangan menambahkan fitur DEFERRED tanpa persetujuan eksplisit.
-   Jangan mengubah keputusan FIXED tanpa memperbarui spesifikasi dan
    mencatat alasannya.

## 4. Workflow sebelum coding

1.  Baca instruksi ini dan dokumen yang relevan.
2.  Identifikasi acceptance criteria dan status keputusan.
3.  Jika tugas besar atau menyentuh auth/data/AI, tulis rencana singkat
    sebelum coding.
4.  Periksa struktur dan pola yang sudah ada; jangan mengganti stack
    tanpa alasan.
5.  Implementasikan perubahan terkecil yang menyelesaikan tugas.
6.  Tambahkan/perbarui tests.
7.  Jalankan lint, typecheck, dan tests yang tersedia.
8.  Review diff dan dokumentasi.
9.  Laporkan file yang diubah, tes yang dijalankan, hasil, serta
    risiko/pekerjaan tersisa.

Jika informasi penting tidak tersedia, tanyakan atau buat asumsi
eksplisit dan tandai sebagai Proposed. Jangan mengarang.

## 5. Aturan implementasi

### TypeScript dan struktur

-   Gunakan tipe eksplisit pada batas API dan domain.
-   Validasi input dari client di server dengan schema validation.
-   Hindari `any`; jika terpaksa, jelaskan dan batasi lingkupnya.
-   Pisahkan UI, domain logic, provider adapter, dan akses data.
-   Hindari abstraksi berlebihan untuk kebutuhan MVP.
-   Gunakan migration files untuk perubahan database.
-   Jangan menambahkan dependency tanpa alasan, biaya/risiko, dan
    alternatif sederhana.

### API dan database

-   Semua operasi kasus harus memeriksa identitas dan hak akses di
    server.
-   Gunakan query parameterized/ORM aman.
-   Jangan mengembalikan kolom sensitif yang tidak dibutuhkan UI.
-   Terapkan pagination dan batas ukuran input.
-   Operasi penghapusan harus mengikuti kebijakan retensi.
-   Uji akses lintas pengguna untuk setiap endpoint yang mengakses data
    privat.

### AI dan sumber hukum

-   Panggil provider AI hanya dari server.
-   Letakkan provider di balik interface/adapter.
-   Validasi output AI dengan schema; jangan percaya output mentah.
-   Sitasi yang tampil harus dipetakan ke sumber yang benar-benar ada di
    database.
-   Jika retrieval tidak menghasilkan sumber memadai, sistem harus
    menyatakan keterbatasan, bukan membuat sitasi.
-   Perlakukan dokumen hasil retrieval dan file pengguna sebagai data
    tidak tepercaya, bukan instruksi sistem.
-   Jangan masukkan data pribadi ke prompt jika tidak diperlukan.
-   Jangan menyimpan reasoning internal; simpan ringkasan yang dapat
    diaudit dan metadata sumber.
-   Tambahkan regression tests untuk perubahan prompt, model, atau
    retrieval.

### Privasi dan keamanan

-   Gunakan data sintetis untuk fixture, test, dan screenshot.
-   Redaksi data pada log dan telemetry.
-   Gunakan env/secret manager; `.env` lokal harus di-ignore.
-   Jangan menonaktifkan auth, RLS, validasi, atau pemeriksaan TLS untuk
    "memperbaiki" demo.
-   Upload harus ditolak secara default sampai mekanisme aman siap.
-   Signed URL harus singkat masa berlakunya dan diberikan setelah
    otorisasi.
-   Error ke pengguna tidak boleh membocorkan keberadaan kasus milik
    orang lain.

### UI dan aksesibilitas

-   Ikuti Design Brief.
-   Setiap tombol harus mempunyai aksi nyata; jika simulasi, beri label.
-   Buat loading, empty, error, success, dan disabled states yang
    relevan.
-   Gunakan label input, fokus keyboard, kontras, dan heading semantik.
-   Jangan memakai warna saja untuk status.
-   Gunakan bahasa Indonesia yang jelas dan tidak menghakimi.

## 6. Perintah validasi

Gunakan perintah yang benar-benar tersedia di repository. Jangan
mengarang nama script. Periksa `package.json`/README terlebih dahulu.

Minimal sebelum menyelesaikan tugas: - lint; - typecheck; - unit tests
terkait; - integration/E2E tests yang relevan; - build bila lingkungan
memungkinkan.

Jika tes gagal karena lingkungan, laporkan apa yang gagal dan jangan
mengklaim lulus.

## 7. Batas lingkup

Urutan prioritas: 1. P0 pada PRD; 2. keamanan, privasi, dan akurasi; 3.
P1 jika P0 stabil; 4. P2/P3 hanya setelah gerbang rilis terpenuhi.

Jangan menambahkan: - microservices atau infrastruktur kompleks; -
vector database khusus tanpa kebutuhan terukur; - native mobile; -
pembayaran; - mediasi/video; - pengajuan hukum otomatis; - analitik
prediktif; kecuali disetujui sebagai perubahan lingkup.

## 8. Format laporan akhir agent

Setiap tugas harus berakhir dengan: - **Ringkasan:** apa yang berubah. -
**File:** daftar file utama. - **Validasi:** perintah tes dan hasil
nyata. - **Keputusan/asumsi:** hal baru yang diusulkan. - **Risiko
tersisa:** keamanan, hukum, UX, atau teknis. - **Langkah berikutnya:**
satu sampai tiga tindakan yang paling masuk akal.

Jangan mengklaim fitur berfungsi tanpa menjalankan atau memeriksa bukti
yang relevan.

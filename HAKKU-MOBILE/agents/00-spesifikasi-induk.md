# HAKKU --- Spesifikasi Induk Produk

**Status dokumen:** Baseline untuk prototype lomba yang dirancang agar
dapat berkembang menjadi produk nyata\
**Versi:** 1.1\
**Bahasa produk:** Bahasa Indonesia\
**Pemilik produk:** Pendiri tunggal, dibantu AI coding\
**Prinsip:** Ambisius pada visi, realistis pada rilis, ketat pada
keselamatan dan kepercayaan.

## 1. Visi dan proposisi nilai

**HAKKU --- Digital Legal Companion**\
**Tagline:** *Pahami Hakmu. Tentukan Langkahmu.*

HAKKU adalah platform pendamping hukum digital untuk membantu masyarakat
Indonesia memahami persoalan hukum, mengeksplorasi pilihan tindakan,
menyiapkan informasi dan draf dokumen, serta menemukan bantuan hukum
yang relevan.

HAKKU bukan pengganti advokat, pengadilan, kepolisian, atau lembaga
resmi. Produk membantu pengguna memahami dan menavigasi proses; hasil
hukum tidak dijamin.

## 2. Target dan konteks

-   **Target tahap pertama:** prototype lomba yang bisa didemonstrasikan
    secara meyakinkan dan dikembangkan menjadi produk nyata.
-   **Kapasitas pengembangan:** satu orang dengan bantuan AI coding;
    desain dan arsitektur harus menghindari kompleksitas operasional
    yang tidak perlu.
-   **Pengguna:** masyarakat Indonesia dengan tingkat literasi hukum dan
    digital yang beragam.
-   **Kebutuhan inti:** pengguna sering tidak tahu cara mengategorikan
    masalah, bukti apa yang diperlukan, opsi apa yang tersedia, atau ke
    mana harus meminta bantuan.

## 2A. Acuan Traspac Competition 2027

Bagian ini menyesuaikan produk dengan Guide Book Traspac Competition 2027 yang diberikan pemilik proyek. Jika panitia menerbitkan perubahan, perbarui bagian ini beserta dokumen turunan.

### Ketentuan lomba yang menjadi batas delivery

- **Bidang target:** Web/Mobile Apps.
- **Tema yang direkomendasikan:** Sosial, dengan fokus pada akses informasi dan navigasi bantuan hukum. Ini pemetaan strategis HAKKU ke daftar tema dalam guide book, bukan kategori khusus yang ditetapkan panitia.
- **Format peserta:** individu; rancangan harus realistis untuk satu pengembang dengan bantuan AI coding.
- **Batas pengumpulan:** 30 Desember 2026.
- **Artefak pengumpulan:** video, pitch deck, dan software sistem.
- **Source code:** diunggah ke GitHub; tautan repository dicantumkan pada pitch deck.
- **Orisinalitas:** karya harus orisinal dan belum pernah diikutsertakan dalam lomba lain.
- **Presentasi:** peserta perlu mampu mendemonstrasikan produk dan menjawab pertanyaan teknis. Guide book mencantumkan final pada 20–22 Januari 2027; ikuti pengumuman resmi panitia untuk detail tahapan.

### Bobot penilaian Web/Mobile Apps dan implikasi

| Aspek | Bobot | Bukti yang perlu disiapkan |
|---|---:|---|
| Logika kode | 15 | Alur inti berfungsi end-to-end. |
| User interface | 15 | UI konsisten, responsif, dan mudah digunakan. |
| Keamanan aplikasi | 10 | Validasi dan otorisasi yang benar; sesi aman bila memakai akun. |
| Easy development | 10 | README, setup berulang, `.env.example`, seed/demo data. |
| Kreativitas ide | 10 | Masalah nyata, pembeda HAKKU, manfaat yang jelas. |
| Performa sistem | 10 | Demo stabil serta loading/error/fallback yang baik. |
| Pengetahuan dasar code | 10 | Pemilik mampu menjelaskan kode dan trade-off. |
| Penggunaan database | 10 | Skema, relasi, dan query dapat dijelaskan. |
| Kerapian code | 10 | Struktur modular, penamaan konsisten, lint/typecheck/test. |

Fitur yang hanya berupa mockup tidak boleh diklaim sebagai implementasi selesai. Fitur simulasi harus diberi label dengan jelas.

### Gerbang pengumpulan lomba (FIXED)

1. Aplikasi berjalan mengikuti README pada lingkungan bersih.
2. Repository tidak berisi secret, kredensial, atau data perkara nyata.
3. Satu skenario demo utama berjalan dari input sampai langkah berikutnya.
4. Video menunjukkan software yang benar-benar berjalan.
5. Pitch deck memuat masalah, pengguna, solusi, alur demo, teknologi, keamanan, validasi, batasan, dan tautan GitHub.
6. Pemilik mampu menjelaskan kode, database, keamanan, dan keputusan teknis.
7. Tidak ada klaim integrasi, sumber hukum, mitra, atau pengajuan resmi yang belum dibuktikan.

## 3. Keputusan produk dan status

### FIXED --- keputusan yang menjadi baseline

1.  HAKKU adalah **platform pendamping hukum**, bukan chatbot
    tanya-jawab semata.
2.  Pengguna boleh menceritakan beragam masalah hukum sejak awal.
3.  Kedalaman panduan berbeda berdasarkan tingkat validasi dan risiko
    kasus.
4.  Pengalaman utama adalah: ceritakan masalah → klarifikasi → pahami
    pilihan → persiapkan kebutuhan → tindak lanjuti/rujuk.
5.  Jawaban hukum harus menyertakan rujukan yang dapat diperiksa bila
    membuat klaim hukum spesifik.
6.  AI tidak boleh mengarang sumber, tenggat, prosedur, atau kepastian
    hasil. Ketidakpastian harus dinyatakan.
7.  Kasus berisiko tinggi, mendesak, atau tidak cukup didukung sumber
    diarahkan ke bantuan manusia/layanan resmi yang relevan.
8.  Prototype tidak boleh berpura-pura mengirim laporan, gugatan, atau
    dokumen ke lembaga resmi jika integrasi sah belum tersedia.
9.  Privasi, kontrol akses, minimisasi data, dan penghapusan data
    dirancang sejak awal.
10. Tahap pertama berfokus pada **web responsif**; aplikasi native dan
    integrasi kompleks tidak menjadi syarat MVP.
11. Untuk MVP, gunakan satu backend dan satu basis data utama; hindari
    microservices.
12. Dokumen produk dan kode harus menggunakan istilah, status, serta
    batasan yang konsisten.

### PROPOSED --- rekomendasi untuk disetujui sebelum implementasi

-   Web: Next.js + TypeScript.
-   UI: Tailwind CSS dengan komponen aksesibel yang konsisten.
-   Backend: API routes/server layer dalam aplikasi yang sama untuk
    mengurangi beban operasional awal.
-   Database: PostgreSQL terkelola; Supabase dapat dipilih jika sesuai
    anggaran dan kebutuhan.
-   AI: satu provider LLM di balik adapter server-side; gunakan RAG
    setelah korpus hukum yang sah dan terkurasi siap.
-   Autentikasi: layanan terkelola atau implementasi teruji; jangan
    membuat kriptografi/auth sendiri.
-   Penyimpanan dokumen: private object storage dengan URL bertanda
    tangan berumur pendek; dapat ditunda dari demo bila unggah aman
    belum siap.
-   Rilis prototype: staging terpisah dari demo publik; jangan
    memasukkan perkara nyata yang sensitif ke demo.

Keputusan teknologi di atas menjadi **proposed** sampai diverifikasi
terhadap anggaran, kemampuan, ketentuan provider, dan kebutuhan
deployment.

### TO VALIDATE --- wajib dibuktikan

-   Kebutuhan dan bahasa yang dipahami pengguna sasaran melalui
    wawancara/uji kegunaan.
-   Sumber hukum yang boleh diambil, ketentuan penggunaan, cara
    pembaruan, dan metadata status berlakunya.
-   Akurasi jawaban untuk skenario uji yang ditinjau praktisi hukum.
-   Kepatuhan pada UU Pelindungan Data Pribadi dan ketentuan hukum
    terkait layanan.
-   Model kerja sama, verifikasi, dan respons mitra bantuan hukum.
-   Biaya penggunaan LLM, penyimpanan, peta/direktori, dan notifikasi.
-   Kelayakan pengingat tenggat hukum dan metode verifikasi tanggalnya.

### DEFERRED --- tidak termasuk MVP

-   Pengajuan otomatis ke e-Court, kepolisian, atau lembaga lain.
-   Klaim bahwa aplikasi dapat menyelesaikan semua perkara.
-   Mediasi/video call native.
-   Aplikasi native Android/iOS.
-   Analitik prediktif perkara atau prediksi peluang menang.
-   Pemrosesan dokumen sensitif secara otomatis tanpa kontrol dan
    evaluasi.
-   Marketplace berbayar advokat, pembayaran, dan monetisasi kompleks.
-   Dukungan multi-bahasa selain Bahasa Indonesia.

## 4. Model cakupan kasus

HAKKU menerima cerita masalah dari bidang hukum apa pun, tetapi mengatur
kedalaman bantuan:

-   **Level 1 --- Panduan terstruktur:** alur, pertanyaan, sumber, dan
    langkah telah divalidasi.
-   **Level 2 --- Analisis awal terbatas:** merangkum fakta, menunjukkan
    informasi yang belum diketahui, dan mencari sumber umum; tidak
    menyimpulkan secara pasti.
-   **Level 3 --- Rujukan/eskalasi:** kasus mendesak, berisiko tinggi,
    kompleks, tenggat dekat, atau bukti/sumber tidak memadai.

Klasifikasi ini adalah kebijakan produk; penentuan kategori dan pemicu
eskalasi harus ditinjau ahli hukum.

## 5. Alur produk utama

1.  Pengguna masuk sebagai tamu atau akun, sesuai konfigurasi prototype.
2.  Pengguna menceritakan masalah melalui bahasa alami atau memilih
    kategori.
3.  HAKKU meminta klarifikasi minimum yang diperlukan dan menandai
    urgensi.
4.  Sistem menampilkan ringkasan fakta untuk dikoreksi pengguna.
5.  Sistem mencari sumber hukum terkelola dan menghasilkan penjelasan
    yang menyebutkan sumber serta keterbatasan.
6.  Pengguna melihat opsi tindakan, kebutuhan bukti/dokumen, dan kapan
    bantuan profesional diperlukan.
7.  Pengguna menyimpan ringkasan kasus, checklist, dan draf bila fitur
    tersedia.
8.  Pengguna memilih langkah berikutnya atau melihat rujukan.
9.  Status dan catatan tindak lanjut diperbarui secara eksplisit oleh
    pengguna atau mitra berwenang.

## 6. Batasan klaim

Gunakan frasa seperti "informasi awal", "opsi yang mungkin relevan", dan
"verifikasi dengan bantuan profesional". Hindari "pasti menang", "pasti
sah", "laporan berhasil dikirim", atau "HAKKU menyelesaikan perkara"
tanpa bukti nyata dan kewenangan yang sesuai.

## 7. Ukuran keberhasilan

Prototype: - Pengguna uji dapat menyelesaikan alur inti tanpa bantuan
moderator. - Jawaban hukum spesifik dapat ditelusuri ke sumber yang
benar. - Tidak ada jalur demo yang menyatakan pengajuan resmi berhasil
jika itu simulasi. - Tidak ada akses lintas pengguna ke data kasus. -
Pengguna dapat menjelaskan langkah berikutnya setelah menggunakan
prototype.

Produk nyata (setelah validasi): - pemahaman pengguna sebelum/sesudah; -
tingkat penyelesaian langkah berikutnya; - kualitas dan keterlacakan
sumber; - rujukan yang berhasil menghubungkan pengguna dengan bantuan; -
insiden keamanan dan privasi; - aksesibilitas serta kepuasan pengguna.

## 8. Dokumen turunan

Dokumen berikut wajib konsisten dengan spesifikasi ini:

-   `01-prd.md` --- kebutuhan produk dan acceptance criteria.
-   `02-technical-requirements.md` --- batasan arsitektur dan kualitas
    teknis.
-   `03-app-flow.md` --- perjalanan pengguna dan kondisi alternatif.
-   `04-design-brief.md` --- sistem desain dan aksesibilitas.
-   `05-backend-scheme.md` --- model data, API, kontrol akses.
-   `06-implementation-plan.md` --- tahapan implementasi dan gerbang
    rilis.
-   `07-agents.md` --- instruksi AI coding agent.

Perubahan keputusan FIXED harus dicatat sebagai keputusan baru dan
diperbarui di semua dokumen terkait.

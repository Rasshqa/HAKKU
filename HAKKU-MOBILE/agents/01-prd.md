# HAKKU --- Product Requirements Document (PRD)

**Versi:** 1.1\
**Status:** Baseline prototype lomba → produk nyata\
**Mengacu pada:** `00-spesifikasi-induk.md`

## 1. Ringkasan produk

HAKKU adalah platform pendamping hukum digital yang membantu masyarakat
memahami masalah, melihat opsi tindakan, menyiapkan informasi/dokumen,
dan menemukan bantuan yang relevan. MVP memprioritaskan alur
pendampingan yang aman dan dapat didemonstrasikan, bukan otomatisasi
proses hukum formal.

## 1A. Sasaran khusus Traspac Competition 2027

HAKKU ditujukan ke kategori Web/Mobile Apps dengan tema utama **Sosial**, melalui fokus pada akses informasi dan navigasi bantuan hukum. Versi lomba harus berupa software yang berjalan, bukan konsep saja, dan dikumpulkan paling lambat **30 Desember 2026** bersama video dan pitch deck. Source code harus diunggah ke GitHub dan tautannya dicantumkan pada pitch deck.

Prioritas berdasarkan bobot penilaian:
- **Logika kode (15) dan UI (15):** alur utama harus berfungsi end-to-end dan mudah dipahami.
- **Keamanan, kemudahan instalasi, kreativitas ide, performa, pengetahuan kode, database, dan kerapian kode (masing-masing 10):** setiap aspek harus memiliki bukti implementasi atau dokumentasi yang bisa dijelaskan.
- Sertakan README, `.env.example` tanpa secret, skema/migrasi database bila digunakan, seed data demo, dan tes yang relevan.
- Pemilik proyek harus memahami kode yang dibantu AI dan mampu menjelaskan alur data, query, keamanan, serta trade-off.

Kriteria lomba tidak membenarkan pengurangan validasi hukum atau keamanan. Jangan menambahkan fitur sensitif hanya agar aplikasi terlihat lebih lengkap.

## 2. Masalah pengguna

Pengguna mungkin: - tidak mengetahui kategori atau istilah hukum yang
tepat; - tidak tahu fakta apa yang perlu dijelaskan; - kesulitan
membedakan informasi umum dengan nasihat khusus; - tidak tahu bukti apa
yang perlu disimpan; - tidak mengetahui layanan bantuan yang relevan; -
kesulitan mengikuti langkah berikutnya.

## 3. Tujuan dan non-tujuan

### Tujuan

1.  Membantu pengguna menjelaskan masalah tanpa harus menguasai istilah
    hukum.
2.  Menghasilkan ringkasan fakta yang dapat dikoreksi.
3.  Memberikan informasi awal yang dapat ditelusuri ke sumber.
4.  Menyajikan opsi dan langkah berikutnya secara terstruktur.
5.  Membantu persiapan kronologi, checklist, dan draf sederhana.
6.  Menyediakan rujukan bantuan hukum yang statusnya jelas.
7.  Membuat prototype yang dapat diuji dan dikembangkan.

### Non-tujuan MVP

-   menggantikan konsultasi advokat;
-   menjamin hasil perkara;
-   mengirim gugatan/laporan ke lembaga resmi;
-   menyediakan semua alur hukum tervalidasi;
-   memprediksi peluang menang;
-   menangani mediasi secara native;
-   mengumpulkan data perkara nyata tanpa kebutuhan, persetujuan, dan
    kontrol keamanan yang layak.

## 4. Persona dan kebutuhan

### Persona A --- Warga yang bingung

"Bantu saya memahami masalah ini dan apa yang sebaiknya saya lakukan
berikutnya."

### Persona B --- Pengguna yang sedang menyiapkan perkara

"Bantu saya menyusun kronologi, merapikan bukti, dan menyiapkan
pertanyaan untuk konsultasi."

### Persona C --- Pengguna yang membutuhkan bantuan profesional

"Bantu saya menemukan layanan yang relevan dan memahami informasi apa
yang perlu saya siapkan."

Persona adalah hipotesis awal; validasi melalui wawancara dan uji
pengguna.

## 5. Prioritas fitur

  ---------------------------------------------------------------------------
  ID               Fitur                           Prioritas Status
  ---------------- ------------------- --------------------- ----------------
  F-01             Beranda dan pilihan                    P0 Fixed
                   "Ceritakan masalah"                       

  F-02             Intake kasus                           P0 Fixed
                   berbasis pertanyaan                       
                   klarifikasi                               

  F-03             Ringkasan fakta                        P0 Fixed
                   yang dapat diedit                         
                   pengguna                                  

  F-04             Jawaban awal dengan                    P0 Fixed
                   rujukan/sumber dan                        
                   batasan                                   

  F-05             Opsi tindakan dan                      P0 Fixed
                   langkah berikutnya                        

  F-06             Klasifikasi tingkat                    P0 Fixed; aturan
                   bantuan/eskalasi                          perlu validasi

  F-07             Checklist                              P0 Fixed
                   bukti/dokumen dan                         
                   ringkasan kasus                           

  F-08             Demo                                   P1 Proposed
                   direktori/rujukan                         
                   yang diberi label                         
                   status verifikasi                         

  F-09             Akun dan                               P1 Proposed untuk
                   penyimpanan kasus                         prototype; wajib
                   privat                                    sebelum data
                                                             nyata

  F-10             Unggah dokumen                         P2 Deferred sampai
                   sensitif                                  keamanan siap

  F-11             Pembuatan draf                         P2 Deferred kecuali
                   dokumen spesifik                          template
                                                             ditinjau

  F-12             Pengingat tenggat                      P2 Deferred sampai
                   hukum                                     proses
                                                             verifikasi kuat

  F-13             Pengajuan otomatis                     P3 Deferred
                   ke lembaga                                

  F-14             Konsultasi                             P3 Deferred
                   video/mediasi                             
                   native                                    
  ---------------------------------------------------------------------------

## 6. Kebutuhan fungsional

### FR-01 --- Mulai tanpa istilah hukum

Pengguna harus dapat menjelaskan masalah dengan teks bebas. Sistem tidak
boleh mensyaratkan pemilihan kategori hukum terlebih dahulu.

**Acceptance criteria** - Ada input cerita masalah dengan petunjuk
contoh. - Pengguna dapat melanjutkan meski tidak tahu nama perkara. -
Validasi input menjelaskan apa yang masih dibutuhkan.

### FR-02 --- Klarifikasi minimum

Sistem mengajukan pertanyaan yang relevan untuk mengurangi ambiguitas,
misalnya waktu, lokasi umum, pihak terkait, dan langkah yang telah
dilakukan. Jangan meminta data identitas sensitif kecuali benar-benar
diperlukan.

**Acceptance criteria** - Pertanyaan mempunyai tujuan yang jelas. -
Pengguna dapat melewati pertanyaan yang tidak diketahui, dengan
penjelasan dampaknya. - Sistem tidak meminta kata sandi, PIN, atau data
pembayaran.

### FR-03 --- Konfirmasi ringkasan fakta

Sebelum memberikan rekomendasi yang lebih spesifik, tampilkan ringkasan
fakta dan minta pengguna mengoreksi kesalahan.

**Acceptance criteria** - Fakta yang diberikan pengguna dibedakan dari
inferensi sistem. - Pengguna dapat mengedit atau mengonfirmasi
ringkasan. - Ketidakpastian tidak disajikan sebagai fakta.

### FR-04 --- Penjelasan hukum bersumber

Jawaban yang menyebut aturan/pasal spesifik harus menampilkan identitas
sumber dan tautan atau metadata yang dapat diverifikasi bila tersedia.

**Acceptance criteria** - Sumber berasal dari korpus yang disetujui. -
Jawaban menampilkan peringatan bila sumber tidak cukup atau statusnya
belum terverifikasi. - Jika retrieval tidak menemukan sumber yang
memadai, sistem menyatakan keterbatasan dan tidak mengarang sitasi.

### FR-05 --- Opsi tindakan

Tampilkan beberapa opsi yang mungkin relevan, alasan, kebutuhan
persiapan, serta kapan perlu meminta bantuan profesional. Jangan membuat
keputusan hukum final atas nama pengguna.

### FR-06 --- Ruang kasus

Simpan ringkasan, checklist, catatan, dan status kasus sesuai kemampuan
versi.

**Acceptance criteria** - Data kasus hanya dapat diakses oleh pemilik
atau pihak yang diberi akses secara sah. - Perubahan status dicatat
dengan waktu dan aktor. - Pengguna dapat menghapus kasus sesuai
kebijakan retensi.

### FR-07 --- Rujukan

Tampilkan informasi organisasi/layanan dengan sumber, tanggal
verifikasi, dan status. Jika data belum diverifikasi, labeli jelas dan
jangan menyebutnya rekomendasi terjamin.

### FR-08 --- Eskalasi keselamatan

Jika terdeteksi situasi mendesak atau berisiko tinggi, tampilkan jalur
bantuan yang sesuai dan hindari memberi instruksi yang dapat memperburuk
risiko. Daftar pemicu dan teks respons harus ditinjau ahli.

### FR-09 --- Disclaimer

Jelaskan pada titik relevan bahwa HAKKU memberi informasi awal dan bukan
pengganti nasihat profesional. Jangan menutupi disclaimer di halaman
legal yang jarang dibaca.

## 7. Kebutuhan nonfungsional

-   **Keamanan:** server-side authorization pada setiap akses data;
    secrets tidak pernah dikirim ke browser.
-   **Privasi:** minimisasi data, tujuan pemrosesan jelas, retensi
    terdefinisi, penghapusan dapat diuji.
-   **Aksesibilitas:** navigasi keyboard, label input, fokus terlihat,
    kontras memadai, bahasa sederhana.
-   **Keandalan:** error state yang jelas; tidak menyatakan berhasil
    sebelum backend mengonfirmasi.
-   **Performa:** target awal LCP ≤ 2,5 detik pada halaman utama di
    kondisi uji yang disepakati; ukur sebelum optimasi lanjutan.
-   **Auditabilitas:** versi sumber dan waktu pembuatan jawaban disimpan
    tanpa mencatat data sensitif secara berlebihan.
-   **Portabilitas:** pemisahan domain produk dari provider AI agar
    provider dapat diganti.
-   **Maintainability:** struktur sederhana yang cocok dikelola satu
    developer.

## 8. Konten dan kebijakan AI

-   Pisahkan fakta pengguna, sumber hukum, inferensi AI, dan saran umum.
-   Jawaban harus menyebut tanggal acuan bila relevan.
-   Jangan menyatakan hasil perkara pasti.
-   Jangan memberi tenggat hukum tanpa sumber dan konteks yang memadai.
-   Jika sumber tidak ditemukan, katakan demikian.
-   Sediakan fallback non-AI untuk navigasi dan informasi umum.
-   Prompt injection dari dokumen atau hasil retrieval tidak boleh
    mengubah kebijakan sistem.
-   Evaluasi AI harus memakai skenario yang ditinjau praktisi hukum
    sebelum pilot publik.

## 9. Analitik dan metrik

Prototype: - completion rate alur intake; - proporsi jawaban dengan
rujukan valid; - keberhasilan pengguna menyebutkan langkah berikutnya; -
jumlah kesalahan kritis pada evaluasi; - jumlah temuan akses data lintas
pengguna (target nol); - waktu penyelesaian tugas dan umpan balik
kegunaan.

Jangan mengoptimalkan jumlah chat jika itu mendorong jawaban berlebihan
atau ketergantungan pada AI.

## 10. Risiko utama

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Jawaban hukum salah/usang           sumber terkurasi, tanggal/status,
                                      evaluasi ahli, fallback

  Data perkara bocor                  minimisasi, otorisasi server,
                                      private storage, audit

  Pengguna mengira AI adalah advokat  bahasa produk/disclaimer, eskalasi

  Fitur terlalu luas untuk tim solo   P0 terbatas, fase dan gerbang rilis

  Integrasi palsu pada demo           tandai simulasi; jangan klaim
                                      transaksi resmi

  Direktori usang                     status dan tanggal verifikasi
  -----------------------------------------------------------------------

## 11. Kriteria MVP siap didemonstrasikan

-   Alur inti dari cerita masalah ke rencana tindakan berjalan
    end-to-end.
-   Minimal satu alur kasus demonstrasi ditinjau ahli atau diberi label
    jelas sebagai contoh non-nasihat.
-   Semua klaim hukum spesifik mempunyai rujukan yang bisa diperiksa
    atau dinyatakan belum terverifikasi.
-   Semua tombol/tautan punya aksi nyata atau diberi label simulasi.
-   Tidak ada data rahasia dalam log, prompt, atau repository.
-   Tidak ada akses lintas akun pada pengujian otorisasi.
-   Pengguna uji memahami bahwa HAKKU bukan layanan pengacara otomatis.


## 12. Acceptance criteria khusus kompetisi

- [ ] Aplikasi dapat dijalankan mengikuti README pada lingkungan baru.
- [ ] Satu alur utama dapat didemokan dari awal hingga hasil dan checklist.
- [ ] Ada keadaan loading, kosong, sukses, dan error yang relevan.
- [ ] Jika AI/provider tidak tersedia, aplikasi menampilkan fallback yang jujur.
- [ ] Setiap sumber hukum pada demo dapat dibuka dan diverifikasi; jika tidak, ditandai belum terverifikasi dan tidak dipakai untuk klaim spesifik.
- [ ] Data demo bersifat sintetis.
- [ ] Tidak ada tombol yang berpura-pura mengirim pengaduan/gugatan.
- [ ] Repository memiliki dokumentasi, struktur rapi, serta tidak berisi secret.
- [ ] Pembuat mampu menjelaskan alur kode, skema database, otorisasi, dan alasan pemilihan teknologi.
- [ ] Video, pitch deck, dan software sistem disiapkan terpisah sebagai tiga artefak pengumpulan.

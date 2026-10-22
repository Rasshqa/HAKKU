# HAKKU --- App Flow dan User Journey

**Versi:** 1.1\
**Mengacu pada:** `00-spesifikasi-induk.md`, `01-prd.md`

## 0. Alur demo kompetisi yang wajib stabil

Untuk penilaian, tetapkan satu skenario utama dan gunakan secara konsisten pada pengujian, video, dan presentasi. Skenario yang disarankan untuk prototype adalah **upah belum dibayar** atau **penipuan transaksi online**, setelah sumber dan langkahnya ditinjau. Pilih satu sebagai alur demo utama; alur lain hanya ditampilkan jika benar-benar stabil.

Alur minimum demo:
1. Pengguna menceritakan masalah.
2. HAKKU mengajukan klarifikasi relevan.
3. Pengguna memeriksa dan mengonfirmasi ringkasan fakta.
4. Sistem menampilkan informasi awal dengan sumber yang dapat diperiksa atau menjelaskan keterbatasannya.
5. Pengguna memperoleh opsi langkah berikutnya dan checklist.
6. Pengguna melihat rujukan atau batasan yang jelas.

Jangan mendemokan pengajuan resmi, mitra, login, penyimpanan, atau AI live sebagai fitur aktif bila implementasinya belum teruji. Jika menggunakan simulasi, labeli di UI dan narasi.

## 1. Navigasi utama

Navigasi MVP yang disarankan: - **Beranda** --- mulai menceritakan
masalah. - **Kasus Saya** --- kasus tersimpan, bila akun/penyimpanan
diaktifkan. - **Cari Bantuan** --- direktori layanan dengan status
verifikasi. - **Tentang HAKKU** --- batasan layanan, privasi, sumber,
dan disclaimer.

Pada prototype tanpa autentikasi, gunakan data demo sintetis dan beri
label "Demo". Jangan menampilkan "Kasus Saya" seolah-olah menyimpan data
secara aman bila penyimpanan belum tersedia.

## 2. Alur utama: dari cerita ke langkah berikutnya

``` mermaid
flowchart TD
    A[Beranda] --> B[Ceritakan masalah]
    B --> C[Persetujuan dan pemberitahuan data]
    C --> D[Klarifikasi fakta minimum]
    D --> E[Deteksi urgensi dan risiko]
    E --> F{Perlu eskalasi segera?}
    F -->|Ya| G[Tampilkan jalur bantuan yang sesuai]
    F -->|Tidak| H[Tampilkan ringkasan fakta]
    H --> I{Pengguna mengonfirmasi?}
    I -->|Edit| D
    I -->|Ya| J[Cari sumber hukum terkelola]
    J --> K{Sumber cukup dan relevan?}
    K -->|Tidak| L[Jelaskan keterbatasan dan rujukan]
    K -->|Ya| M[Penjelasan, opsi, dan caveat]
    M --> N[Checklist dan langkah berikutnya]
    N --> O{Simpan kasus?}
    O -->|Ya, akun tersedia| P[Simpan di ruang kasus]
    O -->|Tidak / demo| Q[Tampilkan ringkasan sesi]
    P --> R[Tindak lanjut / cari bantuan]
    Q --> R
```

## 3. Detail layar

### Screen 1 --- Beranda

**Tujuan:** pengguna memahami apa yang bisa dilakukan HAKKU dan memulai
dengan mudah.

Komponen: - headline: "Ada masalah hukum? Mari pahami langkah
berikutnya." - input cerita bebas atau tombol mulai; - contoh topik
tanpa membatasi pengguna; - keterangan singkat bahwa HAKKU memberikan
informasi awal; - tautan privasi dan bantuan.

States: default, input kosong, loading, error.

### Screen 2 --- Pemberitahuan data

**Tujuan:** memberi konteks sebelum pengguna memasukkan informasi
perkara.

Komponen: - tujuan penggunaan data; - peringatan agar tidak mengirim
kata sandi/PIN atau data yang tidak diperlukan; - persetujuan yang jelas
bila penyimpanan data dilakukan; - pilihan melanjutkan dengan informasi
minimum bila tersedia.

Persetujuan bukan pengganti kewajiban hukum lain. Implementasi harus
ditinjau untuk kepatuhan.

### Screen 3 --- Klarifikasi

**Tujuan:** mengumpulkan fakta relevan tanpa membuat formulir terasa
seperti interogasi.

Aturan: - satu pertanyaan utama per langkah bila memungkinkan; -
jelaskan mengapa informasi ditanyakan; - opsi "Saya tidak tahu" atau
"Lewati" jika aman; - jangan meminta NIK, alamat lengkap, atau identitas
pihak lain di awal kecuali benar-benar diperlukan.

### Screen 4 --- Urgensi dan keselamatan

**Tujuan:** menentukan apakah jalur normal sesuai.

Sistem mencari sinyal yang sudah ditetapkan dan ditinjau ahli. Jika ada
keadaan darurat, jangan menunda dengan pertanyaan panjang. Tampilkan
layanan yang sesuai dan instruksi umum yang aman. Kontak darurat dan
rujukan harus diverifikasi untuk wilayah pengguna.

### Screen 5 --- Ringkasan fakta

Bagian: - fakta yang dinyatakan pengguna; - informasi yang belum
diketahui; - asumsi yang perlu dikonfirmasi; - tombol edit/konfirmasi.

Jangan menyajikan inferensi AI sebagai fakta yang diberikan pengguna.

### Screen 6 --- Hasil awal

Bagian: 1. ringkasan masalah; 2. penjelasan hukum sederhana; 3. sumber
dan status verifikasi; 4. apa yang belum bisa dipastikan; 5. opsi
tindakan yang mungkin relevan; 6. kapan perlu bantuan profesional.

Tidak boleh ada prediksi hasil perkara atau klaim bahwa jawaban
merupakan keputusan hukum final.

### Screen 7 --- Checklist dan ruang kasus

Contoh item: - susun kronologi; - simpan bukti transaksi/komunikasi yang
relevan; - catat tanggal penting; - siapkan pertanyaan untuk konsultasi.

Checklist adalah panduan umum; kebutuhan spesifik bergantung pada
perkara. Penyimpanan dan unggah dokumen hanya aktif setelah kontrol
akses serta retensi siap.

### Screen 8 --- Cari bantuan

Tampilkan: - nama organisasi/layanan; - jenis bantuan; - wilayah
layanan; - kontak/situs yang bersumber; - tanggal dan status
verifikasi; - label jika informasi belum dikonfirmasi.

Jangan mengklaim "terdekat" jika lokasi pengguna tidak diberikan atau
izin lokasi tidak ada. Jangan mengklaim mitra resmi tanpa bukti.

### Screen 9 --- Tindak lanjut

Pengguna dapat: - menandai langkah selesai; - menambah catatan; -
mengubah status; - meminta rujukan; - menghapus kasus.

Status harus mencerminkan tindakan nyata. Status "diajukan" hanya boleh
dipakai jika pengajuan benar-benar dikonfirmasi oleh integrasi resmi
atau bukti yang sesuai.

## 4. Alur alternatif dan error states

-   **Input terlalu minim:** minta satu klarifikasi yang paling
    berpengaruh.
-   **Pengguna tidak tahu jawaban:** izinkan "tidak tahu"; kurangi
    tingkat kepastian.
-   **Sumber tidak ditemukan:** jelaskan keterbatasan, tampilkan
    pencarian/rujukan alternatif.
-   **AI/provider gagal:** pertahankan input pengguna jika aman,
    tampilkan retry dan opsi bantuan umum.
-   **Kasus berisiko tinggi:** hentikan alur rekomendasi otomatis yang
    tidak sesuai dan arahkan ke bantuan.
-   **Pengguna membatalkan:** jelaskan apakah data sudah disimpan dan
    berikan opsi hapus bila berlaku.
-   **Akses ditolak:** jangan bocorkan apakah ID kasus milik pengguna
    lain; tampilkan pesan generik.
-   **Rujukan tidak terverifikasi:** beri label jelas atau jangan
    tampilkan sebagai rekomendasi terjamin.
-   **Integrasi eksternal tidak tersedia:** berikan tautan resmi/manual;
    jangan membuat tombol kirim palsu.

## 5. Contoh journey: upah belum dibayar

1.  Pengguna: "Gaji saya belum dibayar dua bulan."
2.  HAKKU bertanya wilayah umum, status hubungan kerja, kapan upah
    seharusnya dibayar, dan langkah yang telah ditempuh.
3.  Pengguna meninjau ringkasan.
4.  Sistem mencari sumber ketenagakerjaan terkelola dan menjelaskan
    batas kepastian.
5.  HAKKU memberi checklist bukti yang mungkin relevan dan pilihan untuk
    mencari bantuan dari instansi/pendamping yang sesuai.
6.  HAKKU tidak langsung menyatakan pasal final atau mengirim gugatan
    tanpa validasi dan integrasi.

## 6. Contoh journey: penipuan transaksi online

1.  Pengguna menjelaskan transaksi dan apa yang terjadi.
2.  HAKKU mengklarifikasi waktu, platform, metode pembayaran, dan apakah
    pengguna masih berada dalam bahaya/ancaman.
3.  Pengguna mengonfirmasi kronologi.
4.  Sistem menjelaskan opsi umum, pentingnya mempertahankan bukti, serta
    sumber resmi yang relevan.
5.  HAKKU menampilkan jalur pengaduan yang telah diverifikasi atau
    menyatakan bahwa informasi perlu dikonfirmasi.
6.  Tidak ada klaim laporan terkirim kecuali benar-benar terjadi.

## 7. Contoh journey: sengketa kontrak

1.  Pengguna menjelaskan pihak, kewajiban, dan perselisihan.
2.  HAKKU meminta informasi yang tidak sensitif dan mengidentifikasi
    bagian kontrak yang relevan jika pengguna memilih membagikannya.
3.  Sistem merangkum fakta serta ketidakpastian.
4.  HAKKU menunjukkan opsi umum seperti komunikasi/negosiasi, mediasi,
    atau konsultasi profesional, sesuai konteks.
5.  Draf dokumen khusus hanya tersedia setelah template dan alurnya
    ditinjau ahli.

## 8. Prinsip UX lintas alur

-   Pengguna selalu tahu sedang berada di langkah mana.
-   Tidak ada jalan buntu: sediakan kembali, edit, bantuan, atau keluar.
-   Pisahkan fakta, sumber hukum, dan saran.
-   Hindari bahasa yang mengintimidasi atau terlalu teknis.
-   Jangan meminta data lebih banyak daripada yang dibutuhkan.
-   Semua tombol mempunyai tindakan yang benar-benar berjalan.

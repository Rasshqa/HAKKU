# HAKKU --- Implementation Plan

**Versi:** 1.1\
**Model tim:** satu developer dengan bantuan AI coding\
**Target:** prototype lomba yang bisa berkembang menjadi produk nyata\
**Mengacu pada:** dokumen spesifikasi induk dan turunannya

## 0. Constraint lomba dan strategi tanggal

**Batas pengumpulan: 30 Desember 2026.** Per 16 Oktober 2026, waktu tersisa sekitar 10–11 minggu. Jadwal berikut adalah rencana mundur untuk satu developer, bukan jaminan; jika terlambat, pangkas scope P1/P2, bukan mengorbankan keamanan atau validasi sumber.

Paket wajib disiapkan sebagai tiga artefak terpisah: **software sistem, pitch deck, dan video**. Source code diunggah ke GitHub dan tautannya dicantumkan pada pitch deck. Sisihkan waktu khusus untuk rekam ulang video, cek repository, dan latihan menjelaskan kode.

## 1. Strategi delivery

Jangan membangun seluruh visi sekaligus. Kirim irisan produk vertikal
yang benar-benar berfungsi: pengguna menceritakan masalah →
mengonfirmasi ringkasan → menerima informasi awal dengan rujukan →
melihat langkah berikutnya.

Gunakan gerbang kualitas untuk menentukan kapan maju. Timeline di bawah
adalah estimasi relatif, bukan janji; sesuaikan berdasarkan kemampuan,
lomba, dan validasi.

## 2. Fase dan deliverable

### Fase 0 --- Kunci keputusan dan validasi

**Deliverables** - baca dan setujui `00-spesifikasi-induk.md`; -
wawancara singkat calon pengguna dan minimal satu praktisi/organisasi
bantuan hukum bila memungkinkan; - pilih 1--2 alur demo yang dapat
ditinjau; - pilih stack dan anggaran; - tetapkan sumber hukum yang dapat
digunakan.

**Gate:** tidak ada fitur P0 tanpa tujuan dan kriteria penerimaan.

### Fase 1 --- Prototype UX

**Deliverables** - wireframe beranda, intake, ringkasan, hasil,
checklist, dan rujukan; - prototype klik untuk uji tugas; - design
tokens dan komponen dasar; - copy disclaimer dan error states.

**Gate:** pengguna uji memahami langkah utama tanpa penjelasan panjang
dari pembuat.

### Fase 2 --- Kerangka aplikasi

**Deliverables** - repository, lint, typecheck, test runner; - aplikasi
web responsif; - routing dan layout; - konfigurasi local/staging; - data
demo sintetis; - error/loading/empty states.

**Gate:** aplikasi bisa dijalankan dari instruksi README yang bersih.

### Fase 3 --- Alur kasus inti

**Deliverables** - intake bahasa bebas; - pertanyaan klarifikasi
dasar; - ringkasan fakta yang dapat diedit; - checklist tindakan; -
state management yang jelas.

**Gate:** alur dapat dijalankan end-to-end dengan data sintetis tanpa AI
live.

### Fase 4 --- Sumber hukum dan AI

**Deliverables** - skema sumber hukum dan metadata; - pipeline ingestion
minimal untuk sumber yang diizinkan; - retrieval dan citation mapping; -
AI adapter server-side; - output terstruktur dan fallback; - dataset
evaluasi yang ditinjau ahli sejauh tersedia.

**Gate:** AI tidak boleh menampilkan sumber yang tidak cocok dengan ID
sumber di database; uji sumber kosong dan jawaban tidak pasti.

### Fase 5 --- Penyimpanan dan keamanan

**Deliverables** - autentikasi jika dibutuhkan; - kepemilikan kasus dan
object-level authorization; - penghapusan data; - rate limit; - redaksi
log; - privacy notice dan kebijakan retensi draft; - backup/restore bila
menyimpan data persisten.

**Gate:** tes negatif membuktikan pengguna tidak bisa mengakses kasus
pengguna lain. Jangan gunakan data nyata sebelum gate lulus.

### Fase 6 --- Rujukan dan penyempurnaan

**Deliverables** - direktori rujukan dengan sumber/tanggal verifikasi; -
filter berdasarkan jenis/wilayah bila data cukup; - label data belum
terverifikasi; - perbaikan aksesibilitas dan mobile; - pengujian
kegunaan.

**Gate:** tidak ada data mitra fiktif yang ditampilkan sebagai
organisasi nyata.

### Fase 7 --- Persiapan demo/rilis

**Deliverables** - skenario demo dengan data sintetis; - seed/reset
demo; - README setup; - daftar batasan prototype; - smoke test
staging; - slide/demo script sesuai fitur yang benar-benar berfungsi.

**Gate:** tidak ada tombol palsu, klaim pengiriman resmi palsu, secret
di repo, atau bug kritis yang diketahui.

## 3. Urutan prioritas kerja

### P0 --- harus ada untuk demo

1.  Beranda dan intake.
2.  Ringkasan fakta yang dapat dikoreksi.
3.  Hasil awal dengan sumber atau penjelasan keterbatasan.
4.  Opsi langkah berikutnya.
5.  Checklist.
6.  Disclaimer dan error/fallback state.
7.  Data demo sintetis.

### P1 --- jika waktu memungkinkan

1.  Penyimpanan kasus privat.
2.  Direktori rujukan yang terverifikasi.
3.  Login dan penghapusan akun.
4.  Evaluasi AI otomatis/regression suite.

### P2 --- setelah MVP tervalidasi

1.  Unggah dokumen sensitif.
2.  Generator draf dokumen yang ditinjau ahli.
3.  Pengingat tenggat yang mempunyai sumber/verifikasi.
4.  Portal mitra bantuan hukum.

### P3 --- jangka panjang

1.  Integrasi resmi.
2.  Mobile native.
3.  Mediasi/video call.
4.  Analitik agregat dan fitur bahasa tambahan.

## 4. Rencana mingguan menuju 30 Desember 2026

| Periode | Fokus | Hasil minimum |
|---|---|---|
| 16–22 Okt | Kunci skenario, validasi singkat, pilih sumber dan stack | Satu alur demo, daftar sumber awal, scope P0 |
| 23–29 Okt | Wireframe dan prototype UX | Alur dapat diuji tanpa penjelasan panjang |
| 30 Okt–5 Nov | Kerangka web dan setup | Repo, layout responsif, README awal, data sintetis |
| 6–12 Nov | Intake, klarifikasi, ringkasan yang dapat diedit | Alur input hingga konfirmasi berjalan |
| 13–19 Nov | Hasil awal, checklist, error/fallback states; ikuti webinar lomba 18 November dan catat perubahan resmi | Alur inti tanpa integrasi palsu; perbarui rencana bila panitia memberi instruksi baru |
| 20–26 Nov | Korpus sumber hukum dan pencarian | Sumber dengan metadata/status dan tautan yang dapat diperiksa |
| 27 Nov–3 Des | AI bersumber atau fallback terstruktur | Jawaban tervalidasi, sitasi dipetakan ke sumber database |
| 4–10 Des | Keamanan, tes, dan perbaikan UI/performa | Tes izin/input, build stabil, bug kritis ditutup |
| 11–17 Des | Uji pengguna, perbaikan, dokumentasi GitHub | README final draft, skenario demo terkunci |
| 18–24 Des | Pitch deck dan video demo | Draft lengkap tiga artefak, rekam demo versi stabil |
| 25–29 Des | Regression, cek secret, latihan presentasi, finalisasi | Paket pengumpulan final dan backup lokal |
| 30 Des | Pengumpulan | Submit sebelum batas waktu dan simpan bukti submit |

Jika sumber hukum atau AI belum cukup siap, gunakan skenario terbatas dengan sumber terkurasi dan fallback jujur. Jangan memperluas kategori kasus hanya agar terlihat universal.

## 5. Alur kerja AI coding

Untuk setiap tugas: 1. Berikan satu perubahan kecil dengan tujuan dan
acceptance criteria. 2. Minta agent membaca `AGENTS.md` dan dokumen
relevan. 3. Minta rencana singkat sebelum perubahan lintas modul. 4.
Implementasikan perubahan terkecil yang memenuhi kebutuhan. 5. Jalankan
lint, typecheck, unit/integration tests yang relevan. 6. Periksa diff
untuk secrets, data sensitif, akses tanpa otorisasi, dan perubahan
skema. 7. Perbarui dokumentasi dan status keputusan. 8. Commit hanya
setelah tes lulus.

Jangan meminta agent mengubah seluruh aplikasi dalam satu prompt besar.

## 6. Definition of Done

Sebuah fitur dianggap selesai jika: - memenuhi acceptance criteria
PRD; - mempunyai loading, empty, success, dan error states yang
relevan; - validasi dilakukan di server untuk input/akses sensitif; -
memiliki test yang relevan; - tidak menampilkan klaim yang
menyesatkan; - aksesibilitas dasar diperiksa; - tidak membocorkan
secrets atau data; - dokumentasi diperbarui; - semua integrasi nyata
telah diuji, atau diberi label simulasi.

## 7. Checklist sebelum demo

-   [ ] Setup berhasil dari README pada lingkungan bersih.
-   [ ] Data demo sintetis dan bisa di-reset.
-   [ ] Semua sumber hukum demo dapat dibuka/diperiksa.
-   [ ] Jawaban tidak mengarang sumber ketika retrieval gagal.
-   [ ] AI menyatakan ketidakpastian bila bukti tidak cukup.
-   [ ] Tidak ada tombol yang berpura-pura mengirim laporan/gugatan.
-   [ ] Tes otorisasi lintas pengguna lulus bila akun aktif.
-   [ ] Tidak ada secrets atau data pribadi di repository/log.
-   [ ] Tampilan diuji pada viewport mobile dan desktop.
-   [ ] Jalur error provider/jaringan didemonstrasikan.
-   [ ] Batasan prototype dijelaskan pada presentasi.

## 8. Risiko delivery

  -----------------------------------------------------------------------
  Risiko                              Respons
  ----------------------------------- -----------------------------------
  Scope membengkak                    kembali ke P0; pindahkan fitur ke
                                      Deferred

  AI coding membuat perubahan luas    tugas kecil, review diff, tests

  Sumber hukum tidak siap             gunakan alur demo berbasis sumber
                                      terkurasi; jangan pura-pura lengkap

  Biaya API naik                      batas token/rate, cache aman,
                                      fallback

  Waktu lomba sempit                  demo tanpa data nyata dan tandai
                                      simulasi

  Security belum cukup                jangan aktifkan upload atau kasus
                                      nyata
  -----------------------------------------------------------------------


## 9. Checklist pengumpulan Traspac Competition 2027

### Software sistem
- [ ] Build final dan alur demo utama telah diuji.
- [ ] README setup berjalan pada lingkungan bersih.
- [ ] Data demo sintetis; tidak ada data pribadi atau rahasia.
- [ ] Tes, status keterbatasan, dan langkah menjalankan aplikasi tercatat.

### GitHub
- [ ] Repository berisi source code orisinal.
- [ ] Tidak ada secret, `.env`, token, atau data perkara nyata.
- [ ] Commit history dan README cukup membantu pemeriksaan juri.
- [ ] Link repository dicantumkan di pitch deck.

### Pitch deck
- [ ] Masalah dan dampak sosial dijelaskan dengan spesifik.
- [ ] Target pengguna, solusi, pembeda, alur, dan fitur yang benar-benar selesai.
- [ ] Arsitektur, database, keamanan, validasi sumber, dan batasan dijelaskan.
- [ ] Ada bukti demo/hasil uji dan rencana pengembangan.
- [ ] Semua klaim sesuai kondisi implementasi.

### Video
- [ ] Menunjukkan aplikasi berjalan dari skenario yang sama dengan versi repository.
- [ ] Audio, teks, dan transisi dapat dipahami.
- [ ] Tidak memperlihatkan secret, data sensitif, atau fitur simulasi tanpa label.
- [ ] Durasi dan format mengikuti instruksi terbaru panitia.

Periksa website/grup resmi panitia untuk spesifikasi teknis video dan pitch deck karena guide book yang diberikan tidak menetapkan durasi atau format file secara rinci.

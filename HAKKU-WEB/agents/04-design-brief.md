# HAKKU --- Design Brief

**Versi:** 1.1\
**Mengacu pada:** `00-spesifikasi-induk.md`, `01-prd.md`,
`03-app-flow.md`

## 0. Prioritas desain untuk penilaian lomba

UI merupakan salah satu bobot terbesar (15 poin), setara dengan logika kode. Desain harus bukan hanya estetis, tetapi membantu juri memahami manfaat dan alur aplikasi dalam beberapa menit.

Prioritas:
- Satu CTA utama yang jelas pada setiap tahap.
- Status langkah dan progres mudah dipahami.
- Hasil memisahkan fakta pengguna, sumber, opsi tindakan, dan ketidakpastian.
- Responsif pada ponsel dan desktop tanpa scroll horizontal.
- Demo tidak menampilkan tombol mati, placeholder yang tampak seperti data nyata, atau label keberhasilan palsu.
- Gunakan konsistensi komponen agar perubahan mudah dikerjakan oleh satu developer.

## 1. Arah desain

HAKKU harus terasa **ramah, jelas, tenang, dan dapat dipercaya**.
Hindari estetika yang terlalu mirip firma hukum eksklusif, terlalu
banyak ornamen, atau antarmuka yang menakut-nakuti pengguna.

Desain harus mengurangi beban kognitif: satu tindakan utama per layar,
pertanyaan singkat, istilah sehari-hari, serta perbedaan visual yang
jelas antara fakta, sumber, opsi, dan peringatan.

## 2. Karakter merek

-   **Ramah:** pengguna tidak perlu merasa malu karena tidak memahami
    hukum.
-   **Terpercaya:** sumber dan batasan terlihat jelas.
-   **Memberdayakan:** HAKKU membantu pengguna mengambil keputusan,
    bukan memerintah atau menjamin hasil.
-   **Inklusif:** mudah dipakai di ponsel, jaringan lambat, dan berbagai
    tingkat literasi digital.
-   **Tenang:** warna dan microcopy tidak menggunakan alarm berlebihan
    kecuali benar-benar diperlukan.

Tagline: **Pahami Hakmu. Tentukan Langkahmu.**

## 3. Palet warna (Proposed)

  Token        Nilai       Penggunaan
  ------------ ----------- ------------------------------
  Primary      `#005BBB`   tombol utama, link, fokus
  Accent       `#FF8C00`   aksen dan penekanan terbatas
  Background   `#F9FAFB`   latar halaman
  Surface      `#FFFFFF`   kartu/form
  Text         `#202124`   teks utama
  Muted text   `#5F6368`   teks sekunder
  Border       `#DADCE0`   batas komponen
  Success      `#137333`   status berhasil
  Warning      `#8A4B08`   peringatan
  Danger       `#B3261E`   error/risiko tinggi

Warna adalah usulan dan harus diuji untuk kontras WCAG AA. Jangan
memakai warna sebagai satu-satunya cara menyampaikan status.

## 4. Tipografi dan tata letak

-   Font sans-serif yang mudah dibaca, misalnya Inter atau font sistem.
-   Body text minimum target 16 px pada layar utama.
-   Line-height sekitar 1.5.
-   Lebar teks dibatasi agar paragraf tidak terlalu panjang.
-   Spacing berbasis kelipatan 4/8 px.
-   Tombol dan target sentuh minimal sekitar 44 × 44 px.
-   Desain mobile-first dengan layout yang responsif.
-   Hindari modal bertumpuk dan form panjang dalam satu layar.

## 5. Struktur layar

### Beranda

-   headline yang langsung menjelaskan manfaat;
-   kotak "Ceritakan masalahmu" sebagai aksi utama;
-   contoh topik sebagai inspirasi, bukan kategori wajib;
-   penjelasan singkat tentang peran AI;
-   akses mudah ke cari bantuan dan privasi.

### Intake

-   progress indicator sederhana;
-   satu pertanyaan utama per layar bila memungkinkan;
-   pilihan "Saya tidak tahu" jika relevan;
-   tombol kembali dan lanjut yang konsisten;
-   autosave hanya jika penyimpanan aman dan perilakunya dijelaskan.

### Hasil hukum

Gunakan hierarki: 1. "Ringkasan masalah" 2. "Apa yang diketahui dan
belum diketahui" 3. "Informasi hukum yang relevan" 4. "Pilihan langkah"
5. "Bukti/dokumen yang mungkin diperlukan" 6. "Kapan perlu bantuan
profesional"

Kartu sumber harus memuat judul, institusi/sumber, metadata
tanggal/status jika tersedia, dan tautan.

### Ruang kasus

-   status perkara dalam bahasa sederhana;
-   timeline perubahan;
-   checklist tindakan;
-   dokumen dan catatan terpisah;
-   tombol hapus/ekspor sesuai fitur dan kebijakan.

## 6. Komponen dan states

Setiap komponen interaktif harus mempunyai: - default; - hover/focus; -
loading; - disabled; - success; - error; - empty state jika relevan.

Komponen prioritas: - input cerita bebas; - pertanyaan klarifikasi; -
progress stepper; - kartu sumber hukum; - kartu opsi tindakan; -
checklist; - status kasus; - banner batasan/eskalasi; - kartu rujukan; -
konfirmasi penghapusan.

## 7. Microcopy

Gunakan kalimat langsung, manusiawi, dan tidak menghakimi.

**Disarankan** - "Ceritakan apa yang terjadi dengan kata-katamu
sendiri." - "Saya belum punya cukup informasi untuk memastikan hal
ini." - "Berikut beberapa pilihan yang mungkin relevan." - "Periksa
kembali sumber ini atau konsultasikan dengan bantuan hukum." - "Ini
adalah informasi awal, bukan pengganti nasihat profesional."

**Hindari** - "Anda pasti menang." - "Kasus Anda dijamin selesai." - "AI
kami adalah pengacara pribadi Anda." - "Laporan berhasil dikirim" bila
hanya simulasi. - "Pasal ini pasti berlaku" jika konteks atau status
aturan belum diverifikasi.

## 8. Aksesibilitas

Target desain: WCAG 2.2 AA sejauh dapat diterapkan pada prototype.

-   Semua input memiliki label programatik.
-   Fokus keyboard terlihat dan urutan fokus masuk akal.
-   Kontras teks memenuhi target.
-   Error dijelaskan dengan teks, bukan warna saja.
-   Gunakan heading yang terstruktur.
-   Tombol mempunyai nama yang jelas untuk screen reader.
-   Jangan mengandalkan drag-only interaction.
-   Dukung zoom teks dan layout reflow.
-   Animasi minimal; hormati reduced-motion bila didukung.
-   Uji dengan keyboard dan setidaknya satu screen reader bila
    memungkinkan.

## 9. Ilustrasi dan ikon

Gunakan ikon sederhana dan konsisten. Ilustrasi dapat membantu membuat
pengalaman terasa ramah, tetapi tidak boleh menggantikan instruksi
penting. Hindari gambar palu hakim/gedung pengadilan yang berlebihan
pada setiap layar.

## 10. Responsif dan performa

-   Mulai dari lebar ponsel.
-   Form dan hasil harus mudah dibaca tanpa scroll horizontal.
-   Pertahankan aksi utama terlihat jelas.
-   Gunakan aset ringan dan lazy-load bila perlu.
-   Sediakan empty/error state yang tetap berguna ketika AI atau
    jaringan gagal.

## 11. Design tokens awal

``` css
:root {
  --color-primary: #005BBB;
  --color-accent: #FF8C00;
  --color-bg: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-text: #202124;
  --color-muted: #5F6368;
  --color-border: #DADCE0;
  --radius-card: 12px;
  --radius-control: 8px;
  --space-unit: 4px;
}
```

Nilai final harus diuji untuk kontras, konsistensi, dan kebutuhan brand
sebelum menjadi Fixed.

## 12. Checklist review desain

-   Apakah pengguna tahu apa yang harus dilakukan berikutnya?
-   Apakah fakta dibedakan dari interpretasi AI?
-   Apakah sumber hukum mudah dibuka dan dipahami?
-   Apakah batasan AI terlihat pada saat yang tepat?
-   Apakah pengguna bisa kembali atau memperbaiki informasi?
-   Apakah tindakan berisiko memiliki konfirmasi?
-   Apakah tampilan tetap jelas di ponsel dan zoom?
-   Apakah semua tombol berfungsi dan tidak menyesatkan?

# Kebijakan Keamanan (Security Policy)

Keamanan informasi, kerahasiaan data perkara hukum, dan privasi masyarakat adalah prioritas utama HAKKU. Dokumen ini menjelaskan kebijakan penanganan kerentanan dan cara melaporkan celah keamanan secara bertanggung jawab (*responsible disclosure*).

---

## Versi yang Didukung

Kami secara aktif memperbarui dan memelihara keamanan untuk versi cabang utama (`main`):

| Komponen | Status Dukungan |
| :--- | :--- |
| `HAKKU-WEB` (Next.js 15+) | :white_check_mark: Didukung Penuh |
| `HAKKU-MOBILE` (Flutter 3.x) | :white_check_mark: Didukung Penuh |

---

## Melaporkan Celah Keamanan (Vulnerability Disclosure)

Jika Anda menemukan potensi kerentanan keamanan, kebocoran data, atau masalah kepatuhan privasi (UU PDP):

1. **JANGAN membuat public issue di GitHub** yang mengekspos rincian kerentanan sebelum perbaikan dirilis.
2. Laporkan secara privat melalui fitur **GitHub Private Vulnerability Reporting** di tab *Security* repositori ini, atau hubungi langsung maintainer melalui email pengelola.
3. Cantumkan rincian berikut dalam laporan Anda:
   - Deskripsi lengkap kerentanan dan dampaknya.
   - Langkah-langkah reproduksi (*Proof of Concept* / PoC) yang jelas.
   - Komponen atau endpoint yang terpengaruh.
   - Saran perbaikan jika ada.

---

## Komitmen Penanganan

1. Tim pengembang akan mengonfirmasi penerimaan laporan dalam kurun waktu 1-3 hari kerja.
2. Penilaian tingkat risiko akan dilakukan berdasarkan standar CVSS v3.
3. Kami akan menyiapkan perbaikan (*patch*), memverifikasi melalui alur pengujian CI otomatis, dan mempublikasikan versi pembaruan secepatnya.
4. Nama penemu celah keamanan akan diberikan kredit dan atribusi penghormatan (jika disetujui oleh pelapor).

---

## Standar Keamanan Pengembangan

- **Zero Hardcoded Secrets**: Penggunaan static analysis dan secret scanner untuk mencegah kebocoran kredensial di riwayat commit.
- **Enkripsi Transit & At-Rest**: Seluruh komunikasi wajib menggunakan TLS/HTTPS.
- **Prinsip Hak Akses Minimal (*Least Privilege*)**: Proteksi data perkara dengan otorisasi berbasis sesi terenkripsi dan isolasi data per akun.
- **Validasi Skema Masukan**: Memastikan sanitasi dan pengecekan ketat pada seluruh parameter API.

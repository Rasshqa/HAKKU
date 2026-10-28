# HAKKU Mobile Application

Aplikasi mobile resmi HAKKU — asisten paralegal digital dan pendamping advokasi hukum ketenagakerjaan, sengketa sewa-menyewa, penipuan digital, dan perhitungan hak pesangon resmi (PP No. 35 Tahun 2021) untuk platform Android dan iOS.

---

## 📱 Fitur Utama

- **Konsultasi Paralegal Real-Time**: Interaksi responsif dengan streaming LLM token per token (Google Gemini 2.5 Flash / model offline deterministik berbasis korpus hukum sah).
- **Kalkulator Kompensasi Statutory**: Perhitungan uang pesangon (UP), uang penghargaan masa kerja (UPMK), dan uang penggantian hak (UPH) berdasarkan PP 35/2021 dan UU Ketenagakerjaan.
- **Pemeriksa Klausul Kontrak (*Contract Red-Flag Scanner*)**: Pendeteksian klausul eksonerasi, pemotongan deposit sepihak, dan penahanan ijazah.
- **Direktori Bantuan Hukum (LBH & Posbankum)**: Akses kontak resmi lembaga bantuan hukum, Posbankum pengadilan, Satgas PASTI OJK, dan Komnas HAM.
- **Pengamanan Data Lokal**: Penyimpanan lokal menggunakan Hive dan pengamanan sesi login Google-only.

---

## 🛠️ Persyaratan Lingkungan

- **Flutter SDK**: 3.27.x atau lebih baru (Dart 3.6+)
- **Android Studio / Xcode** untuk kompilasi native
- **Target OS**: Android 6.0+ (API Level 23+), iOS 13.0+

---

## 🚀 Menjalankan Aplikasi

```bash
# Unduh dependensi
flutter pub get

# Jalankan dalam mode debug
flutter run

# Menjalankan pengujian (Unit & Widget Tests)
flutter test

# Analisis statis kode
flutter analyze
```

---

## 📦 Struktur Proyek

```
lib/
├── core/            # Tema, konstanta warna, utilitas jaringan (Dio), penyimpanan Hive
├── domain/          # Layanan AI Paralegal, korpus regulasi hukum RI, direktori rujukan
├── features/        # Modul UI (Konsultasi, Onboarding, Login, Beranda, Kalkulator, Kasus)
└── router.dart      # Navigasi & guard rute aplikasi (GoRouter)
```

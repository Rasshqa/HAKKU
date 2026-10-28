# HAKKU (Legal Consultation & Digital Paralegal Platform)

HAKKU adalah platform bantuan hukum digital interaktif dan edukatif untuk masyarakat Indonesia. Platform ini menyediakan konsultasi berbasis AI, kalkulator kompensasi ketenagakerjaan resmi (PP No. 35 Tahun 2021), pendeteksi klausul kontrak berisiko (*contract red-flag scanner*), generator dokumen hukum formal (Bipartit, Somasi, Kronologi Perkara), serta direktori bantuan hukum resmi (Posbankum, YLBHI, Komnas, OJK).

---

## 🏛️ Arsitektur Monorepo

```
HAKKU/
├── HAKKU-WEB/       # Web application (Next.js 15 App Router, React 19, Tailwind CSS v4, Neon Auth / Postgres)
├── HAKKU-MOBILE/    # Cross-platform mobile app (Flutter 3.x, Riverpod, Hive, Dio SSE Streaming)
└── .github/         # CI/CD Workflows, Automation & Security Policies
```

---

## 🚀 Memulai (Quick Start)

### 1. Prasyarat
- **Node.js**: v20.x atau v22.x LTS & npm
- **Flutter SDK**: v3.27+ / v3.38+ & Dart v3.6+
- **Git**

### 2. Menjalankan HAKKU Web
```bash
cd HAKKU-WEB
npm install
npm run dev
```
Akses di [http://localhost:3000](http://localhost:3000).

Pengujian & linting web:
```bash
npm run lint
npm run typecheck
npm test
```

### 3. Menjalankan HAKKU Mobile
```bash
cd HAKKU-MOBILE
flutter pub get
flutter run
```

Pengujian & analisis mobile:
```bash
flutter analyze
flutter test
```

---

## 🔒 Kebijakan Keamanan & Privasi

1. **Prinsip Zero Hardcoded Secrets**: Seluruh kredensial, token API, dan kunci rahasia wajib dimuat via variabel lingkungan (`.env*`). Berkas `.env` tidak pernah dikomit ke repositori.
2. **Kepatuhan UU Pelindungan Data Pribadi (UU PDP No. 27/2022)**:
   - Data konsultasi dan perkara terlindungi isolasi multi-tenant berdasarkan identitas pengguna.
   - Hak untuk Dilupakan (*Right to Erasure*) diterapkan pada penghapusan berkas perkara.
   - Platform tidak pernah meminta kata sandi, PIN perbankan, nomor CVV/CVC, atau OTP.
3. **Validasi Input di Batas Sistem**: Seluruh input disanitasi menggunakan skema Zod (Web) dan validasi ketat (Mobile) untuk mencegah injeksi kode, XSS, dan SSRF.
4. **Rate Limiting & Anti-Abuse**: Pembatasan laju panggilan (burst & hourly limit) diterapkan untuk mencegah eksploitasi API dan DoS.

---

## 📜 Panduan & Berkas Resmi

- [Kode Etik (Code of Conduct)](./CODE_OF_CONDUCT.md)
- [Kebijakan Pelaporan Kerentanan (Security Policy)](./SECURITY.md)
- [Panduan Kontribusi (Contributing Guide)](./CONTRIBUTING.md)
- [Arsitektur Web](./HAKKU-WEB/docs/ARCHITECTURE.md)
- [Panduan Desain & UI Token](./HAKKU-WEB/DESIGN.md)

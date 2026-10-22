# HAKKU Mobile App — Panduan Arsitektur & Implementasi Flutter untuk AI Coding Agent

> **Target Pengembang:** AI Coding Agents, Flutter / Dart Engineers  
> **Framework:** **Flutter (v3.24+)** dengan bahasa **Dart (v3.5+)** — Null Safety  
> **Platform Target:** Android & iOS (Cross-Platform)  
> **Backend Referensi:** HAKKU V2 Web REST API (`Next.js 16 + Neon Serverless Postgres`)  
> **Terakhir Diperbarui:** Oktober 2026

---

## 1. Visi Produk Mobile & Kebutuhan Pengguna

Di Indonesia, lebih dari 75% masyarakat mengakses internet melalui ponsel pintar (*smartphone*). Saat menghadapi sengketa perdata atau ketenagakerjaan mendadak (misal: PHK sepihak, penipuan belanja online, pengusiran sewa kos), masyarakat membutuhkan aplikasi mobile yang:

1. **Cepat & Responsif:** Dapat dibuka seketika saat panik tanpa jeda rendering.
2. **Offline-First:** Kalkulator pesangon statuter, draf surat formil, dan korpus hukum tetap 100% berfungsi tanpa jaringan internet atau saat kehabisan kuota.
3. **Pemanfaatan Perangkat Keras Asli (Kamera & Galeri):** Memotret langsung bukti fisik (surat PHK, kuitansi sewa, bukti transfer ATM) atau melampirkan screenshot percakapan WhatsApp untuk dianalisis matriks bukti.
4. **Pengawal Hak Hukum (Notifikasi Lokal):** Pengingat berkala untuk mengawal tenggat waktu statuter **14 hari perundingan bipartit** (UU 2/2004) atau **7 hari somasi perdata** (KUHPerdata 1238).
5. **Kerahasiaan Tingkat Tinggi (Biometrik):** Perlindungan berkas perkara hukum menggunakan sidik jari (*Fingerprint*) atau pemindai wajah (*Face ID*).
6. **Ekspor & Cetak Nirkabel:** Mengonversi draf surat menjadi PDF resmi dan membagikannya langsung ke WhatsApp atau mencetak ke printer nirkabel (*AirPrint* / *Android Print Service*).

---

## 2. Arsitektur Stack Teknologi Flutter

Gunakan arsitektur **Feature-First (Clean Architecture Ringkas)** yang modular dan mudah diuji:

```
┌─────────────────────────────────────────────────────────────┐
│                    HAKKU FLUTTER STACK                      │
├─────────────────────────┬───────────────────────────────────┤
│ Bahasa & SDK            │ Dart 3.5+ • Flutter 3.24+         │
│ State Management        │ flutter_riverpod / riverpod_annotation │
│ Navigasi & Routing      │ go_router (Declarative Routing)   │
│ Jaringan & HTTP         │ dio (Interceptors, Retry, Logging)│
│ Penyimpanan Lokal       │ isar / hive_flutter (Offline-First)│
│ Serialisasi Data        │ json_serializable / freezed       │
│ Kamera & Berkas         │ image_picker, file_picker         │
│ Notifikasi Lokal        │ flutter_local_notifications       │
│ Kunci Biometrik         │ local_auth (Biometric Security)   │
│ Dokumen & Pencetakan    │ pdf, printing, share_plus         │
│ Umpan Balik Taktil      │ flutter/services (HapticFeedback) │
│ Pengenalan Suara        │ speech_to_text (Voice Input)      │
│ Ikon                    │ lucide_icons                      │
└─────────────────────────┴───────────────────────────────────┘
```

### Rekomendasi `pubspec.yaml`:
```yaml
name: hakku_mobile
description: "Aplikasi Pendamping Hukum Digital Warga Indonesia"
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.5.0 <4.0.0"
  flutter: ">=3.24.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # State Management & DI
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

  # Navigasi
  go_router: ^14.2.7

  # Jaringan & API
  dio: ^5.7.0

  # Penyimpanan Offline-First
  hive_flutter: ^1.1.0

  # Akses Kamera, Galeri, & Berkas
  image_picker: ^1.1.2
  file_picker: ^8.1.2

  # Notifikasi & Keamanan Biometrik
  flutter_local_notifications: ^17.2.2
  local_auth: ^2.2.0

  # PDF, Cetak, & Berbagi
  pdf: ^3.11.1
  printing: ^5.13.2
  share_plus: ^10.0.2

  # UI, Ikon, & Efek
  lucide_icons: ^0.246.0
  intl: ^0.19.0
  confetti: ^0.7.0
  speech_to_text: ^7.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.12
  riverpod_generator: ^2.4.2
  json_serializable: ^6.8.0
```

---

## 3. Struktur Direktori Proyek Flutter (`lib/`)

```text
lib/
├── app.dart                  # Konfigurasi MaterialApp, Theme, & GoRouter
├── main.dart                 # Entry point, inisialisasi Hive & Notifications
├── core/
│   ├── constants/
│   │   ├── api_endpoints.dart # URL ke HAKKU Web API (/api/cases, dll.)
│   │   └── app_colors.dart    # Design Tokens HAKKU (Navy, Amber, Emerald, Red)
│   ├── network/
│   │   └── dio_client.dart    # Dio HTTP client dengan interceptor
│   ├── storage/
│   │   └── local_storage.dart # Wrapper Hive untuk penyimpanan kasus lokal
│   ├── theme/
│   │   └── app_theme.dart     # ThemeData (Tipografi, ButtonStyle, InputBorder)
│   └── utils/
│       ├── formatters.dart    # formatRupiah, formatIndonesianDate, generateCaseCode
│       └── pdf_generator.dart # Pembuatan draf dokumen formil PDF
├── domain/                   # Logika Bisnis & Rumus Hukum Murni (Tanpa UI)
│   ├── calculator/           # Kalkulator Kompensasi Ketenagakerjaan PP 35/2021
│   │   ├── calculator_engine.dart
│   │   └── calculator_models.dart
│   ├── evidence/             # Evaluator Alat Bukti KUHAP 184
│   │   ├── evidence_evaluator.dart
│   │   └── evidence_models.dart
│   ├── document/             # Template Draf Surat Formil
│   │   └── document_templates.dart
│   ├── intake/               # Triage Keselamatan & Pemisahan Fakta
│   │   └── intake_engine.dart
│   └── legal/                # Korpus Pasal Hukum Terverifikasi RI
│       └── legal_corpus.dart
└── features/                 # Fitur Antarmuka Pengguna (UI & Riverpod)
    ├── home/                 # Tab 1: Beranda, Sapaan Hakki, & Quick Intake
    ├── consultation/         # Tab 2: Tanya Hakki (Chat AI & Floating Assessment)
    ├── tools/                # Tab 3: Hub Instrumen Hukum
    │   ├── calculator_screen.dart
    │   ├── document_screen.dart
    │   └── evidence_screen.dart
    ├── cases/                # Tab 4: Ruang Kasus Saya & Countdown 14 Hari
    │   ├── case_detail_screen.dart
    │   └── widgets/countdown_timer_card.dart
    └── emergency/            # Modal Triage Kedaruratan (Panggilan 110 & 129)
```

---

## 4. Porting Logika Hukum HAKKU V2 ke Dart

Seluruh logika bisnis dari repositori HAKKU V2 dapat di-porting ke Dart murni secara elegan:

### A. Formatters Terpusat (`lib/core/utils/formatters.dart`)
```dart
import 'dart:math';
import 'package:intl/intl.dart';

class HakkuFormatters {
  static final NumberFormat _rupiahFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  static final DateFormat _indonesianDateFormat = DateFormat('d MMMM yyyy', 'id_ID');
  static final DateFormat _shortDateFormat = DateFormat('d MMM yyyy', 'id_ID');

  /// Format angka ke Rupiah standar Indonesia (misal: Rp 5.500.000)
  static String formatRupiah(num amount) {
    return _rupiahFormat.format(amount);
  }

  /// Format tanggal formal Indonesia (misal: 21 Oktober 2026)
  static String formatIndonesianDate(DateTime date) {
    return _indonesianDateFormat.format(date);
  }

  /// Format tanggal pendek (misal: 21 Okt 2026)
  static String formatShortDate(DateTime date) {
    return _shortDateFormat.format(date);
  }

  /// Menghasilkan kode kasus unik acak format HK-YYYY-XXXX (misal: HK-2026-A8F2)
  static String generateCaseCode() {
    final year = DateTime.now().year;
    final random = Random.secure();
    final chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    final randomStr = List.generate(4, (_) => chars[random.nextInt(chars.length)]).join();
    return 'HK-$year-$randomStr';
  }
}
```

---

### B. Mesin Kalkulator Kompensasi PP 35/2021 (`lib/domain/calculator/calculator_engine.dart`)
```dart
import 'calculator_models.dart';

class StatutoryCalculatorEngine {
  /// Menghitung bulan dasar Uang Pesangon (UP) sesuai Pasal 40 ayat 2 PP 35/2021
  static int getBaseSeveranceMonths(double tenureYears) {
    if (tenureYears < 1) return 1;
    if (tenureYears < 2) return 2;
    if (tenureYears < 3) return 3;
    if (tenureYears < 4) return 4;
    if (tenureYears < 5) return 5;
    if (tenureYears < 6) return 6;
    if (tenureYears < 7) return 7;
    if (tenureYears < 8) return 8;
    return 9; // Maksimal 9 bulan upah
  }

  /// Menghitung bulan dasar UPMK sesuai Pasal 40 ayat 3 PP 35/2021
  static int getBaseLongServiceMonths(double tenureYears) {
    if (tenureYears < 3) return 0;
    if (tenureYears < 6) return 2;
    if (tenureYears < 9) return 3;
    if (tenureYears < 12) return 4;
    if (tenureYears < 15) return 5;
    if (tenureYears < 18) return 6;
    if (tenureYears < 21) return 7;
    if (tenureYears < 24) return 8;
    return 10; // 24 tahun ke atas
  }

  /// Menghitung Kompensasi PKWT Karyawan Kontrak sesuai Pasal 15 PP 35/2021
  /// Rumus Eksak: (Masa Kerja Bulan / 12) * Upah Bulanan
  static double calculateContractCompensation({
    required int tenureMonths,
    required double monthlySalary,
  }) {
    if (tenureMonths < 1) return 0;
    return (tenureMonths / 12.0) * monthlySalary;
  }

  /// Kalkulasi komprehensif seluruh komponen hak pemutusan hubungan kerja
  static CompensationBreakdown calculateSeverance({
    required ContractType contractType,
    required double monthlySalary,
    required DateTime startDate,
    required DateTime endDate,
    required TerminationReason reason,
    int unusedLeaveDays = 0,
    int remainingContractMonths = 0,
  }) {
    final days = endDate.difference(startDate).inDays;
    final tenureMonths = (days / 30.4167).floor();
    final tenureYears = days / 365.25;

    if (contractType == ContractType.pkwt) {
      final compensation = calculateContractCompensation(
        tenureMonths: tenureMonths,
        monthlySalary: monthlySalary,
      );
      final remainingSalaryDamages = remainingContractMonths * monthlySalary;
      return CompensationBreakdown(
        severancePay: 0,
        longServicePay: 0,
        rightsReplacementPay: 0,
        contractCompensation: compensation,
        remainingContractDamages: remainingSalaryDamages,
        grandTotal: compensation + remainingSalaryDamages,
      );
    }

    // PKWTT (Karyawan Tetap)
    final baseUP = getBaseSeveranceMonths(tenureYears) * monthlySalary;
    final baseUPMK = getBaseLongServiceMonths(tenureYears) * monthlySalary;
    final baseUPH = (unusedLeaveDays / 25.0) * monthlySalary;

    // Multiplier faktor alasan PHK sesuai Pasal 43 s.d. 52
    final upMultiplier = reason.upMultiplier;
    final upmkMultiplier = reason.upmkMultiplier;

    final finalUP = baseUP * upMultiplier;
    final finalUPMK = baseUPMK * upmkMultiplier;
    final finalUPH = baseUPH;

    return CompensationBreakdown(
      severancePay: finalUP,
      longServicePay: finalUPMK,
      rightsReplacementPay: finalUPH,
      contractCompensation: 0,
      remainingContractDamages: 0,
      grandTotal: finalUP + finalUPMK + finalUPH,
    );
  }
}
```

---

### C. Mesin Evaluasi Matriks Bukti KUHAP 184 (`lib/domain/evidence/evidence_evaluator.dart`)
```dart
import 'evidence_models.dart';

class StatutoryEvidenceEvaluator {
  /// Evaluasi skor kekuatan berkas (0 - 100%) dan kesiapan hukum acara
  static EvidenceAuditResult evaluateReadiness(List<EvidenceItem> items) {
    if (items.isEmpty) {
      return EvidenceAuditResult(
        score: 0,
        status: EvidenceReadinessStatus.criticalMissing,
        label: "Belum Ada Bukti",
        strengths: [],
        missingItems: ["Minimal 1 alat bukti tertulis atau elektronik sah."],
      );
    }

    int score = 0;
    final strengths = <String>[];
    final missing = <String>[];

    final hasWritten = items.any((e) => e.type == EvidenceType.writtenDocument);
    final hasDigital = items.any((e) => e.type == EvidenceType.digitalProof);
    final hasFinancial = items.any((e) => e.type == EvidenceType.financialProof);
    final hasWitness = items.any((e) => e.type == EvidenceType.witnessStatement);

    if (hasWritten) {
      score += 35;
      strengths.add("Tersedia dokumen tertulis resmi (Pasal 1866 KUHPerdata).");
    } else {
      missing.add("Bukti tertulis (kontrak kerja / surat perjanjian sewa).");
    }

    if (hasDigital) {
      score += 25;
      strengths.add("Tersedia bukti elektronik sah (Pasal 5 UU ITE No. 1/2024).");
    }

    if (hasFinancial) {
      score += 25;
      strengths.add("Tersedia rekam jejak transfer/kuitansi finansial riil.");
    } else {
      missing.add("Bukti mutasi rekening bank atau kuitansi pembayaran resmi.");
    }

    if (hasWitness) {
      score += 15;
      strengths.add("Tersedia saksi yang melihat/mengalami langsung perbuatan.");
    }

    score = score.clamp(0, 100);

    final status = score >= 75
        ? EvidenceReadinessStatus.readyForFiling
        : score >= 45
            ? EvidenceReadinessStatus.needsSupplement
            : EvidenceReadinessStatus.criticalMissing;

    return EvidenceAuditResult(
      score: score,
      status: status,
      label: status.label,
      strengths: strengths,
      missingItems: missing,
    );
  }
}
```

---

## 5. Arsitektur Layar & Navigasi (Bottom Navigation Shell)

Aplikasi menggunakan `go_router` dengan **StatefulShellRoute** untuk 4 tab utama:

```dart
final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return ScaffoldWithBottomNavBar(navigationShell: navigationShell);
      },
      branches: [
        // Tab 1: Beranda & Quick Intake
        StatefulShellBranch(routes: [
          GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
        ]),
        // Tab 2: Tanya Hakki (Konsultasi AI)
        StatefulShellBranch(routes: [
          GoRoute(path: '/konsultasi', builder: (context, state) => const ConsultationChatScreen()),
        ]),
        // Tab 3: Hub Instrumen Hukum
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/perangkat',
            builder: (context, state) => const ToolsHubScreen(),
            routes: [
              GoRoute(path: 'kalkulator', builder: (context, state) => const CalculatorScreen()),
              GoRoute(path: 'dokumen', builder: (context, state) => const DocumentGeneratorScreen()),
              GoRoute(path: 'bukti', builder: (context, state) => const EvidenceAuditScreen()),
            ],
          ),
        ]),
        // Tab 4: Ruang Kasus Saya
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/kasus',
            builder: (context, state) => const CasesListScreen(),
            routes: [
              GoRoute(
                path: ':code',
                builder: (context, state) => CaseDetailScreen(caseCode: state.pathParameters['code']!),
              ),
            ],
          ),
        ]),
      ],
    ),
    // Modal Rute Khusus
    GoRoute(
      path: '/darurat',
      builder: (context, state) => const EmergencyTriageModal(),
    ),
  ],
);
```

---

## 6. Integrasi Fitur Perangkat Keras Asli (*Native Hardware*)

### A. Pengambilan Foto Bukti Fisik via Kamera & Galeri
```dart
import 'package:image_picker/image_picker.dart';

class EvidenceMediaService {
  final ImagePicker _picker = ImagePicker();

  Future<XFile?> takeEvidencePhoto() async {
    return await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
      preferredCameraDevice: CameraDevice.rear,
    );
  }

  Future<XFile?> pickEvidenceFromGallery() async {
    return await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
    );
  }
}
```

### B. Pengingat Notifikasi Lokal Masa Tunggu 14 Hari (*Statutory Countdown*)
```dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class LegalNotificationService {
  static final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();

  static Future<void> scheduleBipartiteDeadlineReminder({
    required String caseCode,
    required DateTime deliveryDate,
    int durationDays = 14,
  }) async {
    final deadline = deliveryDate.add(Duration(days: durationDays));
    final reminderDate = deadline.subtract(const Duration(days: 3)); // H-3

    if (reminderDate.isBefore(DateTime.now())) return;

    await _notifications.schedule(
      caseCode.hashCode,
      '⏳ Masa Tunggu Bipartit $caseCode',
      'Tersisa 3 hari lagi sebelum batas waktu 14 hari kerja berakhir. Siapkan permohonan mediasi ke Disnaker jika belum ada iktikad baik.',
      reminderDate,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'hakku_statutory_channel',
          'Pengingat Masa Tunggu Hukum',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
    );
  }
}
```

### C. Pembuatan PDF & Cetak Nirkabel (*AirPrint / Android Print*)
```dart
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';

class LegalPdfService {
  /// Membuat berkas PDF resmi lembar draf surat format A4
  static Future<void> generateAndShareDocument({
    required String title,
    required String caseCode,
    required String fullText,
  }) async {
    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.symmetric(horizontal: 40, vertical: 35),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Kop Surat Resmi
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('HAKKU • ADVOKASI & PRA-LITIGASI WARGA',
                          style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11)),
                      pw.Text('Standar Korespondensi Formil KUHPerdata jo. UU No. 2/2004',
                          style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700)),
                    ],
                  ),
                  pw.Text('No: $caseCode',
                      style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                ],
              ),
              pw.Divider(thickness: 1.5),
              pw.SizedBox(height: 12),
              // Isi Naskah Surat
              pw.Text(fullText,
                  style: const pw.TextStyle(fontSize: 10, lineSpacing: 1.5)),
            ],
          );
        },
      ),
    );

    // Bagikan langsung via WhatsApp/Email atau kirim ke Printer Wireless
    await Printing.sharePdf(
      bytes: await doc.save(),
      filename: 'HAKKU_${title.replaceAll(' ', '_')}.pdf',
    );
  }
}
```

### D. Kunci Privasi Berkas Perkara via Biometrik
```dart
import 'package:local_auth/local_auth.dart';

class BiometricSecurityService {
  static final LocalAuthentication _auth = LocalAuthentication();

  static Future<bool> authenticateToAccessCase() async {
    final canAuthenticate = await _auth.canCheckBiometrics || await _auth.isDeviceSupported();
    if (!canAuthenticate) return true; // Lewati jika ponsel tidak punya sensor biometrik

    try {
      return await _auth.authenticate(
        localizedReason: 'Pindai Sidik Jari atau Wajah untuk Membuka Berkas Perkara',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );
    } catch (_) {
      return false;
    }
  }
}
```

---

## 7. Desain Sistem & Aksesibilitas Flutter (HAKKU Tokens)

```dart
import 'package:flutter/material.dart';

class HakkuColors {
  // Palet Warna Resmi HAKKU V2
  static const Color primary = Color(0xFF005BBB);        // Navy Blue
  static const Color primaryHover = Color(0xFF004691);
  static const Color primaryLight = Color(0xFFE8F0FE);
  
  static const Color accent = Color(0xFFFF8C00);         // Amber
  static const Color accentHover = Color(0xFFE07B00);
  
  static const Color success = Color(0xFF137333);        // Emerald Kesiapan Bukti
  static const Color successLight = Color(0xFFE6F4EA);
  
  static const Color danger = Color(0xFFB3261E);         // Red Kedaruratan
  static const Color dangerLight = Color(0xFFFCE8E6);
  
  static const Color background = Color(0xFFF9FAFB);     // Surface Lembut
  static const Color cardSurface = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF202124);
  static const Color textMuted = Color(0xFF5F6368);
  static const Color border = Color(0xFFDADCE0);
}
```

### Standar Aksesibilitas:
- **Ukuran Sentuh Minimum:** Seluruh tombol dan komponen interaktif wajib memiliki dimensi sentuh minimal **48x48 dp** (`minTouchTargetSize: Size(48, 48)`).
- **Umpan Balik Taktil (Haptics):** Panggil `HapticFeedback.lightImpact()` saat pengguna mencentang checklist bukti, menyalin teks, atau beralih tab.
- **Copywriting Bebas Jargon:** Jangan pernah memunculkan kata *"database"*, *"SQL"*, atau *"server postgres"* pada antarmuka pengguna mobile. Selalu gunakan istilah *"Tersimpan dengan Aman"* atau *"Server Penyimpanan"*.

---

## 8. Panduan Langkah-demi-Langkah untuk Agen AI

Jika Anda adalah agen AI yang ditugaskan membangun proyek Flutter HAKKU:

1. **Inisialisasi Proyek Flutter:**
   ```bash
   flutter create --org com.hakku hakku_mobile --platforms=android,ios
   cd hakku_mobile
   ```
2. **Pasang Dependensi Utama:**
   Tambahkan paket-paket dari bagian 2 ke `pubspec.yaml`, lalu jalankan `flutter pub get`.
3. **Bangun Lapisan Inti (`lib/core/` & `lib/domain/`):**
   - Salin dan implementasikan `HakkuFormatters`.
   - Implementasikan `StatutoryCalculatorEngine` (Kalkulator PP 35/2021).
   - Implementasikan `StatutoryEvidenceEvaluator` (Matriks KUHAP 184).
   - Implementasikan `LegalCorpus` data statuter.
4. **Bangun Lapisan Navigasi & Shell:**
   - Siapkan `appRouter` dengan `go_router` dan 4 tab utama.
5. **Bangun Layar Sesuai Prioritas:**
   - **Fase 1:** Beranda & Modal Darurat 110/129.
   - **Fase 2:** Wawancara AI Chat & Floating Asesmen Hukum.
   - **Fase 3:** Kalkulator Kompensasi Interaktif & Rincian Pesangon.
   - **Fase 4:** Matriks Bukti dengan Integrasi Kamera & Skor Kesiapan.
   - **Fase 5:** Draf Surat Formil & PDF Viewer/Sharing.
   - **Fase 6:** Ruang Kasus, Countdown 14 Hari, dan Proteksi Biometrik.
6. **Uji Fungsionalitas:**
   Jalankan `flutter test` untuk memvalidasi rumus kompensasi pesangon dan evaluasi bukti.

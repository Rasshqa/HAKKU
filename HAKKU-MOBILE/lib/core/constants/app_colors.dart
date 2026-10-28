import 'package:flutter/material.dart';

/// Design tokens resmi HAKKU — identik dengan arsitektur web HAKKU
/// Palet Deep Navy, Neo-Brutalist Obsidian Border, dan Aksen Sian Hakki
class HakkuColors {
  HakkuColors._();

  // Primary — Deep Navy (#1B365D) identik dengan versi website
  static const Color primary = Color(0xFF1B365D);
  static const Color primaryHover = Color(0xFF13294B);
  static const Color primaryLight = Color(0xFFE8EEF5);

  // Accent — Sian Maskot Hakki & Aksen Sorotan
  static const Color accent = Color(0xFF00F0FF);
  static const Color accentHover = Color(0xFF00D4E2);
  static const Color accentLight = Color(0xFFE0F2FE);
  static const Color cyanMuted = Color(0xFF93C5FD);

  // Status Statuter & Legal Alerts
  static const Color success = Color(0xFF0D9488);
  static const Color successLight = Color(0xFFCCFBF1);
  static const Color warning = Color(0xFFB45309);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color danger = Color(0xFFDC2626);
  static const Color dangerLight = Color(0xFFFEE2E2);

  // Surface & Background (Canvas Dingin Arsitektural)
  static const Color background = Color(0xFFF8F9FA);
  static const Color cardSurface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F5F9);

  // Typography — Kontras Tinggi WCAG AA
  static const Color textMain = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF475569);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Garis Tepi Neo-Brutalisme (Tegas & Presisi)
  static const Color border = Color(0xFF0F172A);
  static const Color borderSubtle = Color(0xFFE2E8F0);
  static const Color borderFocus = Color(0xFF1B365D);

  // Jalur Cepat Darurat
  static const Color emergency = Color(0xFFDC2626);
  static const Color emergencyLight = Color(0xFFFEE2E2);

  // Helper Bayangan Neo-Brutalis Tanpa Blur (Hard Offset Shadow)
  static List<BoxShadow> neoShadow({
    Color color = const Color(0xFF1B365D),
    double offset = 4.0,
  }) {
    return [
      BoxShadow(
        color: color,
        offset: Offset(offset, offset),
        blurRadius: 0,
        spreadRadius: 0,
      ),
    ];
  }
}

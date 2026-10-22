import 'package:flutter/material.dart';

/// Design tokens resmi HAKKU — sesuai design brief
class HakkuColors {
  HakkuColors._();

  // Primary — Navy Blue
  static const Color primary = Color(0xFF005BBB);
  static const Color primaryHover = Color(0xFF004691);
  static const Color primaryLight = Color(0xFFE8F0FE);

  // Accent — Amber
  static const Color accent = Color(0xFFFF8C00);
  static const Color accentHover = Color(0xFFE07B00);
  static const Color accentLight = Color(0xFFFFF3E0);

  // Status
  static const Color success = Color(0xFF137333);
  static const Color successLight = Color(0xFFE6F4EA);
  static const Color warning = Color(0xFF8A4B08);
  static const Color warningLight = Color(0xFFFEF7E0);
  static const Color danger = Color(0xFFB3261E);
  static const Color dangerLight = Color(0xFFFCE8E6);

  // Surface & Background
  static const Color background = Color(0xFFF9FAFB);
  static const Color cardSurface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F3F4);

  // Text
  static const Color textMain = Color(0xFF202124);
  static const Color textMuted = Color(0xFF5F6368);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Border
  static const Color border = Color(0xFFDADCE0);
  static const Color borderFocus = Color(0xFF005BBB);

  // Emergency
  static const Color emergency = Color(0xFFB3261E);
  static const Color emergencyLight = Color(0xFFFCE8E6);
}

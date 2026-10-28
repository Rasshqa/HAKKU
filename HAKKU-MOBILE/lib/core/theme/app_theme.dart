import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light {
    final base = ThemeData.light(useMaterial3: true);
    return base.copyWith(
      colorScheme: ColorScheme.fromSeed(
        seedColor: HakkuColors.primary,
        primary: HakkuColors.primary,
        secondary: HakkuColors.accent,
        error: HakkuColors.danger,
        surface: HakkuColors.cardSurface,
        onPrimary: HakkuColors.textOnPrimary,
      ),
      scaffoldBackgroundColor: HakkuColors.background,
      textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
        displayLarge: GoogleFonts.sora(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: HakkuColors.textMain,
          letterSpacing: -0.8,
          height: 1.15,
        ),
        displayMedium: GoogleFonts.sora(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          color: HakkuColors.textMain,
          letterSpacing: -0.6,
          height: 1.2,
        ),
        headlineLarge: GoogleFonts.sora(
          fontSize: 24,
          fontWeight: FontWeight.w800,
          color: HakkuColors.textMain,
          letterSpacing: -0.5,
          height: 1.25,
        ),
        headlineMedium: GoogleFonts.sora(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: HakkuColors.textMain,
          letterSpacing: -0.4,
          height: 1.3,
        ),
        titleLarge: GoogleFonts.sora(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: HakkuColors.textMain,
          letterSpacing: -0.3,
          height: 1.35,
        ),
        titleMedium: GoogleFonts.sora(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: HakkuColors.textMain,
          letterSpacing: -0.2,
          height: 1.4,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: HakkuColors.textMain,
          height: 1.55,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: HakkuColors.textMain,
          height: 1.5,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: HakkuColors.textMuted,
          height: 1.45,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.1,
        ),
        labelSmall: GoogleFonts.jetBrainsMono(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: HakkuColors.cardSurface,
        foregroundColor: HakkuColors.textMain,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.sora(
          fontSize: 18,
          fontWeight: FontWeight.w800,
          color: HakkuColors.textMain,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: HakkuColors.cardSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: HakkuColors.border, width: 1.5),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: HakkuColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 48),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: HakkuColors.border, width: 1.5),
          ),
          textStyle: GoogleFonts.sora(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.1,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: HakkuColors.textMain,
          minimumSize: const Size(double.infinity, 48),
          elevation: 0,
          side: const BorderSide(color: HakkuColors.border, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.sora(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.1,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: HakkuColors.primary,
          minimumSize: const Size(44, 44),
          textStyle: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: HakkuColors.background,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: HakkuColors.border, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: HakkuColors.border, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: HakkuColors.primary, width: 2.0),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: HakkuColors.danger, width: 1.5),
        ),
        hintStyle: GoogleFonts.inter(
          fontSize: 14,
          color: HakkuColors.textMuted,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: HakkuColors.borderSubtle,
        thickness: 1,
        space: 0,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: HakkuColors.cardSurface,
        selectedItemColor: HakkuColors.primary,
        unselectedItemColor: HakkuColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: HakkuColors.textMain,
        contentTextStyle: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: HakkuColors.border, width: 1.5),
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

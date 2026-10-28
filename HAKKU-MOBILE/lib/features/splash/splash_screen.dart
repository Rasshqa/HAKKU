import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/storage/local_storage.dart';
import '../home/widgets/hakki_mascot_widget.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _checkAuthAndNavigate();
  }

  void _checkAuthAndNavigate() {
    _timer = Timer(const Duration(milliseconds: 1400), () {
      if (!mounted) return;

      final bool loggedIn = LocalStorage.isLoggedIn();
      final bool onboardingDone = LocalStorage.getOnboardingCompleted();

      if (!loggedIn) {
        context.go('/login');
      } else if (!onboardingDone) {
        context.go('/onboarding');
      } else {
        context.go('/');
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HakkuColors.background,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(flex: 2),

              // Hero Mascot
              const HakkiMascotWidget(
                key: ValueKey('splash_mascot'),
                size: 140,
                initialMood: HakkiMood.welcoming,
                showSpeechBubble: false,
              ).animate().scale(
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.elasticOut,
                  ),
              const SizedBox(height: 24),

              // HAKKU Brand Title
              Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    'HAKKU',
                    style: GoogleFonts.sora(
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1.0,
                      color: HakkuColors.primary,
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.only(left: 4),
                    width: 9,
                    height: 9,
                    decoration: const BoxDecoration(
                      color: HakkuColors.accent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.2, end: 0),
              const SizedBox(height: 8),

              // Tagline Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: HakkuColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: HakkuColors.primary, width: 1.2),
                ),
                child: Text(
                  'ASISTEN HUKUM SAKU ANDA',
                  style: GoogleFonts.jetBrainsMono(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                    color: HakkuColors.primary,
                  ),
                ),
              ).animate().fadeIn(delay: 200.ms),

              const Spacer(flex: 2),

              // Subtle Loading Indicator & Legal Protection Note
              Column(
                children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      valueColor: AlwaysStoppedAnimation<Color>(HakkuColors.primary),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Terproteksi Prinsip Kerahasiaan UU PDP No. 27/2022',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: HakkuColors.textMuted,
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 400.ms),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

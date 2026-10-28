import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/storage/local_storage.dart';
import '../../core/widgets/duo_button.dart';
import '../home/widgets/hakki_mascot_widget.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  static const List<_OnboardingItem> _slides = [
    _OnboardingItem(
      mood: HakkiMood.welcoming,
      speech: 'Halo! Saya Hakki, paralegal digital Anda!',
      tag: 'PENGETAHUAN HUKUM WARGA',
      title: 'Pahami Hak Hukum\nTanpa Istilah Rumit',
      description:
          'Hakki menerjemahkan pasal perundang-undangan menjadi langkah nyata yang mudah dipahami setiap warga.',
      badgeIcon: Icons.menu_book_outlined,
      badgeText: 'KUHAP & UU Ketenagakerjaan',
    ),
    _OnboardingItem(
      mood: HakkiMood.analyzing,
      speech: 'Klausul janggal? Mari kita teliti pasalnya!',
      tag: 'AUDIT & SIMULASI OTOMATIS',
      title: 'Periksa Kontrak &\nHitung Hak Pesangon',
      description:
          'Audit klausul PKWT yang merugikan, uji matriks bukti digital, dan kalkulasi pesangon akurat sesuai PP No. 35/2021.',
      badgeIcon: Icons.calculate_outlined,
      badgeText: 'Formula Statuter PP 35/2021',
    ),
    _OnboardingItem(
      mood: HakkiMood.celebrating,
      speech: 'Hak Anda terlindungi. Berdiri tegak bersama!',
      tag: 'SOLUSI HINGGA TUNTAS',
      title: 'Draf Dokumen Resmi &\nDirektori Bantuan LBH',
      description:
          'Susun draf somasi & perundingan bipartit siap cetak, serta terhubung dengan lembaga bantuan hukum terpercaya.',
      badgeIcon: Icons.shield_outlined,
      badgeText: '100% Privat & Aman di Perangkat',
    ),
  ];

  Future<void> _finishAndEnter() async {
    HapticFeedback.mediumImpact();
    await LocalStorage.setOnboardingCompleted();
    if (mounted) {
      context.go('/');
    }
  }

  void _onNext() async {
    if (_currentPage < _slides.length - 1) {
      HapticFeedback.lightImpact();
      _pageController.nextPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeInOutCubic,
      );
    } else {
      await _finishAndEnter();
    }
  }

  void _onPrevious() {
    HapticFeedback.lightImpact();
    _pageController.previousPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeInOutCubic,
    );
  }

  void _skipToHome() async {
    await _finishAndEnter();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HakkuColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar: Segmented Capsule Progress + Skip Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                children: [
                  // Duolingo-style Segmented Capsule Progress
                  Expanded(
                    child: Row(
                      children: List.generate(_slides.length, (index) {
                        final isFilled = index <= _currentPage;
                        return Expanded(
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeOutCubic,
                            height: 8,
                            margin: EdgeInsets.only(right: index < _slides.length - 1 ? 6 : 0),
                            decoration: BoxDecoration(
                              color: isFilled ? HakkuColors.accent : HakkuColors.border,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: isFilled ? HakkuColors.primary : Colors.transparent,
                                width: 1.5,
                              ),
                              boxShadow: isFilled
                                  ? [
                                      BoxShadow(
                                        color: HakkuColors.primary.withValues(alpha: 0.3),
                                        offset: const Offset(0, 1.5),
                                        blurRadius: 0,
                                      )
                                    ]
                                  : null,
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                  const SizedBox(width: 14),
                  // Lewati Button
                  TextButton(
                    onPressed: _skipToHome,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      visualDensity: VisualDensity.compact,
                    ),
                    child: Text(
                      'LEWATI',
                      style: GoogleFonts.sora(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: HakkuColors.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Middle Carousel: Mascot + Content Cards
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (page) {
                  HapticFeedback.selectionClick();
                  setState(() => _currentPage = page);
                },
                itemCount: _slides.length,
                itemBuilder: (context, index) {
                  final slide = _slides[index];
                  return SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Mascot Hero with Keyed Animation
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 400),
                          transitionBuilder: (child, anim) => ScaleTransition(
                            scale: CurvedAnimation(
                              parent: anim,
                              curve: Curves.elasticOut,
                            ),
                            child: child,
                          ),
                          child: HakkiMascotWidget(
                            key: ValueKey('mascot_slide_$index'),
                            size: 125,
                            initialMood: slide.mood,
                            customSpeech: slide.speech,
                            showSpeechBubble: true,
                            isHorizontal: false,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Pill Category Tag
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: HakkuColors.primaryLight,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: HakkuColors.primary, width: 1.2),
                          ),
                          child: Text(
                            slide.tag,
                            style: GoogleFonts.jetBrainsMono(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                              color: HakkuColors.primary,
                            ),
                          ),
                        ).animate(key: ValueKey('tag_$index')).fadeIn().slideY(begin: 0.2, end: 0),
                        const SizedBox(height: 12),

                        // Title
                        Text(
                          slide.title,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.sora(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                            height: 1.25,
                            color: HakkuColors.textMain,
                          ),
                        ).animate(key: ValueKey('title_$index')).fadeIn().slideY(begin: 0.2, end: 0),
                        const SizedBox(height: 10),

                        // Description
                        ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 340),
                          child: Text(
                            slide.description,
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              height: 1.45,
                              color: HakkuColors.textMuted,
                            ),
                          ),
                        ).animate(key: ValueKey('desc_$index')).fadeIn(),
                        const SizedBox(height: 16),

                        // Trust Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: HakkuColors.border, width: 1.5),
                            boxShadow: HakkuColors.neoShadow(
                              color: HakkuColors.border,
                              offset: 2,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(slide.badgeIcon, size: 14, color: HakkuColors.primary),
                              const SizedBox(width: 6),
                              Text(
                                slide.badgeText,
                                style: GoogleFonts.sora(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: HakkuColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ).animate(key: ValueKey('badge_$index')).fadeIn().scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1)),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Bottom Buttons (Duolingo 3D Tactile Buttons)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Primary 3D Action Button
                  DuoButton(
                    text: _currentPage == _slides.length - 1 ? 'MULAI SEKARANG' : 'LANJUT',
                    icon: _currentPage == _slides.length - 1 ? Icons.arrow_forward_rounded : null,
                    onPressed: _onNext,
                    backgroundColor: HakkuColors.accent,
                    textColor: HakkuColors.textMain,
                  ),
                  const SizedBox(height: 10),

                  // Secondary 3D Button (Kembali / Lewati)
                  if (_currentPage > 0)
                    DuoButton.secondary(
                      text: 'KEMBALI KE SEBELUMNYA',
                      onPressed: _onPrevious,
                    )
                  else
                    DuoButton.secondary(
                      text: 'LEWATI PANDUAN',
                      onPressed: _skipToHome,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingItem {
  final HakkiMood mood;
  final String speech;
  final String tag;
  final String title;
  final String description;
  final IconData badgeIcon;
  final String badgeText;

  const _OnboardingItem({
    required this.mood,
    required this.speech,
    required this.tag,
    required this.title,
    required this.description,
    required this.badgeIcon,
    required this.badgeText,
  });
}

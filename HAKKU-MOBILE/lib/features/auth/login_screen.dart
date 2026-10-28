import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/storage/local_storage.dart';
import '../../core/widgets/duo_button.dart';
import '../home/widgets/hakki_mascot_widget.dart';

/// Ikon Resmi Google 4-Warna (Vector SVG-exact)
class GoogleIconWidget extends StatelessWidget {
  final double size;
  const GoogleIconWidget({super.key, this.size = 20});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GoogleLogoPainter(),
      ),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    final bluePaint = Paint()..color = const Color(0xFF4285F4);
    final greenPaint = Paint()..color = const Color(0xFF34A853);
    final yellowPaint = Paint()..color = const Color(0xFFFBBC05);
    final redPaint = Paint()..color = const Color(0xFFEA4335);

    final center = Offset(w / 2, h / 2);
    final radius = w / 2;

    // Red arc (top)
    final redPath = Path()
      ..moveTo(center.dx, center.dy)
      ..arcTo(
        Rect.fromCircle(center: center, radius: radius),
        -math.pi * 0.75,
        math.pi * 0.5,
        false,
      )
      ..close();
    canvas.drawPath(redPath, redPaint);

    // Yellow arc (left)
    final yellowPath = Path()
      ..moveTo(center.dx, center.dy)
      ..arcTo(
        Rect.fromCircle(center: center, radius: radius),
        math.pi * 0.75,
        math.pi * 0.5,
        false,
      )
      ..close();
    canvas.drawPath(yellowPath, yellowPaint);

    // Green arc (bottom)
    final greenPath = Path()
      ..moveTo(center.dx, center.dy)
      ..arcTo(
        Rect.fromCircle(center: center, radius: radius),
        math.pi * 0.25,
        math.pi * 0.5,
        false,
      )
      ..close();
    canvas.drawPath(greenPath, greenPaint);

    // Blue arc + bar (right)
    final bluePath = Path()
      ..moveTo(center.dx, center.dy)
      ..arcTo(
        Rect.fromCircle(center: center, radius: radius),
        -math.pi * 0.25,
        math.pi * 0.5,
        false,
      )
      ..close();
    canvas.drawPath(bluePath, bluePaint);

    // White inner cutout
    final whitePaint = Paint()..color = Colors.white;
    canvas.drawCircle(center, radius * 0.55, whitePaint);

    // Blue horizontal crossbar
    final barRect = Rect.fromLTRB(
      center.dx,
      center.dy - (radius * 0.24),
      w,
      center.dy + (radius * 0.24),
    );
    canvas.drawRect(barRect, bluePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isLoading = false;
  String? _errorMessage;

  HakkiMood _mascotMood = HakkiMood.welcoming;
  String _mascotSpeech = 'Halo! Masuk praktis dengan akun Google ya.';

  void _handleGoogleSignIn() async {
    HapticFeedback.mediumImpact();
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _mascotMood = HakkiMood.listening;
      _mascotSpeech = 'Menghubungkan ke otentikasi Google...';
    });

    // Simulasi alur autentikasi OAuth Google
    await Future.delayed(const Duration(milliseconds: 900));

    if (!mounted) return;

    await LocalStorage.setLoggedIn(
      true,
      email: 'warga@hakku.id',
      displayName: 'Warga Terdaftar',
    );

    setState(() {
      _isLoading = false;
      _mascotMood = HakkiMood.celebrating;
      _mascotSpeech = 'Akun Google terhubung! Selamat datang di HAKKU.';
    });

    await Future.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;

    // Jika onboarding belum pernah selesai -> arahkan ke onboarding
    final onboardingDone = LocalStorage.getOnboardingCompleted();
    if (!onboardingDone) {
      context.go('/onboarding');
    } else {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {},
      child: Scaffold(
        backgroundColor: HakkuColors.background,
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Interactive Duolingo Mascot
                    Center(
                      child: HakkiMascotWidget(
                        key: ValueKey('mascot_login_$_mascotMood'),
                        size: 135,
                        initialMood: _mascotMood,
                        customSpeech: _mascotSpeech,
                        showSpeechBubble: true,
                        isHorizontal: false,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Security Badge
                    Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: HakkuColors.primaryLight,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: HakkuColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.shield_outlined, size: 14, color: HakkuColors.primary),
                            const SizedBox(width: 6),
                            Text(
                              'Autentikasi Aman • Akses Warga',
                              style: GoogleFonts.sora(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: HakkuColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate().fadeIn().slideY(begin: 0.2, end: 0),
                    const SizedBox(height: 12),

                    // Title
                    Text(
                      'Masuk ke HAKKU',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.sora(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                        color: HakkuColors.textMain,
                      ),
                    ).animate().fadeIn().slideY(begin: 0.2, end: 0),
                    const SizedBox(height: 6),

                    // Subtitle (Persis Web)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'Selamat datang. Masuk praktis dengan akun Google untuk melanjutkan penanganan perkara dan berkonsultasi dengan asisten hukum AI.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          height: 1.45,
                          color: HakkuColors.textMuted,
                        ),
                      ),
                    ).animate().fadeIn(),
                    const SizedBox(height: 24),

                    // Value Highlights Card (Persis Web)
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: HakkuColors.primaryHover, width: 2),
                        boxShadow: HakkuColors.neoShadow(
                          color: HakkuColors.primaryHover,
                          offset: 4,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.auto_awesome, size: 16, color: HakkuColors.warning),
                              const SizedBox(width: 8),
                              Text(
                                'Akses Penuh Akun Warga:',
                                style: GoogleFonts.sora(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: HakkuColors.textMain,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          _buildFeatureBullet(
                            'Penyimpanan otomatis berkas perkara & kode tracking kasus',
                          ),
                          const SizedBox(height: 8),
                          _buildFeatureBullet(
                            'Unduh berkas somasi & perundingan bipartit berstempel digital',
                          ),
                          const SizedBox(height: 8),
                          _buildFeatureBullet(
                            'Riwayat konsultasi wawancara hukum paralegal terlindungi',
                          ),
                        ],
                      ),
                    ).animate().fadeIn().slideY(begin: 0.15, end: 0),
                    const SizedBox(height: 22),

                    // Error Box if any
                    if (_errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: HakkuColors.dangerLight,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: HakkuColors.danger, width: 1.2),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, size: 16, color: HakkuColors.danger),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: HakkuColors.danger,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ).animate().shake(),
                      const SizedBox(height: 16),
                    ],

                    // Google-Only Sign-In Button (Duolingo 3D Tactile)
                    DuoButton(
                      text: 'Masuk dengan Google',
                      leading: const GoogleIconWidget(size: 22),
                      backgroundColor: Colors.white,
                      textColor: HakkuColors.textMain,
                      borderColor: HakkuColors.primaryHover,
                      shadowColor: HakkuColors.primaryHover,
                      bevelHeight: 4.0,
                      isLoading: _isLoading,
                      onPressed: _handleGoogleSignIn,
                    ).animate().fadeIn().slideY(begin: 0.1, end: 0),
                    const SizedBox(height: 20),

                    // Privacy notice
                    Text(
                      'Dengan masuk, data Anda dijamin terlindungi oleh enkripsi lokal dan prinsip privasi UU PDP No. 27 Tahun 2022.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        height: 1.4,
                        color: HakkuColors.textMuted,
                      ),
                    ).animate().fadeIn(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureBullet(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: const EdgeInsets.only(top: 5),
          width: 5,
          height: 5,
          decoration: const BoxDecoration(
            color: HakkuColors.primary,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.inter(
              fontSize: 12,
              height: 1.35,
              color: HakkuColors.textMuted,
            ),
          ),
        ),
      ],
    );
  }
}

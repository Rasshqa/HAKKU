import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';

enum HakkiMood {
  welcoming,
  listening,
  analyzing,
  celebrating,
  empathetic,
}

/// HakkiMascotWidget — Maskot Kancil Paralegal HAKKU Interaktif
/// Dilengkapi animasi nafas/mengambang, telinga bergerak, mata berkedip,
/// dan reaksi sentuhan interaktif dengan speech bubble dan haptic feedback.
class HakkiMascotWidget extends StatefulWidget {
  final double size;
  final HakkiMood initialMood;
  final String? customSpeech;
  final VoidCallback? onTap;
  final bool showSpeechBubble;

  const HakkiMascotWidget({
    super.key,
    this.size = 90,
    this.initialMood = HakkiMood.welcoming,
    this.customSpeech,
    this.onTap,
    this.showSpeechBubble = true,
  });

  @override
  State<HakkiMascotWidget> createState() => _HakkiMascotWidgetState();
}

class _HakkiMascotWidgetState extends State<HakkiMascotWidget>
    with TickerProviderStateMixin {
  late final AnimationController _breatheController;
  late final AnimationController _earController;
  late final AnimationController _bounceController;

  late HakkiMood _currentMood;
  int _speechIndex = 0;
  bool _isWinking = false;
  Timer? _blinkTimer;
  Timer? _winkResetTimer;

  final List<String> _legalTips = [
    'Halo! Sentuh aku untuk tips hukum praktis.',
    'Ingat: Selalu simpan bukti transfer & screenshot chat WhatsApp!',
    'Pekerja berhak atas perundingan bipartit 14 hari kerja saat PHK.',
    'Somasi wanprestasi KUHPerdata memberi tenggat wajar minimal 7 hari.',
    'Berkas perkara Anda di HAKKU tersimpan privat & aman di perangkat.',
    'Butuh bantuan cepat? Tekan tombol Darurat di pojok kanan atas!',
  ];

  @override
  void initState() {
    super.initState();
    _currentMood = widget.initialMood;

    // Animasi mengambang / bernafas lembut
    _breatheController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);

    // Animasi goyang telinga sesekali
    _earController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // Animasi pantul saat disentuh
    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
      lowerBound: 0.9,
      upperBound: 1.12,
      value: 1.0,
    );

    // Timer kedipan mata alami
    _triggerPeriodicBlink();
  }

  void _triggerPeriodicBlink() {
    _blinkTimer?.cancel();
    _blinkTimer = Timer(Duration(milliseconds: 3000 + math.Random().nextInt(3000)), () {
      if (mounted) {
        setState(() => _isWinking = true);
        _winkResetTimer?.cancel();
        _winkResetTimer = Timer(const Duration(milliseconds: 180), () {
          if (mounted) {
            setState(() => _isWinking = false);
            _triggerPeriodicBlink();
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _blinkTimer?.cancel();
    _winkResetTimer?.cancel();
    _breatheController.dispose();
    _earController.dispose();
    _bounceController.dispose();
    super.dispose();
  }

  void _handleTap() {
    HapticFeedback.lightImpact();

    // Pantulan squash & stretch
    _bounceController
        .forward()
        .then((_) => _bounceController.reverse());

    // Goyangkan telinga
    _earController.forward(from: 0.0);

    // Ganti tips bicara
    setState(() {
      _speechIndex = (_speechIndex + 1) % _legalTips.length;
      // Rotasi mood secara acak menyenangkan
      final moods = HakkiMood.values;
      _currentMood = moods[(_speechIndex) % moods.length];
    });

    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    final speechText = widget.customSpeech ?? _legalTips[_speechIndex];

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Speech Bubble Interaktif
        if (widget.showSpeechBubble)
          GestureDetector(
            onTap: _handleTap,
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              constraints: const BoxConstraints(maxWidth: 240),
              decoration: BoxDecoration(
                color: HakkuColors.cardSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: HakkuColors.primary.withValues(alpha: 0.25),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: HakkuColors.primary.withValues(alpha: 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.auto_awesome,
                    size: 13,
                    color: HakkuColors.accent,
                  ),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      speechText,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: HakkuColors.textMain,
                        height: 1.3,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            )
                .animate(key: ValueKey(_speechIndex))
                .scale(
                  begin: const Offset(0.92, 0.92),
                  end: const Offset(1.0, 1.0),
                  duration: 250.ms,
                  curve: Curves.easeOutBack,
                )
                .fadeIn(duration: 200.ms),
          ),

        // Karakter Hakki Interaktif
        GestureDetector(
          onTap: _handleTap,
          child: AnimatedBuilder(
            animation: Listenable.merge([
              _breatheController,
              _bounceController,
              _earController,
            ]),
            builder: (context, child) {
              final floatY = math.sin(_breatheController.value * math.pi * 2) * 3.5;
              final scale = _bounceController.value;

              return Transform.translate(
                offset: Offset(0, floatY),
                child: Transform.scale(
                  scale: scale,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Bayangan lantai
                      Positioned(
                        bottom: 0,
                        child: Container(
                          width: widget.size * 0.65,
                          height: 7,
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.12 - (floatY * 0.01)),
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                      // Gambar Vektor Hakki
                      SizedBox(
                        width: widget.size,
                        height: widget.size,
                        child: CustomPaint(
                          painter: _HakkiVectorPainter(
                            mood: _currentMood,
                            earWiggle: math.sin(_earController.value * math.pi * 4) * 0.12,
                            isWinking: _isWinking,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        // Hint interaktif kecil
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: HakkuColors.primaryLight,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                _getMoodIcon(_currentMood),
                size: 11,
                color: HakkuColors.primary,
              ),
              const SizedBox(width: 4),
              Text(
                _getMoodLabel(_currentMood),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: HakkuColors.primary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  IconData _getMoodIcon(HakkiMood mood) {
    switch (mood) {
      case HakkiMood.welcoming:
        return Icons.waving_hand;
      case HakkiMood.listening:
        return Icons.hearing;
      case HakkiMood.analyzing:
        return Icons.psychology;
      case HakkiMood.celebrating:
        return Icons.celebration;
      case HakkiMood.empathetic:
        return Icons.favorite;
    }
  }

  String _getMoodLabel(HakkiMood mood) {
    switch (mood) {
      case HakkiMood.welcoming:
        return 'Hakki Siap Membantu';
      case HakkiMood.listening:
        return 'Mendengarkan Seksama';
      case HakkiMood.analyzing:
        return 'Menganalisis Dasar Hukum';
      case HakkiMood.celebrating:
        return 'Hak Anda Terlindungi!';
      case HakkiMood.empathetic:
        return 'Pahami Hak Warga';
    }
  }
}

/// CustomPainter untuk menggambar Karakter Vektor Hakki si Kancil Paralegal
class _HakkiVectorPainter extends CustomPainter {
  final HakkiMood mood;
  final double earWiggle;
  final bool isWinking;

  _HakkiVectorPainter({
    required this.mood,
    required this.earWiggle,
    required this.isWinking,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 100.0;
    canvas.save();
    canvas.scale(scale, scale);

    final furPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFFDE8938), Color(0xFFBA621C)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(const Rect.fromLTWH(0, 0, 100, 100));

    final creamPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFFFFFBEB), Color(0xFFFEE685)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(const Rect.fromLTWH(0, 0, 100, 100));

    final pinkEarPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFFFDA4AF), Color(0xFFF472B6)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(const Rect.fromLTWH(0, 0, 100, 100));

    final goldPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFFFBBF24), Color(0xFFD97706)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(const Rect.fromLTWH(0, 0, 100, 100));

    final darkOutline = Paint()
      ..color = const Color(0xFF8C4210)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // 1. Telinga Kiri
    canvas.save();
    canvas.translate(31, 31);
    canvas.rotate(earWiggle);
    final leftEarPath = Path()
      ..moveTo(0, 0)
      ..cubicTo(-8, -3, -19, -11, -19, -19)
      ..cubicTo(-12, -18, -3, -10, 3, -4)
      ..close();
    canvas.drawPath(leftEarPath, furPaint);
    canvas.drawPath(leftEarPath, darkOutline);

    final leftInnerEar = Path()
      ..moveTo(-2, -2)
      ..cubicTo(-8, -5, -15, -11, -15, -17)
      ..cubicTo(-11, -16, -5, -10, 0, -5)
      ..close();
    canvas.drawPath(leftInnerEar, pinkEarPaint);
    canvas.restore();

    // 2. Telinga Kanan
    canvas.save();
    canvas.translate(69, 31);
    canvas.rotate(-earWiggle);
    final rightEarPath = Path()
      ..moveTo(0, 0)
      ..cubicTo(8, -3, 19, -11, 19, -19)
      ..cubicTo(12, -18, 3, -10, -3, -4)
      ..close();
    canvas.drawPath(rightEarPath, furPaint);
    canvas.drawPath(rightEarPath, darkOutline);

    final rightInnerEar = Path()
      ..moveTo(2, -2)
      ..cubicTo(8, -5, 15, -11, 15, -17)
      ..cubicTo(11, -16, 5, -10, 0, -5)
      ..close();
    canvas.drawPath(rightInnerEar, pinkEarPaint);
    canvas.restore();

    // 3. Mahkota Tanduk Mini Kancil (Emas)
    final leftHorn = Path()
      ..moveTo(37, 23)
      ..cubicTo(34, 16, 28, 11, 25, 8)
      ..cubicTo(23.5, 6.5, 21.5, 8, 22.5, 10)
      ..cubicTo(24.5, 13, 28.5, 17, 31.5, 22)
      ..close();
    canvas.drawPath(leftHorn, goldPaint);

    final rightHorn = Path()
      ..moveTo(63, 23)
      ..cubicTo(66, 16, 72, 11, 75, 8)
      ..cubicTo(76.5, 6.5, 78.5, 8, 77.5, 10)
      ..cubicTo(75.5, 13, 71.5, 17, 68.5, 22)
      ..close();
    canvas.drawPath(rightHorn, goldPaint);

    // 4. Badan & Dada Putih
    final bodyPath = Path()
      ..moveTo(32, 60)
      ..cubicTo(28, 70, 26, 82, 34, 88)
      ..cubicTo(42, 92, 58, 92, 66, 88)
      ..cubicTo(74, 82, 72, 70, 68, 60)
      ..close();
    canvas.drawPath(bodyPath, furPaint);

    final chestPath = Path()
      ..moveTo(43, 62)
      ..cubicTo(38, 70, 39, 82, 45, 87)
      ..cubicTo(48, 89, 52, 89, 55, 87)
      ..cubicTo(61, 82, 62, 70, 57, 62)
      ..close();
    canvas.drawPath(chestPath, Paint()..color = Colors.white);

    // 5. Kepala Bundar Menggemaskan
    final headPath = Path()
      ..moveTo(30, 42)
      ..cubicTo(28, 24, 72, 24, 70, 42)
      ..cubicTo(73, 52, 70, 62, 64, 64)
      ..cubicTo(56, 67, 44, 67, 36, 64)
      ..cubicTo(30, 62, 27, 52, 30, 42)
      ..close();
    canvas.drawPath(headPath, furPaint);
    canvas.drawPath(headPath, darkOutline);

    // 6. Moncong Cerah
    final muzzlePath = Path()
      ..moveTo(37, 48)
      ..cubicTo(37, 43, 63, 43, 63, 48)
      ..cubicTo(64, 57, 60, 63, 50, 63)
      ..cubicTo(40, 63, 36, 57, 37, 48)
      ..close();
    canvas.drawPath(muzzlePath, creamPaint);

    // Hidung Cokelat Gelap
    final nosePaint = Paint()..color = const Color(0xFF3E1F0B);
    canvas.drawOval(
      Rect.fromCenter(center: const Offset(50, 52), width: 7, height: 4.5),
      nosePaint,
    );

    // Mulut Senyum
    final mouthPaint = Paint()
      ..color = const Color(0xFF3E1F0B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.4
      ..strokeCap = StrokeCap.round;

    final mouth = Path()
      ..moveTo(46, 56)
      ..quadraticBezierTo(50, 59, 54, 56);
    canvas.drawPath(mouth, mouthPaint);

    // 7. Mata Karakter
    final eyeWhite = Paint()..color = Colors.white;
    final pupilPaint = Paint()..color = const Color(0xFF1E293B);
    final shinePaint = Paint()..color = Colors.white;

    // Mata Kiri
    canvas.drawOval(
      Rect.fromCenter(center: const Offset(40, 42), width: 9, height: 11),
      eyeWhite,
    );
    canvas.drawOval(
      Rect.fromCenter(center: const Offset(41, 42), width: 6.5, height: 8),
      pupilPaint,
    );
    canvas.drawCircle(const Offset(42.5, 40), 2, shinePaint);
    canvas.drawCircle(const Offset(39.5, 44), 1, shinePaint);

    // Mata Kanan (Bisa Kedip/Wink)
    if (isWinking) {
      final winkPaint = Paint()
        ..color = const Color(0xFF1E293B)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0
        ..strokeCap = StrokeCap.round;
      final wink = Path()
        ..moveTo(56, 42)
        ..quadraticBezierTo(60, 39, 64, 42);
      canvas.drawPath(wink, winkPaint);
    } else {
      canvas.drawOval(
        Rect.fromCenter(center: const Offset(60, 42), width: 9, height: 11),
        eyeWhite,
      );
      canvas.drawOval(
        Rect.fromCenter(center: const Offset(59, 42), width: 6.5, height: 8),
        pupilPaint,
      );
      canvas.drawCircle(const Offset(60.5, 40), 2, shinePaint);
      canvas.drawCircle(const Offset(57.5, 44), 1, shinePaint);
    }

    // 8. Dasi Kupu-Kupu Biru Paralegal & Pin Timbangan Keadilan
    final tiePaint = Paint()..color = const Color(0xFF005BBB);
    final leftBow = Path()
      ..moveTo(50, 64)
      ..lineTo(44, 61.5)
      ..lineTo(44, 66.5)
      ..close();
    final rightBow = Path()
      ..moveTo(50, 64)
      ..lineTo(56, 61.5)
      ..lineTo(56, 66.5)
      ..close();
    canvas.drawPath(leftBow, tiePaint);
    canvas.drawPath(rightBow, tiePaint);

    // Simpul Emas di tengah
    canvas.drawCircle(const Offset(50, 64), 2.2, goldPaint);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _HakkiVectorPainter oldDelegate) {
    return oldDelegate.mood != mood ||
        oldDelegate.earWiggle != earWiggle ||
        oldDelegate.isWinking != isWinking;
  }
}

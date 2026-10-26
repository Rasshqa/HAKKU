import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:confetti/confetti.dart';
import '../../../core/constants/app_colors.dart';

enum HakkiMood {
  welcoming('welcoming', 'assets/images/mascot/hakki-welcoming.png'),
  listening('listening', 'assets/images/mascot/hakki-listening.png'),
  analyzing('analyzing', 'assets/images/mascot/hakki-analyzing.png'),
  celebrating('celebrating', 'assets/images/mascot/hakki-celebrating.png'),
  empathetic('empathetic', 'assets/images/mascot/hakki-welcoming.png');

  final String code;
  final String assetPath;
  const HakkiMood(this.code, this.assetPath);
}

/// HakkiMascotWidget — Maskot Kancil Paralegal HAKKU Interaktif ala Duolingo.
/// Fitur interaktif:
/// 1. Eye & Head Parallax Tracking saat pengguna mengusap layar (Pan gesture).
/// 2. Squash & Stretch Jumping dengan fisika pegas elastis saat disentuh.
/// 3. Interaksi Duolingo multi-gestur:
///    - Ketuk 1x: Lompat riang, kedipan mata, haptic, tips hukum berputar.
///    - Ketuk 2x: Perayaan pesta konfeti warna-warni (Confetti burst).
///    - Tahan (Long Press): Partikel hati cinta & afeksi empati.
/// 4. Seni visual resmi resolusi tinggi identik dengan web HAKKU + fallback vektor kustom.
class HakkiMascotWidget extends StatefulWidget {
  final double size;
  final HakkiMood initialMood;
  final String? customSpeech;
  final VoidCallback? onTap;
  final bool showSpeechBubble;
  final bool enableTracking;

  const HakkiMascotWidget({
    super.key,
    this.size = 110,
    this.initialMood = HakkiMood.welcoming,
    this.customSpeech,
    this.onTap,
    this.showSpeechBubble = true,
    this.enableTracking = true,
  });

  @override
  State<HakkiMascotWidget> createState() => _HakkiMascotWidgetState();
}

class _HakkiMascotWidgetState extends State<HakkiMascotWidget>
    with TickerProviderStateMixin {
  late final AnimationController _breatheController;
  late final AnimationController _jumpController;
  late final AnimationController _earController;
  late final ConfettiController _confettiController;

  late HakkiMood _currentMood;
  int _speechIndex = 0;
  bool _isWinking = false;
  bool _showHearts = false;
  Timer? _blinkTimer;
  Timer? _winkResetTimer;
  Timer? _heartTimer;

  // Interaktivitas Duolingo: Pelacakan sentuhan jari (Eye / Head Tracking)
  Offset _lookTarget = Offset.zero; // Relatif -1.0 s/d 1.0
  Offset _currentLook = Offset.zero;

  static const List<String> _legalTips = [
    'Hakki siap bantu hitung hak pesangon sesuai PP 35/2021!',
    'Simpan bukti tangkapan layar percakapan dan mutasi bank sebagai alat bukti sah UU ITE.',
    'Sengketa sewa atau deposit? Cek Pasal 1238 & 1365 KUHPerdata tentang wanprestasi dan ganti rugi.',
    'Ada intimidasi pinjol ilegal? Amankan bukti teror dan laporkan ke Satgas PASTI OJK.',
    'PHK sepihak wajib didahului perundingan bipartit tertulis menurut UU No. 2 Tahun 2004.',
    'Kuitansi, kontrak, dan bukti transfer adalah fondasi pembuktian perdata yang kuat.',
    'Semua data Anda terlindungi prinsip privasi UU PDP No. 27 Tahun 2022.',
  ];

  @override
  void initState() {
    super.initState();
    _currentMood = widget.initialMood;

    // Nafas mengambang lembut
    _breatheController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);

    // Fisika lompat Duolingo squash & stretch
    _jumpController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );

    // Goyang telinga
    _earController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    // Konfeti perayaan
    _confettiController = ConfettiController(
      duration: const Duration(milliseconds: 1200),
    );

    _triggerPeriodicBlink();
  }

  void _triggerPeriodicBlink() {
    _blinkTimer?.cancel();
    _blinkTimer = Timer(
      Duration(milliseconds: 2800 + math.Random().nextInt(2500)),
      () {
        if (mounted) {
          setState(() => _isWinking = true);
          _winkResetTimer?.cancel();
          _winkResetTimer = Timer(const Duration(milliseconds: 160), () {
            if (mounted) {
              setState(() => _isWinking = false);
              _triggerPeriodicBlink();
            }
          });
        }
      },
    );
  }

  @override
  void dispose() {
    _blinkTimer?.cancel();
    _winkResetTimer?.cancel();
    _heartTimer?.cancel();
    _breatheController.dispose();
    _jumpController.dispose();
    _earController.dispose();
    _confettiController.dispose();
    super.dispose();
  }

  void _handleSingleTap() {
    HapticFeedback.lightImpact();
    _jumpController.forward(from: 0.0);
    _earController.forward(from: 0.0);

    setState(() {
      _speechIndex = (_speechIndex + 1) % _legalTips.length;
      final moods = HakkiMood.values;
      _currentMood = moods[_speechIndex % moods.length];
    });

    widget.onTap?.call();
  }

  void _handleDoubleTap() {
    HapticFeedback.heavyImpact();
    _confettiController.play();
    _jumpController.forward(from: 0.0);

    setState(() {
      _currentMood = HakkiMood.celebrating;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.stars, color: Colors.amber, size: 20),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Semangat! Hakki selalu siap mendampingi hak hukum Anda!',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ],
          ),
          backgroundColor: HakkuColors.primary,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _handleLongPress() {
    HapticFeedback.vibrate();
    setState(() {
      _showHearts = true;
      _currentMood = HakkiMood.empathetic;
    });

    _heartTimer?.cancel();
    _heartTimer = Timer(const Duration(milliseconds: 2000), () {
      if (mounted) setState(() => _showHearts = false);
    });
  }

  void _updateTracking(Offset localPosition, Size widgetSize) {
    if (!widget.enableTracking) return;
    final dx = ((localPosition.dx / widgetSize.width) * 2 - 1).clamp(-1.0, 1.0);
    final dy = ((localPosition.dy / widgetSize.height) * 2 - 1).clamp(-1.0, 1.0);
    setState(() {
      _lookTarget = Offset(dx, dy);
    });
  }

  void _resetTracking() {
    setState(() {
      _lookTarget = Offset.zero;
    });
  }

  @override
  Widget build(BuildContext context) {
    final speechText = widget.customSpeech ?? _legalTips[_speechIndex];

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Konfeti Emitter di atas kepala Hakki
        Align(
          alignment: Alignment.topCenter,
          child: ConfettiWidget(
            confettiController: _confettiController,
            blastDirectionality: BlastDirectionality.explosive,
            shouldLoop: false,
            colors: const [
              HakkuColors.primary,
              HakkuColors.accent,
              Colors.amber,
              Colors.pinkAccent,
              HakkuColors.success,
            ],
            numberOfParticles: 20,
            gravity: 0.25,
          ),
        ),

        // Balon Percakapan Interaktif
        if (widget.showSpeechBubble)
          GestureDetector(
            onTap: _handleSingleTap,
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              constraints: const BoxConstraints(maxWidth: 260),
              decoration: BoxDecoration(
                color: HakkuColors.cardSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: HakkuColors.primary.withValues(alpha: 0.25),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: HakkuColors.primary.withValues(alpha: 0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    _getMoodIcon(_currentMood),
                    size: 15,
                    color: HakkuColors.accent,
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      speechText,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: HakkuColors.textMain,
                        height: 1.35,
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

        // Maskot Karakter Interaktif (Interaksi Sentuhan Duolingo)
        GestureDetector(
          onTap: _handleSingleTap,
          onDoubleTap: _handleDoubleTap,
          onLongPress: _handleLongPress,
          onPanUpdate: (details) =>
              _updateTracking(details.localPosition, Size(widget.size, widget.size)),
          onPanEnd: (_) => _resetTracking(),
          onPanCancel: _resetTracking,
          child: AnimatedBuilder(
            animation: Listenable.merge([
              _breatheController,
              _jumpController,
              _earController,
            ]),
            builder: (context, child) {
              // Animasi Fisika Squash & Stretch
              final jumpProgress = _jumpController.value;
              final jumpY = -math.sin(jumpProgress * math.pi) * 16.0;
              final scaleX = 1.0 + (math.sin(jumpProgress * math.pi * 2) * 0.12);
              final scaleY = 1.0 - (math.sin(jumpProgress * math.pi * 2) * 0.12);

              final floatY =
                  math.sin(_breatheController.value * math.pi * 2) * 3.5;

              // Interpolasi halusnya tatapan mata & kemiringan kepala
              _currentLook = Offset.lerp(_currentLook, _lookTarget, 0.25)!;

              return Transform.translate(
                offset: Offset(0, floatY + jumpY),
                child: Transform.scale(
                  scaleX: scaleX,
                  scaleY: scaleY,
                  child: Stack(
                    alignment: Alignment.center,
                    clipBehavior: Clip.none,
                    children: [
                      // Bayangan lantai dinamis
                      Positioned(
                        bottom: -4,
                        child: Container(
                          width: widget.size * (0.65 - (jumpProgress * 0.2)),
                          height: 7,
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(
                              alpha: (0.12 - (floatY * 0.01) - (jumpProgress * 0.06))
                                  .clamp(0.02, 0.15),
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),

                      // Partikel Cinta saat Long Press
                      if (_showHearts)
                        Positioned(
                          top: -16,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.favorite,
                                      color: Colors.pinkAccent, size: 16)
                                  .animate()
                                  .scale(duration: 400.ms)
                                  .slideY(begin: 0.2, end: -0.6),
                              const SizedBox(width: 14),
                              const Icon(Icons.favorite,
                                      color: Colors.redAccent, size: 20)
                                  .animate()
                                  .scale(duration: 500.ms)
                                  .slideY(begin: 0.3, end: -0.8),
                            ],
                          ),
                        ),

                      // Render Gambar Maskot Hakki Resmi
                      Transform(
                        alignment: Alignment.center,
                        transform: Matrix4.identity()
                          ..setEntry(3, 2, 0.001)
                          ..rotateZ(_currentLook.dx * 0.08) // Kemiringan kepala
                          ..setTranslationRaw(_currentLook.dx * 4.0, _currentLook.dy * 3.0, 0.0), // Parallaks
                        child: SizedBox(
                          width: widget.size,
                          height: widget.size,
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: Image.asset(
                              _currentMood.assetPath,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                // Fallback Vektor jika asset gambar belum dimuat
                                return CustomPaint(
                                  painter: _HakkiVectorPainter(
                                    mood: _currentMood,
                                    earWiggle: math.sin(
                                            _earController.value * math.pi * 4) *
                                        0.12,
                                    isWinking: _isWinking,
                                    lookOffset: _currentLook,
                                  ),
                                );
                              },
                            ),
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

        // Lencana Status Mood Interaktif
        const SizedBox(height: 6),
        GestureDetector(
          onTap: _handleSingleTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: HakkuColors.primaryLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: HakkuColors.primary.withValues(alpha: 0.2),
              ),
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

/// Fallback CustomPainter Vektor Kancil dengan Eye Tracking
class _HakkiVectorPainter extends CustomPainter {
  final HakkiMood mood;
  final double earWiggle;
  final bool isWinking;
  final Offset lookOffset;

  _HakkiVectorPainter({
    required this.mood,
    required this.earWiggle,
    required this.isWinking,
    required this.lookOffset,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 100.0;
    canvas.save();
    canvas.scale(scale, scale);

    final furPaint = Paint()..color = const Color(0xFFDE8938);
    final creamPaint = Paint()..color = const Color(0xFFFFFBEB);
    final eyePaint = Paint()..color = const Color(0xFF1E293B);
    final pupilPaint = Paint()..color = Colors.white;

    // Telinga kiri & kanan dengan goyangan
    final leftEarPath = Path()
      ..moveTo(25, 45)
      ..quadraticBezierTo(12 + earWiggle * 20, 15, 28, 20)
      ..close();
    canvas.drawPath(leftEarPath, furPaint);

    final rightEarPath = Path()
      ..moveTo(75, 45)
      ..quadraticBezierTo(88 - earWiggle * 20, 15, 72, 20)
      ..close();
    canvas.drawPath(rightEarPath, furPaint);

    // Kepala bulat kancil
    canvas.drawCircle(const Offset(50, 52), 32, furPaint);

    // Moncong krem
    canvas.drawOval(
      Rect.fromCenter(center: const Offset(50, 64), width: 34, height: 24),
      creamPaint,
    );

    // Hidung cokelat kecil
    final nosePaint = Paint()..color = const Color(0xFF451A03);
    canvas.drawCircle(const Offset(50, 56), 4, nosePaint);

    // Mata Kiri & Kanan dengan Pelacakan Sentuhan (lookOffset)
    final eyeShiftX = lookOffset.dx * 3.0;
    final eyeShiftY = lookOffset.dy * 2.5;

    if (isWinking) {
      // Mata berkedip garis lengkung
      final winkPaint = Paint()
        ..color = const Color(0xFF1E293B)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5
        ..strokeCap = StrokeCap.round;
      canvas.drawArc(
        const Rect.fromLTWH(34, 42, 10, 8),
        0,
        math.pi,
        false,
        winkPaint,
      );
    } else {
      canvas.drawCircle(const Offset(38, 44), 6, eyePaint);
      canvas.drawCircle(
          Offset(38 + eyeShiftX, 44 + eyeShiftY), 2.5, pupilPaint);
    }

    // Mata kanan
    canvas.drawCircle(const Offset(62, 44), 6, eyePaint);
    canvas.drawCircle(
        Offset(62 + eyeShiftX, 44 + eyeShiftY), 2.5, pupilPaint);

    // Senyum ramah
    final smilePaint = Paint()
      ..color = const Color(0xFF78350F)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;
    final smilePath = Path()
      ..moveTo(44, 66)
      ..quadraticBezierTo(50, 72, 56, 66);
    canvas.drawPath(smilePath, smilePaint);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _HakkiVectorPainter oldDelegate) {
    return oldDelegate.mood != mood ||
        oldDelegate.earWiggle != earWiggle ||
        oldDelegate.isWinking != isWinking ||
        oldDelegate.lookOffset != lookOffset;
  }
}

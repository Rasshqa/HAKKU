import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';

enum HakkiMood {
  welcoming,
  listening,
  analyzing,
  celebrating,
  empathetic,
}

/// HakkiMascotWidget — Maskot Vektor 2D Kancil Paralegal HAKKU Interaktif ala Duolingo.
/// Identik 100% dengan maskot vektor resmi di website HAKKU (HakkiDuoInteractive).
///
/// Spesifikasi Visual Arsitektural:
/// 1. Medali circular base dengan outline tebal 2.8px dan bayangan offset keras neo-brutalis.
/// 2. Jas blazer obsidian navy (#0F172A), kemeja putih kerah tegak, dasi sutra sian (#00F0FF),
///    pin timbangan hukum emas (#FBBF24), dan saputangan saku sian.
/// 3. Cakar kiri memegang Kitab Hukum (KUHAP / UU) dengan pita pembatas sian.
/// 4. Cakar kanan melambai ramah dengan bantalan cakar kancil.
/// 5. Mata ekspresif Duolingo dengan busur iris sian (#00F0FF), kelopak kedip, dan pelacakan tatapan.
/// 6. Balon ucapan arsitektural dengan garis batas 2px, bayangan offset keras 4px #1B365D,
///    dan tips regulasi hukum resmi (PP 35/2021, UU ITE 1/2024, KUHPerdata, UU PDP 27/2022).
class HakkiMascotWidget extends StatefulWidget {
  final double size;
  final HakkiMood initialMood;
  final String? customSpeech;
  final int characterCount;
  final bool isTyping;
  final VoidCallback? onTap;
  final bool showSpeechBubble;
  final bool isHorizontal;

  const HakkiMascotWidget({
    super.key,
    this.size = 140,
    this.initialMood = HakkiMood.welcoming,
    this.customSpeech,
    this.characterCount = 0,
    this.isTyping = false,
    this.onTap,
    this.showSpeechBubble = true,
    this.isHorizontal = false,
  });

  @override
  State<HakkiMascotWidget> createState() => _HakkiMascotWidgetState();
}

class _HakkiMascotWidgetState extends State<HakkiMascotWidget>
    with TickerProviderStateMixin {
  late final AnimationController _breatheController;
  late final AnimationController _jumpController;
  late final AnimationController _earController;
  late final AnimationController _waveController;
  late final AnimationController _wobbleController;

  late HakkiMood _currentMood;
  int _tipIndex = 0;
  bool _isWinking = false;
  bool _isPressed = false;
  Timer? _blinkTimer;
  Timer? _winkResetTimer;

  Offset _lookTarget = Offset.zero;
  Offset _currentLook = Offset.zero;

  static const List<String> _statutoryTips = [
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
      duration: const Duration(milliseconds: 3200),
    )..repeat(reverse: true);

    // Fisika lompat Duolingo squash & stretch
    _jumpController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 380),
    );

    // Kedutan telinga kancil
    _earController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    // Lambaian tangan ramah
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    // Goyang taktil interaktif (wobble tilt) ala Duolingo
    _wobbleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 550),
    );

    _scheduleNextBlink();
  }

  void _scheduleNextBlink() {
    _blinkTimer?.cancel();
    _blinkTimer = Timer(
      Duration(milliseconds: 2600 + math.Random().nextInt(2200)),
      () {
        if (!mounted) return;
        setState(() => _isWinking = true);
        _winkResetTimer?.cancel();
        _winkResetTimer = Timer(const Duration(milliseconds: 140), () {
          if (!mounted) return;
          setState(() => _isWinking = false);
          _scheduleNextBlink();
        });
      },
    );
  }

  @override
  void didUpdateWidget(covariant HakkiMascotWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialMood != widget.initialMood) {
      setState(() {
        _currentMood = widget.initialMood;
      });
      if (widget.initialMood == HakkiMood.celebrating) {
        _jumpController.forward(from: 0.0);
        _wobbleController.forward(from: 0.0);
      }
    }
  }

  @override
  void dispose() {
    _blinkTimer?.cancel();
    _winkResetTimer?.cancel();
    _breatheController.dispose();
    _jumpController.dispose();
    _earController.dispose();
    _waveController.dispose();
    _wobbleController.dispose();
    super.dispose();
  }

  void _handleTap() {
    HapticFeedback.lightImpact();
    setState(() {
      _tipIndex = (_tipIndex + 1) % _statutoryTips.length;
      _isWinking = true;
    });

    _jumpController.forward(from: 0.0);
    _wobbleController.forward(from: 0.0);
    Future.delayed(const Duration(milliseconds: 180), () {
      if (mounted) setState(() => _isWinking = false);
    });

    widget.onTap?.call();
  }

  void _handleDoubleTap() {
    HapticFeedback.mediumImpact();
    setState(() {
      _currentMood = HakkiMood.celebrating;
    });
    _jumpController.forward(from: 0.0);
    _wobbleController.forward(from: 0.0);
    Future.delayed(const Duration(milliseconds: 2000), () {
      if (mounted) setState(() => _currentMood = widget.initialMood);
    });
  }

  String _getActiveSpeechText() {
    if (widget.customSpeech != null) return widget.customSpeech!;
    if (widget.isTyping) {
      return 'Hakki sedang memetakan kronologi dan entitas hukum Anda...';
    }
    if (widget.characterCount > 0) {
      if (widget.characterCount < 20) {
        return 'Teruskan! Tambahkan kronologi dan pihak terkait (${widget.characterCount} karakter).';
      }
      return 'Kronologi lengkap terbaca. Siap dianalisis pasalnya.';
    }
    return _statutoryTips[_tipIndex % _statutoryTips.length];
  }

  @override
  Widget build(BuildContext context) {
    final speechText = _getActiveSpeechText();

    if (widget.isHorizontal) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _buildMascotAvatar(),
          if (widget.showSpeechBubble) ...[
            const SizedBox(width: 14),
            Expanded(
              child: _buildSpeechBubble(speechText, isHorizontal: true),
            ),
          ],
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (widget.showSpeechBubble)
          _buildSpeechBubble(speechText, isHorizontal: false),
        _buildMascotAvatar(),
        const SizedBox(height: 12),
        Text(
          'KLIK HAKKI UNTUK TIPS HUKUM',
          style: GoogleFonts.jetBrainsMono(
            fontSize: 8.5,
            fontWeight: FontWeight.w600,
            color: HakkuColors.textMuted,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildSpeechBubble(String speechText, {required bool isHorizontal}) {
    return Container(
      margin: EdgeInsets.only(bottom: isHorizontal ? 0 : 12),
      constraints: isHorizontal ? null : const BoxConstraints(maxWidth: 320),
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HakkuColors.border, width: 2),
        boxShadow: HakkuColors.neoShadow(
          color: HakkuColors.primary,
          offset: 3,
        ),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Aksen Garis Biru Navy di sudut
              Container(
                width: 20,
                height: 2.5,
                margin: const EdgeInsets.only(bottom: 5),
                decoration: BoxDecoration(
                  color: HakkuColors.primary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: HakkuColors.primary,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: HakkuColors.border, width: 1),
                    ),
                    child: const Icon(
                      Icons.chat_bubble_outline_rounded,
                      color: Colors.white,
                      size: 11,
                    ),
                  ),
                  const SizedBox(width: 7),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'HAKKI · PENDAMPING AI',
                          style: GoogleFonts.jetBrainsMono(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                            color: HakkuColors.textMain,
                            letterSpacing: 0.4,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          speechText,
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
                            color: HakkuColors.textMain,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Ekor Balon Percakapan: Menunjuk ke kiri saat horizontal, ke bawah saat vertikal
          if (isHorizontal)
            Positioned(
              top: 18,
              left: -17,
              child: Transform.rotate(
                angle: math.pi / 4,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(
                      bottom: BorderSide(color: HakkuColors.border, width: 2),
                      left: BorderSide(color: HakkuColors.border, width: 2),
                    ),
                  ),
                ),
              ),
            )
          else
            Positioned(
              bottom: -15,
              left: 0,
              right: 0,
              child: Center(
                child: Transform.rotate(
                  angle: math.pi / 4,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border(
                        bottom: BorderSide(color: HakkuColors.border, width: 2),
                        right: BorderSide(color: HakkuColors.border, width: 2),
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMascotAvatar() {
    return Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
        // Karakter Maskot Interaktif dengan Gestur & Taktil
        GestureDetector(
          onTapDown: (_) {
            HapticFeedback.selectionClick();
            setState(() => _isPressed = true);
          },
          onTapUp: (_) => setState(() => _isPressed = false),
          onTapCancel: () => setState(() => _isPressed = false),
          onTap: _handleTap,
          onDoubleTap: _handleDoubleTap,
          onPanUpdate: (details) {
            final center = Offset(widget.size / 2, widget.size / 2);
            final delta = details.localPosition - center;
            setState(() {
              _lookTarget = Offset(
                (delta.dx / (widget.size / 2)).clamp(-1.0, 1.0),
                (delta.dy / (widget.size / 2)).clamp(-1.0, 1.0),
              );
            });
          },
          onPanEnd: (_) => setState(() => _lookTarget = Offset.zero),
          child: AnimatedBuilder(
            animation: Listenable.merge([
              _breatheController,
              _jumpController,
              _earController,
              _waveController,
              _wobbleController,
            ]),
            builder: (context, child) {
              final jumpVal = _jumpController.value;
              final jumpY = -math.sin(jumpVal * math.pi) * 16.0;

              // Squash & stretch dinamis
              final pressSquash = _isPressed ? 1.08 : 1.0;
              final pressStretch = _isPressed ? 0.92 : 1.0;

              final squash = (1.0 + (math.sin(jumpVal * math.pi * 2) * 0.12)) * pressSquash;
              final stretch = (1.0 - (math.sin(jumpVal * math.pi * 2) * 0.12)) * pressStretch;

              // Goyangan elastis (wobble tilt)
              final wobbleProgress = _wobbleController.value;
              final wobbleAngle = math.sin(wobbleProgress * math.pi * 3) *
                  (1.0 - wobbleProgress) *
                  0.10;

              final floatY = math.sin(_breatheController.value * math.pi * 2) * 2.8;
              _currentLook = Offset.lerp(_currentLook, _lookTarget, 0.25)!;

              return Transform.rotate(
                angle: wobbleAngle,
                alignment: Alignment.bottomCenter,
                child: Transform.translate(
                  offset: Offset(0, floatY + jumpY),
                  child: Transform.scale(
                    scaleX: squash,
                    scaleY: stretch,
                    alignment: Alignment.bottomCenter,
                    child: SizedBox(
                      width: widget.size,
                      height: widget.size,
                      child: CustomPaint(
                        painter: _HakkiVectorMasterPainter(
                          mood: _currentMood,
                          earTwitch: _earController.value,
                          waveHand: _waveController.value,
                          isWinking: _isWinking,
                          lookOffset: _currentLook,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        // Lencana Status Neo-Brutalis Menempel di Bawah Medali (Persis Web)
        Positioned(
          bottom: -6,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: HakkuColors.border,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.black, width: 1.5),
              boxShadow: HakkuColors.neoShadow(
                color: HakkuColors.primary,
                offset: 2,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.balance,
                  color: Color(0xFF00F0FF),
                  size: 10,
                ),
                const SizedBox(width: 4),
                Text(
                  'HAKKI · AI PARALEGAL',
                  style: GoogleFonts.jetBrainsMono(
                    fontSize: 8.5,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: 0.7,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// Master Painter Vektor Hakki Kancil Resmi HAKKU (Berdasarkan HakkiDuoInteractive)
class _HakkiVectorMasterPainter extends CustomPainter {
  final HakkiMood mood;
  final double earTwitch;
  final double waveHand;
  final bool isWinking;
  final Offset lookOffset;

  _HakkiVectorMasterPainter({
    required this.mood,
    required this.earTwitch,
    required this.waveHand,
    required this.isWinking,
    required this.lookOffset,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Normalisasi kanvas ke 140 x 140 (koordinat desain HakkiDuoInteractive)
    final scale = size.width / 140.0;
    canvas.save();
    canvas.scale(scale, scale);

    // 1. Cincin Sian Halus (Vector Crisp Ring — Tanpa Filter Blur Rusak)
    canvas.drawCircle(
      const Offset(70, 70),
      54.5,
      Paint()
        ..color = const Color(0xFF00F0FF).withValues(alpha: 0.3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0,
    );

    // 2. Medali Base Lingkaran Offset Keras Neo-Brutalis
    canvas.drawCircle(const Offset(73, 73), 50.5, Paint()..color = const Color(0xFF0F172A));

    final baseFillPaint = Paint()..color = const Color(0xFFFFFDF9);
    final baseStrokePaint = Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.8;
    canvas.drawCircle(const Offset(70, 70), 50.5, baseFillPaint);
    canvas.drawCircle(const Offset(70, 70), 50.5, baseStrokePaint);

    // Cincin interior medali
    final innerRingPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawCircle(const Offset(70, 70), 46.5, innerRingPaint);

    // 3. Batang Leher & Garis Tenggorokan Kancil
    final neckPath = Path()
      ..moveTo(61, 74)
      ..lineTo(79, 74)
      ..lineTo(81, 86)
      ..lineTo(59, 86)
      ..close();
    canvas.drawPath(neckPath, Paint()..color = const Color(0xFFD97706));
    canvas.drawPath(neckPath, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0);

    // Garis putih tenggorokan
    final throatPath = Path()
      ..moveTo(66, 75)
      ..lineTo(74, 75)
      ..lineTo(75, 85)
      ..lineTo(65, 85)
      ..close();
    canvas.drawPath(throatPath, Paint()..color = const Color(0xFFFFFBEB));

    // 4. Jas Blazer Obsidian-Navy Advokat & Bahu
    final suitPath = Path()
      ..moveTo(35, 114)
      ..cubicTo(36, 90, 48, 81, 70, 81)
      ..cubicTo(92, 81, 104, 90, 105, 114)
      ..cubicTo(88, 122, 52, 122, 35, 114)
      ..close();
    canvas.drawPath(suitPath, Paint()..color = const Color(0xFF0F172A));
    canvas.drawPath(suitPath, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5);

    // Kemeja Putih Kerah Advokat
    final shirtPath = Path()
      ..moveTo(55, 81)
      ..lineTo(70, 105)
      ..lineTo(85, 81)
      ..close();
    canvas.drawPath(shirtPath, Paint()..color = Colors.white);
    canvas.drawPath(shirtPath, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0);

    // Kerah kemeja kiri & kanan
    final leftCollar = Path()
      ..moveTo(56, 80)
      ..lineTo(66, 89)
      ..lineTo(61, 93)
      ..lineTo(52, 84)
      ..close();
    canvas.drawPath(leftCollar, Paint()..color = const Color(0xFFF8FAFC));
    canvas.drawPath(leftCollar, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8);

    final rightCollar = Path()
      ..moveTo(84, 80)
      ..lineTo(74, 89)
      ..lineTo(79, 93)
      ..lineTo(88, 84)
      ..close();
    canvas.drawPath(rightCollar, Paint()..color = const Color(0xFFF8FAFC));
    canvas.drawPath(rightCollar, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8);

    // Dasi Sutra Sian Hakki (#00F0FF)
    final tiePath = Path()
      ..moveTo(66.5, 86)
      ..lineTo(73.5, 86)
      ..lineTo(75, 103)
      ..lineTo(70, 109)
      ..lineTo(65, 103)
      ..close();
    canvas.drawPath(tiePath, Paint()..color = const Color(0xFF00F0FF));
    canvas.drawPath(tiePath, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8);

    // Simpul dasi
    final tieKnot = Path()
      ..moveTo(65.5, 82.5)
      ..lineTo(74.5, 82.5)
      ..lineTo(73, 87.5)
      ..lineTo(67, 87.5)
      ..close();
    canvas.drawPath(tieKnot, Paint()..color = const Color(0xFF00D4E2));
    canvas.drawPath(tieKnot, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.7);

    // Penjepit Dasi Emas (Gold Tie Clip)
    final tieClip = RRect.fromRectAndRadius(
      const Rect.fromLTWH(66, 95, 8, 2.2),
      const Radius.circular(1),
    );
    canvas.drawRRect(tieClip, Paint()..color = const Color(0xFFFBBF24));
    canvas.drawRRect(tieClip, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.9);

    // Saputangan Saku Sian & Pin Kerah Timbangan Hukum Emas
    final pocketSquare = Path()
      ..moveTo(82, 99)
      ..lineTo(87, 95)
      ..lineTo(91, 99)
      ..close();
    canvas.drawPath(pocketSquare, Paint()..color = const Color(0xFF00F0FF));
    canvas.drawPath(pocketSquare, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.3);

    // Pin kerah emas
    canvas.drawCircle(const Offset(54, 93), 3.2, Paint()..color = const Color(0xFFFBBF24));
    canvas.drawCircle(const Offset(54, 93), 3.2, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2);
    canvas.drawCircle(const Offset(54, 93), 1.2, Paint()..color = const Color(0xFF00F0FF));

    // 5. Telinga Kancil Daun (Kiri & Kanan dengan Goyangan)
    final earTwitchDeg = (earTwitch - 0.5) * 8.0;

    // Telinga Kiri
    canvas.save();
    canvas.translate(46, 42);
    canvas.rotate(-earTwitchDeg * math.pi / 180);
    canvas.translate(-46, -42);

    final leftEarPath = Path()
      ..moveTo(47, 44)
      ..cubicTo(33, 38, 20, 25, 22, 12)
      ..cubicTo(34, 11, 48, 22, 54, 37)
      ..close();
    canvas.drawPath(leftEarPath, Paint()..color = const Color(0xFFF59E0B));
    canvas.drawPath(leftEarPath, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.4);

    // Ujung telinga cokelat tua
    final leftEarTip = Path()
      ..moveTo(22, 12)
      ..cubicTo(26, 12, 31, 14, 34, 17)
      ..cubicTo(29, 18, 25, 19, 23, 22)
      ..cubicTo(21.5, 18, 21.5, 15, 22, 12)
      ..close();
    canvas.drawPath(leftEarTip, Paint()..color = const Color(0xFF78350F));

    // Daun telinga dalam merah muda
    final leftInnerEar = Path()
      ..moveTo(46, 40)
      ..cubicTo(36, 35, 28, 25, 28, 17)
      ..cubicTo(36, 18, 44, 26, 49, 36)
      ..close();
    canvas.drawPath(leftInnerEar, Paint()..color = const Color(0xFFFDA4AF));

    // Anting sian teknologi kancil
    canvas.drawCircle(const Offset(26, 22), 2.4, Paint()..color = const Color(0xFF00F0FF));
    canvas.drawCircle(const Offset(26, 22), 2.4, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.1);
    canvas.restore();

    // Telinga Kanan
    canvas.save();
    canvas.translate(94, 42);
    canvas.rotate(earTwitchDeg * math.pi / 180);
    canvas.translate(-94, -42);

    final rightEarPath = Path()
      ..moveTo(93, 44)
      ..cubicTo(107, 38, 120, 25, 118, 12)
      ..cubicTo(106, 11, 92, 22, 86, 37)
      ..close();
    canvas.drawPath(rightEarPath, Paint()..color = const Color(0xFFF59E0B));
    canvas.drawPath(rightEarPath, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.4);

    final rightEarTip = Path()
      ..moveTo(118, 12)
      ..cubicTo(114, 12, 109, 14, 106, 17)
      ..cubicTo(111, 18, 115, 19, 117, 22)
      ..cubicTo(118.5, 18, 118.5, 15, 118, 12)
      ..close();
    canvas.drawPath(rightEarTip, Paint()..color = const Color(0xFF78350F));

    final rightInnerEar = Path()
      ..moveTo(94, 40)
      ..cubicTo(104, 35, 112, 25, 112, 17)
      ..cubicTo(104, 18, 96, 26, 91, 36)
      ..close();
    canvas.drawPath(rightInnerEar, Paint()..color = const Color(0xFFFDA4AF));
    canvas.restore();

    // 6. Kepala Kancil & Pipi Berbulu
    final headPath = Path()
      ..moveTo(40, 51)
      ..cubicTo(41, 29, 99, 29, 100, 51)
      ..cubicTo(105, 56, 106, 63, 101, 67)
      ..cubicTo(103, 70, 99, 75, 94, 76)
      ..cubicTo(87, 82, 79, 84, 70, 84)
      ..cubicTo(61, 84, 53, 82, 46, 76)
      ..cubicTo(41, 75, 37, 70, 39, 67)
      ..cubicTo(34, 63, 35, 56, 40, 51)
      ..close();
    canvas.drawPath(headPath, Paint()..color = const Color(0xFFF59E0B));
    canvas.drawPath(headPath, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5);

    // Garis belang kening kancil
    final crownPath = Path()
      ..moveTo(65, 33)
      ..quadraticBezierTo(70, 45, 70, 51)
      ..quadraticBezierTo(70, 45, 75, 33)
      ..close();
    canvas.drawPath(crownPath, Paint()..color = const Color(0xFFB45309).withValues(alpha: 0.55));
    canvas.drawOval(
      Rect.fromCenter(center: const Offset(70, 41), width: 7.6, height: 12.4),
      Paint()..color = const Color(0xFFFFFBEB).withValues(alpha: 0.9),
    );

    // Topeng Krem Hangat Kancil (Heart-Shaped Muzzle)
    final maskPath = Path()
      ..moveTo(43, 60)
      ..cubicTo(43, 49, 58, 47, 70, 53)
      ..cubicTo(82, 47, 97, 49, 97, 60)
      ..cubicTo(98, 73, 86, 83, 70, 83)
      ..cubicTo(54, 83, 42, 73, 43, 60)
      ..close();
    canvas.drawPath(maskPath, Paint()..color = const Color(0xFFFFFBEB));

    // Jambul Rambut Kancil di Kening
    final tuft1 = Path()
      ..moveTo(63, 33)
      ..cubicTo(64, 24, 69, 21, 72, 20)
      ..cubicTo(71, 25, 74, 27, 76, 33);
    canvas.drawPath(tuft1, Paint()..color = const Color(0xFFF59E0B));
    canvas.drawPath(tuft1, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round);

    // Pipi Merona Lembut
    final cheekPaint = Paint()..color = const Color(0xFFFB7185).withValues(alpha: 0.55);
    canvas.drawOval(Rect.fromCenter(center: const Offset(47, 66), width: 11, height: 6.4), cheekPaint);
    canvas.drawOval(Rect.fromCenter(center: const Offset(93, 66), width: 11, height: 6.4), cheekPaint);

    // Alis Mata Kancil
    final browPaint = Paint()
      ..color = const Color(0xFF451A03)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.6
      ..strokeCap = StrokeCap.round;
    final leftBrow = Path()..moveTo(46, 44)..quadraticBezierTo(52, 40.5, 58, 44);
    final rightBrow = Path()..moveTo(82, 44)..quadraticBezierTo(88, 40.5, 94, 44);
    canvas.drawPath(leftBrow, browPaint);
    canvas.drawPath(rightBrow, browPaint);

    // 7. Mata Duolingo Kancil dengan Busur Sian (#00F0FF) & Kedipan
    final eyeShiftX = lookOffset.dx * 2.5;
    final eyeShiftY = lookOffset.dy * 1.8;

    if (isWinking) {
      // Garis mata berkedip
      final winkStroke = Paint()
        ..color = const Color(0xFF0F172A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.8
        ..strokeCap = StrokeCap.round;
      final leftWink = Path()..moveTo(46.5, 56.5)..quadraticBezierTo(54, 60, 61.5, 56.5);
      final rightWink = Path()..moveTo(78.5, 56.5)..quadraticBezierTo(86, 60, 93.5, 56.5);
      canvas.drawPath(leftWink, winkStroke);
      canvas.drawPath(rightWink, winkStroke);
    } else {
      // Mata Kiri
      canvas.drawOval(
        Rect.fromCenter(center: const Offset(54, 56), width: 15.2, height: 16.8),
        Paint()..color = Colors.white,
      );
      canvas.drawOval(
        Rect.fromCenter(center: const Offset(54, 56), width: 15.2, height: 16.8),
        Paint()
          ..color = const Color(0xFF0F172A)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.2,
      );

      // Garis bulu mata atas
      final leftLash = Path()..moveTo(45.8, 53.5)..cubicTo(48, 47, 59, 47, 61.8, 53.5);
      canvas.drawPath(leftLash, Paint()
        ..color = const Color(0xFF0F172A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.8
        ..strokeCap = StrokeCap.round);

      // Pupil & Busur Sian Kiri
      final leftPupilCenter = Offset(54 + eyeShiftX, 56 + eyeShiftY);
      canvas.drawCircle(leftPupilCenter, 5.4, Paint()..color = const Color(0xFF0F172A));
      // Busur radian sian bawah
      final leftIrisArc = Path()
        ..addArc(
          Rect.fromCircle(center: leftPupilCenter, radius: 4.0),
          0.2 * math.pi,
          0.6 * math.pi,
        );
      canvas.drawPath(leftIrisArc, Paint()
        ..color = const Color(0xFF00F0FF)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0
        ..strokeCap = StrokeCap.round);
      // Kilau cahaya putih mata
      canvas.drawCircle(leftPupilCenter + const Offset(1.8, -2.4), 2.0, Paint()..color = Colors.white);
      canvas.drawCircle(leftPupilCenter + const Offset(-2.0, 2.2), 1.0, Paint()..color = Colors.white);

      // Mata Kanan
      canvas.drawOval(
        Rect.fromCenter(center: const Offset(86, 56), width: 15.2, height: 16.8),
        Paint()..color = Colors.white,
      );
      canvas.drawOval(
        Rect.fromCenter(center: const Offset(86, 56), width: 15.2, height: 16.8),
        Paint()
          ..color = const Color(0xFF0F172A)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.2,
      );

      final rightLash = Path()..moveTo(78.2, 53.5)..cubicTo(81, 47, 92, 47, 94.2, 53.5);
      canvas.drawPath(rightLash, Paint()
        ..color = const Color(0xFF0F172A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.8
        ..strokeCap = StrokeCap.round);

      // Pupil & Busur Sian Kanan
      final rightPupilCenter = Offset(86 + eyeShiftX, 56 + eyeShiftY);
      canvas.drawCircle(rightPupilCenter, 5.4, Paint()..color = const Color(0xFF0F172A));
      final rightIrisArc = Path()
        ..addArc(
          Rect.fromCircle(center: rightPupilCenter, radius: 4.0),
          0.2 * math.pi,
          0.6 * math.pi,
        );
      canvas.drawPath(rightIrisArc, Paint()
        ..color = const Color(0xFF00F0FF)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0
        ..strokeCap = StrokeCap.round);
      canvas.drawCircle(rightPupilCenter + const Offset(1.8, -2.4), 2.0, Paint()..color = Colors.white);
      canvas.drawCircle(rightPupilCenter + const Offset(-2.0, 2.2), 1.0, Paint()..color = Colors.white);
    }

    // 8. Hidung Beludru Cokelat & Senyum Ramah
    final nosePath = Path()
      ..moveTo(65.5, 62.5)
      ..cubicTo(65.5, 60, 74.5, 60, 74.5, 62.5)
      ..cubicTo(74.5, 65.2, 71.8, 67, 70, 67)
      ..cubicTo(68.2, 67, 65.5, 65.2, 65.5, 62.5)
      ..close();
    canvas.drawPath(nosePath, Paint()..color = const Color(0xFF271206));
    canvas.drawOval(
      Rect.fromCenter(center: const Offset(68.6, 62), width: 3.2, height: 1.7),
      Paint()..color = Colors.white.withValues(alpha: 0.75),
    );

    // Philtrum
    canvas.drawLine(
      const Offset(70, 67),
      const Offset(70, 70.2),
      Paint()
        ..color = const Color(0xFF451A03)
        ..strokeWidth = 1.9
        ..strokeCap = StrokeCap.round,
    );

    // Senyuman
    if (mood == HakkiMood.celebrating) {
      final happyMouth = Path()
        ..moveTo(63, 70)
        ..quadraticBezierTo(70, 78, 77, 70)
        ..close();
      canvas.drawPath(happyMouth, Paint()..color = const Color(0xFF9F1239));
      canvas.drawPath(happyMouth, Paint()
        ..color = const Color(0xFF0F172A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.9);
      // Lidah merah muda
      canvas.drawOval(
        Rect.fromCenter(center: const Offset(70, 74), width: 6, height: 3.5),
        Paint()..color = const Color(0xFFFB7185),
      );
    } else {
      final smile = Path()
        ..moveTo(63.5, 70.2)
        ..quadraticBezierTo(66.8, 73.8, 70, 70.5)
        ..quadraticBezierTo(73.2, 73.8, 76.5, 70.2);
      canvas.drawPath(smile, Paint()
        ..color = const Color(0xFF0F172A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.1
        ..strokeCap = StrokeCap.round);
    }

    // 9. Cakar Kiri Memegang Kitab Hukum ("KUHP / UU")
    canvas.save();
    canvas.translate(33, 93);
    canvas.rotate(-14 * math.pi / 180);
    canvas.translate(-33, -93);

    // Lembaran Halaman Buku (Kertas Putih-Krem di Sisi Kanan)
    final pagesRect = RRect.fromRectAndRadius(
      const Rect.fromLTWH(37, 83, 5, 20),
      const Radius.circular(1.5),
    );
    canvas.drawRRect(pagesRect, Paint()..color = const Color(0xFFFEF3C7));
    canvas.drawRRect(pagesRect, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2);

    // Cover Buku Hukum (Navy Pekat Neo-Brutalis)
    final bookRect = RRect.fromRectAndRadius(
      const Rect.fromLTWH(23, 82, 17, 22),
      const Radius.circular(3),
    );
    canvas.drawRRect(bookRect, Paint()..color = const Color(0xFF13294B));
    canvas.drawRRect(bookRect, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0);

    // Border Emas Lambang Statuta di Cover
    final bookGoldBorder = RRect.fromRectAndRadius(
      const Rect.fromLTWH(25.5, 84.5, 12, 17),
      const Radius.circular(1.8),
    );
    canvas.drawRRect(bookGoldBorder, Paint()
      ..color = const Color(0xFFFBBF24)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0);

    // Simbol Neraca Keadilan Emas di Cover
    canvas.drawLine(const Offset(29, 92), const Offset(34, 92), Paint()
      ..color = const Color(0xFFFBBF24)
      ..strokeWidth = 1.2);
    canvas.drawLine(const Offset(31.5, 89), const Offset(31.5, 96), Paint()
      ..color = const Color(0xFFFBBF24)
      ..strokeWidth = 1.2);

    // Pita pembatas buku sian
    final ribbon = Path()
      ..moveTo(31.5, 104)
      ..lineTo(30.5, 112)
      ..lineTo(33, 110)
      ..lineTo(35.5, 112)
      ..lineTo(34.5, 104)
      ..close();
    canvas.drawPath(ribbon, Paint()..color = const Color(0xFF00F0FF));
    canvas.drawPath(ribbon, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0);

    // Cakar kancil mencengkeram buku
    final pawLeft = Path()
      ..addOval(Rect.fromCenter(center: const Offset(37, 93), width: 11, height: 9));
    canvas.drawPath(pawLeft, Paint()..color = const Color(0xFFF59E0B));
    canvas.drawPath(pawLeft, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0);
    canvas.drawCircle(const Offset(36, 91.5), 1.2, Paint()..color = const Color(0xFFFEF3C7));
    canvas.drawCircle(const Offset(38.5, 92.5), 1.2, Paint()..color = const Color(0xFFFEF3C7));
    canvas.restore();

    // 10. Cakar Kanan Melambai Ramah dengan Lambaian Dinamis
    final waveDeg = (waveHand - 0.5) * 20.0;
    canvas.save();
    canvas.translate(104, 82);
    canvas.rotate(waveDeg * math.pi / 180);
    canvas.translate(-104, -82);

    // Garis Lambaian Dinamis (Motion Lines Sian)
    final motionLine1 = Path()
      ..moveTo(111, 74)
      ..quadraticBezierTo(114, 78, 112, 82);
    canvas.drawPath(
      motionLine1,
      Paint()
        ..color = const Color(0xFF00F0FF)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.6
        ..strokeCap = StrokeCap.round,
    );

    final pawRight = Path()
      ..addOval(Rect.fromCenter(center: const Offset(104, 82), width: 13, height: 11));
    canvas.drawPath(pawRight, Paint()..color = const Color(0xFFF59E0B));
    canvas.drawPath(pawRight, Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2);

    // Bantalan cakar krem & kuku
    canvas.drawCircle(const Offset(104, 81.5), 2.3, Paint()..color = const Color(0xFFFEF3C7));
    canvas.drawCircle(const Offset(101.5, 78), 1.2, Paint()..color = const Color(0xFFFEF3C7));
    canvas.drawCircle(const Offset(104, 77.2), 1.2, Paint()..color = const Color(0xFFFEF3C7));
    canvas.drawCircle(const Offset(106.5, 78.5), 1.2, Paint()..color = const Color(0xFFFEF3C7));
    canvas.restore();

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _HakkiVectorMasterPainter oldDelegate) {
    return oldDelegate.mood != mood ||
        oldDelegate.earTwitch != earTwitch ||
        oldDelegate.waveHand != waveHand ||
        oldDelegate.isWinking != isWinking ||
        oldDelegate.lookOffset != lookOffset;
  }
}

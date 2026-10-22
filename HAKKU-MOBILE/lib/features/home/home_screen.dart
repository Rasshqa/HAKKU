import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import 'widgets/hakki_mascot_widget.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HakkuColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // App Bar kustom dengan status darurat
          SliverAppBar(
            floating: true,
            pinned: false,
            backgroundColor: HakkuColors.cardSurface,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(color: HakkuColors.border.withValues(alpha: 0.6), height: 1),
            ),
            title: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: HakkuColors.primary,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: HakkuColors.primary.withValues(alpha: 0.25),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.balance, color: Colors.white, size: 18),
                ),
                const SizedBox(width: 10),
                Text(
                  'HAKKU',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: HakkuColors.primary,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                      ),
                ),
              ],
            ),
            actions: [
              // Tombol Darurat Interaktif
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: TextButton.icon(
                  style: TextButton.styleFrom(
                    foregroundColor: HakkuColors.danger,
                    backgroundColor: HakkuColors.dangerLight,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: BorderSide(color: HakkuColors.danger.withValues(alpha: 0.2)),
                    ),
                  ),
                  icon: const Icon(Icons.warning_amber_rounded, size: 16),
                  label: const Text(
                    'Darurat',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  onPressed: () {
                    HapticFeedback.mediumImpact();
                    context.go('/darurat');
                  },
                ),
              ),
            ],
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // 1. Hero Section dengan Maskot Hakki Interaktif
                const _HeroSection().animate().fadeIn(duration: 350.ms).slideY(begin: 0.05, duration: 350.ms),
                const SizedBox(height: 20),

                // 2. Quick Intake CTA Card dengan Efek Interaktif
                const _QuickIntakeCTA()
                    .animate()
                    .fadeIn(duration: 400.ms, delay: 100.ms)
                    .slideY(begin: 0.05, duration: 400.ms),
                const SizedBox(height: 24),

                // 3. Topik Pilihan Cepat
                const _TopicExamples()
                    .animate()
                    .fadeIn(duration: 400.ms, delay: 200.ms)
                    .slideY(begin: 0.05, duration: 400.ms),
                const SizedBox(height: 28),

                // 4. Hub Tiga Perangkat Hukum
                const _ToolsPreview()
                    .animate()
                    .fadeIn(duration: 400.ms, delay: 300.ms)
                    .slideY(begin: 0.05, duration: 400.ms),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: HakkuColors.cardSurface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: HakkuColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Maskot Hakki Interaktif di Tengah
          const HakkiMascotWidget(
            size: 96,
            initialMood: HakkiMood.welcoming,
            showSpeechBubble: true,
          ),
          const SizedBox(height: 14),

          // Teks Sambutan
          Text(
            'Ada Masalah Hukum?\nMari Pahami Langkah Berikutnya.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  height: 1.25,
                  letterSpacing: -0.4,
                  color: HakkuColors.textMain,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'HAKKU mendampingi pekerja, konsumen, dan warga memahami hak serta menyusun berkas hukum mandiri secara resmi.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: HakkuColors.textMuted,
                  height: 1.5,
                ),
          ),
        ],
      ),
    );
  }
}

class _QuickIntakeCTA extends StatefulWidget {
  const _QuickIntakeCTA();

  @override
  State<_QuickIntakeCTA> createState() => _QuickIntakeCTAState();
}

class _QuickIntakeCTAState extends State<_QuickIntakeCTA> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        HapticFeedback.lightImpact();
        context.go('/intake');
      },
      child: AnimatedScale(
        scale: _isPressed ? 0.98 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [HakkuColors.primary, Color(0xFF006DE8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: HakkuColors.primary.withValues(alpha: 0.28),
                blurRadius: 18,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.edit_note, color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'Ceritakan Masalahmu',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Gunakan kata-katamu sendiri — sistem memisahkan fakta & mendeteksi pasal hukum terkait.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.white.withValues(alpha: 0.9),
                            height: 1.4,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.arrow_forward_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TopicExamples extends StatelessWidget {
  const _TopicExamples();

  static const _topics = [
    ('⚖️', 'PHK & Pesangon', 'Saya diberhentikan sepihak tanpa perundingan'),
    ('💻', 'Penipuan Online', 'Saya tertipu transfer belanja online'),
    ('🏠', 'Sewa Kos', 'Uang deposit tidak dikembalikan pemilik kos'),
    ('💰', 'Gaji Tertunggak', 'Gaji 2 bulan belum dibayar perusahaan'),
    ('📋', 'Wanprestasi', 'Rekan bisnis melanggar isi perjanjian kontrak'),
    ('🆘', 'Bantuan LBH', 'Saya butuh bantuan hukum gratis dari Posbankum'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Pilihan Topik Cepat',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: HakkuColors.textMain,
                  ),
            ),
            const Text(
              'Klik untuk mulai',
              style: TextStyle(fontSize: 11, color: HakkuColors.textMuted),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _topics.map((topic) {
            return _TopicChip(
              emoji: topic.$1,
              label: topic.$2,
              example: topic.$3,
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _TopicChip extends StatefulWidget {
  final String emoji;
  final String label;
  final String example;

  const _TopicChip({
    required this.emoji,
    required this.label,
    required this.example,
  });

  @override
  State<_TopicChip> createState() => _TopicChipState();
}

class _TopicChipState extends State<_TopicChip> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: () {
        HapticFeedback.selectionClick();
        context.go('/intake', extra: widget.example);
      },
      child: AnimatedScale(
        scale: _pressed ? 0.94 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: HakkuColors.cardSurface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: HakkuColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 4,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(widget.emoji, style: const TextStyle(fontSize: 13)),
              const SizedBox(width: 6),
              Text(
                widget.label,
                style: const TextStyle(
                  fontSize: 12,
                  color: HakkuColors.textMain,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ToolsPreview extends StatelessWidget {
  const _ToolsPreview();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Tiga Instrumen Hukum',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: HakkuColors.textMain,
                  ),
            ),
            TextButton(
              onPressed: () {
                HapticFeedback.selectionClick();
                context.go('/perangkat');
              },
              child: const Text('Buka Semua', style: TextStyle(fontSize: 12)),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _ToolCard(
                icon: Icons.calculate_outlined,
                title: 'Kalkulator Hak',
                subtitle: 'PP No. 35/2021',
                color: HakkuColors.primary,
                badge: 'Statuter',
                onTap: () => context.go('/perangkat/kalkulator'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ToolCard(
                icon: Icons.article_outlined,
                title: 'Draf Surat Formil',
                subtitle: 'Bipartit & Somasi',
                color: HakkuColors.accent,
                badge: 'A4 Cetak',
                onTap: () => context.go('/perangkat/dokumen'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        _ToolCard(
          icon: Icons.checklist_outlined,
          title: 'Audit Matriks Bukti',
          subtitle: 'Uji kesiapan berkas sesuai KUHAP 184 & UU ITE No. 1/2024',
          color: HakkuColors.success,
          badge: 'Skor 0-100%',
          onTap: () => context.go('/perangkat/bukti'),
          fullWidth: true,
        ),
      ],
    );
  }
}

class _ToolCard extends StatefulWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final String badge;
  final VoidCallback onTap;
  final bool fullWidth;

  const _ToolCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.badge,
    required this.onTap,
    this.fullWidth = false,
  });

  @override
  State<_ToolCard> createState() => _ToolCardState();
}

class _ToolCardState extends State<_ToolCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap();
      },
      child: AnimatedScale(
        scale: _pressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: widget.color.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: widget.color.withValues(alpha: 0.2)),
            boxShadow: [
              BoxShadow(
                color: widget.color.withValues(alpha: 0.04),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: widget.color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(widget.icon, color: widget.color, size: 20),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: widget.color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      widget.badge,
                      style: TextStyle(
                        color: widget.color,
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                widget.title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: HakkuColors.textMain,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                widget.subtitle,
                style: TextStyle(
                  fontSize: 11,
                  color: HakkuColors.textMuted,
                  height: 1.3,
                ),
                maxLines: widget.fullWidth ? 2 : 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

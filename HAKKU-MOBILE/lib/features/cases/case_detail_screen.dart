import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/storage/local_storage.dart';
import '../../core/utils/formatters.dart';
import 'widgets/countdown_timer_card.dart';

class CaseDetailScreen extends StatefulWidget {
  final String caseCode;

  const CaseDetailScreen({super.key, required this.caseCode});

  @override
  State<CaseDetailScreen> createState() => _CaseDetailScreenState();
}

class _CaseDetailScreenState extends State<CaseDetailScreen> {
  LocalCaseRecord? _case;
  final Set<int> _checkedFactIndices = {};

  @override
  void initState() {
    super.initState();
    _loadCase();
  }

  void _loadCase() {
    final c = LocalStorage.getCase(widget.caseCode);
    setState(() {
      _case = c;
    });
  }

  Future<void> _deleteCase() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Berkas Kasus?'),
        content: const Text(
          'Seluruh catatan kronologi dan fakta terkait kasus ini akan dihapus secara permanen dari perangkat.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: HakkuColors.danger,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await LocalStorage.deleteCase(widget.caseCode);
      if (mounted) {
        if (context.canPop()) {
          context.pop();
        } else {
          context.go('/kasus');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_case == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Detail Kasus')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Berkas kasus tidak ditemukan.'),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => context.canPop() ? context.pop() : context.go('/kasus'),
                child: const Text('Kembali'),
              ),
            ],
          ),
        ),
      );
    }

    final c = _case!;
    final isLabor = c.category == 'labor';

    return Scaffold(
      backgroundColor: HakkuColors.background,
      appBar: AppBar(
        title: Text(c.caseCode),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.canPop() ? context.pop() : context.go('/kasus'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, color: HakkuColors.danger),
            tooltip: 'Hapus Berkas',
            onPressed: _deleteCase,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: HakkuColors.cardSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: HakkuColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: HakkuColors.primaryLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        c.categoryLabel,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: HakkuColors.primary,
                        ),
                      ),
                    ),
                    Text(
                      HakkuFormatters.formatIndonesianDate(c.createdAt),
                      style: TextStyle(
                        fontSize: 11,
                        color: HakkuColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  c.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 8),
                const Text(
                  'Kronologi Awal:',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: HakkuColors.textMuted,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  c.originalStory,
                  style: const TextStyle(
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 200.ms),

          const SizedBox(height: 16),

          // Pelacak Masa Tunggu Statuter
          StatutoryCountdownTimerCard(
            caseCode: c.caseCode,
            startDate: c.createdAt,
            totalDays: isLabor ? 14 : 7,
            title: isLabor
                ? 'Masa Perundingan Bipartit'
                : 'Masa Tunggu Somasi Tertulis',
            legalBasis: isLabor
                ? 'Pasal 3 UU No. 2 Tahun 2004 (Maksimal 14 Hari Kerja)'
                : 'Pasal 1238 KUHPerdata (Batas Waktu Somasi)',
            nextStepAdvice: isLabor
                ? 'Bila dalam 14 hari tidak ada kesepakatan tertulis, segera catatkan perselisihan ke Disnaker setempat untuk mediasi.'
                : 'Bila somasi tidak dipenuhi dalam 7 hari, Anda berhak melayangkan gugatan perdata wanprestasi ke Pengadilan Negeri.',
          ).animate().slideY(begin: 0.1, duration: 250.ms).fadeIn(),

          const SizedBox(height: 16),

          // Fakta-Fakta Terkonfirmasi (Interactive Checklist)
          if (c.knownFacts.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: HakkuColors.cardSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: HakkuColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.check_circle_outline,
                          color: HakkuColors.success, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Fakta Terkonfirmasi',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ...c.knownFacts.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final fact = entry.value;
                    final isChecked = _checkedFactIndices.contains(idx);

                    return CheckboxListTile(
                      value: isChecked,
                      onChanged: (val) {
                        HapticFeedback.lightImpact();
                        setState(() {
                          if (val == true) {
                            _checkedFactIndices.add(idx);
                          } else {
                            _checkedFactIndices.remove(idx);
                          }
                        });
                      },
                      contentPadding: EdgeInsets.zero,
                      activeColor: HakkuColors.success,
                      title: Text(
                        fact,
                        style: TextStyle(
                          fontSize: 13,
                          decoration: isChecked
                              ? TextDecoration.lineThrough
                              : TextDecoration.none,
                          color: isChecked
                              ? HakkuColors.textMuted
                              : HakkuColors.textMain,
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Aspek Celah yang Belum Diketahui
          if (c.unknownFacts.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: HakkuColors.cardSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: HakkuColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.help_outline,
                          color: HakkuColors.accent, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Celah Informasi untuk Ditelusuri',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ...c.unknownFacts.map((uf) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('• ',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: HakkuColors.accent)),
                          Expanded(
                            child: Text(
                              uf,
                              style: TextStyle(
                                fontSize: 13,
                                color: HakkuColors.textMuted,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Quick Action Tools Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: HakkuColors.cardSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: HakkuColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Instrumen Terkait Perkara',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _ActionTile(
                  icon: Icons.description_outlined,
                  title: 'Buat Draf Surat Formil',
                  subtitle: isLabor
                      ? 'Surat Permohonan Perundingan Bipartit (UU 2/2004)'
                      : 'Surat Somasi / Teguran Hukum Tertulis (KUHPerdata 1238)',
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.push('/perangkat/dokumen');
                  },
                ),
                const Divider(),
                _ActionTile(
                  icon: Icons.verified_user_outlined,
                  title: 'Audit Matriks Bukti',
                  subtitle:
                      'Cek kelengkapan dokumen tertulis, digital, & saksi',
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.push('/perangkat/bukti');
                  },
                ),
                if (isLabor) ...[
                  const Divider(),
                  _ActionTile(
                    icon: Icons.calculate_outlined,
                    title: 'Hitung Hak Pesangon Statuter',
                    subtitle: 'Formula resmi PP No. 35/2021',
                    onTap: () {
                      HapticFeedback.lightImpact();
                      context.push('/perangkat/kalkulator');
                    },
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: HakkuColors.primaryLight,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: HakkuColors.primary, size: 20),
      ),
      title: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(fontSize: 11, color: HakkuColors.textMuted),
      ),
      trailing: const Icon(Icons.chevron_right, size: 18),
      onTap: onTap,
    );
  }
}

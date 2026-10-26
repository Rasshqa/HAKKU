import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';

class ToolsHubScreen extends StatelessWidget {
  const ToolsHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Perangkat Hukum'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Instrumen Hukum',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 4),
            Text(
              'Tersedia sepenuhnya offline — tanpa koneksi internet',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: HakkuColors.success,
                    fontWeight: FontWeight.w500,
                  ),
            ),
            const SizedBox(height: 20),
            _ToolTile(
              icon: Icons.calculate_outlined,
              title: 'Kalkulator Pesangon',
              subtitle:
                  'Hitung hak kompensasi PHK secara akurat sesuai PP No. 35/2021 — Pasal 40 (UP, UPMK, UPH)',
              tag: 'PP 35/2021',
              color: HakkuColors.primary,
              route: '/perangkat/kalkulator',
            ).animate().fadeIn(duration: 300.ms, delay: 50.ms),
            const SizedBox(height: 12),
            _ToolTile(
              icon: Icons.checklist_outlined,
              title: 'Audit Matriks Bukti',
              subtitle:
                  'Nilai kesiapan berkas perkara Anda berdasarkan Pasal 184 KUHAP & UU ITE No. 1/2024',
              tag: 'KUHAP 184',
              color: HakkuColors.success,
              route: '/perangkat/bukti',
            ).animate().fadeIn(duration: 300.ms, delay: 100.ms),
            const SizedBox(height: 12),
            _ToolTile(
              icon: Icons.article_outlined,
              title: 'Generator Draf Surat',
              subtitle:
                  'Buat draf surat bipartit, somasi, atau permohonan LBH yang siap digunakan',
              tag: 'Draf Resmi',
              color: HakkuColors.accent,
              route: '/perangkat/dokumen',
            ).animate().fadeIn(duration: 300.ms, delay: 150.ms),
            const SizedBox(height: 12),
            _ToolTile(
              icon: Icons.gavel_outlined,
              title: 'Pemeriksa Klausul Kontrak',
              subtitle:
                  'Deteksi klausul jebakan ilegal: masa percobaan PKWT, penahanan ijazah, denda sepihak, dan pelanggaran UU PDP',
              tag: 'Red-Flag Scan',
              color: HakkuColors.primary,
              route: '/perangkat/kontrak',
            ).animate().fadeIn(duration: 300.ms, delay: 200.ms),
            const SizedBox(height: 12),
            _ToolTile(
              icon: Icons.account_balance_outlined,
              title: 'Direktori Bantuan Hukum (LBH)',
              subtitle:
                  'Daftar kontak dan alamat lembaga bantuan hukum cuma-cuma, Posbankum PN/PA, Disnaker, dan Satgas OJK',
              tag: 'Rujukan',
              color: HakkuColors.success,
              route: '/rujukan',
            ).animate().fadeIn(duration: 300.ms, delay: 250.ms),
            const SizedBox(height: 12),
            _ToolTile(
              icon: Icons.info_outline,
              title: 'Tentang & Batasan Hukum',
              subtitle:
                  'Standar akurasi regulasi, transparansi metodologi AI, dan perlindungan privasi UU PDP No. 27/2022',
              tag: 'Transparansi',
              color: HakkuColors.textMuted,
              route: '/tentang',
            ).animate().fadeIn(duration: 300.ms, delay: 300.ms),
            const SizedBox(height: 24),
            _LegalCorpusSection(),
          ],
        ),
      ),
    );
  }
}

class _ToolTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String tag;
  final Color color;
  final String route;

  const _ToolTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.tag,
    required this.color,
    required this.route,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        context.go(route);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: HakkuColors.cardSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: HakkuColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(title,
                          style:
                              Theme.of(context).textTheme.titleMedium),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          tag,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: color,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(subtitle,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            height: 1.5,
                          )),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: HakkuColors.textMuted),
          ],
        ),
      ),
    );
  }
}

class _LegalCorpusSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Sumber Hukum Terverifikasi',
            style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 4),
        Text(
          'Peraturan berikut tersedia offline dan dapat diakses kapan saja',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 12),
        _LegalChip(
            label: 'PP 35/2021 — Ketenagakerjaan',
            color: HakkuColors.primary),
        const SizedBox(height: 8),
        _LegalChip(
            label: 'UU 2/2004 — PHI & Bipartit', color: HakkuColors.primary),
        const SizedBox(height: 8),
        _LegalChip(
            label: 'UU 13/2003 — Ketenagakerjaan',
            color: HakkuColors.primary),
        const SizedBox(height: 8),
        _LegalChip(
            label: 'KUHPerdata 1238 — Somasi', color: HakkuColors.accent),
        const SizedBox(height: 8),
        _LegalChip(
            label: 'UU 1/2024 ITE — Bukti Digital',
            color: HakkuColors.success),
        const SizedBox(height: 8),
        _LegalChip(
            label: 'UU 16/2011 — Bantuan Hukum',
            color: HakkuColors.success),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: HakkuColors.warningLight,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline,
                  color: HakkuColors.warning, size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Sumber hukum dirangkum untuk panduan umum. Selalu verifikasi pasal terkini sebelum mengambil keputusan hukum.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: HakkuColors.warning,
                      ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _LegalChip extends StatelessWidget {
  final String label;
  final Color color;

  const _LegalChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified_outlined, color: color, size: 14),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w500,
                ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';

/// Modal darurat — tampilkan segera saat ada indikasi kedaruratan
/// Kontak: SAPA 129 (KDRT), Polisi 110, YLBHI
class EmergencyScreen extends StatelessWidget {
  const EmergencyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: HakkuColors.dangerLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.warning_amber_rounded,
                    color: HakkuColors.danger,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Butuh Bantuan Segera?',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(color: HakkuColors.danger),
                      ),
                      Text(
                        'Hubungi layanan darurat berikut',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                  color: HakkuColors.textMuted,
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 16),

            // Disclaimer
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: HakkuColors.warningLight,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: HakkuColors.warning.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline,
                      color: HakkuColors.warning, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'HAKKU bukan layanan darurat. Jika Anda dalam bahaya langsung, hubungi nomor di bawah ini.',
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: HakkuColors.warning),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Kontak Darurat
            _EmergencyContact(
              icon: Icons.phone_in_talk,
              title: 'Polisi',
              number: '110',
              description: 'Laporan kejahatan, ancaman, tindak pidana',
              color: HakkuColors.danger,
            ),
            const SizedBox(height: 12),
            _EmergencyContact(
              icon: Icons.support_agent,
              title: 'SAPA (Kemen PPPA)',
              number: '129',
              description: 'Kekerasan dalam rumah tangga (KDRT), perempuan & anak',
              color: HakkuColors.primary,
            ),
            const SizedBox(height: 12),
            _EmergencyContact(
              icon: Icons.local_hospital,
              title: 'Ambulans / Gawat Darurat',
              number: '119',
              description: 'Kondisi medis darurat',
              color: HakkuColors.success,
            ),
            const SizedBox(height: 12),
            _EmergencyContact(
              icon: Icons.gavel,
              title: 'Posbakum / Bantuan Hukum',
              number: '1500-096',
              description: 'Hotline pengaduan Komnas HAM',
              color: HakkuColors.accent,
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 12),

            Text(
              'Lembaga Bantuan Hukum (LBH)',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'YLBHI dan jaringan LBH se-Indonesia menyediakan bantuan hukum gratis untuk masyarakat tidak mampu, sesuai UU No. 16/2011.',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(height: 1.6),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.open_in_new, size: 16),
                label: const Text('Cari LBH di ylbhi.or.id'),
                onPressed: () async {
                  final url = Uri.parse('https://ylbhi.or.id');
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url,
                        mode: LaunchMode.externalApplication);
                  }
                },
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Tutup'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmergencyContact extends StatelessWidget {
  final IconData icon;
  final String title;
  final String number;
  final String description;
  final Color color;

  const _EmergencyContact({
    required this.icon,
    required this.title,
    required this.number,
    required this.description,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        HapticFeedback.mediumImpact();
        final uri = Uri.parse('tel:$number');
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri);
        }
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: Border.all(color: HakkuColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: Theme.of(context).textTheme.titleMedium),
                  Text(description,
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.phone, color: Colors.white, size: 14),
                  const SizedBox(width: 4),
                  Text(
                    number,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
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

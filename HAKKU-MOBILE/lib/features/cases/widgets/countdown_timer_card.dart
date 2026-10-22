import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/notification_service.dart';
import '../../../core/utils/formatters.dart';

/// Kartu pelacak masa tunggu statuter (14 Hari Bipartit / 7 Hari Somasi)
class StatutoryCountdownTimerCard extends StatefulWidget {
  final String caseCode;
  final DateTime startDate;
  final int totalDays;
  final String title;
  final String legalBasis;
  final String nextStepAdvice;

  const StatutoryCountdownTimerCard({
    super.key,
    required this.caseCode,
    required this.startDate,
    this.totalDays = 14,
    this.title = 'Masa Perundingan Bipartit',
    this.legalBasis = 'Pasal 3 UU No. 2 Tahun 2004 (Maksimal 14 Hari Kerja)',
    this.nextStepAdvice =
        'Bila tidak ada tanggapan atau kesepakatan tertulis setelah 14 hari kerja, Anda berhak mencatatkan perselisihan ke Dinas Tenaga Kerja setempat.',
  });

  @override
  State<StatutoryCountdownTimerCard> createState() =>
      _StatutoryCountdownTimerCardState();
}

class _StatutoryCountdownTimerCardState
    extends State<StatutoryCountdownTimerCard> {
  bool _reminderScheduled = false;

  @override
  Widget build(BuildContext context) {
    final deadline = widget.startDate.add(Duration(days: widget.totalDays));
    final now = DateTime.now();
    final remainingDays = deadline.difference(now).inDays;
    final elapsedDays = widget.totalDays - remainingDays;
    final progress = (elapsedDays / widget.totalDays).clamp(0.0, 1.0);

    final isExpired = remainingDays <= 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: HakkuColors.cardSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isExpired
              ? HakkuColors.danger.withValues(alpha: 0.5)
              : HakkuColors.primary.withValues(alpha: 0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: (isExpired ? HakkuColors.danger : HakkuColors.primary)
                .withValues(alpha: 0.06),
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
              Row(
                children: [
                  Icon(
                    Icons.hourglass_top,
                    size: 18,
                    color: isExpired ? HakkuColors.danger : HakkuColors.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    widget.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isExpired
                      ? HakkuColors.dangerLight
                      : HakkuColors.primaryLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  isExpired ? 'Batas Terlampaui' : '$remainingDays Hari Lagi',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color:
                        isExpired ? HakkuColors.danger : HakkuColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Animated Progress bar
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: progress),
            duration: const Duration(milliseconds: 700),
            curve: Curves.easeOutCubic,
            builder: (context, animVal, child) {
              return ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: animVal,
                  minHeight: 8,
                  backgroundColor: HakkuColors.border.withValues(alpha: 0.5),
                  valueColor: AlwaysStoppedAnimation<Color>(
                    isExpired ? HakkuColors.danger : HakkuColors.primary,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 8),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Mulai: ${HakkuFormatters.formatShortDate(widget.startDate)}',
                style: TextStyle(fontSize: 11, color: HakkuColors.textMuted),
              ),
              Text(
                'Batas: ${HakkuFormatters.formatShortDate(deadline)}',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 8),

          Text(
            widget.legalBasis,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: HakkuColors.textMain,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            widget.nextStepAdvice,
            style: TextStyle(
              fontSize: 11,
              color: HakkuColors.textMuted,
              height: 1.4,
            ),
          ),

          const SizedBox(height: 12),

          // Tombol Jadwalkan Pengingat Notifikasi Lokal
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _reminderScheduled
                  ? null
                  : () async {
                      HapticFeedback.lightImpact();
                      await LegalNotificationService.requestPermissions();
                      final reminderDate =
                          deadline.subtract(const Duration(days: 3));
                      await LegalNotificationService.scheduleStatutoryReminder(
                        caseCode: widget.caseCode,
                        title: widget.title,
                        body:
                            'Tersisa 3 hari lagi sebelum tenggat waktu berakhir. Siapkan langkah lanjutan.',
                        reminderDate: reminderDate,
                      );
                      setState(() => _reminderScheduled = true);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                                'Pengingat notifikasi berhasil diaktifkan untuk H-3!'),
                          ),
                        );
                      }
                    },
              icon: Icon(
                _reminderScheduled
                    ? Icons.notifications_active
                    : Icons.notification_add_outlined,
                size: 16,
              ),
              label: Text(
                _reminderScheduled
                    ? 'Pengingat H-3 Aktif'
                    : 'Pasang Pengingat Notifikasi',
                style: const TextStyle(fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

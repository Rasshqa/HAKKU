import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/biometric_service.dart';
import '../../core/storage/local_storage.dart';
import '../../core/utils/formatters.dart';

class CasesListScreen extends StatefulWidget {
  const CasesListScreen({super.key});

  @override
  State<CasesListScreen> createState() => _CasesListScreenState();
}

class _CasesListScreenState extends State<CasesListScreen> {
  List<LocalCaseRecord> _cases = [];
  bool _biometricEnabled = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final list = LocalStorage.getAllCases();
    final bio = LocalStorage.getBiometricEnabled();
    setState(() {
      _cases = list;
      _biometricEnabled = bio;
    });
  }

  Future<void> _toggleBiometrics(bool value) async {
    HapticFeedback.lightImpact();
    if (value) {
      final available = await BiometricSecurityService.isBiometricsAvailable();
      if (!available) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  'Sensor biometrik (sidik jari/wajah) tidak terdeteksi pada perangkat ini.'),
            ),
          );
        }
        return;
      }
    }
    await LocalStorage.setBiometricEnabled(value);
    setState(() => _biometricEnabled = value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HakkuColors.background,
      appBar: AppBar(
        title: const Text('Ruang Kasus Saya'),
        actions: [
          IconButton(
            icon: Icon(
              _biometricEnabled ? Icons.fingerprint : Icons.lock_outline,
              color: _biometricEnabled ? HakkuColors.primary : HakkuColors.textMuted,
            ),
            tooltip: _biometricEnabled ? 'Proteksi Biometrik Aktif' : 'Atur Keamanan',
            onPressed: () => _showSecurityDialog(),
          ),
        ],
      ),
      body: _cases.isEmpty ? _buildEmptyState() : _buildCaseList(),
    );
  }

  void _showSecurityDialog() {
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.shield_outlined, color: HakkuColors.primary),
              SizedBox(width: 8),
              Text('Keamanan Kasus', style: TextStyle(fontSize: 16)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Kunci privasi berkas perkara dengan sidik jari atau Face ID agar tidak dapat diakses orang lain.',
                style: TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                value: _biometricEnabled,
                contentPadding: EdgeInsets.zero,
                activeThumbColor: HakkuColors.primary,
                title: const Text('Kunci Biometrik',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                onChanged: (val) async {
                  await _toggleBiometrics(val);
                  setDialogState(() {});
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Tutup'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: HakkuColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.folder_open_outlined,
                size: 56,
                color: HakkuColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Belum Ada Berkas Kasus',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Mulai ceritakan permasalahan Anda atau lakukan konsultasi dengan Tanya Hakki untuk mencatat kasus baru.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: HakkuColors.textMuted),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                HapticFeedback.lightImpact();
                context.go('/intake');
              },
              icon: const Icon(Icons.add),
              label: const Text('Mulai Ceritakan Masalah'),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildCaseList() {
    return RefreshIndicator(
      onRefresh: () async {
        _loadData();
      },
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _cases.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = _cases[index];
          return _CaseCard(
            caseRecord: item,
            onTap: () async {
              HapticFeedback.lightImpact();
              if (_biometricEnabled) {
                final authOk =
                    await BiometricSecurityService.authenticateToAccessCase();
                if (!authOk) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Autentikasi biometrik tidak berhasil.'),
                      ),
                    );
                  }
                  return;
                }
              }
              if (context.mounted) {
                context.push('/kasus/${item.caseCode}');
              }
            },
          ).animate().slideY(begin: 0.1, duration: (200 + index * 50).ms).fadeIn();
        },
      ),
    );
  }
}

class _CaseCard extends StatelessWidget {
  final LocalCaseRecord caseRecord;
  final VoidCallback onTap;

  const _CaseCard({
    required this.caseRecord,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color urgencyColor;
    if (caseRecord.urgencyLevel == 'critical') {
      urgencyColor = HakkuColors.danger;
    } else if (caseRecord.urgencyLevel == 'urgent') {
      urgencyColor = HakkuColors.accent;
    } else {
      urgencyColor = HakkuColors.primary;
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: HakkuColors.cardSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: HakkuColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
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
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: HakkuColors.primaryLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    caseRecord.caseCode,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: HakkuColors.primary,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: urgencyColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    caseRecord.categoryLabel,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: urgencyColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              caseRecord.title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 6),
            Text(
              caseRecord.originalStory,
              style: TextStyle(
                fontSize: 12,
                color: HakkuColors.textMuted,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        size: 13, color: HakkuColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      HakkuFormatters.formatIndonesianDate(caseRecord.createdAt),
                      style: TextStyle(
                        fontSize: 11,
                        color: HakkuColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const Row(
                  children: [
                    Text(
                      'Buka Berkas',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: HakkuColors.primary,
                      ),
                    ),
                    Icon(
                      Icons.chevron_right,
                      size: 16,
                      color: HakkuColors.primary,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

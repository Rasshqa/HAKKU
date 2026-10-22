import 'dart:io';
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/media_service.dart';
import '../../domain/evidence/evidence_models.dart';
import '../../domain/evidence/evidence_evaluator.dart';

class EvidenceScreen extends StatefulWidget {
  const EvidenceScreen({super.key});

  @override
  State<EvidenceScreen> createState() => _EvidenceScreenState();
}

class _EvidenceScreenState extends State<EvidenceScreen> {
  // Matriks bukti yang dipilih
  bool _hasWritten = false;
  bool _hasDigital = true;
  bool _hasFinancial = false;
  bool _hasWitness = false;

  final List<XFile> _attachedFiles = [];
  late final ConfettiController _confettiController;
  int _previousScore = 25;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 2));
    _previousScore = _getResult().score;
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  EvidenceAuditResult _getResult() {
    final items = <EvidenceItem>[];
    if (_hasWritten) {
      items.add(const EvidenceItem(
        id: 'written_1',
        description: 'Dokumen Tertulis',
        type: EvidenceType.writtenDocument,
      ));
    }
    if (_hasDigital) {
      items.add(const EvidenceItem(
        id: 'digital_1',
        description: 'Bukti Elektronik',
        type: EvidenceType.digitalProof,
      ));
    }
    if (_hasFinancial) {
      items.add(const EvidenceItem(
        id: 'financial_1',
        description: 'Bukti Finansial',
        type: EvidenceType.financialProof,
      ));
    }
    if (_hasWitness) {
      items.add(const EvidenceItem(
        id: 'witness_1',
        description: 'Keterangan Saksi',
        type: EvidenceType.witnessStatement,
      ));
    }
    return StatutoryEvidenceEvaluator.evaluateReadiness(items);
  }

  void _checkAndCelebrateScore(int newScore) {
    if (newScore >= 75 && _previousScore < 75) {
      _confettiController.play();
      HapticFeedback.mediumImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 Luar biasa! Berkas Anda telah memenuhi standar formil pelaporan.'),
          duration: Duration(seconds: 3),
          backgroundColor: HakkuColors.success,
        ),
      );
    }
    _previousScore = newScore;
  }

  Future<void> _takeCameraPhoto() async {
    HapticFeedback.lightImpact();
    final photo = await MediaService.takeEvidencePhoto();
    if (photo != null) {
      setState(() {
        _attachedFiles.add(photo);
        _hasWritten = true;
      });
      _checkAndCelebrateScore(_getResult().score);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Foto bukti fisik berhasil dilampirkan!')),
        );
      }
    }
  }

  Future<void> _pickGalleryMedia() async {
    HapticFeedback.lightImpact();
    final media = await MediaService.pickEvidenceFromGallery();
    if (media != null) {
      setState(() {
        _attachedFiles.add(media);
        _hasDigital = true;
      });
      _checkAndCelebrateScore(_getResult().score);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Screenshot / berkas bukti berhasil dilampirkan!')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final result = _getResult();

    Color scoreColor;
    if (result.score >= 75) {
      scoreColor = HakkuColors.success;
    } else if (result.score >= 45) {
      scoreColor = HakkuColors.accent;
    } else {
      scoreColor = HakkuColors.danger;
    }

    return Scaffold(
      backgroundColor: HakkuColors.background,
      appBar: AppBar(
        title: const Text('Matriks Alat Bukti'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Banner Status Skor Kesiapan Interaktif
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: HakkuColors.cardSurface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: scoreColor.withValues(alpha: 0.4), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: scoreColor.withValues(alpha: 0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Kekuatan Berkas Hukum',
                              style: TextStyle(
                                fontSize: 13,
                                color: HakkuColors.textMuted,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              result.label,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: scoreColor,
                              ),
                            ),
                          ],
                        ),
                        // Animated Score Badge
                        TweenAnimationBuilder<double>(
                          key: ValueKey(result.score),
                          tween: Tween<double>(begin: 0, end: result.score.toDouble()),
                          duration: const Duration(milliseconds: 500),
                          curve: Curves.easeOutCubic,
                          builder: (context, val, child) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: scoreColor.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '${val.round()}%',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  color: scoreColor,
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    // Animated Progress Bar
                    TweenAnimationBuilder<double>(
                      tween: Tween<double>(begin: 0, end: result.score / 100.0),
                      duration: const Duration(milliseconds: 550),
                      curve: Curves.easeOutCubic,
                      builder: (context, progressVal, child) {
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: progressVal,
                            minHeight: 10,
                            backgroundColor: HakkuColors.border.withValues(alpha: 0.5),
                            valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 250.ms),

              const SizedBox(height: 16),

              // Checklist Alat Bukti KUHAP 184 & KUHPerdata 1866
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
                      'Daftar Bukti yang Anda Miliki',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Sesuai Pasal 184 KUHAP, Pasal 1866 KUHPerdata, & UU ITE 1/2024.',
                      style: TextStyle(fontSize: 12, color: HakkuColors.textMuted),
                    ),
                    const SizedBox(height: 12),

                    _EvidenceCheckbox(
                      title: 'Dokumen Tertulis Fisik',
                      subtitle:
                          'Surat PHK, Kontrak Kerja, Perjanjian Sewa, Slip Kuitansi Resmi',
                      value: _hasWritten,
                      onChanged: (val) {
                        HapticFeedback.lightImpact();
                        setState(() => _hasWritten = val ?? false);
                        _checkAndCelebrateScore(_getResult().score);
                      },
                    ),
                    const Divider(),
                    _EvidenceCheckbox(
                      title: 'Bukti Elektronik / Digital',
                      subtitle:
                          'Screenshot Chat WhatsApp, Surel (Email), Rekaman Audio/Video',
                      value: _hasDigital,
                      onChanged: (val) {
                        HapticFeedback.lightImpact();
                        setState(() => _hasDigital = val ?? false);
                        _checkAndCelebrateScore(_getResult().score);
                      },
                    ),
                    const Divider(),
                    _EvidenceCheckbox(
                      title: 'Bukti Finansial & Mutasi Rekening',
                      subtitle:
                          'Rekening Koran, Bukti Transfer M-Banking, Slip Gaji Bulanan',
                      value: _hasFinancial,
                      onChanged: (val) {
                        HapticFeedback.lightImpact();
                        setState(() => _hasFinancial = val ?? false);
                        _checkAndCelebrateScore(_getResult().score);
                      },
                    ),
                    const Divider(),
                    _EvidenceCheckbox(
                      title: 'Keterangan Saksi Fakta',
                      subtitle:
                          'Rekan kerja / tetangga yang melihat dan mengalami langsung',
                      value: _hasWitness,
                      onChanged: (val) {
                        HapticFeedback.lightImpact();
                        setState(() => _hasWitness = val ?? false);
                        _checkAndCelebrateScore(_getResult().score);
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Integrasi Kamera & Galeri (Native Hardware)
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
                      'Lampiran Bukti Nyata',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Foto dokumen fisik atau unggah screenshot percakapan dari perangkat ini.',
                      style: TextStyle(fontSize: 12, color: HakkuColors.textMuted),
                    ),
                    const SizedBox(height: 14),

                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _takeCameraPhoto,
                            icon: const Icon(Icons.camera_alt_outlined),
                            label: const Text('Foto Kamera'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _pickGalleryMedia,
                            icon: const Icon(Icons.photo_library_outlined),
                            label: const Text('Pilih Galeri'),
                          ),
                        ),
                      ],
                    ),

                    if (_attachedFiles.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Text(
                        '${_attachedFiles.length} Berkas Bukti Terlampir:',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 80,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _attachedFiles.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (context, idx) {
                            final file = _attachedFiles[idx];
                            return Stack(
                              children: [
                                Container(
                                  width: 80,
                                  height: 80,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: HakkuColors.border),
                                    image: DecorationImage(
                                      image: FileImage(File(file.path)),
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 2,
                                  right: 2,
                                  child: GestureDetector(
                                    onTap: () {
                                      HapticFeedback.lightImpact();
                                      setState(() => _attachedFiles.removeAt(idx));
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(
                                        color: Colors.black54,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.close,
                                        color: Colors.white,
                                        size: 14,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Rekomendasi Kekurangan Bukti
              if (result.missingItems.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: HakkuColors.dangerLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: HakkuColors.danger.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.info_outline,
                            color: HakkuColors.danger,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Kekurangan Bukti Utama',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: HakkuColors.danger,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...result.missingItems.map(
                        (item) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('• ',
                                  style: TextStyle(color: HakkuColors.danger)),
                              Expanded(
                                child: Text(
                                  item,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: HakkuColors.danger.withValues(alpha: 0.9),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 24),
            ],
          ),

          // Confetti Celebration Overlay
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              colors: const [
                HakkuColors.primary,
                HakkuColors.accent,
                HakkuColors.success,
                Colors.amber,
                Colors.lightBlue,
              ],
              numberOfParticles: 25,
              gravity: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}

class _EvidenceCheckbox extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool?> onChanged;

  const _EvidenceCheckbox({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onChanged(!value),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: value,
              onChanged: onChanged,
              activeColor: HakkuColors.primary,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: HakkuColors.textMuted,
                      height: 1.3,
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

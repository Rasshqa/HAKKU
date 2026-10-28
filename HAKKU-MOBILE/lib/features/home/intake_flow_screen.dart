import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/storage/local_storage.dart';
import '../../core/utils/formatters.dart';
import '../../domain/intake/intake_engine.dart';

/// Alur 3-langkah: Cerita → Klarifikasi → Ringkasan Fakta
class IntakeFlowScreen extends StatefulWidget {
  final String? initialStory;
  const IntakeFlowScreen({super.key, this.initialStory});

  @override
  State<IntakeFlowScreen> createState() => _IntakeFlowScreenState();
}

class _IntakeFlowScreenState extends State<IntakeFlowScreen> {
  int _currentStep = 0;
  late final TextEditingController _storyController;
  CaseFactSummary? _analysis;
  final Map<String, String?> _clarifications = {};
  bool _isAnalyzing = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _storyController = TextEditingController(text: widget.initialStory ?? '');
  }

  @override
  void dispose() {
    _storyController.dispose();
    super.dispose();
  }

  void _analyzeStory() {
    final story = _storyController.text.trim();
    if (story.length < 20) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ceritakan sedikit lebih detail agar kami bisa membantu dengan tepat.'),
        ),
      );
      return;
    }

    HapticFeedback.lightImpact();
    setState(() => _isAnalyzing = true);

    // Simulasi analisis (dalam production, panggil /api/intake/analyze)
    Future.delayed(const Duration(milliseconds: 800), () {
      final result = IntakeEngine.analyzeStory(story);

      // Cek darurat
      if (!mounted) return;
      if (result.requiresEmergencyEscalation) {
        setState(() => _isAnalyzing = false);
        context.push('/darurat');
        return;
      }

      setState(() {
        _analysis = result;
        _isAnalyzing = false;
        _currentStep = 1;
      });
    });
  }

  Future<void> _saveCase() async {
    if (_analysis == null) return;

    setState(() => _isSaving = true);
    HapticFeedback.lightImpact();

    try {
      final story = _storyController.text.trim();
      final caseCode = HakkuFormatters.generateCaseCode();
      final category = _analysis!.category;

      // Generate checklist awal berdasarkan kategori
      final checklist = _generateChecklist(category);

      final record = LocalCaseRecord(
        caseCode: caseCode,
        title: _generateTitle(story, category),
        category: category.code,
        categoryLabel: category.label,
        urgencyLevel: _analysis!.urgencyLevel.code,
        originalStory: story,
        status: 'active',
        createdAt: DateTime.now(),
        knownFacts: _analysis!.knownFacts,
        unknownFacts: _analysis!.unknownFacts,
        checklist: checklist,
      );

      await LocalStorage.saveCase(record);

      if (mounted) {
        setState(() => _isSaving = false);
        HapticFeedback.mediumImpact();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Perkara $caseCode tersimpan dengan aman.'),
            action: SnackBarAction(
              label: 'Lihat',
              onPressed: () => context.go('/kasus/$caseCode'),
            ),
          ),
        );
        context.go('/kasus/$caseCode');
      }
    } catch (e) {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal menyimpan. Coba lagi.'),
          ),
        );
      }
    }
  }

  String _generateTitle(String story, DisputeCategory category) {
    final short = story.length > 60 ? '${story.substring(0, 60)}...' : story;
    return '${category.label}: $short';
  }

  List<String> _generateChecklist(DisputeCategory category) {
    switch (category) {
      case DisputeCategory.labor:
        return [
          'Simpan salinan kontrak kerja atau perjanjian kerja',
          'Kumpulkan slip gaji terakhir dan rekam jejak pembayaran',
          'Simpan surat PHK (jika ada) beserta tanggal diterimanya',
          'Catat kronologi kejadian dengan tanggal dan jam',
          'Simpan komunikasi terkait (pesan, email) dari atasan/HRD',
          'Cari kontak Dinas Ketenagakerjaan (Disnaker) setempat',
        ];
      case DisputeCategory.digitalScam:
        return [
          'Screenshot seluruh percakapan dengan pelaku',
          'Simpan bukti transfer (mutasi rekening, struk ATM)',
          'Catat nomor rekening dan identitas pelaku (jika diketahui)',
          'Screenshot profil pelaku di marketplace/media sosial',
          'Buat laporan di platform jual-beli yang digunakan',
          'Siapkan laporan ke polisi (Pasal 378 KUHP atau UU ITE)',
        ];
      case DisputeCategory.tenancyContract:
        return [
          'Simpan salinan perjanjian sewa',
          'Simpan bukti pembayaran deposit dan sewa bulanan',
          'Foto kondisi properti saat masuk (jika ada)',
          'Catat kronologi sengketa dengan tanggal',
          'Simpan komunikasi dengan pemilik properti',
        ];
      default:
        return [
          'Susun kronologi kejadian dengan tanggal lengkap',
          'Kumpulkan semua dokumen yang berkaitan',
          'Simpan bukti komunikasi (pesan, email, surat)',
          'Cari referensi layanan bantuan hukum yang relevan',
          'Catat pertanyaan untuk konsultasi dengan LBH',
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ceritakan Masalahmu'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_currentStep > 0) {
              setState(() => _currentStep--);
            } else {
              context.go('/');
            }
          },
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: (_currentStep + 1) / 3,
            backgroundColor: HakkuColors.border,
            color: HakkuColors.primary,
          ),
        ),
      ),
      body: IndexedStack(
        index: _currentStep,
        children: [
          // Langkah 1: Input Cerita
          _StoryInputStep(
            controller: _storyController,
            isAnalyzing: _isAnalyzing,
            onAnalyze: _analyzeStory,
          ),
          // Langkah 2: Klarifikasi
          _analysis == null
              ? const SizedBox()
              : _ClarificationStep(
                  analysis: _analysis!,
                  clarifications: _clarifications,
                  onNext: () => setState(() => _currentStep = 2),
                ),
          // Langkah 3: Ringkasan Fakta & Simpan
          _analysis == null
              ? const SizedBox()
              : _FactSummaryStep(
                  analysis: _analysis!,
                  story: _storyController.text,
                  isSaving: _isSaving,
                  onSave: _saveCase,
                  onEdit: () => setState(() => _currentStep = 1),
                ),
        ],
      ),
    );
  }
}

// ── Step 1: Input Cerita ────────────────────────────────────────────

class _StoryInputStep extends StatelessWidget {
  final TextEditingController controller;
  final bool isAnalyzing;
  final VoidCallback onAnalyze;

  const _StoryInputStep({
    required this.controller,
    required this.isAnalyzing,
    required this.onAnalyze,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Langkah 1 dari 3',
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: HakkuColors.primary),
          ),
          const SizedBox(height: 4),
          Text(
            'Ceritakan apa yang terjadi',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Gunakan kata-katamu sendiri. Tidak perlu mengetahui istilah hukumnya — cukup ceritakan situasinya.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: HakkuColors.textMuted,
                  height: 1.6,
                ),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: controller,
            maxLines: 8,
            maxLength: 5000,
            textInputAction: TextInputAction.newline,
            decoration: const InputDecoration(
              hintText:
                  'Contoh: "Saya bekerja selama 3 tahun di perusahaan X sebagai operator, lalu tiba-tiba di PHK tanpa surat dan tanpa pesangon. Atasan bilang saya di-kontrak tapi saya tidak pernah tandatangan kontrak..."',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 8),
          // Tips
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: HakkuColors.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '💡 Tips agar bantuan lebih tepat:',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  '• Sebutkan kapan kejadian terjadi\n• Siapa yang terlibat (tanpa nama lengkap)\n• Langkah apa yang sudah ditempuh\n• Jangan cantumkan kata sandi, PIN, atau data pembayaran',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(height: 1.7),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isAnalyzing ? null : onAnalyze,
              child: isAnalyzing
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Analisis Masalah →'),
            ),
          ),
        ],
      ).animate().fadeIn(duration: 300.ms),
    );
  }
}

// ── Step 2: Klarifikasi ─────────────────────────────────────────────

class _ClarificationStep extends StatelessWidget {
  final CaseFactSummary analysis;
  final Map<String, String?> clarifications;
  final VoidCallback onNext;

  const _ClarificationStep({
    required this.analysis,
    required this.clarifications,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Langkah 2 dari 3',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: HakkuColors.primary)),
          const SizedBox(height: 4),
          Text('Beberapa pertanyaan klarifikasi',
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text(
            'Informasi ini membantu kami memahami situasimu lebih baik. Pilih "Saya tidak tahu" jika belum tahu.',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: HakkuColors.textMuted, height: 1.6),
          ),
          const SizedBox(height: 16),
          // Kategori terdeteksi
          _DetectedCategory(analysis: analysis),
          const SizedBox(height: 16),
          // Pertanyaan yang belum diketahui
          ...analysis.unknownFacts.asMap().entries.map((entry) {
            final idx = entry.key;
            final question = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _ClarificationQuestion(
                index: idx + 1,
                question: question,
                answer: clarifications[question],
                onAnswer: (ans) => clarifications[question] = ans,
              ),
            );
          }),
          const SizedBox(height: 8),
          Text(
            'Semua pertanyaan bersifat opsional. Anda bisa melanjutkan tanpa mengisi semua.',
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: HakkuColors.textMuted),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.lightImpact();
                onNext();
              },
              child: const Text('Lihat Ringkasan →'),
            ),
          ),
        ],
      ).animate().fadeIn(duration: 300.ms),
    );
  }
}

class _DetectedCategory extends StatelessWidget {
  final CaseFactSummary analysis;

  const _DetectedCategory({required this.analysis});

  @override
  Widget build(BuildContext context) {
    final urgency = analysis.urgencyLevel;
    final urgencyColor = urgency == UrgencyLevel.critical
        ? HakkuColors.danger
        : urgency == UrgencyLevel.urgent
            ? HakkuColors.warning
            : HakkuColors.success;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: HakkuColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HakkuColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Kategori Terdeteksi',
                    style: Theme.of(context).textTheme.bodySmall),
                Text(analysis.category.label,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(color: HakkuColors.primary)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: urgencyColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              urgency.label,
              style: TextStyle(
                color: urgencyColor,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ClarificationQuestion extends StatefulWidget {
  final int index;
  final String question;
  final String? answer;
  final ValueChanged<String?> onAnswer;

  const _ClarificationQuestion({
    required this.index,
    required this.question,
    required this.answer,
    required this.onAnswer,
  });

  @override
  State<_ClarificationQuestion> createState() =>
      _ClarificationQuestionState();
}

class _ClarificationQuestionState extends State<_ClarificationQuestion> {
  late final TextEditingController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.answer);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: HakkuColors.primaryLight,
                borderRadius: BorderRadius.circular(11),
              ),
              child: Center(
                child: Text('${widget.index}',
                    style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: HakkuColors.primary)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(widget.question,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      )),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _ctrl,
          maxLines: 2,
          onChanged: widget.onAnswer,
          decoration: const InputDecoration(
            hintText: 'Jawaban Anda (atau kosongkan jika tidak tahu)',
          ),
        ),
      ],
    );
  }
}

// ── Step 3: Ringkasan Fakta ─────────────────────────────────────────

class _FactSummaryStep extends StatelessWidget {
  final CaseFactSummary analysis;
  final String story;
  final bool isSaving;
  final VoidCallback onSave;
  final VoidCallback onEdit;

  const _FactSummaryStep({
    required this.analysis,
    required this.story,
    required this.isSaving,
    required this.onSave,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Langkah 3 dari 3',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: HakkuColors.primary)),
          const SizedBox(height: 4),
          Text('Ringkasan Fakta Perkara',
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text(
            'Periksa ringkasan ini. Fakta yang Anda berikan dibedakan dari interpretasi sistem.',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: HakkuColors.textMuted, height: 1.6),
          ),
          const SizedBox(height: 16),

          // Fakta yang diketahui
          _FactSection(
            title: '✅ Fakta yang Dinyatakan',
            color: HakkuColors.success,
            items: analysis.knownFacts,
            emptyMessage: 'Cerita telah dicatat.',
          ),
          const SizedBox(height: 12),

          // Informasi yang masih dibutuhkan
          _FactSection(
            title: '❓ Informasi yang Belum Diketahui',
            color: HakkuColors.warning,
            items: analysis.unknownFacts,
            emptyMessage: 'Tidak ada informasi tambahan yang dibutuhkan.',
          ),
          const SizedBox(height: 12),

          // Cerita asli
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: HakkuColors.surfaceVariant,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HakkuColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('📝 Cerita Asli Anda',
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Text(
                  story.length > 300
                      ? '${story.substring(0, 300)}...'
                      : story,
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(height: 1.6),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Disclaimer penting
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: HakkuColors.warningLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline,
                    color: HakkuColors.warning, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Ini adalah informasi awal berdasarkan cerita Anda, bukan kesimpulan hukum final. Verifikasi dengan bantuan profesional untuk keputusan penting.',
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(
                            color: HakkuColors.warning, height: 1.6),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Row(
            children: [
              OutlinedButton(
                onPressed: onEdit,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(100, 48),
                ),
                child: const Text('Edit'),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: isSaving ? null : onSave,
                  child: isSaving
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Simpan Perkara ✓'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Center(
            child: Text(
              'Data tersimpan dengan aman di perangkat Anda',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
        ],
      ).animate().fadeIn(duration: 300.ms),
    );
  }
}

class _FactSection extends StatelessWidget {
  final String title;
  final Color color;
  final List<String> items;
  final String emptyMessage;

  const _FactSection({
    required this.title,
    required this.color,
    required this.items,
    required this.emptyMessage,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(fontWeight: FontWeight.w700, color: color)),
          const SizedBox(height: 8),
          if (items.isEmpty)
            Text(emptyMessage,
                style: Theme.of(context).textTheme.bodySmall)
          else
            ...items.map(
              (fact) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.circle, size: 6, color: color),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(fact,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(height: 1.5)),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

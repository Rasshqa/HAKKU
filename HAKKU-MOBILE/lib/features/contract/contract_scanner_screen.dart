import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../domain/contract/contract_models.dart';
import '../../domain/contract/contract_analyzer.dart';

class ContractScannerScreen extends StatefulWidget {
  const ContractScannerScreen({super.key});

  @override
  State<ContractScannerScreen> createState() => _ContractScannerScreenState();
}

class _ContractScannerScreenState extends State<ContractScannerScreen> {
  ContractDomainType _selectedDomain = ContractDomainType.pkwtLabor;
  final TextEditingController _textController = TextEditingController();
  ContractAuditResult? _auditResult;
  bool _isAnalyzing = false;

  @override
  void initState() {
    super.initState();
    // Default load sample
    _loadSample(ContractDomainType.pkwtLabor);
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  void _loadSample(ContractDomainType type) {
    final sample = ContractAnalyzer.sampleContracts[type];
    if (sample != null) {
      _textController.text = sample['text'] ?? '';
      _analyze();
    }
  }

  void _analyze() {
    final text = _textController.text.trim();
    if (text.isEmpty) {
      setState(() {
        _auditResult = null;
      });
      return;
    }

    setState(() {
      _isAnalyzing = true;
    });

    final result = ContractAnalyzer.analyze(
      contractType: _selectedDomain,
      contractText: text,
    );

    setState(() {
      _auditResult = result;
      _isAnalyzing = false;
    });
  }

  Future<void> _pasteFromClipboard() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    if (data?.text != null && data!.text!.isNotEmpty) {
      _textController.text = data.text!;
      _analyze();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Teks berhasil ditempel dari papan klip.'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HakkuColors.background,
      appBar: AppBar(
        title: const Text(
          'Pemeriksa Klausul Kontrak',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        backgroundColor: HakkuColors.cardSurface,
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            tooltip: 'Panduan Pemeriksaan',
            icon: const Icon(Icons.help_outline, color: HakkuColors.textMuted),
            onPressed: () => _showHelpDialog(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeaderBanner(),
            const SizedBox(height: 16),
            _buildDomainSelector(),
            const SizedBox(height: 16),
            _buildInputCard(),
            const SizedBox(height: 16),
            if (_isAnalyzing)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_auditResult != null) ...[
              _buildAuditOverviewCard(_auditResult!),
              const SizedBox(height: 16),
              _buildFindingsList(_auditResult!),
              const SizedBox(height: 24),
              _buildReferralCtaCard(),
              const SizedBox(height: 32),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: HakkuColors.primaryLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: HakkuColors.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: HakkuColors.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.gavel,
              color: HakkuColors.textOnPrimary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Deteksi Klausul Jebakan & Ilegal',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: HakkuColors.primary,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Periksa naskah kontrak kerja, sewa menyewa, atau pinjaman digital terhadap larangan UU Cipta Kerja, PP 35/2021, KUHPerdata, dan UU PDP.',
                  style: TextStyle(
                    fontSize: 12,
                    color: HakkuColors.textMain,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildDomainSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Pilih Jenis Perjanjian',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: HakkuColors.textMain,
          ),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: ContractDomainType.values.map((type) {
              final isSelected = _selectedDomain == type;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(
                    type.label,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected
                          ? HakkuColors.primary
                          : HakkuColors.textMuted,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: HakkuColors.primaryLight,
                  backgroundColor: HakkuColors.cardSurface,
                  side: BorderSide(
                    color: isSelected
                        ? HakkuColors.primary
                        : HakkuColors.border,
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedDomain = type;
                      });
                      _loadSample(type);
                    }
                  },
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildInputCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: HakkuColors.cardSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HakkuColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Salin atau Masukkan Teks Kontrak',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: HakkuColors.textMain,
                ),
              ),
              Row(
                children: [
                  TextButton.icon(
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    onPressed: _pasteFromClipboard,
                    icon: const Icon(Icons.paste, size: 14),
                    label: const Text('Tempel', style: TextStyle(fontSize: 11)),
                  ),
                  const SizedBox(width: 4),
                  TextButton(
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    onPressed: () {
                      _textController.clear();
                      _analyze();
                    },
                    child: const Text('Hapus',
                        style: TextStyle(
                            fontSize: 11, color: HakkuColors.danger)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _textController,
            maxLines: 8,
            minLines: 4,
            style: const TextStyle(
              fontSize: 13,
              fontFamily: 'monospace',
              color: HakkuColors.textMain,
              height: 1.4,
            ),
            decoration: InputDecoration(
              hintText:
                  'Ketik atau tempel pasal-pasal perjanjian yang ingin Anda periksa di sini...',
              hintStyle: const TextStyle(
                fontSize: 12,
                color: HakkuColors.textMuted,
                fontFamily: 'sans-serif',
              ),
              filled: true,
              fillColor: HakkuColors.background,
              contentPadding: const EdgeInsets.all(12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: HakkuColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: HakkuColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(
                    color: HakkuColors.primary, width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: HakkuColors.primary,
              foregroundColor: HakkuColors.textOnPrimary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            onPressed: _analyze,
            icon: const Icon(Icons.security, size: 18),
            label: const Text(
              'Periksa Klausul Hukum Sekarang',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuditOverviewCard(ContractAuditResult result) {
    Color badgeBg;
    Color badgeText;
    IconData statusIcon;

    switch (result.overallRisk) {
      case ClauseRiskSeverity.highRisk:
        badgeBg = HakkuColors.dangerLight;
        badgeText = HakkuColors.danger;
        statusIcon = Icons.error_outline;
        break;
      case ClauseRiskSeverity.warning:
        badgeBg = HakkuColors.warningLight;
        badgeText = HakkuColors.warning;
        statusIcon = Icons.warning_amber_rounded;
        break;
      case ClauseRiskSeverity.safe:
        badgeBg = HakkuColors.successLight;
        badgeText = HakkuColors.success;
        statusIcon = Icons.check_circle_outline;
        break;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: HakkuColors.cardSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HakkuColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: badgeBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(statusIcon, color: badgeText, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      result.overallRiskLabel,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: badgeText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Kategori: ${result.contractTypeLabel}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: HakkuColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            result.summaryText,
            style: const TextStyle(
              fontSize: 12,
              color: HakkuColors.textMain,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _buildCountBadge(
                label: 'Risiko Tinggi',
                count: result.highRiskCount,
                color: HakkuColors.danger,
                bgColor: HakkuColors.dangerLight,
              ),
              const SizedBox(width: 8),
              _buildCountBadge(
                label: 'Perlu Negosiasi',
                count: result.warningCount,
                color: HakkuColors.warning,
                bgColor: HakkuColors.warningLight,
              ),
              const SizedBox(width: 8),
              _buildCountBadge(
                label: 'Sesuai UU',
                count: result.safeCount,
                color: HakkuColors.success,
                bgColor: HakkuColors.successLight,
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 250.ms);
  }

  Widget _buildCountBadge({
    required String label,
    required int count,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$count',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFindingsList(ContractAuditResult result) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Daftar Evaluasi Klausul Perjanjian',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: HakkuColors.textMain,
          ),
        ),
        const SizedBox(height: 8),
        ...result.findings.asMap().entries.map((entry) {
          final idx = entry.key;
          final finding = entry.value;
          return _buildFindingCard(finding, idx);
        }),
      ],
    );
  }

  Widget _buildFindingCard(ContractClauseFinding finding, int index) {
    Color severityColor;
    Color severityBg;

    switch (finding.severity) {
      case ClauseRiskSeverity.highRisk:
        severityColor = HakkuColors.danger;
        severityBg = HakkuColors.dangerLight;
        break;
      case ClauseRiskSeverity.warning:
        severityColor = HakkuColors.warning;
        severityBg = HakkuColors.warningLight;
        break;
      case ClauseRiskSeverity.safe:
        severityColor = HakkuColors.success;
        severityBg = HakkuColors.successLight;
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: HakkuColors.cardSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: finding.severity == ClauseRiskSeverity.highRisk
              ? HakkuColors.danger.withValues(alpha: 0.3)
              : HakkuColors.border,
        ),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: index == 0,
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          leading: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: severityBg,
              shape: BoxShape.circle,
            ),
            child: Icon(
              finding.severity == ClauseRiskSeverity.safe
                  ? Icons.check
                  : Icons.warning_amber_rounded,
              color: severityColor,
              size: 16,
            ),
          ),
          title: Text(
            finding.title,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: HakkuColors.textMain,
            ),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              finding.severityLabel,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: severityColor,
              ),
            ),
          ),
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: HakkuColors.background,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: HakkuColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Kutipan Kalimat Kontrak:',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: HakkuColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '"${finding.clauseExcerpt}"',
                    style: const TextStyle(
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: HakkuColors.textMain,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.balance,
                  size: 14,
                  color: HakkuColors.primary,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    finding.legalBasis,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: HakkuColors.primary,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              finding.explanation,
              style: const TextStyle(
                fontSize: 12,
                color: HakkuColors.textMain,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: HakkuColors.primaryLight.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: HakkuColors.primary.withValues(alpha: 0.2),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Rekomendasi Revisi Draf:',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: HakkuColors.primary,
                        ),
                      ),
                      InkWell(
                        onTap: () {
                          Clipboard.setData(
                            ClipboardData(text: finding.recommendedRevision),
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                  'Draf rekomendasi disalin ke papan klip.'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                        child: const Row(
                          children: [
                            Icon(Icons.copy,
                                size: 12, color: HakkuColors.primary),
                            SizedBox(width: 4),
                            Text(
                              'Salin Draf',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: HakkuColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    finding.recommendedRevision,
                    style: const TextStyle(
                      fontSize: 11,
                      color: HakkuColors.textMain,
                      height: 1.4,
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

  Widget _buildReferralCtaCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: HakkuColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Butuh Bantuan Negosiasi atau Bantuan Hukum?',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: HakkuColors.textMain,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Jika pihak lawan menolak merevisi klausul ilegal atau Anda mengalami pemaksaan penandatanganan, Anda berhak berkonsultasi cuma-cuma dengan LBH terakreditasi.',
            style: TextStyle(
              fontSize: 11,
              color: HakkuColors.textMuted,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: HakkuColors.primary,
              side: const BorderSide(color: HakkuColors.primary),
              padding: const EdgeInsets.symmetric(vertical: 10),
            ),
            onPressed: () => context.push('/rujukan'),
            icon: const Icon(Icons.account_balance, size: 16),
            label: const Text(
              'Buka Direktori Lembaga Bantuan Hukum (LBH)',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  void _showHelpDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Tentang Scanner Klausul'),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Alat ini menganalisis perjanjian secara deterministik menggunakan aturan hukum Indonesia:',
                style: TextStyle(fontSize: 12, height: 1.4),
              ),
              SizedBox(height: 8),
              Text(
                '• Larangan masa percobaan pada PKWT (Pasal 58 UU 13/2003 jo. PP 35/2021)\n'
                '• Larangan penahanan ijazah & barang berharga pekerja (Asas Keseimbangan KUHPerdata)\n'
                '• Kewajiban uang kompensasi PKWT (Pasal 61A UU Ketenagakerjaan)\n'
                '• Batasan akses data kontak & foto oleh pinjaman online (UU PDP No. 27/2022)\n'
                '• Larangan klausul eksonerasi pelepasan hak gugat (UU Perlindungan Konsumen)',
                style: TextStyle(fontSize: 11, height: 1.4),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Mengerti'),
          ),
        ],
      ),
    );
  }
}

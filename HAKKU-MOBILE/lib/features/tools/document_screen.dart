import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/pdf_service.dart';
import '../../domain/document/document_templates.dart';
import '../../domain/intake/intake_engine.dart';

class DocumentScreen extends StatefulWidget {
  const DocumentScreen({super.key});

  @override
  State<DocumentScreen> createState() => _DocumentScreenState();
}

class _DocumentScreenState extends State<DocumentScreen> {
  LegalDocumentType _selectedType = LegalDocumentType.bipartiteRequest;

  final TextEditingController _cityController =
      TextEditingController(text: 'Jakarta');
  final TextEditingController _senderNameController =
      TextEditingController(text: 'Ahmad Faisal');
  final TextEditingController _senderPhoneController =
      TextEditingController(text: '081234567890');
  final TextEditingController _senderAddressController =
      TextEditingController(text: 'Jl. Merdeka No. 12, Jakarta');
  final TextEditingController _recipientNameController =
      TextEditingController(text: 'PT Maju Bersama Sejahtera');
  final TextEditingController _recipientAddressController =
      TextEditingController(text: 'Gedung Wisma Niaga Lt. 8, Jakarta');
  final TextEditingController _fact1Controller = TextEditingController(
      text: 'Pemberitahuan pemutusan hubungan kerja sepihak tanpa perundingan bipartit terlebih dahulu.');
  final TextEditingController _fact2Controller = TextEditingController(
      text: 'Hak kompensasi pesangon statuter belum dibayarkan sesuai ketentuan PP No. 35 Tahun 2021.');

  bool _isGeneratingPdf = false;

  @override
  void dispose() {
    _cityController.dispose();
    _senderNameController.dispose();
    _senderPhoneController.dispose();
    _senderAddressController.dispose();
    _recipientNameController.dispose();
    _recipientAddressController.dispose();
    _fact1Controller.dispose();
    _fact2Controller.dispose();
    super.dispose();
  }

  GeneratedLegalDocument _getGeneratedDocument() {
    final knownFacts = <String>[];
    if (_fact1Controller.text.trim().isNotEmpty) {
      knownFacts.add(_fact1Controller.text.trim());
    }
    if (_fact2Controller.text.trim().isNotEmpty) {
      knownFacts.add(_fact2Controller.text.trim());
    }

    final factSummary = CaseFactSummary(
      category: DisputeCategory.labor,
      urgencyLevel: UrgencyLevel.urgent,
      originalStory: 'Perselisihan ketenagakerjaan mengenai hak normatif.',
      knownFacts: knownFacts.isEmpty
          ? ['Terjadi sengketa hukum hak normatif.']
          : knownFacts,
      unknownFacts: [],
    );

    final fields = DocumentCustomFields(
      senderName: _senderNameController.text,
      senderPhone: _senderPhoneController.text,
      senderAddress: _senderAddressController.text,
      recipientName: _recipientNameController.text,
      recipientAddress: _recipientAddressController.text,
      letterCity: _cityController.text,
      responseDeadlineDays: 7,
      proposedMeetingDate: '7 (tujuh) hari kerja setelah surat ini diterima',
    );

    return DocumentTemplateEngine.generate(
      type: _selectedType,
      factSummary: factSummary,
      fields: fields,
    );
  }

  Future<void> _sharePdf(GeneratedLegalDocument doc) async {
    setState(() => _isGeneratingPdf = true);
    try {
      await LegalPdfService.generateAndShareDocument(document: doc);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal membuat PDF: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isGeneratingPdf = false);
      }
    }
  }

  Future<void> _printDoc(GeneratedLegalDocument doc) async {
    try {
      await LegalPdfService.printDocument(document: doc);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal mencetak: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final doc = _getGeneratedDocument();

    return Scaffold(
      backgroundColor: HakkuColors.background,
      appBar: AppBar(
        title: const Text('Draf Surat Formil'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.canPop() ? context.pop() : context.go('/perangkat'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.print_outlined),
            tooltip: 'Cetak Dokumen',
            onPressed: () => _printDoc(doc),
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Bagikan PDF',
            onPressed: _isGeneratingPdf ? null : () => _sharePdf(doc),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Template Selector
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: LegalDocumentType.values.map((type) {
                final isSelected = type == _selectedType;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(type.title),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        HapticFeedback.lightImpact();
                        setState(() => _selectedType = type);
                      }
                    },
                    selectedColor: HakkuColors.primary,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : HakkuColors.textMain,
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 12),

          // Template Legal Basis Chip
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: HakkuColors.primaryLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.gavel, size: 18, color: HakkuColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Dasar Hukum: ${_selectedType.legalBasis}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: HakkuColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Form Input Fields (Expandable)
          ExpansionTile(
            initiallyExpanded: false,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: HakkuColors.border),
            ),
            collapsedShape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: HakkuColors.border),
            ),
            backgroundColor: HakkuColors.cardSurface,
            collapsedBackgroundColor: HakkuColors.cardSurface,
            title: const Text(
              'Sesuaikan Identitas & Duduk Perkara',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            childrenPadding: const EdgeInsets.all(16),
            children: [
              _buildField('Kota Surat', _cityController),
              const SizedBox(height: 10),
              _buildField('Nama Lengkap Anda', _senderNameController),
              const SizedBox(height: 10),
              _buildField('Nomor Kontak / WhatsApp', _senderPhoneController),
              const SizedBox(height: 10),
              _buildField('Alamat Domisili', _senderAddressController),
              const SizedBox(height: 10),
              _buildField('Nama Pihak Dituju / Perusahaan', _recipientNameController),
              const SizedBox(height: 10),
              _buildField('Alamat Pihak Dituju', _recipientAddressController),
              const SizedBox(height: 10),
              _buildField('Poin Fakta 1', _fact1Controller),
              const SizedBox(height: 10),
              _buildField('Poin Fakta 2', _fact2Controller),
            ],
          ),

          const SizedBox(height: 16),

          // Document Preview Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Pratinjau Lembar Surat Formil',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              ),
              TextButton.icon(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  Clipboard.setData(ClipboardData(text: doc.fullText));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Naskah surat berhasil disalin ke clipboard!'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
                icon: const Icon(Icons.copy, size: 16),
                label: const Text('Salin Naskah'),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Preview Paper
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HakkuColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: SelectableText(
              doc.fullText,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 11,
                height: 1.5,
                color: HakkuColors.textMain,
              ),
            ),
          ).animate().fadeIn(duration: 250.ms),

          const SizedBox(height: 20),

          // Export PDF Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _isGeneratingPdf ? null : () => _sharePdf(doc),
              icon: _isGeneratingPdf
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.picture_as_pdf),
              label: Text(
                _isGeneratingPdf
                    ? 'Sedang Memproses PDF...'
                    : 'Unduh / Bagikan PDF Resmi A4',
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: HakkuColors.textMuted),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          decoration: const InputDecoration(
            isDense: true,
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
          onChanged: (_) => setState(() {}),
        ),
      ],
    );
  }
}

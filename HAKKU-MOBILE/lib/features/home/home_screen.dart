import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/storage/local_storage.dart';
import 'widgets/hakki_mascot_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _intakeController = TextEditingController();
  final _intakeFocusNode = FocusNode();
  int _charCount = 0;
  bool _isTyping = false;

  static const List<_ScenarioCase> _scenarios = [
    _ScenarioCase(
      code: 'KASUS 01',
      title: 'Ketenagakerjaan & PHK',
      statute: 'PP No. 35/2021 · UU 13/2003',
      description:
          'PHK sepihak tanpa SP, pesangon belum dibayar, atau pemotongan upah sepihak.',
      prompt:
          'Saya bekerja selama 2 tahun dan mendadak di-PHK sepihak tanpa surat peringatan (SP). Uang pesangon dan kompensasi belum dibayarkan sesuai ketentuan PP No. 35/2021.',
    ),
    _ScenarioCase(
      code: 'KASUS 02',
      title: 'Penipuan Transaksi Digital',
      statute: 'UU ITE No. 1/2024 · Pasal 378 KUHP',
      description:
          'Rekening dibobol, barang belanja online fiktif, atau transfer tanpa pengiriman.',
      prompt:
          'Saya menjadi korban penipuan belanja daring. Saya telah mentransfer dana ke rekening penjual namun barang tidak dikirim dan nomor kontak saya diblokir.',
    ),
    _ScenarioCase(
      code: 'KASUS 03',
      title: 'Sengketa Sewa & Kontrak',
      statute: 'Pasal 1238 & 1365 KUHPerdata',
      description:
          'Uang deposit ditahan sepihak atau pemilik properti melanggar perjanjian sewa.',
      prompt:
          'Pemilik indekos menolak mengembalikan uang deposit sewa kamar sebesar Rp 2.500.000 padahal masa sewa telah usai dan kamar diserahkan dalam kondisi bersih utuh.',
    ),
    _ScenarioCase(
      code: 'KASUS 04',
      title: 'Intimidasi Pinjaman Online',
      statute: 'POJK 10/2022 · UU PDP 27/2022',
      description:
          'Penyebaran data pribadi, ancaman kontak darurat, atau bunga di atas batas OJK.',
      prompt:
          'Debt collector pinjaman online menagih dengan teror kata kasar dan menyebarkan foto serta data pribadi saya ke seluruh daftar kontak telepon genggam.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _intakeController.addListener(() {
      final len = _intakeController.text.length;
      if (len != _charCount) {
        setState(() {
          _charCount = len;
          _isTyping = len > 0;
        });
      }
    });
  }

  @override
  void dispose() {
    _intakeController.dispose();
    _intakeFocusNode.dispose();
    super.dispose();
  }

  void _selectScenario(_ScenarioCase scenario) {
    HapticFeedback.mediumImpact();
    setState(() {
      _intakeController.text = scenario.prompt;
      _intakeController.selection = TextSelection.fromPosition(
        TextPosition(offset: scenario.prompt.length),
      );
    });
    _intakeFocusNode.requestFocus();
  }

  void _startInterview() {
    final text = _intakeController.text.trim();
    HapticFeedback.lightImpact();
    context.go('/konsultasi', extra: text.isNotEmpty ? text : null);
  }

  void _startIntakeFlow() {
    final text = _intakeController.text.trim();
    HapticFeedback.mediumImpact();
    context.go('/intake', extra: text.isNotEmpty ? text : null);
  }

  void _showAccountDialog(BuildContext context) {
    HapticFeedback.lightImpact();
    final email = LocalStorage.getUserEmail() ?? 'warga@hakku.id';
    final name = LocalStorage.getUserDisplayName() ?? 'Warga HAKKU';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: HakkuColors.primaryHover, width: 2),
        ),
        title: Row(
          children: [
            const Icon(Icons.account_circle, color: HakkuColors.primary, size: 24),
            const SizedBox(width: 8),
            Text(
              'Profil Warga',
              style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.w800),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 14)),
            const SizedBox(height: 2),
            Text(email, style: GoogleFonts.inter(fontSize: 12, color: HakkuColors.textMuted)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: HakkuColors.successLight,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: HakkuColors.success, width: 1),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified_user_outlined, size: 14, color: HakkuColors.success),
                  const SizedBox(width: 6),
                  Text(
                    'Akun Google Terverifikasi',
                    style: GoogleFonts.sora(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: HakkuColors.success,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('Tutup', style: GoogleFonts.sora(color: HakkuColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: HakkuColors.danger,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.of(ctx).pop();
              await LocalStorage.logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            child: Text('Keluar', style: GoogleFonts.sora(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HakkuColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // App Bar Presisi Arsitektural Neo-Brutalis
          SliverAppBar(
            floating: true,
            pinned: false,
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1.5),
              child: Container(color: HakkuColors.border, height: 1.5),
            ),
            title: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: HakkuColors.primary,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: HakkuColors.border, width: 1.5),
                    boxShadow: HakkuColors.neoShadow(
                      color: HakkuColors.border,
                      offset: 2,
                    ),
                  ),
                  child: const Icon(Icons.balance, color: Colors.white, size: 17),
                ),
                const SizedBox(width: 10),
                Text(
                  'HAKKU',
                  style: GoogleFonts.sora(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.6,
                    color: HakkuColors.textMain,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: HakkuColors.primaryLight,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: HakkuColors.primary, width: 1),
                  ),
                  child: Text(
                    'AI LEGAL',
                    style: GoogleFonts.jetBrainsMono(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: HakkuColors.primary,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    _showAccountDialog(context);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: HakkuColors.primaryHover, width: 1.5),
                      boxShadow: HakkuColors.neoShadow(
                        color: HakkuColors.primaryHover,
                        offset: 2,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.account_circle_outlined,
                          size: 15,
                          color: HakkuColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Akun',
                          style: GoogleFonts.sora(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: HakkuColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 14),
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.heavyImpact();
                    context.push('/darurat');
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: HakkuColors.dangerLight,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: HakkuColors.danger, width: 1.5),
                      boxShadow: HakkuColors.neoShadow(
                        color: HakkuColors.danger,
                        offset: 2,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.warning_amber_rounded,
                          size: 15,
                          color: HakkuColors.danger,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Darurat',
                          style: GoogleFonts.sora(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: HakkuColors.danger,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // 1. Hero Title Banner — Identik dengan Heading Website
                _buildHeroTitleBanner(),

                const SizedBox(height: 14),

                // 2. Hakki Mascot Interaktif dengan Balon Ucapan Statuter
                HakkiMascotWidget(
                  size: 108,
                  initialMood: HakkiMood.welcoming,
                  characterCount: _charCount,
                  isTyping: _isTyping,
                  showSpeechBubble: true,
                ).animate().fadeIn(duration: 400.ms),

                const SizedBox(height: 16),

                // 3. Central Intake Card Arsitektural (Neo-Brutalis aether-card)
                _buildCentralIntakeCard(),

                const SizedBox(height: 24),

                // 4. Skenario Kasus Umum (4 Preset Cards Identik Website)
                _buildPresetScenariosSection(),

                const SizedBox(height: 26),

                // 5. Tiga Instrumen Hukum Unggulan HAKKU
                _buildLegalToolsHub(),

                const SizedBox(height: 24),

                // 6. Kartu Pernyataan Integritas & Disclaimer Statuter
                _buildDisclaimerCard(),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  /// Banner Judul Display Arsitektural Website: Solusi Hukum Cerdas. Pahami Hakmu.
  Widget _buildHeroTitleBanner() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tagline Atas
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Color(0xFF00F0FF),
                shape: BoxShape.rectangle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              'HUKUM × AI × DAMPAK NYATA',
              style: GoogleFonts.jetBrainsMono(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
                color: HakkuColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Headline Tingkat 1
        Text(
          'Solusi Hukum Cerdas.',
          style: GoogleFonts.sora(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: HakkuColors.textMain,
            letterSpacing: -0.6,
            height: 1.15,
          ),
        ),
        const SizedBox(height: 6),

        // Headline Tingkat 2 — Solid Navy Block Badge dengan Hard Offset Shadow
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: HakkuColors.primary,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: HakkuColors.border, width: 2),
            boxShadow: HakkuColors.neoShadow(
              color: HakkuColors.border,
              offset: 3.5,
            ),
          ),
          child: Text(
            'Pahami Hakmu.',
            style: GoogleFonts.sora(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.4,
            ),
          ),
        ),

        const SizedBox(height: 12),

        // Paragraf Deskripsi Resmi Sesuai Website
        Text(
          'Ceritakan persoalan Anda dengan bahasa sehari-hari. HAKKU memadukan kecerdasan buatan dengan korpus perundang-undangan resmi Republik Indonesia untuk memetakan pasal sah, mengaudit bukti, dan menyusun dokumen hukum siap pakai.',
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w400,
            color: HakkuColors.textMuted,
            height: 1.55,
          ),
        ),

        const SizedBox(height: 12),

        // Bar Lencana Kepatuhan Resmi
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            _buildTrustBadge(Icons.verified_outlined, 'JDIH Terverifikasi'),
            _buildTrustBadge(Icons.shield_outlined, 'UU PDP No. 27/2022'),
            _buildTrustBadge(Icons.auto_stories_outlined, '6 Tahap Pendampingan'),
          ],
        ),
      ],
    );
  }

  Widget _buildTrustBadge(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: HakkuColors.borderSubtle, width: 1.2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: HakkuColors.primary),
          const SizedBox(width: 4),
          Text(
            text,
            style: GoogleFonts.jetBrainsMono(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: HakkuColors.textMain,
            ),
          ),
        ],
      ),
    );
  }

  /// Kartu Intake Masalah Utama (Neo-Brutalist Form Card)
  Widget _buildCentralIntakeCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: HakkuColors.border, width: 2),
        boxShadow: HakkuColors.neoShadow(
          color: HakkuColors.primary,
          offset: 3.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Kartu + Counter Karakter
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 7,
                    height: 14,
                    decoration: BoxDecoration(
                      color: HakkuColors.primary,
                      borderRadius: BorderRadius.circular(1.5),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'CERITAKAN DUDUK PERKARA ANDA',
                    style: GoogleFonts.jetBrainsMono(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      color: HakkuColors.textMain,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              Text(
                '$_charCount/1000',
                style: GoogleFonts.jetBrainsMono(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: HakkuColors.textMuted,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Area Teks Kronologi Interaktif
          TextField(
            controller: _intakeController,
            focusNode: _intakeFocusNode,
            maxLength: 1000,
            maxLines: 4,
            buildCounter: (_, {required currentLength, required isFocused, maxLength}) =>
                const SizedBox.shrink(),
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: HakkuColors.textMain,
              height: 1.45,
            ),
            decoration: InputDecoration(
              hintText:
                  'Contoh: Saya bekerja 2 tahun di perusahaan swasta Jakarta. Kemarin mendadak di-PHK sepihak tanpa SP dan pesangon belum dibayar sesuai PP 35/2021...',
              hintStyle: GoogleFonts.inter(
                fontSize: 12,
                color: HakkuColors.textMuted.withValues(alpha: 0.8),
                height: 1.45,
              ),
              fillColor: const Color(0xFFF8F9FA),
              filled: true,
              contentPadding: const EdgeInsets.all(12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: HakkuColors.border, width: 1.5),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: HakkuColors.border, width: 1.5),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: HakkuColors.primary, width: 2),
              ),
            ),
          ),

          const SizedBox(height: 8),

          // Catatan Privasi & Enkripsi
          Row(
            children: [
              const Icon(
                Icons.lock_outline_rounded,
                size: 13,
                color: HakkuColors.textMuted,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Diproses secara privat sesuai prinsip perlindungan data pribadi (UU PDP).',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: HakkuColors.textMuted,
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Aksi Ganda Neo-Brutalis
          Column(
            children: [
              // Tombol Primer: Mulai Pendampingan 6 Tahap
              _buildBrutalButton(
                title: 'Mulai Pendampingan 6 Tahap',
                subtitle: 'Klarifikasi Fakta & Matriks Bukti',
                icon: Icons.arrow_forward_rounded,
                isPrimary: true,
                onTap: _startIntakeFlow,
              ),

              const SizedBox(height: 10),

              // Tombol Sekunder: Wawancara AI Paralegal
              _buildBrutalButton(
                title: 'Wawancara AI Paralegal',
                subtitle: 'Tanya Jawab Langsung Bersama Hakki',
                icon: Icons.chat_bubble_outline_rounded,
                isPrimary: false,
                onTap: _startInterview,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBrutalButton({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isPrimary,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isPrimary ? HakkuColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: HakkuColors.border, width: 1.8),
          boxShadow: HakkuColors.neoShadow(
            color: isPrimary ? HakkuColors.border : HakkuColors.primary,
            offset: 3,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: isPrimary
                    ? Colors.white.withValues(alpha: 0.15)
                    : HakkuColors.primaryLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                color: isPrimary ? Colors.white : HakkuColors.primary,
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.sora(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isPrimary ? Colors.white : HakkuColors.textMain,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: isPrimary
                          ? Colors.white.withValues(alpha: 0.85)
                          : HakkuColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: isPrimary ? Colors.white : HakkuColors.textMuted,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  /// 4 Kartu Skenario Kasus Statuter (Persis Website)
  Widget _buildPresetScenariosSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'SKENARIO PERKARA UMUM',
              style: GoogleFonts.jetBrainsMono(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: HakkuColors.textMain,
                letterSpacing: 0.5,
              ),
            ),
            Text(
              'KLIK UNTUK MENGISI',
              style: GoogleFonts.jetBrainsMono(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                color: HakkuColors.primary,
                letterSpacing: 0.4,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Grid 2x2 atau List Kasus
        ..._scenarios.map((caseItem) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _buildScenarioCard(caseItem),
            )),
      ],
    );
  }

  Widget _buildScenarioCard(_ScenarioCase caseItem) {
    return GestureDetector(
      onTap: () => _selectScenario(caseItem),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: HakkuColors.border, width: 1.5),
          boxShadow: HakkuColors.neoShadow(
            color: HakkuColors.border,
            offset: 2.5,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: HakkuColors.primaryLight,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: HakkuColors.primary, width: 1),
                  ),
                  child: Text(
                    caseItem.code,
                    style: GoogleFonts.jetBrainsMono(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: HakkuColors.primary,
                    ),
                  ),
                ),
                Text(
                  caseItem.statute,
                  style: GoogleFonts.jetBrainsMono(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w600,
                    color: HakkuColors.textMuted,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 7),
            Text(
              caseItem.title,
              style: GoogleFonts.sora(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: HakkuColors.textMain,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              caseItem.description,
              style: GoogleFonts.inter(
                fontSize: 11.5,
                color: HakkuColors.textMuted,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Hub Tiga Instrumen Hukum Unggulan HAKKU
  Widget _buildLegalToolsHub() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'TIGA INSTRUMEN HUKUM HAKKU',
              style: GoogleFonts.jetBrainsMono(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: HakkuColors.textMain,
                letterSpacing: 0.5,
              ),
            ),
            GestureDetector(
              onTap: () => context.go('/perangkat'),
              child: Text(
                'SEMUA PERANGKAT →',
                style: GoogleFonts.jetBrainsMono(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  color: HakkuColors.primary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        Row(
          children: [
            Expanded(
              child: _buildToolPillCard(
                icon: Icons.calculate_outlined,
                title: 'Kalkulator Hak',
                subtitle: 'Pesangon PP 35/2021',
                badge: 'STATUTER',
                onTap: () => context.go('/perangkat/kalkulator'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildToolPillCard(
                icon: Icons.article_outlined,
                title: 'Draf Dokumen',
                subtitle: 'Bipartit & Somasi',
                badge: 'A4 RESMI',
                onTap: () => context.go('/perangkat/dokumen'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        _buildToolPillCard(
          icon: Icons.checklist_rtl_rounded,
          title: 'Audit Matriks Bukti Sah',
          subtitle: 'Kualifikasi alat bukti KUHAP 184 & UU ITE 1/2024',
          badge: 'SKOR 0-100%',
          onTap: () => context.go('/perangkat/bukti'),
          isWide: true,
        ),
      ],
    );
  }

  Widget _buildToolPillCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required String badge,
    required VoidCallback onTap,
    bool isWide = false,
  }) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: HakkuColors.border, width: 1.5),
          boxShadow: HakkuColors.neoShadow(
            color: HakkuColors.border,
            offset: 2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: HakkuColors.primaryLight,
                    borderRadius: BorderRadius.circular(7),
                    border: Border.all(color: HakkuColors.border, width: 1),
                  ),
                  child: Icon(icon, color: HakkuColors.primary, size: 17),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: HakkuColors.borderSubtle, width: 1),
                  ),
                  child: Text(
                    badge,
                    style: GoogleFonts.jetBrainsMono(
                      fontSize: 8.5,
                      fontWeight: FontWeight.w700,
                      color: HakkuColors.textMain,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: GoogleFonts.sora(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: HakkuColors.textMain,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: GoogleFonts.inter(
                fontSize: 11,
                color: HakkuColors.textMuted,
                height: 1.35,
              ),
              maxLines: isWide ? 2 : 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  /// Kartu Integritas Statuter
  Widget _buildDisclaimerCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HakkuColors.borderSubtle, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.info_outline_rounded,
            size: 16,
            color: HakkuColors.textMuted,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'HAKKU adalah platform teknologi hukum kecerdasan buatan untuk literasi dan panduan berkas mandiri. Layanan ini bukan pengganti nasihat hukum formal oleh advokat bersumpah per UU No. 18/2003.',
              style: GoogleFonts.inter(
                fontSize: 10.5,
                fontWeight: FontWeight.w500,
                color: HakkuColors.textMuted,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScenarioCase {
  final String code;
  final String title;
  final String statute;
  final String description;
  final String prompt;

  const _ScenarioCase({
    required this.code,
    required this.title,
    required this.statute,
    required this.description,
    required this.prompt,
  });
}

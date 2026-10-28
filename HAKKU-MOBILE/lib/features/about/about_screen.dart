import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  Future<void> _openJdih() async {
    final uri = Uri.parse('https://jdih.kemnaker.go.id');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _navigateBack(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/perangkat');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        _navigateBack(context);
      },
      child: Scaffold(
        backgroundColor: HakkuColors.background,
        appBar: AppBar(
          title: const Text(
            'Tentang HAKKU',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          backgroundColor: HakkuColors.cardSurface,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => _navigateBack(context),
          ),
        ),
        body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeroBanner(),
            const SizedBox(height: 16),
            _buildScopeAndDisclaimerCard(),
            const SizedBox(height: 16),
            _buildPrivacyCard(),
            const SizedBox(height: 16),
            _buildStatutorySourcesCard(),
            const SizedBox(height: 24),
            _buildFooterBadge(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    ),
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: HakkuColors.primaryLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: HakkuColors.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: HakkuColors.primary,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.scale, color: HakkuColors.textOnPrimary, size: 14),
                SizedBox(width: 6),
                Text(
                  'Pendampingan Hukum Digital Warga',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: HakkuColors.textOnPrimary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'HAKKU Mobile',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: HakkuColors.primary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Membantu warga memahami posisi hukum normatif, menyusun kronologi perkara secara runtut, memeriksa klausul kontrak, dan mengamankan bukti sebelum melangkah ke musyawarah bipartit, Disnaker, atau LBH.',
            style: TextStyle(
              fontSize: 13,
              color: HakkuColors.textMain,
              height: 1.4,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 250.ms);
  }

  Widget _buildScopeAndDisclaimerCard() {
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
          const Row(
            children: [
              Icon(Icons.shield_outlined,
                  color: HakkuColors.primary, size: 20),
              SizedBox(width: 8),
              Text(
                'Ruang Lingkup & Batasan Hukum',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: HakkuColors.textMain,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'HAKKU bukan kantor advokat, bukan aparat penegak hukum, dan bukan lembaga peradilan. Informasi yang disajikan merupakan pemetaan awal berdasarkan peraturan perundang-undangan Republik Indonesia dan tidak menggantikan nasihat hukum advokat berlisensi.',
            style: TextStyle(
              fontSize: 12,
              color: HakkuColors.textMain,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: HakkuColors.warningLight,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: HakkuColors.warning.withValues(alpha: 0.3),
              ),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'STANDAR AKURASI & RUJUKAN RESMI',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: HakkuColors.warning,
                    letterSpacing: 0.5,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  '• Seluruh dasar hukum merujuk pasal lembaran negara JDIH resmi.\n'
                  '• Sistem memisahkan secara tegas fakta pengguna dengan ketentuan normatif undang-undang.\n'
                  '• Rumus kompensasi dan pesangon mengacu eksak ke PP No. 35 Tahun 2021.',
                  style: TextStyle(
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
    );
  }

  Widget _buildPrivacyCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: HakkuColors.cardSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HakkuColors.border),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lock_outline, color: HakkuColors.primary, size: 20),
              SizedBox(width: 8),
              Text(
                'Privasi & UU PDP No. 27/2022',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: HakkuColors.textMain,
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          Text(
            'HAKKU mematuhi prinsip Pelindungan Data Pribadi (UU PDP):',
            style: TextStyle(fontSize: 12, color: HakkuColors.textMain),
          ),
          SizedBox(height: 8),
          _PrivacyItem(
            title: 'Minimisasi Data Identitas',
            desc:
                'Pengguna dapat mengkaji perkara dan menghitung pesangon tanpa wajib memasukkan NIK atau nomor rekening.',
          ),
          _PrivacyItem(
            title: 'Penyimpanan Offline-First & Aman',
            desc:
                'Seluruh catatan kronologi, dokumen bukti, dan simulasi tersimpan aman di penyimpanan lokal ponsel Anda.',
          ),
          _PrivacyItem(
            title: 'Hak Atas Penghapusan (Right to Erasure)',
            desc:
                'Anda berhak menghapus seluruh rekaman kronologi, checklist, dan riwayat perkara kapan pun secara permanen.',
          ),
        ],
      ),
    );
  }

  Widget _buildStatutorySourcesCard() {
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
          const Row(
            children: [
              Icon(Icons.menu_book, color: HakkuColors.primary, size: 20),
              SizedBox(width: 8),
              Text(
                'Basis Peraturan Perundang-Undangan',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: HakkuColors.textMain,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const _LawSourceRow(
            title: 'Ketenagakerjaan & PHK',
            regulations:
                'UU No. 13/2003, UU No. 6/2023, UU No. 2/2004, PP No. 35/2021',
          ),
          const _LawSourceRow(
            title: 'Pinjaman Digital & Konsumen',
            regulations:
                'UU No. 8/1999 (UUPK), POJK No. 10/POJK.05/2022, POJK No. 22/2023',
          ),
          const _LawSourceRow(
            title: 'Sewa & Perdata Umum',
            regulations:
                'Kitab Undang-Undang Hukum Perdata (KUHPerdata Buku III)',
          ),
          const _LawSourceRow(
            title: 'Pelindungan Data Pribadi',
            regulations: 'UU No. 27 Tahun 2022 (UU PDP)',
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: HakkuColors.primary,
              side: const BorderSide(color: HakkuColors.primary),
            ),
            onPressed: _openJdih,
            icon: const Icon(Icons.open_in_new, size: 14),
            label: const Text(
              'Akses Jaringan Dokumentasi Hukum (JDIH)',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooterBadge() {
    return const Center(
      child: Column(
        children: [
          Text(
            'HAKKU Mobile • Versi 1.0.0',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: HakkuColors.textMuted,
            ),
          ),
          SizedBox(height: 2),
          Text(
            'Dirancang untuk Akses Keadilan Warga Indonesia',
            style: TextStyle(
              fontSize: 11,
              color: HakkuColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _PrivacyItem extends StatelessWidget {
  final String title;
  final String desc;

  const _PrivacyItem({required this.title, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_outline,
              size: 14, color: HakkuColors.success),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(
                    fontSize: 11, color: HakkuColors.textMain, height: 1.3),
                children: [
                  TextSpan(
                    text: '$title: ',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  TextSpan(text: desc),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LawSourceRow extends StatelessWidget {
  final String title;
  final String regulations;

  const _LawSourceRow({required this.title, required this.regulations});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: HakkuColors.background,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: HakkuColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: HakkuColors.textMain,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            regulations,
            style: const TextStyle(
              fontSize: 10,
              color: HakkuColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

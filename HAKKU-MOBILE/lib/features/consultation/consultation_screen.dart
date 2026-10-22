import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';

class ConsultationScreen extends StatefulWidget {
  const ConsultationScreen({super.key});

  @override
  State<ConsultationScreen> createState() => _ConsultationScreenState();
}

class _ConsultationScreenState extends State<ConsultationScreen> {
  final _msgController = TextEditingController();
  final _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [
    _ChatMessage(
      role: 'assistant',
      content:
          'Halo! Saya Hakki, pendamping hukum digital Anda. 👋\n\nSaya siap membantu Anda memahami situasi hukum, menyiapkan pertanyaan untuk konsultasi, atau menjelaskan istilah hukum yang membingungkan.\n\nIngat: Saya memberikan **informasi awal** sebagai panduan — bukan pengganti konsultasi dengan advokat atau LBH untuk keputusan hukum penting.',
    ),
  ];
  bool _isLoading = false;

  @override
  void dispose() {
    _msgController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String content) async {
    if (content.trim().isEmpty) return;

    HapticFeedback.lightImpact();
    _msgController.clear();

    setState(() {
      _messages.add(_ChatMessage(role: 'user', content: content.trim()));
      _isLoading = true;
    });
    _scrollToBottom();

    // Simulasi respons — dalam production panggil /api/consultation/chat
    await Future.delayed(const Duration(milliseconds: 1200));

    if (mounted) {
      setState(() {
        _messages.add(_ChatMessage(
          role: 'assistant',
          content: _generateOfflineResponse(content),
        ));
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  String _generateOfflineResponse(String userMessage) {
    final lower = userMessage.toLowerCase();
    if (lower.contains('phk') || lower.contains('pecat')) {
      return 'Berkaitan dengan PHK, ada beberapa hal penting yang perlu Anda ketahui:\n\n**Hak Anda saat PHK:**\n• Uang Pesangon (UP) sesuai masa kerja — Pasal 40 PP 35/2021\n• Uang Penghargaan Masa Kerja (UPMK) jika ≥3 tahun bekerja\n• Uang Penggantian Hak (UPH) termasuk cuti yang belum diambil\n\n**Langkah pertama yang disarankan:**\n1. Minta surat PHK tertulis beserta alasannya\n2. Hitung hak Anda menggunakan Kalkulator Pesangon di tab Perangkat\n3. Jika ada perselisihan, ajukan perundingan bipartit (14 hari kerja)\n\n⚠️ *Ini informasi awal. Untuk kepastian, konsultasikan dengan Disnaker setempat atau LBH.*';
    }
    if (lower.contains('gaji') || lower.contains('upah')) {
      return 'Upah yang tidak dibayarkan adalah hak pekerja yang dilindungi hukum.\n\n**Dasar hukum:**\n• UU No. 13/2003 Pasal 93 — Pengusaha wajib membayar upah\n• PP No. 36/2021 tentang pengupahan\n\n**Yang bisa Anda lakukan:**\n1. Buat catatan tertulis/surat teguran kepada pengusaha\n2. Laporkan ke Dinas Ketenagakerjaan (Disnaker) setempat\n3. Jika tidak ada respons, bisa ajukan gugatan ke Pengadilan Hubungan Industrial (PHI)\n\n**Bukti yang perlu disiapkan:**\n• Slip gaji / perjanjian kerja\n• Rekening koran sebagai bukti tidak ada transfer\n• Komunikasi dengan atasan\n\n⚠️ *Verifikasi dengan Disnaker untuk prosedur terbaru di daerah Anda.*';
    }
    if (lower.contains('penipuan') || lower.contains('tipu')) {
      return 'Penipuan online adalah tindak pidana serius yang dapat dilaporkan.\n\n**Dasar hukum:**\n• Pasal 378 KUHP — Tindak pidana penipuan\n• Pasal 28 ayat 1 UU ITE No. 1/2024 — Penipuan elektronik\n\n**Bukti yang perlu dikumpulkan segera:**\n• Screenshot semua percakapan\n• Bukti transfer (mutasi rekening)\n• Profil pelaku di platform yang digunakan\n\n**Cara melaporkan:**\n1. Platform e-commerce — gunakan fitur laporan internal\n2. Polisi — bawa bukti ke Polres/Polsek terdekat\n3. Kominfo — melalui aduankonten.id jika konten berbahaya\n\n⚠️ *Jangan hapus bukti apapun. Tangkap layar sebelum akun pelaku dihapus.*';
    }
    if (lower.contains('lbh') || lower.contains('bantuan hukum') || lower.contains('advokat')) {
      return 'Untuk mendapatkan bantuan hukum gratis:\n\n**LBH (Lembaga Bantuan Hukum)**\nBerdasarkan UU No. 16/2011, masyarakat tidak mampu berhak mendapat bantuan hukum gratis dari LBH terakreditasi.\n\n**Cara menemukan LBH:**\n• YLBHI: ylbhi.or.id\n• BPHN: bphn.go.id (untuk daftar LBH terakreditasi)\n• POSBAKUM di pengadilan (khusus perkara yang sudah masuk pengadilan)\n\n**Syarat umum:**\n• Surat Keterangan Tidak Mampu (SKTM) dari kelurahan\n• Identitas diri (KTP)\n• Dokumen perkara yang dimiliki\n\n⚠️ *Informasi ini bersifat umum. Hubungi LBH setempat untuk konfirmasi prosedur terkini.*';
    }

    return 'Terima kasih atas pertanyaan Anda. Berdasarkan informasi yang diberikan, saya sarankan Anda:\n\n1. **Kumpulkan bukti** yang berkaitan dengan situasi Anda\n2. **Catat kronologi** kejadian dengan tanggal lengkap\n3. **Gunakan Perangkat Hukum** di tab Perangkat untuk kalkulator pesangon atau audit bukti\n4. **Konsultasikan dengan LBH** atau Disnaker setempat untuk panduan yang lebih spesifik\n\nJika Anda ingin bantuan lebih spesifik, ceritakan detail situasinya atau gunakan fitur **Ceritakan Masalahmu** di tab Beranda.\n\n⚠️ *Ini adalah informasi awal — bukan nasihat hukum profesional.*';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: HakkuColors.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.support_agent,
                  color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Tanya Hakki',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                Text('Pendamping Hukum Digital',
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(fontSize: 11)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.warning_amber_rounded,
                color: HakkuColors.danger),
            tooltip: 'Bantuan Darurat',
            onPressed: () => context.go('/darurat'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Info bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: HakkuColors.primaryLight,
            child: Text(
              'ℹ️ Hakki memberikan informasi awal — bukan pengganti advokat. Untuk keputusan hukum penting, konsultasikan dengan LBH.',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: HakkuColors.primary),
            ),
          ),

          // Chat messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return const _TypingIndicator();
                }
                return _ChatBubble(
                  message: _messages[index],
                ).animate().fadeIn(duration: 250.ms);
              },
            ),
          ),

          // Quick prompts
          if (_messages.length < 3)
            _QuickPrompts(onTap: _sendMessage),

          // Input area
          _ChatInput(
            controller: _msgController,
            onSend: () => _sendMessage(_msgController.text),
            isLoading: _isLoading,
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  final String role;
  final String content;

  _ChatMessage({required this.role, required this.content});
}

class _ChatBubble extends StatelessWidget {
  final _ChatMessage message;

  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: HakkuColors.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.support_agent,
                  color: Colors.white, size: 16),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isUser ? HakkuColors.primary : HakkuColors.cardSurface,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(12),
                  topRight: const Radius.circular(12),
                  bottomLeft: isUser
                      ? const Radius.circular(12)
                      : const Radius.circular(2),
                  bottomRight: isUser
                      ? const Radius.circular(2)
                      : const Radius.circular(12),
                ),
                border: isUser
                    ? null
                    : Border.all(color: HakkuColors.border),
              ),
              child: _RichText(
                text: message.content,
                isUser: isUser,
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: HakkuColors.primaryLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.person_outline,
                  color: HakkuColors.primary, size: 16),
            ),
          ],
        ],
      ),
    );
  }
}

/// Render teks dengan **bold** sederhana
class _RichText extends StatelessWidget {
  final String text;
  final bool isUser;

  const _RichText({required this.text, required this.isUser});

  @override
  Widget build(BuildContext context) {
    final baseStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: isUser ? Colors.white : HakkuColors.textMain,
          height: 1.6,
        );
    return Text(
      text,
      style: baseStyle,
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: HakkuColors.primary,
              borderRadius: BorderRadius.circular(10),
            ),
            child:
                const Icon(Icons.support_agent, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: HakkuColors.cardSurface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HakkuColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _Dot(delay: 0),
                const SizedBox(width: 4),
                _Dot(delay: 200),
                const SizedBox(width: 4),
                _Dot(delay: 400),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final int delay;
  const _Dot({required this.delay});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 6,
      height: 6,
      decoration: const BoxDecoration(
        color: HakkuColors.textMuted,
        shape: BoxShape.circle,
      ),
    )
        .animate(onPlay: (c) => c.repeat())
        .fadeOut(duration: 600.ms, delay: Duration(milliseconds: delay))
        .then()
        .fadeIn(duration: 600.ms);
  }
}

class _QuickPrompts extends StatelessWidget {
  final ValueChanged<String> onTap;

  const _QuickPrompts({required this.onTap});

  static const _prompts = [
    'Apa hak saya saat kena PHK?',
    'Bagaimana cara menghitung pesangon?',
    'Saya terkena penipuan online, apa yang harus dilakukan?',
    'Bagaimana cara mendapatkan bantuan hukum gratis?',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      margin: const EdgeInsets.only(bottom: 8),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: _prompts.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          return GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              onTap(_prompts[i]);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: HakkuColors.primaryLight,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                    color: HakkuColors.primary.withValues(alpha: 0.3)),
              ),
              child: Text(
                _prompts[i],
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: HakkuColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ChatInput extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSend;
  final bool isLoading;

  const _ChatInput({
    required this.controller,
    required this.onSend,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 8,
        top: 8,
        bottom: MediaQuery.of(context).padding.bottom + 8,
      ),
      decoration: const BoxDecoration(
        color: HakkuColors.cardSurface,
        border: Border(top: BorderSide(color: HakkuColors.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              maxLines: 4,
              minLines: 1,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => onSend(),
              decoration: const InputDecoration(
                hintText: 'Tanyakan masalah hukummu...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                  borderSide: BorderSide(color: HakkuColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                  borderSide: BorderSide(color: HakkuColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                  borderSide:
                      BorderSide(color: HakkuColors.primary, width: 2),
                ),
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 44,
            height: 44,
            child: FloatingActionButton(
              mini: true,
              elevation: 0,
              backgroundColor: isLoading
                  ? HakkuColors.border
                  : HakkuColors.primary,
              onPressed: isLoading ? null : onSend,
              child: Icon(
                isLoading ? Icons.hourglass_empty : Icons.send_rounded,
                size: 20,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

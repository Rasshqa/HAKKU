import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/storage/local_storage.dart';
import '../../domain/ai/ai_legal_service.dart';

class ConsultationScreen extends StatefulWidget {
  final String? initialMessage;
  const ConsultationScreen({super.key, this.initialMessage});

  @override
  State<ConsultationScreen> createState() => _ConsultationScreenState();
}

class _ConsultationScreenState extends State<ConsultationScreen> {
  final _msgController = TextEditingController();
  final _scrollController = ScrollController();
  final List<ConsultationMessage> _messages = [
    ConsultationMessage(
      role: ChatRole.assistant,
      content:
          'Halo! Saya Hakki, asisten paralegal digital Anda. 👋\n\nSaya siap membedah duduk perkara Anda, memeriksa hak hukum positif RI (PP 35/2021, UU ITE, UU Ketenagakerjaan, KUHPerdata), dan memandu langkah taktis penyelesaian.\n\nApa persoalan hukum yang sedang Anda hadapi saat ini?',
    ),
  ];

  bool _isGenerating = false;
  String _currentThinkingStatus = '';
  CancelToken? _cancelToken;
  StreamSubscription<String>? _streamSub;

  @override
  void initState() {
    super.initState();
    if (widget.initialMessage != null &&
        widget.initialMessage!.trim().isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _sendMessage(widget.initialMessage!.trim());
      });
    }
  }

  @override
  void dispose() {
    _streamSub?.cancel();
    _cancelToken?.cancel();
    _msgController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  Future<void> _sendMessage(String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty || _isGenerating) return;

    HapticFeedback.lightImpact();
    _msgController.clear();

    setState(() {
      _messages.add(ConsultationMessage(
        role: ChatRole.user,
        content: trimmed,
      ));
      _isGenerating = true;
      _currentThinkingStatus = 'Menganalisis duduk perkara...';
    });
    _scrollToBottom();

    _cancelToken = CancelToken();

    // Buat slot pesan asisten kosong yang siap menerima streaming token
    final assistantMsg = ConsultationMessage(
      role: ChatRole.assistant,
      content: '',
    );

    int assistantIndex = -1;
    bool hasAddedAssistant = false;

    try {
      final stream = AiLegalService.streamReply(
        history: _messages,
        currentMessage: trimmed,
        onStatusUpdate: (status) {
          if (mounted) {
            setState(() {
              _currentThinkingStatus = status;
            });
          }
        },
        cancelToken: _cancelToken,
      );

      _streamSub = stream.listen(
        (partialText) {
          if (!mounted) return;
          setState(() {
            if (!hasAddedAssistant) {
              _messages.add(assistantMsg);
              assistantIndex = _messages.length - 1;
              hasAddedAssistant = true;
            }
            if (assistantIndex >= 0 && assistantIndex < _messages.length) {
              _messages[assistantIndex] = ConsultationMessage(
                role: ChatRole.assistant,
                content: partialText,
              );
            }
          });
          _scrollToBottom();
        },
        onError: (err) {
          if (!mounted) return;
          setState(() {
            _isGenerating = false;
            _currentThinkingStatus = '';
          });
        },
        onDone: () {
          if (!mounted) return;
          HapticFeedback.selectionClick();
          setState(() {
            _isGenerating = false;
            _currentThinkingStatus = '';
          });
          _scrollToBottom();
        },
      );
    } catch (_) {
      if (mounted) {
        setState(() {
          _isGenerating = false;
          _currentThinkingStatus = '';
        });
      }
    }
  }

  void _stopGeneration() {
    HapticFeedback.mediumImpact();
    _cancelToken?.cancel('User stopped generation');
    _streamSub?.cancel();
    setState(() {
      _isGenerating = false;
      _currentThinkingStatus = '';
    });
  }

  void _openModelSettingsSheet() {
    HapticFeedback.lightImpact();
    final currentModel = LocalStorage.getLlmModel();
    final currentKey = LocalStorage.getGeminiApiKey() ?? '';
    final keyController = TextEditingController(text: currentKey);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.psychology,
                              color: HakkuColors.primary, size: 24),
                          const SizedBox(width: 8),
                          Text(
                            'Model & Mesin AI Hukum',
                            style: GoogleFonts.sora(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: HakkuColors.textMain,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Pilih model AI untuk konsultasi hukum yang lebih cerdas, responsif, dan mutakhir:',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: HakkuColors.textMuted,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Model Selection Options
                  _buildModelOptionTile(
                    title: 'Google Gemini 2.5 Flash (Direkomendasikan)',
                    subtitle: 'Kecepatan tinggi, penalaran hukum tajam & latensi ultra rendah.',
                    modelCode: 'gemini-2.5-flash',
                    selectedModel: currentModel,
                    onSelect: (val) async {
                      await LocalStorage.setLlmModel(val);
                      setModalState(() {});
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildModelOptionTile(
                    title: 'Google Gemini 3.8 Flash (Next-Gen)',
                    subtitle: 'Model reasoning terbaru untuk bedah kasus sengketa rumit.',
                    modelCode: 'gemini-3.8-flash',
                    selectedModel: currentModel,
                    onSelect: (val) async {
                      await LocalStorage.setLlmModel(val);
                      setModalState(() {});
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildModelOptionTile(
                    title: 'Hakki Legal Neural Engine (Offline-First)',
                    subtitle: 'Pemrosesan lokal tanpa kuota internet dengan rujukan regulasi RI.',
                    modelCode: 'offline-engine',
                    selectedModel: currentModel,
                    onSelect: (val) async {
                      await LocalStorage.setLlmModel(val);
                      setModalState(() {});
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 16),

                  // API Key input
                  Text(
                    'Google Gemini API Key (Opsional untuk Cloud LLM):',
                    style: GoogleFonts.sora(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: HakkuColors.textMain,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: keyController,
                    obscureText: true,
                    decoration: InputDecoration(
                      hintText: 'AIzaSy... (kosongkan jika pakai offline)',
                      hintStyle: GoogleFonts.inter(fontSize: 12),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: HakkuColors.border),
                      ),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.save, size: 20),
                        onPressed: () async {
                          await LocalStorage.setGeminiApiKey(keyController.text);
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              const SnackBar(
                                content: Text('Pengaturan API Key disimpan.'),
                                duration: Duration(seconds: 1),
                              ),
                            );
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildModelOptionTile({
    required String title,
    required String subtitle,
    required String modelCode,
    required String selectedModel,
    required ValueChanged<String> onSelect,
  }) {
    final isSelected = selectedModel == modelCode;
    return GestureDetector(
      onTap: () => onSelect(modelCode),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? HakkuColors.primaryLight : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? HakkuColors.primary : HakkuColors.border,
            width: isSelected ? 1.8 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected
                  ? Icons.radio_button_checked
                  : Icons.radio_button_unchecked,
              color: isSelected ? HakkuColors.primary : HakkuColors.textMuted,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.sora(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: HakkuColors.textMain,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 10.5,
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

  @override
  Widget build(BuildContext context) {
    final activeModel = LocalStorage.getLlmModel();

    return Scaffold(
      backgroundColor: HakkuColors.background,
      appBar: AppBar(
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
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.support_agent,
                  color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tanya Hakki',
                    style: GoogleFonts.sora(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: HakkuColors.textMain,
                    ),
                  ),
                  GestureDetector(
                    onTap: _openModelSettingsSheet,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          activeModel.contains('flash')
                              ? '✨ ${activeModel.toUpperCase()}'
                              : '⚖️ LEGAL ENGINE',
                          style: GoogleFonts.jetBrainsMono(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                            color: HakkuColors.primary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.tune,
                          size: 11,
                          color: HakkuColors.primary,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.warning_amber_rounded,
                color: HakkuColors.danger),
            tooltip: 'Bantuan Darurat',
            onPressed: () => context.push('/darurat'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Info bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
            color: HakkuColors.primaryLight,
            child: Row(
              children: [
                const Icon(Icons.shield_outlined,
                    size: 13, color: HakkuColors.primary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Telaah awal paralegal berbasis hukum positif RI — Bukan pengganti advokat.',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: HakkuColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Chat messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _messages.length +
                  (_isGenerating && _currentThinkingStatus.isNotEmpty &&
                          (_messages.isEmpty || _messages.last.isUser)
                      ? 1
                      : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return _ThinkingIndicator(status: _currentThinkingStatus);
                }
                final msg = _messages[index];
                final isLastStreaming = _isGenerating &&
                    index == _messages.length - 1 &&
                    !msg.isUser;

                return _ChatBubble(
                  message: msg,
                  isStreaming: isLastStreaming,
                ).animate().fadeIn(duration: 180.ms);
              },
            ),
          ),

          // Quick prompts
          if (_messages.length <= 2 && !_isGenerating)
            _QuickPrompts(onTap: _sendMessage),

          // Input area
          _ChatInput(
            controller: _msgController,
            onSend: () => _sendMessage(_msgController.text),
            onStop: _stopGeneration,
            isGenerating: _isGenerating,
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ConsultationMessage message;
  final bool isStreaming;

  const _ChatBubble({
    required this.message,
    this.isStreaming = false,
  });

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
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
                color: isUser ? HakkuColors.primary : Colors.white,
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
                    : Border.all(color: HakkuColors.border, width: 1.2),
                boxShadow: isUser
                    ? null
                    : [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        )
                      ],
              ),
              child: _LegalMarkdownRenderer(
                content: message.content,
                isUser: isUser,
                isStreaming: isStreaming,
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
                border: Border.all(
                  color: HakkuColors.primary.withValues(alpha: 0.3),
                ),
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

/// Renderer Teks Markdown Hukum Berpresisi Tinggi
class _LegalMarkdownRenderer extends StatelessWidget {
  final String content;
  final bool isUser;
  final bool isStreaming;

  const _LegalMarkdownRenderer({
    required this.content,
    required this.isUser,
    this.isStreaming = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isUser) {
      return Text(
        content,
        style: GoogleFonts.inter(
          fontSize: 13.5,
          height: 1.5,
          color: Colors.white,
        ),
      );
    }

    final spans = <InlineSpan>[];
    final lines = content.split('\n');

    for (int i = 0; i < lines.length; i++) {
      final line = lines[i];

      // Parse bold **text**
      final parts = line.split('**');
      for (int j = 0; j < parts.length; j++) {
        final isBold = j.isOdd;
        final partText = parts[j];

        // Format highlight untuk pasal/UU
        if (!isBold && _containsStatuteCitation(partText)) {
          spans.add(_buildStatuteTextSpan(partText));
        } else {
          spans.add(TextSpan(
            text: partText,
            style: GoogleFonts.inter(
              fontSize: 13,
              height: 1.55,
              fontWeight: isBold ? FontWeight.w700 : FontWeight.w400,
              color: isBold ? HakkuColors.primaryHover : HakkuColors.textMain,
            ),
          ));
        }
      }

      if (i < lines.length - 1) {
        spans.add(const TextSpan(text: '\n'));
      }
    }

    // Tambahkan kursor berkedip jika sedang streaming
    if (isStreaming) {
      spans.add(
        WidgetSpan(
          alignment: PlaceholderAlignment.middle,
          child: Container(
            margin: const EdgeInsets.only(left: 2),
            width: 7,
            height: 14,
            decoration: const BoxDecoration(
              color: HakkuColors.primary,
              shape: BoxShape.rectangle,
            ),
          ).animate(onPlay: (c) => c.repeat(reverse: true)).fade(
                duration: const Duration(milliseconds: 400),
              ),
        ),
      );
    }

    return RichText(
      text: TextSpan(children: spans),
    );
  }

  bool _containsStatuteCitation(String text) {
    final lower = text.toLowerCase();
    return lower.contains('pasal') ||
        lower.contains('pp no.') ||
        lower.contains('uu no.') ||
        lower.contains('kuhp') ||
        lower.contains('kuhperdata') ||
        lower.contains('pojk');
  }

  TextSpan _buildStatuteTextSpan(String text) {
    return TextSpan(
      text: text,
      style: GoogleFonts.inter(
        fontSize: 13,
        height: 1.55,
        fontWeight: FontWeight.w500,
        color: HakkuColors.primary,
      ),
    );
  }
}

class _ThinkingIndicator extends StatelessWidget {
  final String status;
  const _ThinkingIndicator({required this.status});

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
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HakkuColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(
                    strokeWidth: 1.8,
                    valueColor: AlwaysStoppedAnimation<Color>(HakkuColors.primary),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  status,
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    fontStyle: FontStyle.italic,
                    color: HakkuColors.textMuted,
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(),
        ],
      ),
    );
  }
}

class _QuickPrompts extends StatelessWidget {
  final ValueChanged<String> onTap;

  const _QuickPrompts({required this.onTap});

  static const _prompts = [
    'Apa hak pesangon saya saat kena PHK sepihak?',
    'Gaji saya tertunda 2 bulan, apa langkah hukumnya?',
    'Saya diteror debt collector pinjol ilegal, bagaimana lapornya?',
    'Bagaimana cara memblokir rekening penipu online?',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 38,
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
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: HakkuColors.primary.withValues(alpha: 0.35),
                  width: 1.2,
                ),
              ),
              child: Text(
                _prompts[i],
                style: GoogleFonts.inter(
                  fontSize: 11.5,
                  color: HakkuColors.primary,
                  fontWeight: FontWeight.w600,
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
  final VoidCallback onStop;
  final bool isGenerating;

  const _ChatInput({
    required this.controller,
    required this.onSend,
    required this.onStop,
    required this.isGenerating,
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
        color: Colors.white,
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
              onSubmitted: (_) => isGenerating ? null : onSend(),
              style: GoogleFonts.inter(fontSize: 13),
              decoration: InputDecoration(
                hintText: isGenerating
                    ? 'Hakki sedang menyusun jawaban...'
                    : 'Tanyakan masalah hukummu...',
                hintStyle: GoogleFonts.inter(
                  fontSize: 12.5,
                  color: HakkuColors.textMuted,
                ),
                border: const OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                  borderSide: BorderSide(color: HakkuColors.border),
                ),
                enabledBorder: const OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                  borderSide: BorderSide(color: HakkuColors.border),
                ),
                focusedBorder: const OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                  borderSide:
                      BorderSide(color: HakkuColors.primary, width: 2),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
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
              backgroundColor:
                  isGenerating ? HakkuColors.danger : HakkuColors.primary,
              onPressed: isGenerating ? onStop : onSend,
              child: Icon(
                isGenerating ? Icons.stop_rounded : Icons.send_rounded,
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

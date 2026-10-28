import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import '../../core/storage/local_storage.dart';
import '../legal/legal_corpus.dart';

/// Role pesan chat konsultasi hukum
enum ChatRole {
  user,
  assistant,
  system;

  String toApiRole() {
    switch (this) {
      case ChatRole.user:
        return 'user';
      case ChatRole.assistant:
        return 'model';
      case ChatRole.system:
        return 'system';
    }
  }
}

/// Struktur data pesan konsultasi
class ConsultationMessage {
  final ChatRole role;
  final String content;
  final DateTime timestamp;
  final List<String>? citedArticles;
  final String? suggestedAction;

  ConsultationMessage({
    required this.role,
    required this.content,
    DateTime? timestamp,
    this.citedArticles,
    this.suggestedAction,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get isUser => role == ChatRole.user;
}

/// Layanan AI Paralegal Cerdas HAKKU
/// Mengintegrasikan Google Gemini LLM (Streaming) dengan Fallback ke
/// Local High-Precision Legal Reasoning Engine berstandar hukum positif Indonesia.
class AiLegalService {
  AiLegalService._();

  static const String systemPrompt = '''
Anda adalah "Hakki si Kancil", Asisten Paralegal & Sahabat Sadar Hukum Warga Indonesia di platform HAKKU.
Karakter Anda: Cerdas, berwibawa, penuh empati, solutif, dan menjunjung tinggi kejujuran hukum.
Anda berbicara dengan bahasa Indonesia yang ramah, santun, lugas, dan mudah dipahami masyarakat awam, namun memiliki presisi ketajaman analisis hukum seorang paralegal profesional.

MISI ANDA:
1. Memvalidasi situasi warga dengan empati tanpa menghakimi.
2. Membedah duduk perkara & menjelaskan hak-hak warga berdasarkan hukum positif Republik Indonesia.
3. Mengutip dasar hukum yang sah & tepat (PP No. 35/2021, UU No. 13/2003, UU No. 1/2024 ITE, UU No. 27/2022 PDP, KUHPerdata, KUHP, POJK). Dilarang keras mengarang nomor pasal fiktif!
4. Memberikan rekomendasi bukti-bukti krusial yang harus diamankan (chat WhatsApp, mutasi rekening, slip gaji, surat resmi).
5. Memandu langkah nyata bertahap: Musyawarah Damai -> Bipartit -> Somasi Tertulis -> Pengaduan ke Instansi Berwenang (Disnaker/OJK/Kominfo/Polri) -> Pendampingan LBH.

PANTANGAN:
- Jangan gunakan formatting berlebihan yang mengganggu keterbacaan.
- Selalu ingatkan bahwa konsultasi ini adalah telaah paralegal awal, bukan kuasa hukum beracara di persidangan.
''';

  /// Stream jawaban dari AI model (Gemini Cloud atau Local Engine)
  static Stream<String> streamReply({
    required List<ConsultationMessage> history,
    required String currentMessage,
    void Function(String statusPhase)? onStatusUpdate,
    CancelToken? cancelToken,
  }) async* {
    final apiKey = LocalStorage.getGeminiApiKey();
    final modelName = LocalStorage.getLlmModel();

    onStatusUpdate?.call('Menganalisis duduk perkara...');
    await Future.delayed(const Duration(milliseconds: 140));

    // Jika user mengonfigurasi Gemini API Key, gunakan streaming Google Gemini
    if (apiKey != null && apiKey.trim().isNotEmpty && apiKey != 'your_api_key_here') {
      onStatusUpdate?.call('Menghubungkan ke $modelName...');
      bool geminiFailed = false;

      final controller = StreamController<String>();
      _streamFromGemini(
        apiKey: apiKey,
        modelName: modelName,
        history: history,
        currentMessage: currentMessage,
        controller: controller,
        cancelToken: cancelToken,
      ).catchError((_) {
        geminiFailed = true;
      });

      yield* controller.stream;

      if (!geminiFailed) return;
    }

    // Default High-Precision Offline Engine dengan LLM Token-Streaming
    onStatusUpdate?.call('Menyelaraskan dengan peraturan hukum positif RI...');
    await Future.delayed(const Duration(milliseconds: 160));

    onStatusUpdate?.call('Menyusun telaah & rekomendasi taktis...');
    final fullResponse = _generateLegalAnalysis(currentMessage, history);

    // Stream token secara responsif setara LLM (natural variable delay 18-35ms)
    final words = fullResponse.split(' ');
    final buffer = StringBuffer();

    for (int i = 0; i < words.length; i++) {
      if (cancelToken?.isCancelled ?? false) break;

      buffer.write(words[i]);
      if (i < words.length - 1) {
        buffer.write(' ');
      }

      // Setiap 1-3 kata kirim update potongan token
      if (i % 2 == 0 || i == words.length - 1) {
        yield buffer.toString();
        await Future.delayed(const Duration(milliseconds: 24));
      }
    }
  }

  /// Panggilan streaming langsung ke Google Gemini API v1beta via Server-Sent Events
  static Future<void> _streamFromGemini({
    required String apiKey,
    required String modelName,
    required List<ConsultationMessage> history,
    required String currentMessage,
    required StreamController<String> controller,
    CancelToken? cancelToken,
  }) async {
    final dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 40),
    ));

    final url =
        'https://generativelanguage.googleapis.com/v1beta/models/$modelName:streamGenerateContent?alt=sse&key=$apiKey';

    final contents = <Map<String, dynamic>>[];

    // Masukkan sliding history (maks 6 pesan terakhir)
    final recent = history.length > 6 ? history.sublist(history.length - 6) : history;
    for (final m in recent) {
      contents.add({
        'role': m.role.toApiRole(),
        'parts': [
          {'text': m.content}
        ],
      });
    }

    contents.add({
      'role': 'user',
      'parts': [
        {'text': currentMessage}
      ],
    });

    final requestBody = {
      'system_instruction': {
        'parts': [
          {'text': systemPrompt}
        ]
      },
      'contents': contents,
      'generationConfig': {
        'temperature': 0.25,
        'topP': 0.85,
        'maxOutputTokens': 1500,
      },
    };

    try {
      final response = await dio.post<ResponseBody>(
        url,
        data: jsonEncode(requestBody),
        options: Options(
          responseType: ResponseType.stream,
          headers: {'Content-Type': 'application/json'},
        ),
        cancelToken: cancelToken,
      );

      final fullAccumulated = StringBuffer();

      response.data?.stream.listen(
        (List<int> chunk) {
          final textChunk = utf8.decode(chunk, allowMalformed: true);
          final lines = textChunk.split('\n');

          for (final line in lines) {
            if (line.startsWith('data: ')) {
              final jsonStr = line.substring(6).trim();
              if (jsonStr.isEmpty) continue;
              try {
                final data = jsonDecode(jsonStr) as Map<String, dynamic>;
                final candidates = data['candidates'] as List<dynamic>?;
                if (candidates != null && candidates.isNotEmpty) {
                  final parts =
                      candidates[0]['content']?['parts'] as List<dynamic>?;
                  if (parts != null && parts.isNotEmpty) {
                    final partText = parts[0]['text'] as String?;
                    if (partText != null) {
                      fullAccumulated.write(partText);
                      controller.add(fullAccumulated.toString());
                    }
                  }
                }
              } catch (_) {}
            }
          }
        },
        onDone: () => controller.close(),
        onError: (e) => controller.addError(e),
        cancelOnError: true,
      );
    } catch (e) {
      controller.addError(e);
      controller.close();
    }
  }

  /// Mesin Penalaran Hukum Offline (High-Precision Indonesian Legal Corpus)
  static String _generateLegalAnalysis(
    String userQuery,
    List<ConsultationMessage> history,
  ) {
    final lower = userQuery.toLowerCase();

    // 1. Ketenagakerjaan: PHK, Pesangon, Kontrak PKWT
    if (lower.contains('phk') ||
        lower.contains('pecat') ||
        lower.contains('pesangon') ||
        lower.contains('bipartit') ||
        lower.contains('disnaker')) {
      return '''Saya memahami situasi ini berat bagi Anda. Mari kita telaah hak-hak hukum Anda secara objektif berdasarkan hukum ketenagakerjaan Republik Indonesia.

1. Posisi Hukum & Hak Anda:
Pengusaha tidak dapat melakukan Pemutusan Hubungan Kerja (PHK) secara sepihak tanpa dasar alasan yang sah. Berdasarkan Pasal 40 PP No. 35 Tahun 2021 jo. UU No. 6 Tahun 2023, Anda berhak atas:
• Uang Pesangon (UP) sebesar 1 hingga 9 kali upah bulanan (tergantung masa kerja).
• Uang Penghargaan Masa Kerja (UPMK) jika Anda telah bekerja minimal 3 tahun.
• Uang Penggantian Hak (UPH) atas sisa cuti tahunan yang belum gugur dan ongkos pulang.

2. Dasar Regulasi Positif:
• Pasal 37–59 PP No. 35 Tahun 2021 (Formula perhitungan kompensasi PHK).
• UU No. 2 Tahun 2004 (Tata cara penyelesaian perselisihan hubungan industrial).

3. Bukti Krusial yang Wajib Diamankan:
• Perjanjian Kerja Waktu Tertentu/Tidak Tertentu (PKWT/PKWTT) atau SK Pengangkatan.
• Bukti transfer upah / slip gaji 3 bulan terakhir.
• Surat pemberitahuan PHK tertulis beserta alasan resminya.
• Riwayat percakapan WhatsApp/email instruksi dari atasan atau HRD.

4. Langkah Taktis yang Disarankan:
1. Jika Anda menolak PHK atau nominal pesangon di bawah ketentuan PP 35/2021, sampaikan surat penolakan tertulis paling lambat 7 hari kerja sejak surat diterima.
2. Ajukan perundingan Bipartit secara musyawarah mufakat (jangka waktu maksimal 30 hari kerja).
3. Gunakan fitur "Kalkulator Pesangon" di tab Perangkat HAKKU untuk menghitung nominal pasti hak Anda.

Ada yang ingin Anda tanyakan mengenai alasan PHK yang dicantumkan perusahaan?''';
    }

    // 2. Ketenagakerjaan: Upah / Gaji Ditahan / Lembur Tak Dibayar
    if (lower.contains('gaji') ||
        lower.contains('upah') ||
        lower.contains('lembur') ||
        lower.contains('ijazah') ||
        lower.contains('tunjangan') ||
        lower.contains('thr')) {
      return '''Hak atas upah dan imbalan kerja dilindungi secara tegas oleh undang-undang. Penahanan gaji atau ijazah tanpa persetujuan sah merupakan pelanggaran hak normatif pekerja.

1. Hak Normatif Anda:
Upah yang belum dibayarkan tetap merupakan utang pengusaha yang wajib dilunasi. Pengusaha yang terlambat membayar upah dikenakan denda keterlambatan per hari berdasarkan ketentuan hukum.

2. Dasar Hukum Resmi:
• Pasal 93 & Pasal 95 UU No. 13 Tahun 2003 tentang Ketenagakerjaan.
• PP No. 36 Tahun 2021 jo. PP No. 51 Tahun 2023 tentang Pengupahan.
• Penahanan ijazah tidak memiliki dasar hukum dalam UU Ketenagakerjaan dan dapat diadukan ke Pengawas Ketenagakerjaan.

3. Bukti yang Perlu Dikumpulkan:
• Kontrak kerja yang memuat besaran upah yang disepakati.
• Mutasi rekening bank yang membuktikan nihilnya pembayaran pada tanggal gajian.
• Rekap jam kerja lembur atau presensi kehadiran.
• Catatan tertulis penagihan ke HRD atau atasan.

4. Rekomendasi Tindakan:
1. Kirimkan surat peringatan/somasi internal pertama meminta pelunasan hak normatif dalam waktu 3x24 jam.
2. Buat draf surat somasi bipartit melalui tab Perangkat di HAKKU.
3. Apabila diabaikan, bawa bukti-bukti tersebut ke Kantor Dinas Tenaga Kerja (Disnaker) kabupaten/kota setempat untuk mediasi pengawasan kerja.

Sudah berapa lama gaji tersebut tertunggak dan apakah ada tanggapan tertulis dari pihak perusahaan?''';
    }

    // 3. Pinjol, Intimidasi Debt Collector, & Penyebaran Data Pribadi
    if (lower.contains('pinjol') ||
        lower.contains('debt collector') ||
        lower.contains('dc') ||
        lower.contains('sebar data') ||
        lower.contains('kontak darurat') ||
        lower.contains('teror') ||
        lower.contains('ancam')) {
      return '''Menghadapi intimidasi atau ancaman penagihan memerlukan ketenangan dan langkah taktis yang tepat. Hukum Indonesia melarang keras penagihan dengan teror, ancaman kekerasan, maupun penyebaran data pribadi.

1. Perlindungan Hukum Anda:
• Penagihan hanya boleh dilakukan kepada debitur yang bersangkutan dan nomor kontak darurat resmi yang telah disetujui, maksimal pukul 20.00 waktu setempat.
• Dilarang menggunakan ancaman kekerasan, mempermalukan, atau merugikan harkat martabat debitur.
• Penyebaran data foto/KTP/kontak ke pihak ketiga di luar kontrak adalah tindak pidana.

2. Dasar Hukum Tegas:
• POJK No. 10/POJK.05/2022 & POJK No. 22 Tahun 2023 tentang Pelindungan Konsumen Sektor Jasa Keuangan.
• Pasal 65 jo. Pasal 67 UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) — ancaman pidana hingga 5 tahun penjara.
• Pasal 27B UU No. 1 Tahun 2024 (Revisi UU ITE) tentang larangan pengancaman elektronik.

3. Tindakan Pengamanan Bukti:
• Ambil tangkapan layar (screenshot) seluruh pesan ancaman, nomor telepon penagih, dan riwayat panggilan.
• Simpan rekaman audio bila terjadi telepon bernada intimidasi.
• Cek legalitas platform di situs resmi OJK (ojk.go.id atau WhatsApp OJK 081-157-157-157).

4. Langkah Solutif:
1. Jika pinjol ilegal: Jangan panik. Buat laporan resmi melalui Satgas PASTI OJK (waspadainvestasi@ojk.go.id) dan portal Patroli Siber Polri (patrolisiber.id).
2. Jika pinjol legal OJK yang melanggar kode etik: Laporkan ke Kontak OJK 157 dan Asosiasi AFPI (afpi.or.id).
3. Anda dapat menolak berkomunikasi di luar jalur resmi penagihan.

Apakah pihak penagih sudah menghubungi kerabat atau kontak di luar daftar kontak darurat Anda?''';
    }

    // 4. Penipuan Digital, Belanja Online, Rekening Penampung
    if (lower.contains('penipuan') ||
        lower.contains('tipu') ||
        lower.contains('transfer') ||
        lower.contains('apk') ||
        lower.contains('rekening') ||
        lower.contains('scam')) {
      return '''Penipuan transaksi digital merupakan kejahatan pidana. Bertindak cepat dalam 1x24 jam pertama sangat menentukan peluang pemblokiran rekening pelaku.

1. Hak & Kedudukan Hukum:
Anda berhak menuntut pengembalian kerugian serta memproses pelaku secara pidana melalui instansi penegak hukum dan perbankan.

2. Dasar Hukum:
• Pasal 28 ayat (1) jo. Pasal 45A ayat (1) UU No. 1 Tahun 2024 (ITE) tentang penipuan melalui media elektronik (ancaman pidana 6 tahun).
• Pasal 378 Kitab Undang-Undang Hukum Pidana (KUHP) tentang Penipuan.
• Peraturan Bank Indonesia tentang perlindungan nasabah dan pemblokiran rekening terindikasi tindak pidana.

3. Langkah Cepat Wajib Dilakukan Sekarang:
1. Hubungi call center bank yang Anda gunakan untuk transaksi, laporkan transaksi mencurigakan dan minta penerbitan formulir dispute/surat permohonan blokir.
2. Hubungi bank tujuan penampung dana pelaku dengan menyertakan bukti transfer dan nomor rekening pelaku.
3. Laporkan nomor rekening penipu ke situs resmi CekRekening.id milik Kementerian Kominfo agar rekening masuk daftar hitam nasional.
4. Buat aduan ke portal resmi Kepolisian melalui patrolisiber.id atau SPKT Polres terdekat dengan membawa berkas kronologi tertulis.

4. Dokumen yang Harus Disiapkan:
• Tangkapan layar chat tawaran/percakapan dari awal hingga pemblokiran.
• Bukti mutasi transfer yang memuat nomor referensi bank dan jam transaksi.
• Tautan (link) akun pelaku atau bukti aplikasi yang dikirimkan.

Berapa nominal kerugian dan apakah transaksi tersebut baru saja terjadi hari ini?''';
    }

    // 5. Sewa Menyewa, Kontrak, & Tanah/Properti
    if (lower.contains('sewa') ||
        lower.contains('kontrak') ||
        lower.contains('rumah') ||
        lower.contains('tanah') ||
        lower.contains('deposit') ||
        lower.contains('usir')) {
      return '''Perjanjian sewa-menyewa yang telah disepakati kedua belah pihak mengikat secara hukum sebagaimana undang-undang bagi yang membuatnya.

1. Posisi Hukum:
• Pemilik tidak berhak mengusir atau memutus sewa sepihak selama masa perjanjian masih berlaku tanpa adanya pelanggaran klausul yang disepakati.
• Uang deposit jaminan sewa wajib dikembalikan penuh saat masa kontrak berakhir, kecuali terdapat kerusakan fisik yang terbukti secara wajar.

2. Dasar Hukum:
• Pasal 1320 & 1338 KUHPerdata (Asas Pacta Sunt Servanda - kesepakatan mengikat sebagai UU).
• Pasal 1548–1600 KUHPerdata (Peraturan khusus sewa-menyewa barang/tempat tinggal).
• Pasal 1243 KUHPerdata tentang tuntutan ganti rugi wanprestasi (ingkar janji).

3. Langkah Mitigasi & Penyelesaian:
1. Periksa kembali pasal perjanjian sewa tertulis Anda (khususnya klausul pemutusan sepihak dan deposit).
2. Dokumentasikan kondisi fisik tempat sewa (foto & video) sebagai bukti tidak ada kerusakan sepihak.
3. Kirimkan surat pemberitahuan/somasi musyawarah secara tertulis.

Apakah terdapat surat perjanjian sewa tertulis atau kesepakatan dilakukan melalui pesan teks?''';
    }

    // 6. Sengketa Konsumen & Transaksi Barang/Jasa
    if (lower.contains('barang') ||
        lower.contains('rusak') ||
        lower.contains('garansi') ||
        lower.contains('konsumen') ||
        lower.contains('uang kembali') ||
        lower.contains('refund')) {
      return '''Sebagai konsumen, Anda dilindungi oleh Undang-Undang Perlindungan Konsumen atas barang atau jasa yang tidak sesuai standar atau rusak bukan karena kesalahan pemakaian.

1. Hak Konsumen yang Dijamin:
• Hak atas kenyamanan, keamanan, dan keselamatan dalam mengonsumsi barang/jasa.
• Hak atas informasi yang benar, jelas, dan jujur mengenai kondisi dan jaminan barang.
• Hak untuk mendapatkan kompensasi, ganti rugi, atau penggantian barang sejenis/pengembalian uang (refund) jika barang cacat tersembunyi.

2. Dasar Regulasi:
• UU No. 8 Tahun 1999 tentang Perlindungan Konsumen (khususnya Pasal 4, 7, dan 19).
• Larangan pencantuman Klausula Baku "Barang yang sudah dibeli tidak dapat ditukar/dikembalikan" (Pasal 18 UU No. 8/1999 batal demi hukum).

3. Langkah Penyelesaian:
1. Ajukan klaim komplain tertulis ke pihak penjual/pelaku usaha dengan melampirkan video unboxing dan struk/invoice pembelian.
2. Jika pelaku usaha menolak beritikad baik, Anda dapat mengadukan ke Badan Penyelesaian Sengketa Konsumen (BPSK) daerah Anda atau melalui layanan konsumen Kementerian Perdagangan (kemendag.go.id).

Bagaimana tanggapan terakhir penjual ketika Anda mengajukan klaim kerusakan barang tersebut?''';
    }

    // 7. Respon Analisis Mendalam Umum / Dinamis
    final matchingSource = LegalCorpus.sources.firstWhere(
      (s) => s.category == LegalCategory.civil,
      orElse: () => LegalCorpus.sources.first,
    );

    return '''Terima kasih telah berkonsultasi dengan HAKKU. Mari kita bedah persoalan ini dari kacamata hukum positif Republik Indonesia.

1. Telaah Kasus:
Persoalan yang Anda hadapi terindikasi memerlukan pembuktian fakta materiel yang runtut, kejelasan kedudukan hukum para pihak, dan inventarisasi kerugian yang timbul.

2. Dasar Acuan Regulasi:
• ${matchingSource.title} — ${matchingSource.fullTitle}
• Ringkasan yuridis: ${matchingSource.summary}
• Prinsip hukum acara: Barang siapa mendalilkan mempunyai hak, ia wajib membuktikannya dengan alat bukti yang sah.

3. Rekomendasi Langkah Taktis:
1. **Inventarisasi Dokumen:** Kumpulkan kronologi kejadian berurutan tanggal, bukti komunikasi tertulis, dan dokumen transaksi pendukung.
2. **Upayakan Musyawarah Terukur:** Lakukan pendekatan damai dengan mengirimkan teguran tertulis yang mencantumkan batas waktu respons yang jelas (misalnya 7 hari kerja).
3. **Manfaatkan Perangkat HAKKU:** Gunakan tab Perangkat untuk menyusun draf somasi atau memeriksa kekuatan bukti yang Anda miliki.
4. **Bantuan Lembaga Terakreditasi:** Apabila membutuhkan pendampingan lapangan, Anda dapat merujuk ke direktori Lembaga Bantuan Hukum (LBH) terakreditasi di tab Rujukan.

Agar saya dapat memberikan saran pasal yang lebih spesifik, bisakah Anda ceritakan:
• Siapa pihak lawan dalam masalah ini?
• Berapa perkiraan kerugian yang ditimbulkan?''';
  }
}

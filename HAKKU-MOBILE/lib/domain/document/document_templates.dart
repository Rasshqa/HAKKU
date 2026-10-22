import '../intake/intake_engine.dart';
import '../../core/utils/formatters.dart';

/// Jenis draf surat formil hukum
enum LegalDocumentType {
  bipartiteRequest(
    'bipartite_request',
    'Surat Permohonan Perundingan Bipartit',
    'Surat resmi permohonan musyawarah penyelesaian hak/upah antara pekerja dan pengusaha. Syarat wajib formil sebelum mengajukan mediasi resmi ke Dinas Tenaga Kerja.',
    'Pasal 3 UU No. 2 Tahun 2004 tentang PPHI jo. PP No. 36 Tahun 2021',
    'Perselisihan hak upah, PHK sepihak, pesangon, kompensasi kontrak',
  ),
  somasiWarning(
    'somasi_warning',
    'Surat Somasi / Teguran Hukum Tertulis',
    'Surat teguran resmi yang memberikan batas waktu konkret kepada pihak lawan untuk memenuhi kewajiban hukumnya sebelum ditempuh jalur peradilan atau laporan resmi.',
    'Pasal 1238 & 1243 Kitab Undang-Undang Hukum Perdata (KUHPerdata)',
    'Sewa kamar/rumah, deposit tertahan, penipuan transaksi digital, wanprestasi kontrak',
  ),
  legalAidChronology(
    'legal_aid_chronology',
    'Lembar Kronologi Fakta & Permohonan LBH',
    'Dokumen pengantar terstruktur yang merangkum kronologi, alat bukti, dan poin masalah untuk diserahkan kepada advokat di Posbankum Pengadilan atau Lembaga Bantuan Hukum (LBH).',
    'Undang-Undang No. 16 Tahun 2011 tentang Bantuan Hukum',
    'Semua jenis perkara sebelum konsultasi dengan advokat pro bono',
  );

  final String code;
  final String title;
  final String description;
  final String legalBasis;
  final String recommendedFor;

  const LegalDocumentType(
    this.code,
    this.title,
    this.description,
    this.legalBasis,
    this.recommendedFor,
  );
}

/// Data input untuk menghasilkan surat formil
class DocumentCustomFields {
  final String senderName;
  final String senderPhone;
  final String senderAddress;
  final String recipientName;
  final String recipientAddress;
  final String recipientRoleOrTitle;
  final String letterCity;
  final int responseDeadlineDays;
  final String proposedMeetingDate;

  const DocumentCustomFields({
    this.senderName = '',
    this.senderPhone = '',
    this.senderAddress = '',
    this.recipientName = '',
    this.recipientAddress = '',
    this.recipientRoleOrTitle = '',
    this.letterCity = 'Jakarta',
    this.responseDeadlineDays = 7,
    this.proposedMeetingDate = '',
  });
}

/// Hasil naskah dokumen yang dihasilkan
class GeneratedLegalDocument {
  final LegalDocumentType type;
  final String title;
  final String legalBasis;
  final String fullText;
  final String city;
  final String dateFormatted;
  final String senderName;
  final String recipientName;

  const GeneratedLegalDocument({
    required this.type,
    required this.title,
    required this.legalBasis,
    required this.fullText,
    required this.city,
    required this.dateFormatted,
    required this.senderName,
    required this.recipientName,
  });
}

/// Engine generator dokumen hukum offline-first
class DocumentTemplateEngine {
  DocumentTemplateEngine._();

  static GeneratedLegalDocument generate({
    required LegalDocumentType type,
    required CaseFactSummary factSummary,
    required DocumentCustomFields fields,
    DateTime? currentDate,
  }) {
    final now = currentDate ?? DateTime.now();
    final dateFormatted = HakkuFormatters.formatIndonesianDate(now);
    final city = fields.letterCity.trim().isEmpty ? 'Jakarta' : fields.letterCity.trim();

    switch (type) {
      case LegalDocumentType.bipartiteRequest:
        return _generateBipartite(factSummary, fields, city, dateFormatted, now.year);
      case LegalDocumentType.somasiWarning:
        return _generateSomasi(factSummary, fields, city, dateFormatted);
      case LegalDocumentType.legalAidChronology:
        return _generateLegalAid(factSummary, fields, city, dateFormatted);
    }
  }

  static GeneratedLegalDocument _generateBipartite(
    CaseFactSummary factSummary,
    DocumentCustomFields fields,
    String city,
    String dateFormatted,
    int year,
  ) {
    final factsList = factSummary.knownFacts.isEmpty
        ? '   1. Terjadi perselisihan hak normatif ketenagakerjaan antara pekerja dan perusahaan.'
        : factSummary.knownFacts.asMap().entries.map((e) => '   ${e.key + 1}. ${e.value}').join('\n');

    final meetingDate = fields.proposedMeetingDate.trim().isEmpty
        ? '7 (tujuh) hari kerja setelah surat ini diterima'
        : fields.proposedMeetingDate.trim();

    final sender = fields.senderName.trim().isEmpty ? '[Nama Lengkap Pekerja]' : fields.senderName.trim();
    final recipient = fields.recipientName.trim().isEmpty ? '[Nama Perusahaan / Atasan]' : fields.recipientName.trim();

    final text = '''SURAT PERMOHONAN PERUNDINGAN BIPARTIT

Nomor       : 01/BIPARTIT/$year
Lampiran    : Salinan Bukti Terkait
Perihal     : Permohonan Perundingan Bipartit atas Perselisihan Hak Ketenagakerjaan

$city, $dateFormatted

Kepada Yth.
Pimpinan / Manajemen Perusahaan
$recipient
${fields.recipientAddress.trim().isEmpty ? '[Alamat Kantor Perusahaan]' : fields.recipientAddress.trim()}

Dengan hormat,

Yang bertanda tangan di bawah ini:
Nama Lengkap        : $sender
Jabatan / Pekerjaan : ${fields.recipientRoleOrTitle.trim().isEmpty ? 'Pekerja / Karyawan' : fields.recipientRoleOrTitle.trim()}
Nomor Telepon/HP    : ${fields.senderPhone.trim().isEmpty ? '[Nomor Telepon]' : fields.senderPhone.trim()}
Alamat Domisili     : ${fields.senderAddress.trim().isEmpty ? '[Alamat Tempat Tinggal]' : fields.senderAddress.trim()}

Bersama surat ini, saya menyampaikan permohonan resmi untuk diadakannya perundingan Bipartit secara musyawarah untuk mencapai mufakat, sebagaimana diwajibkan oleh Pasal 3 Undang-Undang No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial.

Adapun duduk perkara dan fakta-fakta yang mendasari permohonan ini adalah sebagai berikut:
$factsList

Berdasarkan ketentuan hukum ketenagakerjaan yang berlaku di Republik Indonesia (Undang-Undang No. 13 Tahun 2003 jo. Undang-Undang No. 6 Tahun 2023 serta Peraturan Pemerintah No. 35 & 36 Tahun 2021), hak-hak normatif pekerja wajib diselesaikan secara patut, adil, dan tepat waktu.

Demi tercapainya penyelesaian yang berkeadilan dan beriktikad baik bagi kedua belah pihak, dengan ini saya mengusulkan agar perundingan Bipartit dapat diselenggarakan pada:
Hari / Tanggal : $meetingDate
Waktu          : 10.00 WIB s/d selesai
Tempat         : Kantor Perusahaan atau Tempat yang Disepakati Bersama

Demikian surat permohonan ini saya sampaikan. Apabila dalam waktu 30 (tiga puluh) hari kerja sejak surat ini diterima perundingan tidak dapat terlaksana atau tidak mencapai kesepakatan, maka sesuai prosedur hukum yang berlaku, permasalahan ini akan saya teruskan ke Dinas Tenaga Kerja setempat untuk dimohonkan pencatatan dan mediasi hubungan industrial.

Atas perhatian dan iktikad baik Bapak/Ibu Pimpinan, saya ucapkan terima kasih.


Hormat saya,
Pemohon Perundingan,


(Materai Rp 10.000)


$sender''';

    return GeneratedLegalDocument(
      type: LegalDocumentType.bipartiteRequest,
      title: LegalDocumentType.bipartiteRequest.title,
      legalBasis: LegalDocumentType.bipartiteRequest.legalBasis,
      fullText: text,
      city: city,
      dateFormatted: dateFormatted,
      senderName: sender,
      recipientName: recipient,
    );
  }

  static GeneratedLegalDocument _generateSomasi(
    CaseFactSummary factSummary,
    DocumentCustomFields fields,
    String city,
    String dateFormatted,
  ) {
    final deadlineDays = fields.responseDeadlineDays <= 0 ? 7 : fields.responseDeadlineDays;
    final factsList = factSummary.knownFacts.isEmpty
        ? '   1. Pihak Terpanggil belum memenuhi kewajiban hukum yang telah disepakati.'
        : factSummary.knownFacts.asMap().entries.map((e) => '   ${e.key + 1}. ${e.value}').join('\n');

    final sender = fields.senderName.trim().isEmpty ? '[Nama Lengkap Pengirim]' : fields.senderName.trim();
    final recipient = fields.recipientName.trim().isEmpty ? '[Nama Pihak yang Dituju]' : fields.recipientName.trim();

    final text = '''SOMASI / TEGURAN HUKUM TERTULIS
(Pertama dan Terakhir)

$city, $dateFormatted

Kepada Yth.
$recipient
${fields.recipientAddress.trim().isEmpty ? '[Alamat Lengkap Pihak yang Dituju]' : fields.recipientAddress.trim()}

Perihal: Somasi / Teguran Hukum Tertulis atas Pelanggaran Kewajiban Hukum (Wanprestasi)

Dengan hormat,

Saya yang bertanda tangan di bawah ini:
Nama Lengkap      : $sender
Nomor Telepon/HP  : ${fields.senderPhone.trim().isEmpty ? '[Nomor Telepon]' : fields.senderPhone.trim()}
Alamat Domisili   : ${fields.senderAddress.trim().isEmpty ? '[Alamat Lengkap Pengirim]' : fields.senderAddress.trim()}

Dengan ini menyampaikan Somasi (Teguran Hukum Tertulis) kepada Saudara/i berdasarkan fakta-fakta hukum sebagai berikut:

$factsList

Bahwa berdasarkan Pasal 1238 Kitab Undang-Undang Hukum Perdata (KUHPerdata), debitur dinyatakan lalai dengan surat perintah atau dengan akta sejenis itu, atau berdasarkan perikatan itu sendiri. Tindakan Saudara/i yang belum menyelesaikan kewajiban tersebut telah menimbulkan kerugian nyata bagi saya.

TUNTUTAN SOMASI:
Melalui surat somasi ini, saya menegur dan memberikan kesempatan terakhir kepada Saudara/i untuk segera:
1. Menyelesaikan seluruh kewajiban hukum yang belum dipenuhi secara penuh dan beriktikad baik;
2. Mengembalikan hak/dana/dokumen yang menjadi hak saya tanpa potongan sepihak.

TENGGAT WAKTU PENYELESAIAN:
Saya memberikan tenggat waktu selama $deadlineDays hari kalender terhitung sejak tanggal surat ini diterima oleh Saudara/i.

PERINGATAN HUKUM:
Apabila hingga batas waktu di atas Saudara/i tetap mengabaikan somasi ini atau tidak menunjukkan iktikad baik penyelesaian, maka saya akan menempuh upaya hukum yang tegas tanpa pemberitahuan lebih lanjut, baik melalui:
1. Jalur perdata berupa gugatan ganti rugi wanprestasi di Pengadilan Negeri; dan/atau
2. Pengaduan resmi ke badan penyelesaian sengketa terkait (BPSK / Otoritas Jasa Keuangan / Kepolisian RI sesuai ranah perkara).

Segala biaya perkara dan kerugian yang timbul akibat proses hukum tersebut akan menjadi beban Saudara/i sepenuhnya.

Demikian somasi ini disampaikan untuk menjadi perhatian dan dilaksanakan dengan penuh tanggung jawab.


Hormat saya,
Pemberi Somasi,


(Materai Rp 10.000)


$sender''';

    return GeneratedLegalDocument(
      type: LegalDocumentType.somasiWarning,
      title: LegalDocumentType.somasiWarning.title,
      legalBasis: LegalDocumentType.somasiWarning.legalBasis,
      fullText: text,
      city: city,
      dateFormatted: dateFormatted,
      senderName: sender,
      recipientName: recipient,
    );
  }

  static GeneratedLegalDocument _generateLegalAid(
    CaseFactSummary factSummary,
    DocumentCustomFields fields,
    String city,
    String dateFormatted,
  ) {
    final knownList = factSummary.knownFacts.isEmpty
        ? '   1. Pemohon menghadapi persoalan hukum yang membutuhkan telaah advokat.'
        : factSummary.knownFacts.asMap().entries.map((e) => '   ${e.key + 1}. ${e.value}').join('\n');

    final unknownList = factSummary.unknownFacts.isNotEmpty
        ? factSummary.unknownFacts.map((uf) => '   - $uf').join('\n')
        : '   - Seluruh fakta dasar telah terangkum.';

    final sender = fields.senderName.trim().isEmpty ? '[Nama Lengkap Pemohon]' : fields.senderName.trim();
    final recipient = fields.recipientName.trim().isEmpty
        ? 'Pos Bantuan Hukum (Posbankum) / Lembaga Bantuan Hukum (LBH)'
        : fields.recipientName.trim();

    final text = '''LEMBAR KRONOLOGI FAKTA & PERMOHONAN KONSULTASI BANTUAN HUKUM
(Berdasarkan UU No. 16 Tahun 2011 tentang Bantuan Hukum)

Kepada Yth.
Tim Advokat / Paralegal
$recipient
${fields.recipientAddress.trim().isEmpty ? 'Kantor Layanan Setempat' : fields.recipientAddress.trim()}

$city, $dateFormatted

Perihal: Permohonan Bantuan Hukum / Konsultasi Perkara: ${factSummary.categoryLabel}

Dengan hormat,
Saya yang bertanda tangan di bawah ini:
Nama Lengkap      : $sender
Kontak HP         : ${fields.senderPhone.trim().isEmpty ? '[Nomor Telepon / WhatsApp]' : fields.senderPhone.trim()}
Domisili          : ${fields.senderAddress.trim().isEmpty ? '[Alamat Tempat Tinggal]' : fields.senderAddress.trim()}

Bersama ini saya memohon kesediaan Tim Bantuan Hukum untuk memberikan konsultasi dan pendampingan atas persoalan hukum yang sedang saya hadapi, dengan uraian kronologi fakta terstruktur sebagai berikut:

I. KRONOLOGI AWAL:
"${factSummary.originalStory}"

II. FAKTA-FAKTA YANG TELAH TERKONFIRMASI:
$knownList

III. ASPEK YANG MASIH MEMERLUKAN TELAAH HUKUM / BUKTI TAMBAHAN:
$unknownList

IV. MAKSUD DAN TUJUAN KONSULTASI:
Memahami hak-hak hukum normatif, meneliti kekuatan alat bukti yang dimiliki, serta memohon arahan/pendampingan dalam menempuh langkah musyawarah maupun prosedur hukum resmi berikutnya.

Demikian ringkasan fakta perkara ini saya sampaikan dengan sebenar-benarnya untuk bahan pertimbangan konsultasi hukum cuma-cuma (pro bono).


Pemohon Konsultasi,



$sender''';

    return GeneratedLegalDocument(
      type: LegalDocumentType.legalAidChronology,
      title: LegalDocumentType.legalAidChronology.title,
      legalBasis: LegalDocumentType.legalAidChronology.legalBasis,
      fullText: text,
      city: city,
      dateFormatted: dateFormatted,
      senderName: sender,
      recipientName: recipient,
    );
  }
}

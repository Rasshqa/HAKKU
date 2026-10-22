import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../domain/document/document_templates.dart';

/// Layanan generasi dan ekspor dokumen PDF naskah resmi formil A4
class LegalPdfService {
  LegalPdfService._();

  /// Membuat PDF resmi A4 dan membagikan / mencetak langsung
  static Future<void> generateAndShareDocument({
    required GeneratedLegalDocument document,
    String? caseCode,
  }) async {
    final pdf = pw.Document();

    final code = caseCode ?? 'HK-${DateTime.now().year}-DOK';

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.symmetric(horizontal: 40, vertical: 35),
        header: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        'HAKKU • ADVOKASI & PRA-LITIGASI WARGA',
                        style: pw.TextStyle(
                          fontWeight: pw.FontWeight.bold,
                          fontSize: 10,
                          color: PdfColor.fromInt(0xFF005BBB),
                        ),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text(
                        'Standar Korespondensi Formil Hukum Positif Republik Indonesia',
                        style: const pw.TextStyle(
                          fontSize: 8,
                          color: PdfColors.grey700,
                        ),
                      ),
                    ],
                  ),
                  pw.Container(
                    padding: const pw.EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: pw.BoxDecoration(
                      border: pw.Border.all(color: PdfColors.grey400),
                      borderRadius: const pw.BorderRadius.all(pw.Radius.circular(4)),
                    ),
                    child: pw.Text(
                      'No: $code',
                      style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold,
                        fontSize: 9,
                      ),
                    ),
                  ),
                ],
              ),
              pw.SizedBox(height: 6),
              pw.Divider(thickness: 1, color: PdfColors.grey800),
              pw.SizedBox(height: 14),
            ],
          );
        },
        footer: (pw.Context context) {
          return pw.Container(
            margin: const pw.EdgeInsets.only(top: 16),
            padding: const pw.EdgeInsets.only(top: 8),
            decoration: const pw.BoxDecoration(
              border: pw.Border(top: pw.BorderSide(color: PdfColors.grey300)),
            ),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text(
                  'Dasar Hukum: ${document.legalBasis}',
                  style: const pw.TextStyle(
                    fontSize: 7,
                    color: PdfColors.grey600,
                  ),
                ),
                pw.Text(
                  'Halaman ${context.pageNumber} dari ${context.pagesCount}',
                  style: const pw.TextStyle(
                    fontSize: 7,
                    color: PdfColors.grey600,
                  ),
                ),
              ],
            ),
          );
        },
        build: (pw.Context context) => [
          pw.Text(
            document.fullText,
            style: const pw.TextStyle(
              fontSize: 10,
              lineSpacing: 1.4,
            ),
          ),
        ],
      ),
    );

    await Printing.sharePdf(
      bytes: await pdf.save(),
      filename: 'HAKKU_${document.type.code}_$code.pdf',
    );
  }

  /// Pratinjau cetak langsung (AirPrint / Android Print Service)
  static Future<void> printDocument({
    required GeneratedLegalDocument document,
    String? caseCode,
  }) async {
    final pdf = pw.Document();
    final code = caseCode ?? 'HK-${DateTime.now().year}-DOK';

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.symmetric(horizontal: 40, vertical: 35),
        build: (pw.Context context) => [
          pw.Text(
            document.fullText,
            style: const pw.TextStyle(fontSize: 10, lineSpacing: 1.4),
          ),
        ],
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: 'HAKKU_${document.type.code}_$code',
    );
  }
}

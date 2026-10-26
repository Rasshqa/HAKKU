import 'package:flutter_test/flutter_test.dart';
import 'package:hakku_mobile/domain/contract/contract_models.dart';
import 'package:hakku_mobile/domain/contract/contract_analyzer.dart';

void main() {
  group('ContractAnalyzer Unit Tests', () {
    test('deteksi klausul probation ilegal pada PKWT (Pasal 58 UU Ketenagakerjaan)', () {
      const text = '''
      Pasal 3: Hubungan kerja ini adalah PKWT selama 1 tahun.
      Pekerja wajib menjalani masa percobaan (probation) selama 3 bulan.
      ''';

      final result = ContractAnalyzer.analyze(
        contractType: ContractDomainType.pkwtLabor,
        contractText: text,
      );

      expect(result.overallRisk, ClauseRiskSeverity.highRisk);
      expect(result.highRiskCount, greaterThanOrEqualTo(1));
      expect(
        result.findings.any((f) => f.id == 'rule-pkwt-probation'),
        isTrue,
      );
    });

    test('deteksi penahanan ijazah asli pekerja sebagai jaminan', () {
      const text = '''
      Pekerja wajib menyerahkan ijazah asli kepada perusahaan sebagai jaminan kerja
      sampai masa kontrak berakhir.
      ''';

      final result = ContractAnalyzer.analyze(
        contractType: ContractDomainType.pkwtLabor,
        contractText: text,
      );

      expect(result.overallRisk, ClauseRiskSeverity.highRisk);
      expect(
        result.findings.any((f) => f.id == 'rule-pkwt-diploma-withholding'),
        isTrue,
      );
    });

    test('deteksi pemotongan deposit sepihak pada perjanjian sewa kontrakan', () {
      const text = '''
      Pemilik berhak melakukan pemotongan deposit tanpa rincian apabila kamar dinilai kurang bersih.
      ''';

      final result = ContractAnalyzer.analyze(
        contractType: ContractDomainType.tenancyLease,
        contractText: text,
      );

      expect(
        result.findings.any((f) => f.id == 'rule-tenancy-arbitrary-deposit'),
        isTrue,
      );
    });

    test('deteksi akses kontak ponsel ilegal oleh pinjaman online (UU PDP No. 27/2022)', () {
      const text = '''
      Peminjam memberikan hak kepada kreditur untuk mengakses seluruh kontak dan akses galeri foto.
      ''';

      final result = ContractAnalyzer.analyze(
        contractType: ContractDomainType.loanService,
        contractText: text,
      );

      expect(result.overallRisk, ClauseRiskSeverity.highRisk);
      expect(
        result.findings.any((f) => f.id == 'rule-loan-contact-scraping'),
        isTrue,
      );
    });

    test('kontrak dengan klausul musyawarah terdeteksi sebagai klausul aman', () {
      const text = '''
      Apabila terjadi perselisihan, Para Pihak sepakat mengutamakan musyawarah untuk mufakat.
      Pekerja didaftarkan pada program BPJS Ketenagakerjaan.
      ''';

      final result = ContractAnalyzer.analyze(
        contractType: ContractDomainType.pkwtLabor,
        contractText: text,
      );

      expect(result.safeCount, greaterThanOrEqualTo(2));
      expect(
        result.findings.any((f) => f.id == 'safe-dispute-resolution'),
        isTrue,
      );
      expect(
        result.findings.any((f) => f.id == 'safe-bpjs-coverage'),
        isTrue,
      );
    });
  });
}

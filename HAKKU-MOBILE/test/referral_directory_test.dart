import 'package:flutter_test/flutter_test.dart';
import 'package:hakku_mobile/domain/referral/referral_directory.dart';

void main() {
  group('ReferralDirectory Unit Tests', () {
    test('memuat seluruh lembaga bantuan hukum resmi terverifikasi', () {
      final all = ReferralDirectory.organizations;
      expect(all.length, greaterThanOrEqualTo(8));
      expect(all.every((org) => org.isVerified), isTrue);
    });

    test('filter kategori ketenagakerjaan menghasilkan YLBHI dan Kemnaker/Disnaker', () {
      final laborOrgs = ReferralDirectory.search(category: 'labor');
      expect(laborOrgs.any((o) => o.id == 'ref_kemnaker_disnaker'), isTrue);
      expect(laborOrgs.any((o) => o.id == 'ref_ylbhi'), isTrue);
    });

    test('filter kategori pinjol & finansial menghasilkan Satgas PASTI OJK & Patroli Siber', () {
      final financeOrgs = ReferralDirectory.search(category: 'finance_loans');
      expect(financeOrgs.any((o) => o.id == 'ref_satgas_pasti_ojk'), isTrue);
      expect(financeOrgs.any((o) => o.id == 'ref_patroli_siber_cekrekening'), isTrue);
    });

    test('pencarian teks menemukan nama lembaga dan deskripsi', () {
      final posbankum = ReferralDirectory.search(query: 'posbankum');
      expect(posbankum.isNotEmpty, isTrue);
      expect(posbankum.first.id, 'ref_posbankum_pn_pa');

      final ojk = ReferralDirectory.search(query: 'ojk');
      expect(ojk.isNotEmpty, isTrue);
      expect(ojk.first.id, 'ref_satgas_pasti_ojk');
    });
  });
}

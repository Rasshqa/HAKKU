enum ReferralServiceType {
  lbh('LBH', 'Lembaga Bantuan Hukum'),
  posbankum('Posbankum', 'Pos Bantuan Hukum Pengadilan'),
  pemerintah('Layanan Pemerintah', 'Instansi Pemerintah Terkait'),
  lembagaKhusus('Lembaga Khusus', 'Satgas & Komisi Negara');

  final String code;
  final String label;
  const ReferralServiceType(this.code, this.label);
}

class ReferralOrganization {
  final String id;
  final String name;
  final ReferralServiceType serviceType;
  final String jurisdiction;
  final String? phone;
  final String website;
  final String? addressSummary;
  final String feePolicy;
  final String description;
  final List<String> categories;
  final bool isVerified;
  final String verifiedAt;

  const ReferralOrganization({
    required this.id,
    required this.name,
    required this.serviceType,
    required this.jurisdiction,
    this.phone,
    required this.website,
    this.addressSummary,
    required this.feePolicy,
    required this.description,
    required this.categories,
    required this.isVerified,
    required this.verifiedAt,
  });
}

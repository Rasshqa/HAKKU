import 'referral_models.dart';

class ReferralDirectory {
  static const List<ReferralOrganization> organizations = [
    ReferralOrganization(
      id: 'ref_ylbhi',
      name:
          'Yayasan Lembaga Bantuan Hukum Indonesia (YLBHI / LBH Kantor Cabang)',
      serviceType: ReferralServiceType.lbh,
      jurisdiction: 'Nasional (18 Kantor Bantuan Hukum se-Indonesia)',
      website: 'https://ylbhi.or.id',
      phone: '(021) 3145518',
      addressSummary:
          'Jl. Diponegoro No. 74, Menteng, Jakarta Pusat (dan cabang daerah)',
      feePolicy: 'Cuma-cuma (Gratis bagi warga tidak mampu)',
      description:
          'Memberikan bantuan hukum struktural, konsultasi, dan pendampingan perkara cuma-cuma bagi masyarakat miskin, buta hukum, dan tertindas.',
      categories: [
        'labor',
        'tenancy_contract',
        'property_land',
        'general_dispute',
        'family_inheritance',
      ],
      isVerified: true,
      verifiedAt: '2026-01-10',
    ),
    ReferralOrganization(
      id: 'ref_posbankum_pn_pa',
      name:
          'Pos Bantuan Hukum (Posbankum) Pengadilan Negeri & Pengadilan Agama',
      serviceType: ReferralServiceType.posbankum,
      jurisdiction:
          'Tersedia di setiap kantor Pengadilan Negeri & Pengadilan Agama se-Indonesia',
      website: 'https://badilum.mahkamahagung.go.id',
      feePolicy: 'Cuma-cuma (Gratis bagi warga tidak mampu)',
      description:
          'Layanan bantuan hukum resmi bentukan Mahkamah Agung RI untuk konsultasi hukum, pembuatan dokumen gugatan/permohonan, dan informasi hukum tanpa biaya bagi warga yang membutuhkan.',
      categories: [
        'family_inheritance',
        'tenancy_contract',
        'property_land',
        'general_dispute',
      ],
      isVerified: true,
      verifiedAt: '2026-01-12',
    ),
    ReferralOrganization(
      id: 'ref_kemnaker_disnaker',
      name:
          'Layanan Hubungan Industrial Kementerian Ketenagakerjaan (Kemnaker / Disnaker)',
      serviceType: ReferralServiceType.pemerintah,
      jurisdiction:
          'Kantor Disnaker Kabupaten / Kota setempat & Portal SIAPkerja',
      website: 'https://kemnaker.go.id',
      phone: '1500715',
      feePolicy: 'Layanan Publik Resmi',
      description:
          'Fasilitasi mediasi perselisihan hak, perselisihan kepentingan, perselisihan PHK, dan perselisihan antar serikat pekerja.',
      categories: ['labor'],
      isVerified: true,
      verifiedAt: '2026-01-15',
    ),
    ReferralOrganization(
      id: 'ref_satgas_pasti_ojk',
      name:
          'Kontak OJK 157 & Satgas Pemberantasan Aktivitas Keuangan Ilegal (Satgas PASTI)',
      serviceType: ReferralServiceType.lembagaKhusus,
      jurisdiction: 'Nasional',
      website: 'https://konsumen.ojk.go.id',
      phone: '157',
      feePolicy: 'Layanan Publik Resmi',
      description:
          'Saluran resmi pengaduan konsumen jasa keuangan, pinjaman online ilegal, penagihan melanggar etika, dan permohonan pemblokiran rekening penipuan keuangan.',
      categories: ['finance_loans', 'consumer_digital'],
      isVerified: true,
      verifiedAt: '2026-01-14',
    ),
    ReferralOrganization(
      id: 'ref_patroli_siber_cekrekening',
      name: 'Direktorat Tindak Pidana Siber Polri & Portal CekRekening.id',
      serviceType: ReferralServiceType.pemerintah,
      jurisdiction: 'Nasional',
      website: 'https://patrolisiber.id',
      feePolicy: 'Layanan Publik Resmi',
      description:
          'Pusat pelaporan kejahatan siber, penipuan transaksi elektronik, phising, dan registrasi rekening bank penampung tindak pidana untuk dibekukan.',
      categories: ['consumer_digital', 'finance_loans'],
      isVerified: true,
      verifiedAt: '2026-01-10',
    ),
    ReferralOrganization(
      id: 'ref_bpsk',
      name: 'Badan Penyelesaian Sengketa Konsumen (BPSK)',
      serviceType: ReferralServiceType.lembagaKhusus,
      jurisdiction: 'Dinas Perdagangan Provinsi / Kabupaten / Kota',
      website: 'https://kemendag.go.id',
      feePolicy: 'Layanan Publik Resmi',
      description:
          'Menyelesaikan sengketa antara konsumen dan pelaku usaha melalui konsiliasi, mediasi, atau arbitrase di luar peradilan umum.',
      categories: ['consumer_digital', 'general_dispute'],
      isVerified: true,
      verifiedAt: '2026-01-11',
    ),
    ReferralOrganization(
      id: 'ref_sapa_129',
      name: 'Layanan Sahabat Perempuan dan Anak (SAPA 129 KemenPPPA)',
      serviceType: ReferralServiceType.pemerintah,
      jurisdiction: 'Nasional',
      website: 'https://kemenpppa.go.id',
      phone: '129',
      feePolicy: 'Layanan Publik Resmi',
      description:
          'Penanganan pengaduan kekerasan terhadap perempuan dan anak, mediasi kekeluargaan, bantuan hukum cuma-cuma, dan rujukan rumah aman.',
      categories: ['family_inheritance', 'general_dispute'],
      isVerified: true,
      verifiedAt: '2026-01-12',
    ),
    ReferralOrganization(
      id: 'ref_bpn_agraria',
      name: 'Kantor Pertanahan / Kementerian ATR/BPN',
      serviceType: ReferralServiceType.pemerintah,
      jurisdiction:
          'Kantor Pertanahan Kabupaten/Kota Seluruh Indonesia & Aplikasi Sentuh Tanahku',
      website: 'https://www.atrbpn.go.id',
      phone: '138',
      feePolicy: 'Layanan Publik Resmi',
      description:
          'Pengecekan keabsahan sertipikat tanah, pendaftaran hak, mediasi sengketa batas tanah dan tumpang tindih kepemilikan tanah.',
      categories: ['property_land'],
      isVerified: true,
      verifiedAt: '2026-01-13',
    ),
  ];

  static List<ReferralOrganization> search({
    String? category,
    String? query,
  }) {
    return organizations.where((org) {
      if (category != null && category.isNotEmpty && category != 'all') {
        if (!org.categories.contains(category)) return false;
      }
      if (query != null && query.trim().isNotEmpty) {
        final q = query.toLowerCase().trim();
        final match = org.name.toLowerCase().contains(q) ||
            org.description.toLowerCase().contains(q) ||
            org.jurisdiction.toLowerCase().contains(q) ||
            org.serviceType.label.toLowerCase().contains(q);
        if (!match) return false;
      }
      return true;
    }).toList();
  }
}

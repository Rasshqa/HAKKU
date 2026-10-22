import { CaseCategory } from "../intake/types";

export interface ReferralOrganization {
  id: string;
  name: string;
  serviceType: "LBH" | "Posbankum" | "Layanan Pemerintah" | "Lembaga Khusus";
  jurisdiction: string;
  phone?: string;
  website: string;
  addressSummary?: string;
  feePolicy: "Cuma-cuma (Gratis bagi warga tidak mampu)" | "Layanan Publik Resmi" | "Bantuan Subsidi";
  description: string;
  categories: CaseCategory[];
  verificationStatus: "verified" | "needs_review";
  verifiedAt: string;
}

export const VERIFIED_REFERRAL_SERVICES: ReferralOrganization[] = [
  {
    id: "ref_ylbhi",
    name: "Yayasan Lembaga Bantuan Hukum Indonesia (YLBHI / LBH Kantor Cabang)",
    serviceType: "LBH",
    jurisdiction: "Nasional (18 Kantor Bantuan Hukum di Seluruh Indonesia)",
    website: "https://ylbhi.or.id",
    phone: "(021) 3145518",
    addressSummary: "Jl. Diponegoro No. 74, Menteng, Jakarta Pusat (dan cabang daerah)",
    feePolicy: "Cuma-cuma (Gratis bagi warga tidak mampu)",
    description:
      "Memberikan bantuan hukum struktural, konsultasi, dan pendampingan perkara cuma-cuma bagi masyarakat miskin, buta hukum, dan tertindas.",
    categories: ["labor", "tenancy_contract", "property_land", "general_dispute", "family_inheritance"],
    verificationStatus: "verified",
    verifiedAt: "2026-01-10",
  },
  {
    id: "ref_posbankum_pn_pa",
    name: "Pos Bantuan Hukum (Posbankum) Pengadilan Negeri & Pengadilan Agama",
    serviceType: "Posbankum",
    jurisdiction: "Tersedia di setiap kantor Pengadilan Negeri dan Pengadilan Agama se-Indonesia",
    website: "https://badilum.mahkamahagung.go.id",
    feePolicy: "Cuma-cuma (Gratis bagi warga tidak mampu)",
    description:
      "Layanan bantuan hukum resmi bentukan Mahkamah Agung RI untuk pemberian konsultasi hukum, pembuatan dokumen gugatan/permohonan, dan informasi hukum tanpa biaya bagi warga yang membutuhkan.",
    categories: ["family_inheritance", "tenancy_contract", "property_land", "general_dispute"],
    verificationStatus: "verified",
    verifiedAt: "2026-01-12",
  },
  {
    id: "ref_kemnaker_disnaker",
    name: "Layanan Hubungan Industrial Kementerian Ketenagakerjaan (Kemnaker / Disnaker)",
    serviceType: "Layanan Pemerintah",
    jurisdiction: "Kantor Disnaker Kabupaten / Kota setempat & Portal SIAPkerja",
    website: "https://kemnaker.go.id",
    phone: "Call Center 1500715",
    feePolicy: "Layanan Publik Resmi",
    description:
      "Fasilitasi mediasi perselisihan hak, perselisihan kepentingan, perselisihan PHK, dan perselisihan antar serikat pekerja.",
    categories: ["labor"],
    verificationStatus: "verified",
    verifiedAt: "2026-01-15",
  },
  {
    id: "ref_satgas_pasti_ojk",
    name: "Kontak OJK 157 & Satuan Tugas Pemberantasan Aktivitas Keuangan Ilegal (Satgas PASTI)",
    serviceType: "Lembaga Khusus",
    jurisdiction: "Nasional",
    website: "https://konsumen.ojk.go.id",
    phone: "Hotline 157 / WhatsApp 081-157-157-157",
    feePolicy: "Layanan Publik Resmi",
    description:
      "Saluran resmi pengaduan konsumen jasa keuangan, pinjaman online ilegal, penagihan melanggar etika, dan pemblokiran rekening penipuan keuangan.",
    categories: ["finance_loans", "consumer_digital"],
    verificationStatus: "verified",
    verifiedAt: "2026-01-14",
  },
  {
    id: "ref_patroli_siber_cekrekening",
    name: "Direktorat Tindak Pidana Siber Polri & Portal CekRekening.id",
    serviceType: "Layanan Pemerintah",
    jurisdiction: "Nasional",
    website: "https://patrolisiber.id",
    feePolicy: "Layanan Publik Resmi",
    description:
      "Pusat pelaporan kejahatan siber, penipuan transaksi elektronik, phising, dan registrasi rekening bank penampung tindak pidana untuk dibekukan.",
    categories: ["consumer_digital", "finance_loans"],
    verificationStatus: "verified",
    verifiedAt: "2026-01-10",
  },
  {
    id: "ref_bpsk",
    name: "Badan Penyelesaian Sengketa Konsumen (BPSK)",
    serviceType: "Lembaga Khusus",
    jurisdiction: "Dinas Perdagangan Provinsi / Kabupaten / Kota",
    website: "https://kemendag.go.id",
    feePolicy: "Layanan Publik Resmi",
    description:
      "Menyelesaikan sengketa antara konsumen dan pelaku usaha melalui konsiliasi, mediasi, atau arbitrase di luar peradilan umum.",
    categories: ["consumer_digital", "general_dispute"],
    verificationStatus: "verified",
    verifiedAt: "2026-01-11",
  },
  {
    id: "ref_sapa_129",
    name: "Layanan Sahabat Perempuan dan Anak (SAPA 129 KemenPPPA)",
    serviceType: "Layanan Pemerintah",
    jurisdiction: "Nasional",
    website: "https://kemenpppa.go.id",
    phone: "Hotline 129 / WhatsApp 08111-129-129",
    feePolicy: "Layanan Publik Resmi",
    description:
      "Penanganan pengaduan kekerasan terhadap perempuan dan anak, termasuk mediasi kekeluargaan, bantuan hukum cuma-cuma, dan rumah perlindungan aman.",
    categories: ["family_inheritance", "general_dispute"],
    verificationStatus: "verified",
    verifiedAt: "2026-01-12",
  },
  {
    id: "ref_bpn_agraria",
    name: "Kantor Pertanahan / Kementerian ATR/BPN",
    serviceType: "Layanan Pemerintah",
    jurisdiction: "Kantor Pertanahan Kabupaten/Kota Seluruh Indonesia",
    website: "https://www.atrbpn.go.id",
    phone: "Call Center 137",
    feePolicy: "Layanan Publik Resmi",
    description:
      "Pelayanan mediasi sengketa batas tanah, pengembalian batas sertifikat, pengecekan keabsahan warkah, dan sertifikasi tanah.",
    categories: ["property_land"],
    verificationStatus: "verified",
    verifiedAt: "2026-01-10",
  },
];

/**
 * Filter organisasi rujukan yang relevan dengan kategori perkara pengguna
 */
export function getReferralsByCategory(category: CaseCategory): ReferralOrganization[] {
  const matching = VERIFIED_REFERRAL_SERVICES.filter((org) =>
    org.categories.includes(category)
  );

  // Jika hasil sedikit, tambahkan opsi Posbankum & YLBHI sebagai payung nasional
  if (matching.length === 0) {
    return VERIFIED_REFERRAL_SERVICES.filter(
      (org) => org.id === "ref_posbankum_pn_pa" || org.id === "ref_ylbhi"
    );
  }

  return matching;
}

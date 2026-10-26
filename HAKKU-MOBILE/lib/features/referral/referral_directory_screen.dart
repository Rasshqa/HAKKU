import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../domain/referral/referral_models.dart';
import '../../domain/referral/referral_directory.dart';

class ReferralDirectoryScreen extends StatefulWidget {
  const ReferralDirectoryScreen({super.key});

  @override
  State<ReferralDirectoryScreen> createState() =>
      _ReferralDirectoryScreenState();
}

class _ReferralDirectoryScreenState extends State<ReferralDirectoryScreen> {
  String _selectedCategory = 'all';
  final TextEditingController _searchController = TextEditingController();
  List<ReferralOrganization> _filteredOrgs = [];

  static const List<Map<String, String>> _categories = [
    {'id': 'all', 'label': 'Semua Lembaga'},
    {'id': 'labor', 'label': 'Ketenagakerjaan & PHK'},
    {'id': 'finance_loans', 'label': 'Pinjol & Finansial'},
    {'id': 'consumer_digital', 'label': 'Konsumen & E-Commerce'},
    {'id': 'tenancy_contract', 'label': 'Sewa & Hunian'},
    {'id': 'property_land', 'label': 'Tanah & Waris'},
    {'id': 'family_inheritance', 'label': 'Perempuan & Keluarga'},
  ];

  @override
  void initState() {
    super.initState();
    _applyFilter();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _applyFilter() {
    setState(() {
      _filteredOrgs = ReferralDirectory.search(
        category: _selectedCategory,
        query: _searchController.text,
      );
    });
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final cleanPhone = phoneNumber.replaceAll(RegExp(r'[^0-9+]'), '');
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: cleanPhone,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Tidak dapat membuka panggilan ke $phoneNumber'),
          ),
        );
      }
    }
  }

  Future<void> _openWebsite(String url) async {
    final Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Tidak dapat membuka tautan $url'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HakkuColors.background,
      appBar: AppBar(
        title: const Text(
          'Direktori Bantuan Hukum (LBH)',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        backgroundColor: HakkuColors.cardSurface,
        elevation: 0,
      ),
      body: Column(
        children: [
          _buildSearchAndFilters(),
          Expanded(
            child: _filteredOrgs.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredOrgs.length,
                    itemBuilder: (context, index) {
                      final org = _filteredOrgs[index];
                      return _buildOrgCard(org, index);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      color: HakkuColors.cardSurface,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _searchController,
            onChanged: (_) => _applyFilter(),
            decoration: InputDecoration(
              hintText: 'Cari nama lembaga, kota, atau jenis bantuan...',
              hintStyle: const TextStyle(
                fontSize: 12,
                color: HakkuColors.textMuted,
              ),
              prefixIcon: const Icon(
                Icons.search,
                size: 20,
                color: HakkuColors.textMuted,
              ),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 16),
                      onPressed: () {
                        _searchController.clear();
                        _applyFilter();
                      },
                    )
                  : null,
              filled: true,
              fillColor: HakkuColors.background,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: HakkuColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: HakkuColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(
                  color: HakkuColors.primary,
                  width: 1.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat['id'];
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: FilterChip(
                    label: Text(
                      cat['label']!,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.normal,
                        color: isSelected
                            ? HakkuColors.primary
                            : HakkuColors.textMuted,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: HakkuColors.primaryLight,
                    backgroundColor: HakkuColors.background,
                    side: BorderSide(
                      color: isSelected
                          ? HakkuColors.primary
                          : HakkuColors.border,
                    ),
                    onSelected: (selected) {
                      setState(() {
                        _selectedCategory = cat['id']!;
                      });
                      _applyFilter();
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrgCard(ReferralOrganization org, int index) {
    final isFree = org.feePolicy.toLowerCase().contains('cuma-cuma') ||
        org.feePolicy.toLowerCase().contains('gratis');

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: HakkuColors.cardSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HakkuColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  org.name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: HakkuColors.textMain,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: HakkuColors.primaryLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  org.serviceType.code,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: HakkuColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isFree
                      ? HakkuColors.successLight
                      : HakkuColors.warningLight,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isFree ? Icons.check_circle : Icons.info_outline,
                      size: 11,
                      color: isFree
                          ? HakkuColors.success
                          : HakkuColors.warning,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      org.feePolicy,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isFree
                            ? HakkuColors.success
                            : HakkuColors.warning,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              const Icon(
                Icons.verified,
                size: 12,
                color: HakkuColors.primary,
              ),
              const SizedBox(width: 3),
              const Text(
                'Terverifikasi',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: HakkuColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            org.description,
            style: const TextStyle(
              fontSize: 12,
              color: HakkuColors.textMain,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 14,
                color: HakkuColors.textMuted,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  org.jurisdiction +
                      (org.addressSummary != null
                          ? ' — ${org.addressSummary}'
                          : ''),
                  style: const TextStyle(
                    fontSize: 11,
                    color: HakkuColors.textMuted,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              if (org.phone != null) ...[
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: HakkuColors.primary,
                      foregroundColor: HakkuColors.textOnPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    onPressed: () => _makePhoneCall(org.phone!),
                    icon: const Icon(Icons.call, size: 14),
                    label: Text(
                      'Hubungi ${org.phone}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: HakkuColors.primary,
                    side: const BorderSide(color: HakkuColors.primary),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () => _openWebsite(org.website),
                  icon: const Icon(Icons.open_in_browser, size: 14),
                  label: const Text(
                    'Buka Portal',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 200.ms, delay: (index * 40).ms);
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.search_off,
              size: 48,
              color: HakkuColors.textMuted,
            ),
            const SizedBox(height: 12),
            const Text(
              'Lembaga Bantuan Tidak Ditemukan',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: HakkuColors.textMain,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Coba gunakan kata kunci lain atau pilih filter kategori "Semua Lembaga".',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: HakkuColors.textMuted),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                _searchController.clear();
                setState(() {
                  _selectedCategory = 'all';
                });
                _applyFilter();
              },
              child: const Text('Reset Pencarian'),
            ),
          ],
        ),
      ),
    );
  }
}

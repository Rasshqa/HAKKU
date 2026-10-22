import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../domain/calculator/calculator_models.dart';
import '../../domain/calculator/calculator_engine.dart';

class CalculatorScreen extends StatefulWidget {
  const CalculatorScreen({super.key});

  @override
  State<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen> {
  ContractType _contractType = ContractType.pkwtt;
  final TextEditingController _salaryController =
      TextEditingController(text: '6500000');
  final TextEditingController _leaveController =
      TextEditingController(text: '0');
  final TextEditingController _remainingContractController =
      TextEditingController(text: '0');

  DateTime _startDate = DateTime.now().subtract(const Duration(days: 365 * 3));
  DateTime _endDate = DateTime.now();
  TerminationReason _reason = TerminationReason.efficiency;

  CompensationBreakdown? _result;

  @override
  void initState() {
    super.initState();
    _calculate();
  }

  @override
  void dispose() {
    _salaryController.dispose();
    _leaveController.dispose();
    _remainingContractController.dispose();
    super.dispose();
  }

  void _calculate() {
    final salary = double.tryParse(
          _salaryController.text.replaceAll(RegExp(r'[^0-9]'), ''),
        ) ??
        0;
    final leaveDays = int.tryParse(_leaveController.text) ?? 0;
    final remainingMonths =
        int.tryParse(_remainingContractController.text) ?? 0;

    final breakdown = StatutoryCalculatorEngine.calculateSeverance(
      contractType: _contractType,
      monthlySalary: salary,
      startDate: _startDate,
      endDate: _endDate,
      reason: _reason,
      unusedLeaveDays: leaveDays,
      remainingContractMonths: remainingMonths,
    );

    setState(() {
      _result = breakdown;
    });
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final initial = isStart ? _startDate : _endDate;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2000),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      locale: const Locale('id', 'ID'),
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate.isBefore(_startDate)) {
            _endDate = _startDate.add(const Duration(days: 30));
          }
        } else {
          _endDate = picked;
          if (_endDate.isBefore(_startDate)) {
            _startDate = _endDate.subtract(const Duration(days: 30));
          }
        }
      });
      _calculate();
    }
  }

  @override
  Widget build(BuildContext context) {
    final tenureDays = _endDate.difference(_startDate).inDays;
    final tenureYears = (tenureDays / 365.25).toStringAsFixed(1);
    final tenureMonths = (tenureDays / 30.4167).floor();

    return Scaffold(
      backgroundColor: HakkuColors.background,
      appBar: AppBar(
        title: const Text('Kalkulator Pesangon'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner Info PP 35/2021
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: HakkuColors.primaryLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HakkuColors.primary.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified, color: HakkuColors.primary, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: pwCrossAxisAlignment(CrossAxisAlignment.start),
                    children: [
                      const Text(
                        'Formula Statuter PP No. 35/2021',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: HakkuColors.primary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '100% Offline & Sesuai Pasal 40–52 PP 35/2021 jo. UU No. 6/2023.',
                        style: TextStyle(
                          fontSize: 11,
                          color: HakkuColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 300.ms),

          const SizedBox(height: 16),

          // Tipe Kontrak Switch
          Container(
            decoration: BoxDecoration(
              color: HakkuColors.cardSurface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HakkuColors.border),
            ),
            padding: const EdgeInsets.all(4),
            child: Row(
              children: [
                Expanded(
                  child: _ContractTypeTab(
                    label: 'PKWTT (Tetap)',
                    isSelected: _contractType == ContractType.pkwtt,
                    onTap: () {
                      HapticFeedback.lightImpact();
                      setState(() => _contractType = ContractType.pkwtt);
                      _calculate();
                    },
                  ),
                ),
                Expanded(
                  child: _ContractTypeTab(
                    label: 'PKWT (Kontrak)',
                    isSelected: _contractType == ContractType.pkwt,
                    onTap: () {
                      HapticFeedback.lightImpact();
                      setState(() => _contractType = ContractType.pkwt);
                      _calculate();
                    },
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Form Input Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: HakkuColors.cardSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: HakkuColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Data Ketenagakerjaan',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),

                // Upah Bulanan
                Text(
                  'Upah Bulanan (Pokok + Tunjangan Tetap)',
                  style: TextStyle(fontSize: 12, color: HakkuColors.textMuted),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _salaryController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(
                    prefixText: 'Rp ',
                    hintText: '6.500.000',
                  ),
                  onChanged: (_) => _calculate(),
                ),

                const SizedBox(height: 14),

                // Periode Kerja
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Mulai Kerja',
                            style: TextStyle(
                              fontSize: 12,
                              color: HakkuColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: 6),
                          InkWell(
                            onTap: () => _selectDate(context, true),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                border: Border.all(color: HakkuColors.border),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.calendar_today,
                                    size: 16,
                                    color: HakkuColors.primary,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      HakkuFormatters.formatShortDate(_startDate),
                                      style: const TextStyle(fontSize: 13),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Akhir Kerja / PHK',
                            style: TextStyle(
                              fontSize: 12,
                              color: HakkuColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: 6),
                          InkWell(
                            onTap: () => _selectDate(context, false),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                border: Border.all(color: HakkuColors.border),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.calendar_today,
                                    size: 16,
                                    color: HakkuColors.accent,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      HakkuFormatters.formatShortDate(_endDate),
                                      style: const TextStyle(fontSize: 13),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: HakkuColors.background,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.timer_outlined,
                          size: 16, color: HakkuColors.textMuted),
                      const SizedBox(width: 6),
                      Text(
                        'Masa Kerja Terhitung: $tenureYears tahun ($tenureMonths bulan)',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // Alasan Pemutusan Hubungan Kerja
                if (_contractType == ContractType.pkwtt) ...[
                  Text(
                    'Alasan Pemutusan Hubungan Kerja (PHK)',
                    style: TextStyle(fontSize: 12, color: HakkuColors.textMuted),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: HakkuColors.border),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<TerminationReason>(
                        value: _reason,
                        isExpanded: true,
                        items: TerminationReason.values.map((r) {
                          return DropdownMenuItem(
                            value: r,
                            child: Text(
                              r.label,
                              style: const TextStyle(fontSize: 13),
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() => _reason = val);
                            _calculate();
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Sisa Cuti Tahunan yang Belum Gugur (Hari)',
                    style: TextStyle(fontSize: 12, color: HakkuColors.textMuted),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _leaveController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: const InputDecoration(
                      hintText: '0',
                      suffixText: 'hari',
                    ),
                    onChanged: (_) => _calculate(),
                  ),
                ] else ...[
                  Text(
                    'Sisa Masa Kontrak yang Diputus Sepihak (Bulan)',
                    style: TextStyle(fontSize: 12, color: HakkuColors.textMuted),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _remainingContractController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: const InputDecoration(
                      hintText: '0',
                      suffixText: 'bulan',
                    ),
                    onChanged: (_) => _calculate(),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Hasil Kalkulasi Statuter Card
          if (_result != null) ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: HakkuColors.cardSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: HakkuColors.primary.withValues(alpha: 0.5),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: HakkuColors.primary.withValues(alpha: 0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Estimasi Hak Kompensasi',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: HakkuColors.successLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'PP 35/2021',
                          style: TextStyle(
                            color: HakkuColors.success,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TweenAnimationBuilder<double>(
                    key: ValueKey('${_contractType.name}_${_result!.grandTotal}'),
                    tween: Tween<double>(begin: 0, end: _result!.grandTotal),
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeOutCubic,
                    builder: (context, value, child) {
                      return Text(
                        HakkuFormatters.formatRupiah(value),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: HakkuColors.primary,
                          letterSpacing: -0.5,
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  // Animated Proportional Breakdown Bar
                  if (_result!.grandTotal > 0) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: SizedBox(
                        height: 8,
                        child: Row(
                          children: [
                            if (_result!.severancePay > 0)
                              Expanded(
                                flex: (_result!.severancePay).round().clamp(1, 100000000),
                                child: Container(color: HakkuColors.primary),
                              ),
                            if (_result!.longServicePay > 0)
                              Expanded(
                                flex: (_result!.longServicePay).round().clamp(1, 100000000),
                                child: Container(color: HakkuColors.accent),
                              ),
                            if (_result!.rightsReplacementPay > 0)
                              Expanded(
                                flex: (_result!.rightsReplacementPay).round().clamp(1, 100000000),
                                child: Container(color: HakkuColors.success),
                              ),
                            if (_result!.contractCompensation > 0)
                              Expanded(
                                flex: (_result!.contractCompensation).round().clamp(1, 100000000),
                                child: Container(color: HakkuColors.primary),
                              ),
                            if (_result!.remainingContractDamages > 0)
                              Expanded(
                                flex: (_result!.remainingContractDamages).round().clamp(1, 100000000),
                                child: Container(color: HakkuColors.accent),
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Komposisi Kompensasi Statuter',
                          style: TextStyle(fontSize: 10, color: HakkuColors.textMuted),
                        ),
                        Text(
                          'PP 35/2021',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: HakkuColors.primary),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 14),
                  const Divider(),
                  const SizedBox(height: 8),

                  if (_contractType == ContractType.pkwtt) ...[
                    _ResultRow(
                      label: 'Uang Pesangon (UP)',
                      sublabel: 'Pasal 40 ayat 2 (${_reason.upMultiplier}x)',
                      amount: _result!.severancePay,
                    ),
                    _ResultRow(
                      label: 'Uang Penghargaan Masa Kerja (UPMK)',
                      sublabel: 'Pasal 40 ayat 3 (${_reason.upmkMultiplier}x)',
                      amount: _result!.longServicePay,
                    ),
                    _ResultRow(
                      label: 'Uang Penggantian Hak (UPH)',
                      sublabel: 'Pasal 40 ayat 4 (Cuti & Ongkos)',
                      amount: _result!.rightsReplacementPay,
                    ),
                  ] else ...[
                    _ResultRow(
                      label: 'Kompensasi PKWT',
                      sublabel: 'Pasal 15 ((Masa Kerja / 12) * Upah)',
                      amount: _result!.contractCompensation,
                    ),
                    _ResultRow(
                      label: 'Ganti Rugi Sisa Kontrak',
                      sublabel: 'Pasal 17 (Sisa Bulan x Upah)',
                      amount: _result!.remainingContractDamages,
                    ),
                  ],

                  const SizedBox(height: 16),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            final text =
                                'Estimasi Hak Kompensasi HAKKU:\nTotal: ${HakkuFormatters.formatRupiah(_result!.grandTotal)}\nDasar: PP No. 35/2021';
                            Clipboard.setData(ClipboardData(text: text));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Rincian disalin ke papan klip!'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                          icon: const Icon(Icons.copy, size: 18),
                          label: const Text('Salin'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            context.push('/perangkat/dokumen');
                          },
                          icon: const Icon(Icons.description, size: 18),
                          label: const Text('Buat Surat'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ).animate().slideY(begin: 0.1, duration: 250.ms).fadeIn(),
          ],

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

CrossAxisAlignment pwCrossAxisAlignment(CrossAxisAlignment val) => val;

class _ContractTypeTab extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ContractTypeTab({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? HakkuColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              color: isSelected ? Colors.white : HakkuColors.textMuted,
            ),
          ),
        ),
      ),
    );
  }
}

class _ResultRow extends StatelessWidget {
  final String label;
  final String sublabel;
  final double amount;

  const _ResultRow({
    required this.label,
    required this.sublabel,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  sublabel,
                  style: TextStyle(
                    fontSize: 11,
                    color: HakkuColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          Text(
            HakkuFormatters.formatRupiah(amount),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: HakkuColors.textMain,
            ),
          ),
        ],
      ),
    );
  }
}

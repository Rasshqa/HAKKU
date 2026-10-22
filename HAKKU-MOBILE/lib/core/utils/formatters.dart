import 'dart:math';
import 'package:intl/intl.dart';

/// Utilitas format terpusat HAKKU — setara dengan lib/formatters.ts di web
class HakkuFormatters {
  HakkuFormatters._();

  static final NumberFormat _rupiahFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  static final DateFormat _indonesianDateFormat =
      DateFormat('d MMMM yyyy', 'id_ID');
  static final DateFormat _shortDateFormat = DateFormat('d MMM yyyy', 'id_ID');

  /// Format angka ke Rupiah standar Indonesia — misal: Rp 5.500.000
  static String formatRupiah(num amount) {
    return _rupiahFormat.format(amount);
  }

  /// Format tanggal formal Indonesia — misal: 21 Oktober 2026
  static String formatIndonesianDate(DateTime date) {
    return _indonesianDateFormat.format(date);
  }

  /// Format tanggal pendek — misal: 21 Okt 2026
  static String formatShortDate(DateTime date) {
    return _shortDateFormat.format(date);
  }

  /// Hasilkan kode kasus unik acak format HK-YYYY-XXXX
  static String generateCaseCode() {
    final year = DateTime.now().year;
    final random = Random.secure();
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    final randomStr =
        List.generate(4, (_) => chars[random.nextInt(chars.length)]).join();
    return 'HK-$year-$randomStr';
  }

  /// Hitung selisih hari antara dua tanggal (positif = masa depan)
  static int daysBetween(DateTime from, DateTime to) {
    return to.difference(from).inDays;
  }

  /// Format durasi countdown — misal: "3 hari lagi" atau "Sudah terlewat"
  static String formatCountdown(DateTime deadline) {
    final diff = daysBetween(DateTime.now(), deadline);
    if (diff < 0) return 'Sudah terlewat ${diff.abs()} hari';
    if (diff == 0) return 'Hari ini adalah batas akhir';
    if (diff == 1) return '1 hari lagi';
    return '$diff hari lagi';
  }
}

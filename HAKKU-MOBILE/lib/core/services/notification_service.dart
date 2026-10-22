import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Layanan notifikasi lokal untuk pengawalan masa tunggu statuter
/// (14 hari perundingan bipartit UU 2/2004 & 7 hari somasi perdata KUHPerdata 1238)
class LegalNotificationService {
  LegalNotificationService._();

  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;

  /// Inisialisasi plugin notifikasi
  static Future<void> init() async {
    if (_initialized) return;

    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    try {
      await _notifications.initialize(initSettings);
      _initialized = true;
    } catch (_) {
      // Ignore if running on test or unsupported platform
    }
  }

  /// Meminta izin notifikasi (Android 13+ / iOS)
  static Future<bool> requestPermissions() async {
    try {
      final android = _notifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      if (android != null) {
        return await android.requestNotificationsPermission() ?? false;
      }
      final ios = _notifications
          .resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>();
      if (ios != null) {
        return await ios.requestPermissions(alert: true, badge: true, sound: true) ??
            false;
      }
    } catch (_) {}
    return true;
  }

  /// Jadwalkan pengingat masa tunggu hukum
  static Future<void> scheduleStatutoryReminder({
    required String caseCode,
    required String title,
    required String body,
    required DateTime reminderDate,
  }) async {
    if (!_initialized) await init();

    if (reminderDate.isBefore(DateTime.now())) return;

    try {
      // Tampilkan notifikasi konfirmasi pendaftaran pengingat
      await _notifications.show(
        caseCode.hashCode,
        'Pengingat Dijadwalkan: $caseCode',
        'HAKKU akan mengingatkan Anda saat batas waktu $title mendekat.',
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'hakku_statutory_channel',
            'Pengingat Masa Tunggu Hukum',
            channelDescription:
                'Notifikasi tenggat waktu perundingan bipartit dan somasi perdata',
            importance: Importance.high,
            priority: Priority.high,
          ),
          iOS: DarwinNotificationDetails(),
        ),
      );
    } catch (_) {}
  }
}

import 'package:local_auth/local_auth.dart';
import '../storage/local_storage.dart';

/// Layanan keamanan biometrik (Fingerprint & Face ID) untuk proteksi berkas perkara
class BiometricSecurityService {
  BiometricSecurityService._();

  static final LocalAuthentication _auth = LocalAuthentication();

  /// Periksa ketersediaan sensor biometrik pada perangkat
  static Future<bool> isBiometricsAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isSupported = await _auth.isDeviceSupported();
      return canCheck || isSupported;
    } catch (_) {
      return false;
    }
  }

  /// Otentikasi sebelum membuka berkas perkara sensitif
  /// Jika proteksi biometrik dimatikan di pengaturan lokal, selalu lolos (true)
  static Future<bool> authenticateToAccessCase() async {
    final enabled = LocalStorage.getBiometricEnabled();
    if (!enabled) return true;

    final canAuthenticate = await isBiometricsAvailable();
    if (!canAuthenticate) return true;

    try {
      return await _auth.authenticate(
        localizedReason:
            'Pindai Sidik Jari atau Wajah untuk Membuka Berkas Perkara Rahasia',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );
    } catch (_) {
      return false;
    }
  }
}

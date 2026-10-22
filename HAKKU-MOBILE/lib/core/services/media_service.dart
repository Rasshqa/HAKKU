import 'package:image_picker/image_picker.dart';

/// Layanan penangkapan bukti fisik via kamera dan galeri ponsel
class MediaService {
  MediaService._();

  static final ImagePicker _picker = ImagePicker();

  /// Mengambil foto bukti fisik langsung menggunakan kamera belakang
  static Future<XFile?> takeEvidencePhoto() async {
    try {
      return await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        preferredCameraDevice: CameraDevice.rear,
      );
    } catch (_) {
      return null;
    }
  }

  /// Memilih bukti (foto/screenshot percakapan/dokumen) dari galeri
  static Future<XFile?> pickEvidenceFromGallery() async {
    try {
      return await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 90,
      );
    } catch (_) {
      return null;
    }
  }
}

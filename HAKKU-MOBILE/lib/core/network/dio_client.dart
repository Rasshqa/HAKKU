import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';

/// Dio HTTP client dengan interceptor logging & timeout
class DioClient {
  DioClient._();

  static Dio? _instance;

  static Dio get instance {
    _instance ??= _createDio();
    return _instance!;
  }

  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Logging interceptor (dev only)
    dio.interceptors.add(LogInterceptor(
      requestBody: false,
      responseBody: false,
      error: true,
    ));

    // Retry sederhana untuk network error
    dio.interceptors.add(InterceptorsWrapper(
      onError: (error, handler) {
        // Kembalikan error tanpa retry — UI yang menangani fallback
        handler.next(error);
      },
    ));

    return dio;
  }
}

/// Exception yang aman untuk ditampilkan ke UI
class HakkuApiException implements Exception {
  final String message;
  final int? statusCode;

  const HakkuApiException(this.message, {this.statusCode});

  factory HakkuApiException.fromDioError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.connectionError) {
      return const HakkuApiException(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      );
    }
    final statusCode = e.response?.statusCode;
    return HakkuApiException(
      'Terjadi kesalahan pada server. Coba beberapa saat lagi.',
      statusCode: statusCode,
    );
  }

  @override
  String toString() => 'HakkuApiException: $message';
}

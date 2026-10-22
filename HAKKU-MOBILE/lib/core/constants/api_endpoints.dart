/// Endpoint REST API HAKKU Web — ubah BASE_URL sesuai deployment
class ApiEndpoints {
  ApiEndpoints._();

  /// URL dasar HAKKU Web API — ganti dengan URL production saat live
  static const String baseUrl = 'https://hakku-web.vercel.app';

  // Intake & Analysis
  static const String intakeAnalyze = '/api/intake/analyze';

  // Consultation
  static const String consultationChat = '/api/consultation/chat';

  // Documents
  static const String documentsGenerate = '/api/documents/generate';

  // Calculator
  static const String calculator = '/api/calculator';

  // Evidence
  static const String evidenceAudit = '/api/evidence/audit';

  // Cases
  static const String cases = '/api/cases';
  static String caseDetail(String idOrCode) => '/api/cases/$idOrCode';
  static String caseChecklist(String idOrCode) =>
      '/api/cases/$idOrCode/checklist';
}

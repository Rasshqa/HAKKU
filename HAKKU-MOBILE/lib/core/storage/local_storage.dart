import 'package:hive_flutter/hive_flutter.dart';

/// Model kasus tersimpan secara lokal (Hive)
class LocalCaseRecord {
  final String caseCode;
  final String title;
  final String category;
  final String categoryLabel;
  final String urgencyLevel;
  final String originalStory;
  final String status;
  final DateTime createdAt;
  final List<String> knownFacts;
  final List<String> unknownFacts;
  final List<String> checklist;

  LocalCaseRecord({
    required this.caseCode,
    required this.title,
    required this.category,
    required this.categoryLabel,
    required this.urgencyLevel,
    required this.originalStory,
    required this.status,
    required this.createdAt,
    required this.knownFacts,
    required this.unknownFacts,
    required this.checklist,
  });

  Map<String, dynamic> toMap() => {
        'caseCode': caseCode,
        'title': title,
        'category': category,
        'categoryLabel': categoryLabel,
        'urgencyLevel': urgencyLevel,
        'originalStory': originalStory,
        'status': status,
        'createdAt': createdAt.toIso8601String(),
        'knownFacts': knownFacts,
        'unknownFacts': unknownFacts,
        'checklist': checklist,
      };

  factory LocalCaseRecord.fromMap(Map<dynamic, dynamic> map) {
    return LocalCaseRecord(
      caseCode: map['caseCode'] as String,
      title: map['title'] as String,
      category: map['category'] as String,
      categoryLabel: map['categoryLabel'] as String,
      urgencyLevel: map['urgencyLevel'] as String,
      originalStory: map['originalStory'] as String,
      status: map['status'] as String,
      createdAt: DateTime.parse(map['createdAt'] as String),
      knownFacts: List<String>.from(map['knownFacts'] as List),
      unknownFacts: List<String>.from(map['unknownFacts'] as List),
      checklist: List<String>.from(map['checklist'] as List),
    );
  }

  LocalCaseRecord copyWith({String? status, List<String>? checklist}) {
    return LocalCaseRecord(
      caseCode: caseCode,
      title: title,
      category: category,
      categoryLabel: categoryLabel,
      urgencyLevel: urgencyLevel,
      originalStory: originalStory,
      status: status ?? this.status,
      createdAt: createdAt,
      knownFacts: knownFacts,
      unknownFacts: unknownFacts,
      checklist: checklist ?? this.checklist,
    );
  }
}

/// Wrapper Hive untuk penyimpanan kasus lokal — offline-first
class LocalStorage {
  static const String _casesBoxName = 'hakku_cases';
  static const String _settingsBoxName = 'hakku_settings';

  static Box? _casesBox;
  static Box? _settingsBox;

  /// Inisialisasi Hive — panggil di main()
  static Future<void> init() async {
    await Hive.initFlutter();
    _casesBox = await Hive.openBox(_casesBoxName);
    _settingsBox = await Hive.openBox(_settingsBoxName);
  }

  // ── Cases ──────────────────────────────────────────────────────────

  /// Simpan atau perbarui kasus
  static Future<void> saveCase(LocalCaseRecord record) async {
    await _casesBox!.put(record.caseCode, record.toMap());
  }

  /// Ambil semua kasus tersimpan (terbaru duluan)
  static List<LocalCaseRecord> getAllCases() {
    return _casesBox!.values
        .map((v) => LocalCaseRecord.fromMap(v as Map<dynamic, dynamic>))
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  /// Ambil kasus berdasarkan kode
  static LocalCaseRecord? getCase(String caseCode) {
    final v = _casesBox!.get(caseCode);
    if (v == null) return null;
    return LocalCaseRecord.fromMap(v as Map<dynamic, dynamic>);
  }

  /// Hapus kasus
  static Future<void> deleteCase(String caseCode) async {
    await _casesBox!.delete(caseCode);
  }

  // ── Settings ────────────────────────────────────────────────────────

  static bool getBiometricEnabled() {
    return _settingsBox!.get('biometric_enabled', defaultValue: false) as bool;
  }

  static Future<void> setBiometricEnabled(bool value) async {
    await _settingsBox!.put('biometric_enabled', value);
  }

  static bool getOnboardingCompleted() {
    return _settingsBox?.get('onboarding_completed', defaultValue: false) as bool? ?? false;
  }

  static Future<void> setOnboardingCompleted([bool value = true]) async {
    await _settingsBox?.put('onboarding_completed', value);
  }

  // ── Auth Session ───────────────────────────────────────────────────

  static bool isLoggedIn() {
    return _settingsBox?.get('is_logged_in', defaultValue: false) as bool? ?? false;
  }

  static Future<void> setLoggedIn(
    bool value, {
    String? email,
    String? displayName,
    String? photoUrl,
  }) async {
    await _settingsBox?.put('is_logged_in', value);
    if (email != null) await _settingsBox?.put('user_email', email);
    if (displayName != null) await _settingsBox?.put('user_display_name', displayName);
    if (photoUrl != null) await _settingsBox?.put('user_photo_url', photoUrl);
  }

  static String? getUserEmail() {
    return _settingsBox?.get('user_email') as String?;
  }

  static String? getUserDisplayName() {
    return _settingsBox?.get('user_display_name') as String?;
  }

  static Future<void> logout() async {
    await _settingsBox?.put('is_logged_in', false);
    await _settingsBox?.delete('user_email');
    await _settingsBox?.delete('user_display_name');
    await _settingsBox?.delete('user_photo_url');
  }

  // ── AI LLM Configuration ──────────────────────────────────────────

  static String getLlmModel() {
    return _settingsBox?.get('llm_model', defaultValue: 'gemini-2.5-flash') as String? ?? 'gemini-2.5-flash';
  }

  static Future<void> setLlmModel(String model) async {
    await _settingsBox?.put('llm_model', model);
  }

  static String? getGeminiApiKey() {
    return _settingsBox?.get('gemini_api_key') as String?;
  }

  static Future<void> setGeminiApiKey(String? key) async {
    if (key == null || key.trim().isEmpty) {
      await _settingsBox?.delete('gemini_api_key');
    } else {
      await _settingsBox?.put('gemini_api_key', key.trim());
    }
  }
}

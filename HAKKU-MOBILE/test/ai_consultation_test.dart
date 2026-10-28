import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hakku_mobile/core/theme/app_theme.dart';
import 'package:hakku_mobile/domain/ai/ai_legal_service.dart';
import 'package:hakku_mobile/features/consultation/consultation_screen.dart';

void main() {
  group('AiLegalService Unit Tests', () {
    test('streamReply streams chunks with accurate labor law references',
        () async {
      final history = <ConsultationMessage>[];
      final chunks = <String>[];
      String? lastStatus;

      final stream = AiLegalService.streamReply(
        history: history,
        currentMessage: 'Saya kena PHK sepihak tanpa pesangon',
        onStatusUpdate: (s) => lastStatus = s,
      );

      await for (final chunk in stream) {
        chunks.add(chunk);
      }

      expect(chunks, isNotEmpty);
      expect(lastStatus, isNotNull);

      final finalOutput = chunks.last;
      expect(finalOutput, contains('Pasal 40 PP No. 35 Tahun 2021'));
      expect(finalOutput, contains('Uang Pesangon'));
      expect(finalOutput, contains('Bipartit'));
    });

    test('streamReply handles digital fraud and cites ITE law', () async {
      final chunks = <String>[];
      final stream = AiLegalService.streamReply(
        history: [],
        currentMessage: 'Saya tertipu transfer belanja online akun palsu',
      );

      await for (final chunk in stream) {
        chunks.add(chunk);
      }

      final finalOutput = chunks.last;
      expect(finalOutput, contains('Pasal 28'));
      expect(finalOutput, contains('UU No. 1 Tahun 2024'));
      expect(finalOutput, contains('CekRekening.id'));
    });

    test('streamReply stops streaming when cancelled with CancelToken',
        () async {
      final cancelToken = CancelToken();
      final chunks = <String>[];

      final stream = AiLegalService.streamReply(
        history: [],
        currentMessage: 'Bagaimana aturan sewa menyewa rumah deposit?',
        cancelToken: cancelToken,
      );

      int count = 0;
      await for (final chunk in stream) {
        chunks.add(chunk);
        count++;
        if (count >= 2) {
          cancelToken.cancel();
          break;
        }
      }

      expect(chunks.length, equals(2));
      expect(cancelToken.isCancelled, isTrue);
    });
  });

  group('ConsultationScreen Widget Tests', () {
    testWidgets('ConsultationScreen renders header and initial greeting',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light,
          home: const ConsultationScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Tanya Hakki'), findsOneWidget);
      expect(
        find.byWidgetPredicate((w) =>
            w is RichText &&
            w.text.toPlainText().contains('asisten paralegal digital')),
        findsOneWidget,
      );
      expect(find.byType(TextField), findsOneWidget);

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });

    testWidgets('ConsultationScreen sends query and displays streaming response',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light,
          home: const ConsultationScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Enter question
      await tester.enterText(
        find.byType(TextField),
        'Perusahaan tidak mau bayar pesangon PHK',
      );
      await tester.pump();

      // Tap send
      await tester.tap(find.byIcon(Icons.send_rounded));
      await tester.pump();

      // Verify user bubble appears
      expect(find.text('Perusahaan tidak mau bayar pesangon PHK'), findsOneWidget);

      // Advance clock to allow stream chunks to arrive
      for (int i = 0; i < 15; i++) {
        await tester.pump(const Duration(milliseconds: 400));
      }

      expect(
        find.byWidgetPredicate((w) =>
            w is RichText &&
            w.text.toPlainText().contains('Pasal 40 PP No. 35 Tahun 2021')),
        findsOneWidget,
      );

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });
  });
}

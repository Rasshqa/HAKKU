import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hakku_mobile/features/home/widgets/hakki_mascot_widget.dart';

void main() {
  testWidgets('HakkiMascotWidget renders with initial speech and mood',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: HakkiMascotWidget(
            showSpeechBubble: true,
          ),
        ),
      ),
    );

    // Initial render
    expect(find.byType(HakkiMascotWidget), findsOneWidget);
    expect(find.text('Hakki Siap Membantu'), findsOneWidget);

    // Clean disposal of widget timers
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 50));
  });

  testWidgets('HakkiMascotWidget handles custom speech',
      (WidgetTester tester) async {
    const customText = 'Halo! Saya Kancil Paralegal HAKKU.';
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: HakkiMascotWidget(
            customSpeech: customText,
            showSpeechBubble: true,
          ),
        ),
      ),
    );

    expect(find.text(customText), findsOneWidget);

    // Clean disposal of widget timers
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 50));
  });
}

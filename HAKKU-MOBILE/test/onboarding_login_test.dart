import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hakku_mobile/core/theme/app_theme.dart';
import 'package:hakku_mobile/core/widgets/duo_button.dart';
import 'package:hakku_mobile/features/auth/login_screen.dart';
import 'package:hakku_mobile/features/auth/onboarding_screen.dart';
import 'package:hakku_mobile/features/splash/splash_screen.dart';

void main() {
  testWidgets('DuoButton renders and handles tap interaction',
      (WidgetTester tester) async {
    bool tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: Center(
            child: DuoButton(
              text: 'TEKAN SAYA',
              onPressed: () => tapped = true,
            ),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.text('TEKAN SAYA'), findsOneWidget);

    await tester.tap(find.text('TEKAN SAYA'));
    await tester.pump();

    expect(tapped, isTrue);

    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 100));
  });

  testWidgets('OnboardingScreen renders slides and advances smoothly',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const OnboardingScreen(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));

    // Slide 1
    expect(find.text('Pahami Hak Hukum\nTanpa Istilah Rumit'), findsOneWidget);
    expect(find.text('LANJUT'), findsOneWidget);
    expect(find.text('LEWATI'), findsOneWidget);
    expect(find.text('LEWATI PANDUAN'), findsOneWidget);

    // Tap lanjut
    await tester.tap(find.text('LANJUT'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // Slide 2
    expect(find.text('Periksa Kontrak &\nHitung Hak Pesangon'), findsOneWidget);
    expect(find.text('KEMBALI KE SEBELUMNYA'), findsOneWidget);

    // Clean teardown
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 100));
  });

  testWidgets('LoginScreen renders Google-only sign-in matching web version',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const LoginScreen(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));

    // Brand and Google button
    expect(find.text('Masuk ke HAKKU'), findsOneWidget);
    expect(find.text('Masuk dengan Google'), findsOneWidget);
    expect(find.byType(GoogleIconWidget), findsOneWidget);
    expect(find.text('Akses Penuh Akun Warga:'), findsOneWidget);

    // Clean teardown
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 100));
  });

  testWidgets('SplashScreen renders mascot and HAKKU brand identity',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const SplashScreen(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));

    expect(find.text('HAKKU'), findsOneWidget);
    expect(find.text('ASISTEN HUKUM SAKU ANDA'), findsOneWidget);
    expect(find.byKey(const ValueKey('splash_mascot')), findsOneWidget);

    // Clean teardown before timer fires
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 1500));
  });
}

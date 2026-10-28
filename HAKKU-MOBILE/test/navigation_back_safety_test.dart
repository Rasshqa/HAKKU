import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:hakku_mobile/core/theme/app_theme.dart';
import 'package:hakku_mobile/features/about/about_screen.dart';
import 'package:hakku_mobile/features/contract/contract_scanner_screen.dart';
import 'package:hakku_mobile/features/emergency/emergency_screen.dart';
import 'package:hakku_mobile/features/referral/referral_directory_screen.dart';

void main() {
  testWidgets('EmergencyScreen renders and close button pops route',
      (WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => Scaffold(
            body: TextButton(
              onPressed: () => context.push('/darurat'),
              child: const Text('Open Emergency'),
            ),
          ),
        ),
        GoRoute(
          path: '/darurat',
          pageBuilder: (context, state) => const MaterialPage(
            fullscreenDialog: true,
            child: EmergencyScreen(),
          ),
        ),
      ],
    );

    await tester.pumpWidget(
      MaterialApp.router(
        routerConfig: router,
        theme: AppTheme.light,
      ),
    );
    await tester.pump();

    // Open emergency
    await tester.tap(find.text('Open Emergency'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Bantuan Kedaruratan'), findsOneWidget);
    expect(find.byIcon(Icons.close), findsOneWidget);

    // Tap close in AppBar
    await tester.tap(find.byIcon(Icons.close));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pump(const Duration(milliseconds: 500));

    // Must be back on home, not blank
    expect(find.text('Open Emergency'), findsOneWidget);
    expect(find.text('Bantuan Kedaruratan'), findsNothing);
  });

  testWidgets('EmergencyScreen standalone fallback navigates to home when canPop is false',
      (WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/darurat',
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const Scaffold(
            body: Text('HomeScreen Target'),
          ),
        ),
        GoRoute(
          path: '/darurat',
          pageBuilder: (context, state) => const MaterialPage(
            fullscreenDialog: true,
            child: EmergencyScreen(),
          ),
        ),
      ],
    );

    await tester.pumpWidget(
      MaterialApp.router(
        routerConfig: router,
        theme: AppTheme.light,
      ),
    );
    await tester.pump();

    expect(find.text('Bantuan Kedaruratan'), findsOneWidget);

    // Close button should trigger fallback to '/' because canPop is false
    await tester.tap(find.byIcon(Icons.close));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('HomeScreen Target'), findsOneWidget);
  });

  testWidgets('ReferralDirectoryScreen has leading back button and handles direct navigation',
      (WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/rujukan',
      routes: [
        GoRoute(
          path: '/perangkat',
          builder: (context, state) => const Scaffold(
            body: Text('Perangkat Target'),
          ),
        ),
        GoRoute(
          path: '/rujukan',
          builder: (context, state) => const ReferralDirectoryScreen(),
        ),
      ],
    );

    await tester.pumpWidget(
      MaterialApp.router(
        routerConfig: router,
        theme: AppTheme.light,
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Direktori Bantuan Hukum (LBH)'), findsOneWidget);
    expect(find.byIcon(Icons.arrow_back), findsOneWidget);

    // Tekan tombol kembali
    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Perangkat Target'), findsOneWidget);
  });

  testWidgets('AboutScreen has leading back button and handles direct navigation',
      (WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/tentang',
      routes: [
        GoRoute(
          path: '/perangkat',
          builder: (context, state) => const Scaffold(
            body: Text('Perangkat Target'),
          ),
        ),
        GoRoute(
          path: '/tentang',
          builder: (context, state) => const AboutScreen(),
        ),
      ],
    );

    await tester.pumpWidget(
      MaterialApp.router(
        routerConfig: router,
        theme: AppTheme.light,
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Tentang HAKKU'), findsOneWidget);
    expect(find.byIcon(Icons.arrow_back), findsOneWidget);

    // Tekan tombol kembali
    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Perangkat Target'), findsOneWidget);
  });

  testWidgets('ContractScannerScreen has leading back button and handles direct navigation',
      (WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/perangkat/kontrak',
      routes: [
        GoRoute(
          path: '/perangkat',
          builder: (context, state) => const Scaffold(
            body: Text('Perangkat Target'),
          ),
        ),
        GoRoute(
          path: '/perangkat/kontrak',
          builder: (context, state) => const ContractScannerScreen(),
        ),
      ],
    );

    await tester.pumpWidget(
      MaterialApp.router(
        routerConfig: router,
        theme: AppTheme.light,
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(
      find.descendant(
        of: find.byType(AppBar),
        matching: find.text('Pemeriksa Klausul Kontrak'),
      ),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.arrow_back), findsOneWidget);

    // Tekan tombol kembali
    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Perangkat Target'), findsOneWidget);
  });
}

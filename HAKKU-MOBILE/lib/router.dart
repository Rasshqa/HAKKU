import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'features/home/home_screen.dart';
import 'features/consultation/consultation_screen.dart';
import 'features/tools/tools_hub_screen.dart';
import 'features/tools/calculator_screen.dart';
import 'features/tools/evidence_screen.dart';
import 'features/tools/document_screen.dart';
import 'features/contract/contract_scanner_screen.dart';
import 'features/referral/referral_directory_screen.dart';
import 'features/about/about_screen.dart';
import 'features/cases/cases_list_screen.dart';
import 'features/cases/case_detail_screen.dart';
import 'features/emergency/emergency_screen.dart';
import 'features/home/intake_flow_screen.dart';
import 'features/auth/onboarding_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/splash/splash_screen.dart';
import 'core/constants/app_colors.dart';
import 'core/storage/local_storage.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  redirect: (context, state) {
    final bool loggedIn = LocalStorage.isLoggedIn();
    final bool onboardingDone = LocalStorage.getOnboardingCompleted();
    final String location = state.uri.path;

    final bool isSplash = location == '/splash';
    final bool isLogin = location == '/login';
    final bool isOnboarding = location == '/onboarding';

    // Splash mengontrol delay & navigasi awal
    if (isSplash) return null;

    // User diwajibkan login sebelum menggunakan aplikasi
    if (!loggedIn) {
      return isLogin ? null : '/login';
    }

    // Setelah login pertama kali, arahkan ke onboarding screen
    if (!onboardingDone) {
      return isOnboarding ? null : '/onboarding';
    }

    // Jika sudah login dan selesai onboarding, jangan kembali ke login
    if (isLogin) {
      return '/';
    }

    return null;
  },
  routes: [
    // Splash Screen
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return _ScaffoldWithBottomNav(navigationShell: navigationShell);
      },
      branches: [
        // Tab 1: Beranda
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
            routes: [
              GoRoute(
                path: 'intake',
                builder: (context, state) => IntakeFlowScreen(
                  initialStory: state.extra as String?,
                ),
              ),
            ],
          ),
        ]),
        // Tab 2: Tanya Hakki (Konsultasi AI)
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/konsultasi',
            builder: (context, state) => ConsultationScreen(
              initialMessage: state.extra as String?,
            ),
          ),
        ]),
        // Tab 3: Instrumen Hukum
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/perangkat',
            builder: (context, state) => const ToolsHubScreen(),
            routes: [
              GoRoute(
                path: 'kalkulator',
                builder: (context, state) => const CalculatorScreen(),
              ),
              GoRoute(
                path: 'dokumen',
                builder: (context, state) => const DocumentScreen(),
              ),
              GoRoute(
                path: 'bukti',
                builder: (context, state) => const EvidenceScreen(),
              ),
              GoRoute(
                path: 'kontrak',
                builder: (context, state) => const ContractScannerScreen(),
              ),
            ],
          ),
        ]),
        // Tab 4: Kasus Saya
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/kasus',
            builder: (context, state) => const CasesListScreen(),
            routes: [
              GoRoute(
                path: ':code',
                builder: (context, state) => CaseDetailScreen(
                  caseCode: state.pathParameters['code']!,
                ),
              ),
            ],
          ),
        ]),
      ],
    ),
    // Direktori Bantuan Hukum
    GoRoute(
      path: '/rujukan',
      builder: (context, state) => const ReferralDirectoryScreen(),
    ),
    // Tentang & Disclaimer Hukum
    GoRoute(
      path: '/tentang',
      builder: (context, state) => const AboutScreen(),
    ),
    // Kedaruratan
    GoRoute(
      path: '/darurat',
      pageBuilder: (context, state) => const MaterialPage(
        fullscreenDialog: true,
        child: EmergencyScreen(),
      ),
    ),
    // Onboarding / Introduksi Duolingo
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    // Masuk / Login Duolingo
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
  ],
);

/// Shell dengan bottom navigation bar
class _ScaffoldWithBottomNav extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const _ScaffoldWithBottomNav({required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: _HakkuBottomNav(
        currentIndex: navigationShell.currentIndex,
        onTap: (index) => navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        ),
      ),
    );
  }
}

class _HakkuBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _HakkuBottomNav({
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: HakkuColors.border, width: 1.5),
        ),
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        backgroundColor: Colors.white,
        selectedItemColor: HakkuColors.primary,
        unselectedItemColor: HakkuColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Beranda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline),
            activeIcon: Icon(Icons.chat_bubble),
            label: 'Tanya Hakki',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.build_outlined),
            activeIcon: Icon(Icons.build),
            label: 'Perangkat',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.folder_outlined),
            activeIcon: Icon(Icons.folder),
            label: 'Kasus Saya',
          ),
        ],
      ),
    );
  }
}

/// DialogPage helper untuk modal route
class DialogPage<T> extends Page<T> {
  final WidgetBuilder builder;

  const DialogPage({required this.builder, super.key});

  @override
  Route<T> createRoute(BuildContext context) {
    return DialogRoute<T>(
      context: context,
      builder: builder,
      settings: this,
    );
  }
}

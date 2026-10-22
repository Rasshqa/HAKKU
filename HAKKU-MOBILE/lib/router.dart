import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'features/home/home_screen.dart';
import 'features/consultation/consultation_screen.dart';
import 'features/tools/tools_hub_screen.dart';
import 'features/tools/calculator_screen.dart';
import 'features/tools/evidence_screen.dart';
import 'features/tools/document_screen.dart';
import 'features/cases/cases_list_screen.dart';
import 'features/cases/case_detail_screen.dart';
import 'features/emergency/emergency_screen.dart';
import 'features/home/intake_flow_screen.dart';
import 'core/constants/app_colors.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
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
                builder: (context, state) => const IntakeFlowScreen(),
              ),
            ],
          ),
        ]),
        // Tab 2: Tanya Hakki (Konsultasi AI)
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/konsultasi',
            builder: (context, state) => const ConsultationScreen(),
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
    // Modal Darurat
    GoRoute(
      path: '/darurat',
      pageBuilder: (context, state) => DialogPage(
        builder: (_) => const EmergencyScreen(),
      ),
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
        border: Border(
          top: BorderSide(color: HakkuColors.border, width: 1),
        ),
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 11,
        unselectedFontSize: 11,
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

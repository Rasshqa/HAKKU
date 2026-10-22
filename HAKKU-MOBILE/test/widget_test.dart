import 'package:flutter_test/flutter_test.dart';
import 'package:hakku_mobile/app.dart';

void main() {
  testWidgets('HakkuApp widget build smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const HakkuApp());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.byType(HakkuApp), findsOneWidget);
  });
}

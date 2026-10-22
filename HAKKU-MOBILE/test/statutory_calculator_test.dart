import 'package:flutter_test/flutter_test.dart';
import 'package:hakku_mobile/domain/calculator/calculator_engine.dart';
import 'package:hakku_mobile/domain/calculator/calculator_models.dart';
import 'package:hakku_mobile/domain/evidence/evidence_evaluator.dart';
import 'package:hakku_mobile/domain/evidence/evidence_models.dart';
import 'package:hakku_mobile/domain/intake/intake_engine.dart';

void main() {
  group('StatutoryCalculatorEngine — PP No. 35 Tahun 2021', () {
    test('getBaseSeveranceMonths calculates correctly according to Article 40(2)', () {
      expect(StatutoryCalculatorEngine.getBaseSeveranceMonths(0.5), 1);
      expect(StatutoryCalculatorEngine.getBaseSeveranceMonths(1.5), 2);
      expect(StatutoryCalculatorEngine.getBaseSeveranceMonths(2.5), 3);
      expect(StatutoryCalculatorEngine.getBaseSeveranceMonths(5.0), 6);
      expect(StatutoryCalculatorEngine.getBaseSeveranceMonths(8.5), 9);
      expect(StatutoryCalculatorEngine.getBaseSeveranceMonths(15.0), 9); // Max 9 months
    });

    test('getBaseLongServiceMonths calculates correctly according to Article 40(3)', () {
      expect(StatutoryCalculatorEngine.getBaseLongServiceMonths(2.0), 0);
      expect(StatutoryCalculatorEngine.getBaseLongServiceMonths(4.0), 2);
      expect(StatutoryCalculatorEngine.getBaseLongServiceMonths(7.0), 3);
      expect(StatutoryCalculatorEngine.getBaseLongServiceMonths(25.0), 10);
    });

    test('calculateContractCompensation for PKWT (Article 15)', () {
      // 12 months with 6,000,000 salary = 1 month (6,000,000)
      final comp12 = StatutoryCalculatorEngine.calculateContractCompensation(
        tenureMonths: 12,
        monthlySalary: 6000000,
      );
      expect(comp12, 6000000);

      // 6 months with 6,000,000 salary = 0.5 month (3,000,000)
      final comp6 = StatutoryCalculatorEngine.calculateContractCompensation(
        tenureMonths: 6,
        monthlySalary: 6000000,
      );
      expect(comp6, 3000000);
    });

    test('calculateSeverance for PKWTT efficiency loss (0.5x UP, 1x UPMK)', () {
      final start = DateTime(2020, 1, 1);
      final end = DateTime(2023, 1, 1); // 3 years tenure
      final res = StatutoryCalculatorEngine.calculateSeverance(
        contractType: ContractType.pkwtt,
        monthlySalary: 10000000,
        startDate: start,
        endDate: end,
        reason: TerminationReason.efficiencyLoss,
      );

      // 3 years: Base UP is 4 months (10jt * 4 = 40jt). With 0.5x multiplier = 20jt
      // Base UPMK for 3 yrs is 2 months (10jt * 2 = 20jt). With 1.0x multiplier = 20jt
      // Total = 40jt
      expect(res.severancePay, 20000000);
      expect(res.longServicePay, 20000000);
      expect(res.grandTotal, 40000000);
    });
  });

  group('StatutoryEvidenceEvaluator — KUHAP 184 & UU ITE 1/2024', () {
    test('empty evidence gives 0 score and critical missing', () {
      final res = StatutoryEvidenceEvaluator.evaluateReadiness([]);
      expect(res.score, 0);
      expect(res.status, EvidenceReadinessStatus.criticalMissing);
    });

    test('full evidence gives 100 score and ready for filing', () {
      final items = <EvidenceItem>[
        const EvidenceItem(id: '1', description: 'Kontrak', type: EvidenceType.writtenDocument),
        const EvidenceItem(id: '2', description: 'Chat WA', type: EvidenceType.digitalProof),
        const EvidenceItem(id: '3', description: 'Mutasi Bank', type: EvidenceType.financialProof),
        const EvidenceItem(id: '4', description: 'Rekan Kerja', type: EvidenceType.witnessStatement),
      ];
      final res = StatutoryEvidenceEvaluator.evaluateReadiness(items);
      expect(res.score, 100);
      expect(res.status, EvidenceReadinessStatus.readyForFiling);
    });
  });

  group('IntakeEngine — Offline Triage', () {
    test('detects labor dispute and extracts known facts', () {
      const story = 'Saya bekerja di PT ABC selama 3 tahun dan kemarin di-PHK sepihak tanpa pesangon oleh HRD. Mohon segera bantu saya.';
      final res = IntakeEngine.processStory(story);

      expect(res.category, DisputeCategory.labor);
      expect(res.knownFacts.isNotEmpty, true);
      expect(res.urgencyLevel, UrgencyLevel.urgent);
    });

    test('detects physical danger / violence and marks critical emergency', () {
      const dangerStory = 'Ada ancaman kekerasan fisik dan pemukulan oleh debt collector di rumah saya.';
      final isEmergency = IntakeEngine.checkEmergency(dangerStory);
      expect(isEmergency, true);
    });
  });
}

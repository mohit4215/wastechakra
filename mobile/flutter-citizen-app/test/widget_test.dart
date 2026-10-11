import 'package:flutter_test/flutter_test.dart';
import 'package:ecofleet_citizen_app/models/citizen_report.dart';

void main() {
  test('CitizenReport toJson contains nodeId', () {
    final r = CitizenReport(
      nodeId: 'NODE-001',
      reporterName: 'Aarav',
      reporterPhone: '9876543210',
      issueType: 'overflow',
      description: 'Test',
    );
    expect(r.toJson()['node_id'], 'NODE-001');
  });
}

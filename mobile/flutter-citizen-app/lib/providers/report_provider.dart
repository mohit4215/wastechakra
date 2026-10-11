import 'package:flutter/foundation.dart';
import '../models/citizen_report.dart';
import '../services/api_service.dart';

class ReportProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final List<CitizenReport> _reports = [];
  bool _isSubmitting = false;

  List<CitizenReport> get reports => List.unmodifiable(_reports);
  bool get isSubmitting => _isSubmitting;

  Future<String?> sendReport(CitizenReport report) async {
    _isSubmitting = true;
    notifyListeners();

    final ticket = await _apiService.submitReport(report);
    final confirmed = CitizenReport(
      ticketId: ticket,
      nodeId: report.nodeId,
      reporterName: report.reporterName,
      reporterPhone: report.reporterPhone,
      issueType: report.issueType,
      description: report.description,
    );
    _reports.insert(0, confirmed);

    _isSubmitting = false;
    notifyListeners();
    return ticket;
  }
}

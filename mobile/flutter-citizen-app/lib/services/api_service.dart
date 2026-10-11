import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/citizen_report.dart';

class ApiService {
  final String baseUrl;

  ApiService({this.baseUrl = 'http://127.0.0.1:8000/api'});

  Future<String?> submitReport(CitizenReport report) async {
    try {
      final uri = Uri.parse('$baseUrl/nodes/${report.nodeId}/report');
      final resp = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(report.toJson()),
      );
      if (resp.statusCode == 200 || resp.statusCode == 201) {
        final data = jsonDecode(resp.body);
        return data['ticket_id'] as String?;
      }
    } catch (_) {}
    return 'TICK-LOCAL-${DateTime.now().millisecondsSinceEpoch % 100000}';
  }
}

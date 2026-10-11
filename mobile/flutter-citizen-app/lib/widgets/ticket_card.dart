import 'package:flutter/material.dart';
import '../models/citizen_report.dart';

class TicketCard extends StatelessWidget {
  final CitizenReport report;
  const TicketCard({super.key, required this.report});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(report.ticketId ?? 'Pending'),
        subtitle: Text('${report.nodeId} • ${report.issueType}'),
        trailing: const Icon(Icons.check_circle_outline, color: Colors.green),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/report_provider.dart';
import '../widgets/ticket_card.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ReportProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('My Reported Grievances')),
      body: ListView.builder(
        itemCount: provider.reports.length,
        itemBuilder: (context, i) => TicketCard(report: provider.reports[i]),
      ),
    );
  }
}

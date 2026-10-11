import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/citizen_report.dart';
import '../providers/report_provider.dart';

class ReportFormScreen extends StatefulWidget {
  const ReportFormScreen({super.key});

  @override
  State<ReportFormScreen> createState() => _ReportFormScreenState();
}

class _ReportFormScreenState extends State<ReportFormScreen> {
  final _formKey = GlobalKey<FormState>();
  String _nodeId = 'NODE-001';
  String _issueType = 'overflow';
  String _name = 'Citizen';
  String _phone = '';
  String _desc = '';

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ReportProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('Report Bin Overflow')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                initialValue: _nodeId,
                decoration: const InputDecoration(labelText: 'Bin ID'),
                onSaved: (v) => _nodeId = v ?? 'NODE-001',
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: provider.isSubmitting ? null : () async {
                  _formKey.currentState!.save();
                  await provider.sendReport(CitizenReport(
                    nodeId: _nodeId,
                    reporterName: _name,
                    reporterPhone: _phone,
                    issueType: _issueType,
                    description: _desc,
                  ));
                },
                child: const Text('Submit to MCD'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/report_provider.dart';
import 'screens/report_form_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => ReportProvider())],
      child: const EcoFleetCitizenApp(),
    ),
  );
}

class EcoFleetCitizenApp extends StatelessWidget {
  const EcoFleetCitizenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EcoFleet Citizen',
      theme: AppTheme.lightTheme,
      home: const ReportFormScreen(),
    );
  }
}

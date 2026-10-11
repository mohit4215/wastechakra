import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF10B981)),
    useMaterial3: true,
  );
}

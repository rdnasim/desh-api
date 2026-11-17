import 'package:flutter/material.dart';

class DeshNidField extends StatelessWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final InputDecoration? decoration;

  const DeshNidField({
    super.key,
    this.controller,
    this.onChanged,
    this.decoration,
  });

  String? _validate(String? val) {
    if (val == null || val.isEmpty) return 'NID required';
    final digits = val.replaceAll(RegExp(r'\D'), '');
    if (digits.length == 10 || digits.length == 13 || digits.length == 17) {
      return null;
    }
    return 'Invalid NID (must be 10, 13, or 17 digits)';
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      maxLength: 17,
      validator: _validate,
      onChanged: onChanged,
      decoration: (decoration ?? const InputDecoration()).copyWith(
        hintText: '10/13/17 digit National ID',
      ),
    );
  }
}

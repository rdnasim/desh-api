import 'package:flutter/material.dart';

class DeshPhoneField extends StatefulWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final InputDecoration? decoration;

  const DeshPhoneField({
    super.key,
    this.controller,
    this.onChanged,
    this.decoration,
  });

  @override
  State<DeshPhoneField> createState() => _DeshPhoneFieldState();
}

class _DeshPhoneFieldState extends State<DeshPhoneField> {
  late final TextEditingController _controller;
  String? _detectedOperator;

  static const _operators = {
    '013': 'Grameenphone',
    '017': 'Grameenphone',
    '014': 'Banglalink',
    '019': 'Banglalink',
    '018': 'Robi',
    '016': 'Airtel',
    '015': 'Teletalk',
  };

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _controller.addListener(_detect);
  }

  void _detect() {
    final text = _controller.text.replaceAll(RegExp(r'\D'), '');
    String local = text;
    if (local.startsWith('880')) local = local.substring(2);
    if (local.startsWith('0') && local.length >= 3) {
      final pfx = local.substring(0, 3);
      final op = _operators[pfx];
      if (op != _detectedOperator) {
        setState(() => _detectedOperator = op);
      }
    } else if (_detectedOperator != null) {
      setState(() => _detectedOperator = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      keyboardType: TextInputType.phone,
      onChanged: widget.onChanged,
      decoration: (widget.decoration ?? const InputDecoration()).copyWith(
        prefixIcon: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 14),
          child: Text('🇧🇩 +880', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
        suffixIcon: _detectedOperator != null
            ? Chip(
                label: Text(
                  _detectedOperator!,
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
                visualDensity: VisualDensity.compact,
              )
            : null,
      ),
    );
  }
}

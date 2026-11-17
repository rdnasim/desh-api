class DeshDistrict {
  final String id;
  final String divisionId;
  final String nameEn;
  final String nameBn;

  const DeshDistrict({
    required this.id,
    required this.divisionId,
    required this.nameEn,
    required this.nameBn,
  });

  factory DeshDistrict.fromJson(Map<String, dynamic> json) {
    return DeshDistrict(
      id: json['id'] as String,
      divisionId: json['division_id'] as String,
      nameEn: json['name_en'] as String,
      nameBn: json['name_bn'] as String,
    );
  }
}

class DeshValidationResult {
  final bool isValid;
  final String? operator;
  final String? note;

  const DeshValidationResult({
    required this.isValid,
    this.operator,
    this.note,
  });
}

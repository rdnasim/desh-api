import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models.dart';

class DeshApiClient {
  final String baseUrl;
  final String? apiKey;
  final http.Client _httpClient;

  DeshApiClient({
    this.baseUrl = 'https://deshapi.riadul.com',
    this.apiKey,
    http.Client? httpClient,
  }) : _httpClient = httpClient ?? http.Client();

  Future<List<DeshDistrict>> getDistricts({String? division}) async {
    final uri = Uri.parse('$baseUrl/v1/districts${division != null ? '?division=$division' : ''}');
    final headers = {'Accept': 'application/json'};
    if (apiKey != null) headers['X-API-Key'] = apiKey!;

    final res = await _httpClient.get(uri, headers: headers);
    if (res.statusCode != 200) {
      throw Exception('Failed to load districts: ${res.statusCode}');
    }

    final json = jsonDecode(res.body) as Map<String, dynamic>;
    final data = json['data'] as List<dynamic>;
    return data.map((d) => DeshDistrict.fromJson(d as Map<String, dynamic>)).toList();
  }

  Future<String> numToWords(num number, {bool taka = false}) async {
    final endpoint = taka ? '/v1/bangla/taka-in-words?amount=$number' : '/v1/bangla/num-to-words?n=$number';
    final uri = Uri.parse('$baseUrl$endpoint');
    final headers = {'Accept': 'application/json'};
    if (apiKey != null) headers['X-API-Key'] = apiKey!;

    final res = await _httpClient.get(uri, headers: headers);
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    if (json['success'] == true) {
      return (json['data']['in_words'] ?? json['data']['words']) as String;
    }
    throw Exception(json['error']?['message'] ?? 'Failed to convert');
  }

  void dispose() {
    _httpClient.close();
  }
}

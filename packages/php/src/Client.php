<?php

declare(strict_types=1);

namespace DeshApi;

class Client
{
    private string $baseUrl;
    private ?string $apiKey;

    public function __construct(?string $apiKey = null, string $baseUrl = 'https://deshapi.riadul.com')
    {
        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    public function request(string $method, string $path, array $query = [], ?array $body = null): array
    {
        $url = $this->baseUrl . '/' . ltrim($path, '/');
        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }

        $headers = [
            'Accept: application/json',
        ];
        if ($this->apiKey !== null) {
            $headers[] = 'X-API-Key: ' . $this->apiKey;
        }

        $opts = [
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", $headers),
                'ignore_errors' => true,
                'timeout' => 15,
            ]
        ];

        if ($body !== null) {
            $opts['http']['header'] .= "\r\nContent-Type: application/json";
            $opts['http']['content'] = json_encode($body);
        }

        $context = stream_context_create($opts);
        $result = file_get_contents($url, false, $context);
        if ($result === false) {
            throw new \RuntimeException('Failed to connect to Desh API');
        }

        $json = json_decode($result, true);
        if (!is_array($json) || !($json['success'] ?? false)) {
            $msg = $json['error']['message'] ?? 'API error';
            throw new \RuntimeException($msg);
        }

        return $json['data'];
    }

    public function getDistricts(?string $division = null): array
    {
        return $this->request('GET', '/v1/districts', ['division' => $division]);
    }

    public function numToWords(int|string $n): array
    {
        return $this->request('GET', '/v1/bangla/num-to-words', ['n' => (string)$n]);
    }

    public function validateNid(string $number): array
    {
        return $this->request('GET', "/v1/validate/nid/{$number}");
    }
}

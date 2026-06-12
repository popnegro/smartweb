<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function json_response(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitize_value($value): string
{
    return trim((string) ($value ?? ''));
}

function require_post(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_response(405, ['error' => 'Metodo no permitido.']);
    }
}

function get_request_body(): array
{
    $rawBody = file_get_contents('php://input');
    $data = json_decode($rawBody ?: '{}', true);

    if (!is_array($data)) {
        json_response(400, ['error' => 'El cuerpo de la solicitud no es valido.']);
    }

    return $data;
}

function validate_lead(array $lead): array
{
    $errors = [];

    if ($lead['cultivo'] === '') {
        $errors[] = 'Seleccione un cultivo.';
    }

    if ($lead['nombre'] === '') {
        $errors[] = 'Ingrese su nombre.';
    }

    if (!filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Ingrese un email valido.';
    }

    if ($lead['telefono'] === '') {
        $errors[] = 'Ingrese un telefono o WhatsApp.';
    }

    return $errors;
}

function build_email_body(array $lead): string
{
    return implode("\n", [
        'Nuevo lead desde el formulario Metzer',
        '',
        'Cultivo: ' . $lead['cultivo'],
        'Provincia: ' . ($lead['provincia'] ?: '-'),
        'Superficie: ' . ($lead['superficie'] ?: '-'),
        'Estado del proyecto: ' . ($lead['estado'] ?: '-'),
        '',
        'Nombre: ' . $lead['nombre'],
        'Empresa: ' . ($lead['empresa'] ?: '-'),
        'Email: ' . $lead['email'],
        'WhatsApp: ' . $lead['telefono'],
        '',
        'Detalle:',
        $lead['detalle'] ?: 'Sin observaciones',
    ]);
}

require_post();

$body = get_request_body();

if (sanitize_value($body['website'] ?? '') !== '') {
    json_response(200, ['ok' => true]);
}

$lead = [
    'cultivo' => sanitize_value($body['cultivo'] ?? ''),
    'provincia' => sanitize_value($body['provincia'] ?? ''),
    'superficie' => sanitize_value($body['superficie'] ?? ''),
    'estado' => sanitize_value($body['estado'] ?? ''),
    'detalle' => sanitize_value($body['detalle'] ?? ''),
    'nombre' => sanitize_value($body['nombre'] ?? ''),
    'empresa' => sanitize_value($body['empresa'] ?? ''),
    'email' => strtolower(sanitize_value($body['email'] ?? '')),
    'telefono' => sanitize_value($body['telefono'] ?? ''),
];

$errors = validate_lead($lead);

if ($errors !== []) {
    json_response(422, [
        'error' => 'Datos incompletos.',
        'errors' => $errors,
    ]);
}

$leadTo = getenv('LEAD_TO') ?: 'ventas@metzer.com.ar';
$leadFrom = getenv('LEAD_FROM') ?: 'no-reply@metzer.com.ar';
$subject = 'Nuevo lead Metzer - ' . $lead['cultivo'];
$message = build_email_body($lead);
$headers = [
    'From: Metzer Leads <' . $leadFrom . '>',
    'Reply-To: ' . $lead['email'],
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($leadTo, $subject, $message, implode("\r\n", $headers));

if (!$sent) {
    json_response(500, ['error' => 'No se pudo enviar la solicitud.']);
}

json_response(200, ['ok' => true]);

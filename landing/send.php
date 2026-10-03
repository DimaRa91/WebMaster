<?php
// Обработчик формы заявки.
// 1) проверяет данные и защиту от ботов; 2) сохраняет заявку и факт согласия в журнал на сервере;
// 3) отправляет уведомление на почту и (по желанию) в Telegram.

declare(strict_types=1);

const CONSENT_VERSION = 'consent.html, ред. от 03.10.2026';

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function respond(bool $ok, string $error = '', int $code = 200): void
{
    global $wantsJson;
    http_response_code($code);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    } else {
        // Без JavaScript: обычный переход на страницу результата
        header('Location: ' . ($ok ? 'thanks.html' : 'index.html#lead'), true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Метод не поддерживается', 405);
}

$defaults = [
    'mail_to' => '', 'mail_from' => '',
    'telegram_bot_token' => '', 'telegram_chat_id' => '',
    'storage_dir' => __DIR__ . '/storage',
    'rate_limit' => 5, 'rate_window' => 600,
];
$cfg = is_file(__DIR__ . '/config.php') ? array_merge($defaults, (array) require __DIR__ . '/config.php') : $defaults;

$field = static function (string $k, int $max): string {
    $v = trim((string) ($_POST[$k] ?? ''));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
};

// --- Защита от ботов: скрытое поле и слишком быстрая отправка ---
if ($field('website', 200) !== '') {
    respond(true); // делаем вид, что всё хорошо
}
$ts = (int) ($_POST['ts'] ?? 0);
if ($ts > 0 && (microtime(true) * 1000 - $ts) < 2500) {
    respond(false, 'Слишком быстро. Попробуйте ещё раз через пару секунд.', 429);
}

// --- Данные ---
$name    = $field('name', 80);
$phone   = $field('phone', 30);
$email   = $field('email', 120);
$company = $field('company', 120);
$route   = $field('route', 120);
$message = $field('message', 1000);
$via     = $field('contact_via', 20);
$consent = ($_POST['consent'] ?? '') === '1';

$digits = preg_replace('/\D/', '', $phone) ?? '';
if (mb_strlen($name) < 2) respond(false, 'Укажите имя', 422);
if (strlen($digits) < 10 || strlen($digits) > 15) respond(false, 'Укажите корректный номер телефона', 422);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'Проверьте e-mail', 422);
if (!$consent) respond(false, 'Нужно согласие на обработку персональных данных', 422);

// --- Журнал и ограничение частоты ---
$dir = rtrim((string) $cfg['storage_dir'], '/');
if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
    respond(false, 'Временная ошибка сервера. Позвоните нам.', 500);
}
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$rateFile = $dir . '/rate.json';
$now = time();
$fh = fopen($rateFile, 'c+');
if ($fh && flock($fh, LOCK_EX)) {
    $data = json_decode((string) stream_get_contents($fh), true) ?: [];
    foreach ($data as $k => $list) {
        $data[$k] = array_values(array_filter((array) $list, static fn($t) => $t > $now - (int) $cfg['rate_window']));
        if (!$data[$k]) unset($data[$k]);
    }
    $key = hash('sha256', $ip); // в журнале частоты храним не IP, а его хэш
    if (count($data[$key] ?? []) >= (int) $cfg['rate_limit']) {
        flock($fh, LOCK_UN);
        fclose($fh);
        respond(false, 'Слишком много заявок. Попробуйте позже или позвоните нам.', 429);
    }
    $data[$key][] = $now;
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, (string) json_encode($data));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
}

$row = [
    'date'            => date('c'),
    'name'            => $name,
    'phone'           => $phone,
    'email'           => $email,
    'company'         => $company,
    'route'           => $route,
    'message'         => $message,
    'contact_via'     => $via,
    'consent'         => 'да',
    'consent_version' => CONSENT_VERSION,
    'ip'              => $ip,
    'user_agent'      => mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
];
$csv = $dir . '/leads.csv';
$isNew = !is_file($csv);
$out = fopen($csv, 'a');
if (!$out) respond(false, 'Временная ошибка сервера. Позвоните нам.', 500);
flock($out, LOCK_EX);
if ($isNew) {
    fwrite($out, "\xEF\xBB\xBF"); // BOM, чтобы Excel открыл кириллицу
    fputcsv($out, array_keys($row), ';', '"', '');
}
// Защита от формул при открытии в Excel
fputcsv($out, array_map(static fn($v) => preg_match('/^(?:[=@\t\r]|[+\-](?![\d\s(]))/', (string) $v) ? "'" . $v : $v, array_values($row)), ';', '"', '');
flock($out, LOCK_UN);
fclose($out);
@chmod($csv, 0640);

// --- Уведомления ---
$text = "Новая заявка с сайта\n\n"
    . "Имя: {$name}\nТелефон: {$phone}\n"
    . ($email !== '' ? "E-mail: {$email}\n" : '')
    . ($company !== '' ? "Компания: {$company}\n" : '')
    . ($route !== '' ? "Направление: {$route}\n" : '')
    . ($message !== '' ? "Товар: {$message}\n" : '')
    . "Связаться: {$via}\n"
    . 'Время: ' . date('d.m.Y H:i');

if ($cfg['mail_to'] !== '') {
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if ($cfg['mail_from'] !== '') $headers[] = 'From: ' . $cfg['mail_from'];
    if ($email !== '') $headers[] = 'Reply-To: ' . $email;
    @mail((string) $cfg['mail_to'], '=?UTF-8?B?' . base64_encode('Заявка: ' . $name) . '?=', $text, implode("\r\n", $headers));
}

if ($cfg['telegram_bot_token'] !== '' && $cfg['telegram_chat_id'] !== '') {
    $ctx = stream_context_create(['http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query(['chat_id' => $cfg['telegram_chat_id'], 'text' => $text]),
        'timeout' => 5,
    ]]);
    @file_get_contents('https://api.telegram.org/bot' . $cfg['telegram_bot_token'] . '/sendMessage', false, $ctx);
}

respond(true);

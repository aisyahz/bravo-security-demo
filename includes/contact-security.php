<?php
declare(strict_types=1);
if (!defined('BRAVO_CONTACT')) { http_response_code(404); exit; }

function bravoValidPhone(string $phone): bool
{
    if (!preg_match('/^\+?[0-9(). -]{7,40}$/D', $phone)) return false;
    $digits = preg_replace('/\D/', '', $phone);
    if (str_starts_with($digits, '00')) $digits = substr($digits, 2);
    return strlen($digits) >= 7 && strlen($digits) <= 15;
}

// Atomic, cross-session limits. Store only salted IP hashes and timestamps,
// outside the document root. REMOTE_ADDR must be restored by a trusted host
// when using a reverse proxy; never trust client forwarding headers here.
function bravoThrottle(string $bucket, int $limit, int $window): bool
{
    $directory = getenv('BRAVO_RATE_LIMIT_DIR') ?: sys_get_temp_dir() . '/bravo-' . substr(hash('sha256', __DIR__), 0, 16);
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) throw new RuntimeException('Throttle storage unavailable');
    $resolved = realpath($directory);
    $root = realpath(__DIR__ . '/..');
    if (!$resolved || !$root || str_starts_with(strtolower(str_replace('\\', '/', $resolved)) . '/', strtolower(str_replace('\\', '/', $root)) . '/')) throw new RuntimeException('Throttle storage must be outside web root');
    $file = @fopen($directory . '/limits.json', 'c+');
    if (!$file) throw new RuntimeException('Throttle storage unavailable');
    try {
        if (!flock($file, LOCK_EX)) throw new RuntimeException('Throttle lock unavailable');
        $raw = stream_get_contents($file);
        $state = $raw === '' ? ['salt' => bin2hex(random_bytes(32)), 'entries' => []] : json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        if (!isset($state['salt'], $state['entries']) || !is_array($state['entries'])) throw new RuntimeException('Invalid throttle state');
        $now = time();
        foreach ($state['entries'] as $key => $times) {
            $state['entries'][$key] = array_values(array_filter($times, static fn($t) => $t > $now - 3600));
            if (!$state['entries'][$key]) unset($state['entries'][$key]);
        }
        $key = $bucket . ':' . hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', $state['salt']);
        $times = array_values(array_filter($state['entries'][$key] ?? [], static fn($t) => $t > $now - $window));
        $global = $bucket . ':global';
        $globalTimes = $state['entries'][$global] ?? [];
        $allowed = count($times) < $limit && count($globalTimes) < ($bucket === 'mail' ? 50 : 300);
        if ($allowed) {
            $times[] = $now; $globalTimes[] = $now;
            $state['entries'][$key] = $times; $state['entries'][$global] = $globalTimes;
        }
        $json = json_encode($state, JSON_THROW_ON_ERROR);
        rewind($file);
        if (!ftruncate($file, 0) || fwrite($file, $json) !== strlen($json) || !fflush($file)) throw new RuntimeException('Throttle storage write failed');
        return $allowed;
    } finally { flock($file, LOCK_UN); fclose($file); }
}

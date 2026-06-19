<?php
header('Content-Type: application/javascript; charset=utf-8');
require_once __DIR__ . '/data_lib.php';

try {
    echo 'window.FK_DB_FROM_SERVER = ' . json_encode(build_fk_db_payload(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ';';
} catch (Throwable $e) {
    echo 'window.FK_DB_ERROR = ' . json_encode('Database not connected: ' . $e->getMessage()) . ';';
}
?>

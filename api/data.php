<?php
require_once __DIR__ . '/data_lib.php';

try {
    json_response(['success' => true, 'db' => build_fk_db_payload()]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Database data load failed: ' . $e->getMessage()], 500);
}
?>

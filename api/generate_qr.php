<?php
require_once __DIR__ . '/config.php';

try {
    //require_role(['admin', 'committee']);
    $eventId = (int)($_GET['event_id'] ?? 0);
    if ($eventId <= 0) {
        json_response(['success' => false, 'message' => 'Event ID required'], 400);
    }

    $event = fetch_one('SELECT * FROM event WHERE event_id = ?', [$eventId]);
    if (!$event) {
        json_response(['success' => false, 'message' => 'Event not found'], 404);
    }

    $qr_token = bin2hex(random_bytes(8));
    $qr_expiry = date('Y-m-d H:i:s', strtotime('+6 hours'));

    db()->prepare("INSERT INTO event_qr (event_id, qr_token, qr_expiry, status) VALUES (?, ?, ?, 'active')")
        ->execute([$eventId, $qr_token, $qr_expiry]);

    $checkin_url = "https://indah.ump.edu.my/CB24078/fk_system/events/checkin.html?token=" . $qr_token;
    
    $qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" . urlencode($checkin_url);

    json_response(['success' => true, 'qr_url' => $qr_url, 'token' => $qr_token]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => $e->getMessage()], 500);
}
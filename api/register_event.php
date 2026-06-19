<?php
require_once __DIR__ . '/config.php';

try {
    ensure_backend_columns();
    require_role(['student']);

    $data = get_json_input();
    $eventId = (int)($data['eventId'] ?? 0);

    if ($eventId <= 0) {
        json_response(['success' => false, 'message' => 'Event ID is required.'], 400);
    }

    $studentId = find_student_id_by_user_id((string)$_SESSION['user_id']);

    if (!$studentId) {
        json_response(['success' => false, 'message' => 'Student record not found.'], 404);
    }

    $student = fetch_one('SELECT * FROM student WHERE student_id = ? LIMIT 1', [$studentId]);
    $event = fetch_one('SELECT event_id, max_participants FROM event WHERE event_id = ? LIMIT 1', [$eventId]);

    if (!$event) {
        json_response(['success' => false, 'message' => 'Event not found.'], 404);
    }

    $existing = fetch_one('
        SELECT registration_id, status 
        FROM registrations 
        WHERE event_id = ? 
          AND student_id = ? 
          AND status <> "Cancelled" 
        LIMIT 1
    ', [$eventId, $studentId]);

    if ($existing) {
        json_response([
            'success' => false,
            'message' => 'You already registered or joined the waiting list for this event.'
        ], 409);
    }

    $confirmed = fetch_one('
        SELECT COUNT(*) AS total 
        FROM registrations 
        WHERE event_id = ? AND status = "Confirmed"
    ', [$eventId]);

    $status = ((int)$confirmed['total'] >= (int)$event['max_participants'])
        ? 'Waiting'
        : 'Confirmed';

    $regId = next_numeric_id('registrations', 'registration_id');

$stmt = db()->prepare('
        INSERT INTO registrations 
        (registration_id, event_id, student_id, status, registered_at, registration_date) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
    ');

    $stmt->execute([
        $regId,
        $eventId,
        $studentId,
        $status
    ]);
// If status is Waiting, also add to waiting_list table
    if ($status === 'Waiting') {
        $stmt = db()->prepare('
            INSERT INTO waiting_list 
            (event_id, student_id, status, queued_at) 
            VALUES (?, ?, "Waiting", NOW())
        ');
        $stmt->execute([$eventId, $studentId]);
    }

    if ($status === 'Confirmed') {
        $stmt = db()->prepare('
            UPDATE event 
            SET current_count = (
                SELECT COUNT(*) 
                FROM registrations 
                WHERE event_id = ? AND status = "Confirmed"
            ) 
            WHERE event_id = ?
        ');
        $stmt->execute([$eventId, $eventId]);
    }

    json_response([
        'success' => true,
        'status' => $status,
        'message' => $status === 'Waiting'
            ? 'Event is full. You have been added to the waiting list.'
            : 'Event registration confirmed and saved to database.',
        'registrationId' => (string)$regId
    ]);
} catch (Throwable $e) {
    json_response([
        'success' => false,
        'message' => 'Event registration failed: ' . $e->getMessage()
    ], 500);
}
?>
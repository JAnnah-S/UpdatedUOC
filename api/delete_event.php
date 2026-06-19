<?php
require_once __DIR__ . '/config.php';

try {
    require_role(['committee']);

    $data = get_json_input();
    $eventId = (int)($data['eventId'] ?? 0);

    if ($eventId <= 0) {
        json_response([
            'success' => false,
            'message' => 'Event ID is required.'
        ], 400);
    }

    // Get event first
    $event = fetch_one('
        SELECT event_id, club_id, event_title
        FROM event
        WHERE event_id = ?
        LIMIT 1
    ', [$eventId]);

    if (!$event) {
        json_response([
            'success' => false,
            'message' => 'Event not found.'
        ], 404);
    }

    // Check committee can delete only own club event
    // BINARY avoids collation error.
    $allowedClub = fetch_one('
        SELECT committee_id
        FROM club_committee
        WHERE BINARY user_id = BINARY ?
          AND BINARY club_id = BINARY ?
          AND status = "active"
        LIMIT 1
    ', [$_SESSION['user_id'] ?? '', $event['club_id']]);

    if (!$allowedClub) {
        json_response([
            'success' => false,
            'message' => 'Access denied. You can delete events only from your own club.'
        ], 403);
    }

    db()->beginTransaction();

    // Save affected students first
    $affectedStudents = fetch_all(
        'SELECT DISTINCT student_id FROM attendance WHERE event_id = ?',
        [$eventId]
    );

    // Delete child records first
    db()->prepare('DELETE FROM event_qr WHERE event_id = ?')->execute([$eventId]);
    db()->prepare('DELETE FROM registrations WHERE event_id = ?')->execute([$eventId]);
    db()->prepare('DELETE FROM student_points WHERE event_id = ?')->execute([$eventId]);
    db()->prepare('DELETE FROM attendance WHERE event_id = ?')->execute([$eventId]);

    // Delete event
    db()->prepare('DELETE FROM event WHERE event_id = ?')->execute([$eventId]);

    // Recalculate student total points
    foreach ($affectedStudents as $student) {
        if (!empty($student['student_id'])) {
            update_student_total_points($student['student_id']);
        }
    }

    db()->commit();

    json_response([
        'success' => true,
        'message' => 'Event deleted from database successfully.'
    ]);

} catch (Throwable $e) {
    if (db()->inTransaction()) {
        db()->rollBack();
    }

    json_response([
        'success' => false,
        'message' => 'Delete event failed: ' . $e->getMessage()
    ], 500);
}
?>
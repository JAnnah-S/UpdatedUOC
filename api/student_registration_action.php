<?php
require_once __DIR__ . '/config.php';

function recalc_event_count_after_student_action(int $eventId): void
{
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

try {
    require_role(['student']);

    $data = get_json_input();

    $registrationId = (int)($data['registrationId'] ?? 0);
    $action = strtolower(trim((string)($data['action'] ?? '')));

    if ($registrationId <= 0 || !in_array($action, ['cancel', 'leave_queue'], true)) {
        json_response([
            'success' => false,
            'message' => 'Invalid registration action.'
        ], 400);
    }

    $studentId = find_student_id_by_user_id((string)$_SESSION['user_id']);

    if (!$studentId) {
        json_response([
            'success' => false,
            'message' => 'Student record not found.'
        ], 404);
    }

    $reg = fetch_one('
        SELECT registration_id, event_id, student_id, status
        FROM registrations
        WHERE registration_id = ?
        LIMIT 1
    ', [$registrationId]);

    if (!$reg) {
        json_response([
            'success' => false,
            'message' => 'Registration record not found.'
        ], 404);
    }

    if ($reg['student_id'] !== $studentId) {
        json_response([
            'success' => false,
            'message' => 'Access denied. You can only update your own registration.'
        ], 403);
    }

    if ($action === 'cancel' && $reg['status'] !== 'Confirmed') {
        json_response([
            'success' => false,
            'message' => 'Only confirmed registration can be cancelled.'
        ], 400);
    }

    if ($action === 'leave_queue' && $reg['status'] !== 'Waiting') {
        json_response([
            'success' => false,
            'message' => 'Only waiting list registration can leave queue.'
        ], 400);
    }

   $stmt = db()->prepare('
        UPDATE registrations 
        SET status = "Cancelled"
        WHERE registration_id = ?
    ');
    $stmt->execute([$registrationId]);

    // If leaving the waiting queue, DELETE from waiting_list table
    if ($action === 'leave_queue') {
        $stmt = db()->prepare('
            DELETE FROM waiting_list 
            WHERE event_id = ? AND student_id = ? AND status = "Waiting"
        ');
        $stmt->execute([(int)$reg['event_id'], $reg['student_id']]);
    }

    recalc_event_count_after_student_action((int)$reg['event_id']);

    json_response([
        'success' => true,
        'message' => $action === 'leave_queue'
            ? 'You have left the waiting list.'
            : 'Your event registration has been cancelled.'
    ]);

} catch (Throwable $e) {
    json_response([
        'success' => false,
        'message' => 'Registration update failed: ' . $e->getMessage()
    ], 500);
}
?>
<?php
require_once __DIR__ . '/config.php';

function recalc_event_current_count(int $eventId): void
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
    require_role(['committee']);

    $data = get_json_input();
    $registrationId = (int)($data['registrationId'] ?? 0);
    $action = strtolower(trim((string)($data['action'] ?? '')));

    if ($registrationId <= 0 || !in_array($action, ['promote', 'remove'], true)) {
        json_response(['success' => false, 'message' => 'Invalid registration action.'], 400);
    }

    $reg = fetch_one('
        SELECT r.*, e.club_id, e.max_participants 
        FROM registrations r 
        JOIN event e ON e.event_id = r.event_id 
        WHERE r.registration_id = ? 
        LIMIT 1
    ', [$registrationId]);

    if (!$reg) {
        json_response(['success' => false, 'message' => 'Registration record not found.'], 404);
    }

    $committeeClub = fetch_one('
        SELECT committee_id 
        FROM club_committee 
        WHERE user_id = ? 
          AND club_id = ? 
          AND status = "active" 
        LIMIT 1
    ', [$_SESSION['user_id'] ?? '', $reg['club_id']]);

    if (!$committeeClub) {
        json_response([
            'success' => false,
            'message' => 'Access denied. You can manage participants only for your own club events.'
        ], 403);
    }

    $eventId = (int)$reg['event_id'];

    if ($action === 'promote') {
        if ($reg['status'] !== 'Waiting') {
            json_response(['success' => false, 'message' => 'Only waiting list students can be promoted.'], 400);
        }

        $confirmed = fetch_one('
            SELECT COUNT(*) AS total 
            FROM registrations 
            WHERE event_id = ? AND status = "Confirmed"
        ', [$eventId]);

        if ((int)$confirmed['total'] >= (int)$reg['max_participants']) {
            json_response(['success' => false, 'message' => 'Cannot promote. Event capacity is already full.'], 409);
        }

        $stmt = db()->prepare('UPDATE registrations SET status = "Confirmed" WHERE registration_id = ?');
        $stmt->execute([$registrationId]);

        recalc_event_current_count($eventId);

        json_response([
            'success' => true,
            'message' => 'Student promoted from waiting list to confirmed participant.'
        ]);
    }

    if ($action === 'remove') {
        $stmt = db()->prepare('UPDATE registrations SET status = "Cancelled" WHERE registration_id = ?');
        $stmt->execute([$registrationId]);

        // Also delete from waiting_list table
        $stmt = db()->prepare('DELETE FROM waiting_list WHERE event_id = ? AND student_id = ? AND status = "Waiting"');
        $stmt->execute([$eventId, $reg['student_id']]);

        recalc_event_current_count($eventId);

        json_response([
            'success' => true,
            'message' => 'Student removed from waiting list.'
        ]);
    }
if ($action === 'promote') {
        // ... existing checks ...

        $stmt = db()->prepare('UPDATE registrations SET status = "Confirmed" WHERE registration_id = ?');
        $stmt->execute([$registrationId]);

        // Also delete from waiting_list table
        $stmt = db()->prepare('DELETE FROM waiting_list WHERE event_id = ? AND student_id = ? AND status = "Waiting"');
        $stmt->execute([$eventId, $reg['student_id']]);

        recalc_event_current_count($eventId);
        // ... rest
    }

} catch (Throwable $e) {
    json_response([
        'success' => false,
        'message' => 'Participant update failed: ' . $e->getMessage()
    ], 500);
}
?>
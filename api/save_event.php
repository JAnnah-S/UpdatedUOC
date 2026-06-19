<?php
require_once __DIR__ . '/config.php';

try {
    ensure_backend_columns();
    require_role(['committee']);
    $data = get_json_input();
    $id = trim((string)($data['id'] ?? ''));
    $clubId = trim((string)($data['clubId'] ?? ''));
    $title = trim((string)($data['title'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    $date = trim((string)($data['date'] ?? ''));
    $time = trim((string)($data['time'] ?? ''));
    $venue = trim((string)($data['venue'] ?? ''));
    $capacity = (int)($data['capacity'] ?? 0);
    $semester = trim((string)($data['semester'] ?? ''));
    $eventType = trim((string)($data['eventType'] ?? 'General'));
    $status = status_to_db((string)($data['status'] ?? 'Open'));

    if ($clubId === '' || $title === '' || $date === '' || $time === '' || $venue === '' || $capacity <= 0) {
        json_response(['success' => false, 'message' => 'Please complete all required event fields.'], 400);
    }

    $allowedClub = fetch_one(
        'SELECT committee_id FROM club_committee WHERE user_id = ? AND club_id = ? AND status = "active" LIMIT 1',
        [$_SESSION['user_id'] ?? '', $clubId]
    );

    if (!$allowedClub) {
        json_response([
            'success' => false,
            'message' => 'Committee can create events only for their assigned club.'
        ], 403);
    }

    $committeeId = 1;
    if (isset($_SESSION['user_id'])) {
        $com = fetch_one('SELECT committee_id FROM club_committee WHERE user_id = ? AND club_id = ? LIMIT 1', [$_SESSION['user_id'], $clubId]);
        if ($com) $committeeId = (int)preg_replace('/\D+/', '', (string)$com['committee_id']) ?: 1;
    }

    if ($id !== '' && ctype_digit($id)) {
        $stmt = db()->prepare('UPDATE event SET club_id = ?, event_title = ?, event_description = ?, event_date = ?, event_time = ?, venue = ?, max_participants = ?, status = ?, semester = ?, event_type = ? WHERE event_id = ?');
        $stmt->execute([$clubId, $title, $description, $date, $time, $venue, $capacity, $status, $semester ?: semester_from_date($date), $eventType, (int)$id]);
        $eventId = (int)$id;
    } else {
        $stmt = db()->prepare('INSERT INTO event (event_title, event_description, event_date, event_time, venue, max_participants, current_count, status, club_id, committee_id, semester, event_type) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)');
        $stmt->execute([$title, $description, $date, $time, $venue, $capacity, $status, $clubId, $committeeId, $semester ?: semester_from_date($date), $eventType]);
        $eventId = (int)db()->lastInsertId();
    }

    json_response(['success' => true, 'message' => 'Event saved to database.', 'eventId' => (string)$eventId]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Save event failed: ' . $e->getMessage()], 500);
}
?>

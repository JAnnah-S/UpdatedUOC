<?php
require_once __DIR__ . '/config.php';

try {
    // 1. Benarkan kedua-dua peranan (Admin dan Committee) untuk memadam acara
    require_role(['admin', 'committee']);

    $data = get_json_input();
    $eventId = (int)($data['eventId'] ?? 0);

    if ($eventId <= 0) {
        json_response([
            'success' => false,
            'message' => 'Event ID is required.'
        ], 400);
    }

    // Ambil data acara
    $event = fetch_one('
        SELECT event_id, club_id, title AS event_title
        FROM event
        WHERE event_id = ?
        LIMIT 1
    ', [$eventId]);

    if (!$event) {
        // Cuba semak jika nama lajur di DB anda menggunakan event_title
        $event = fetch_one('
            SELECT event_id, club_id, event_title
            FROM event
            WHERE event_id = ?
            LIMIT 1
        ', [$eventId]);
    }

    if (!$event) {
        json_response([
            'success' => false,
            'message' => 'Event not found.'
        ], 404);
    }

    // 2. Sekatan Kelab: Hanya dikenakan kepada peranan 'committee'. Admin dikecualikan.
    if ($_SESSION['role'] === 'committee') {
        $allowedClub = fetch_one('
            SELECT id FROM memberships
            WHERE BINARY user_id = BINARY ?
              AND BINARY club_id = BINARY ?
              AND type = "Committee"
            LIMIT 1
        ', [$_SESSION['user_id'] ?? '', $event['club_id']]);

        if (!$allowedClub) {
            // Cuba semak jadual alternatif club_committee jika memberships tiada
            $allowedClub = fetch_one('
                SELECT committee_id
                FROM club_committee
                WHERE BINARY user_id = BINARY ?
                  AND BINARY club_id = BINARY ?
                  AND status = "active"
                LIMIT 1
            ', [$_SESSION['user_id'] ?? '', $event['club_id']]);
        }

        if (!$allowedClub) {
            json_response([
                'success' => false,
                'message' => 'Access denied. You can delete events only from your own club.'
            ], 403);
        }
    }

    db()->beginTransaction();

    // Simpan senarai ID pelajar yang terkesan untuk kira semula mata ganjaran
    $affectedStudents = fetch_all(
        'SELECT DISTINCT student_id FROM attendance WHERE event_id = ?',
        [$eventId]
    );

    // Padam rekod anak (child records) terlebih dahulu bagi mengelakkan ralat Foreign Key
    db()->prepare('DELETE FROM event_qr WHERE event_id = ?')->execute([$eventId]);
    db()->prepare('DELETE FROM registrations WHERE event_id = ?')->execute([$eventId]);
    
    // Semak dan padam jadual student_points jika wujud
    $stmtCheck = db()->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_points'");
    $stmtCheck->execute();
    if ((int)$stmtCheck->fetchColumn() > 0) {
        db()->prepare('DELETE FROM student_points WHERE event_id = ?')->execute([$eventId]);
    }
    
    db()->prepare('DELETE FROM attendance WHERE event_id = ?')->execute([$eventId]);

    // Akhir sekali, padam acara utama dari jadual event
    db()->prepare('DELETE FROM event WHERE event_id = ?')->execute([$eventId]);

    // Kira semula mata ganjaran terkini pelajar secara automatik
    if (function_exists('update_student_total_points')) {
        foreach ($affectedStudents as $student) {
            if (!empty($student['student_id'])) {
                update_student_total_points($student['student_id']);
            }
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

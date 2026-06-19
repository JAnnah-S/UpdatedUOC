<?php
require_once __DIR__ . '/config.php';

function table_exists_for_delete(string $table): bool
{
    $stmt = db()->prepare("
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
    ");
    $stmt->execute([$table]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return (int)($row['total'] ?? 0) > 0;
}

try {
    require_role(['admin']);

    $data = get_json_input();
    $clubId = trim((string)($data['id'] ?? $data['clubId'] ?? ''));

    if ($clubId === '') {
        json_response([
            'success' => false,
            'message' => 'Club ID is required.'
        ], 400);
    }

    $club = fetch_one('
        SELECT club_id, club_name
        FROM club
        WHERE BINARY club_id = BINARY ?
        LIMIT 1
    ', [$clubId]);

    if (!$club) {
        json_response([
            'success' => false,
            'message' => 'Club not found.'
        ], 404);
    }

    db()->beginTransaction();

    $affectedStudents = [];

    if (table_exists_for_delete('attendance')) {
        $affectedStudents = fetch_all('
            SELECT DISTINCT a.student_id
            FROM attendance a
            JOIN event e ON e.event_id = a.event_id
            WHERE BINARY e.club_id = BINARY ?
        ', [$clubId]);
    }

    if (table_exists_for_delete('event_qr')) {
        db()->prepare('
            DELETE FROM event_qr
            WHERE event_id IN (
                SELECT event_id FROM event WHERE BINARY club_id = BINARY ?
            )
        ')->execute([$clubId]);
    }

    if (table_exists_for_delete('registrations')) {
        db()->prepare('
            DELETE FROM registrations
            WHERE event_id IN (
                SELECT event_id FROM event WHERE BINARY club_id = BINARY ?
            )
        ')->execute([$clubId]);
    }

    if (table_exists_for_delete('student_points')) {
        db()->prepare('
            DELETE FROM student_points
            WHERE event_id IN (
                SELECT event_id FROM event WHERE BINARY club_id = BINARY ?
            )
        ')->execute([$clubId]);
    }

    if (table_exists_for_delete('attendance')) {
        db()->prepare('
            DELETE FROM attendance
            WHERE event_id IN (
                SELECT event_id FROM event WHERE BINARY club_id = BINARY ?
            )
        ')->execute([$clubId]);
    }

    if (table_exists_for_delete('event')) {
        db()->prepare('
            DELETE FROM event
            WHERE BINARY club_id = BINARY ?
        ')->execute([$clubId]);
    }

    if (table_exists_for_delete('club_committee')) {
        db()->prepare('
            DELETE FROM club_committee
            WHERE BINARY club_id = BINARY ?
        ')->execute([$clubId]);
    }

    db()->prepare('
        DELETE FROM club
        WHERE BINARY club_id = BINARY ?
    ')->execute([$clubId]);

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
        'message' => 'Club deleted from database successfully.'
    ]);

} catch (Throwable $e) {
    if (db()->inTransaction()) {
        db()->rollBack();
    }

    json_response([
        'success' => false,
        'message' => 'Delete club failed: ' . $e->getMessage()
    ], 500);
}
?>
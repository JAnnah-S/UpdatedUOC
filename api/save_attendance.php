<?php
require_once __DIR__ . '/config.php';

try {
    ensure_backend_columns();
    require_role(['admin', 'committee']);
    $data = get_json_input();
    $eventId = (int)($data['eventId'] ?? 0);
    $userId = trim((string)($data['userId'] ?? ''));
    $status = trim((string)($data['status'] ?? 'Present'));
    $helper = !empty($data['helper']) ? 1 : 0;
    $points = (int)($data['points'] ?? 0);
    $location = trim((string)($data['location'] ?? 'Venue/geolocation not captured'));

    if ($eventId <= 0 || $userId === '') {
        json_response(['success' => false, 'message' => 'Event and student are required.'], 400);
    }
    if (!in_array($status, ['Present', 'Late', 'Absent'], true)) {
        json_response(['success' => false, 'message' => 'Invalid attendance status.'], 400);
    }

    $studentId = find_student_id_by_user_id($userId);
    if (!$studentId) {
        json_response(['success' => false, 'message' => 'Student record not found for selected user.'], 404);
    }

    $pdo = db();
    $pdo->beginTransaction();

    $existing = fetch_one('SELECT attendance_id FROM attendance WHERE event_id = ? AND student_id = ? LIMIT 1', [$eventId, $studentId]);
    if ($existing) {
        $stmt = $pdo->prepare('UPDATE attendance SET checkin_time = NOW(), attendance_status = ?, attendance_points = ?, is_volunteer = ?, location_stamp = ? WHERE attendance_id = ?');
        $stmt->execute([$status, $points, $helper, $location, $existing['attendance_id']]);
        $attendanceId = $existing['attendance_id'];
    } else {
        $attendanceId = next_code_id('attendance', 'attendance_id', 'ATT', 4);
        $stmt = $pdo->prepare('INSERT INTO attendance (attendance_id, student_id, event_id, checkin_time, attendance_status, attendance_points, is_volunteer, location_stamp) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)');
        $stmt->execute([$attendanceId, $studentId, $eventId, $status, $points, $helper, $location]);
    }

    $point = fetch_one('SELECT point_id FROM student_points WHERE student_id = ? AND event_id = ? LIMIT 1', [$studentId, $eventId]);
    if ($point) {
        $stmt = $pdo->prepare('UPDATE student_points SET points_earned = ?, date_awarded = NOW() WHERE point_id = ?');
        $stmt->execute([$points, $point['point_id']]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO student_points (point_id, student_id, event_id, points_earned, date_awarded) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([next_code_id('student_points', 'point_id', 'PT', 3), $studentId, $eventId, $points]);
    }

    $regStatus = $status === 'Absent' ? 'Cancelled' : 'Confirmed';
    $stmt = $pdo->prepare('UPDATE registrations SET status = ? WHERE event_id = ? AND student_id = ?');
    $stmt->execute([$regStatus, $eventId, $studentId]);

    update_student_total_points($studentId);
    $pdo->commit();
    json_response(['success' => true, 'message' => 'Attendance saved to database.', 'attendanceId' => $attendanceId]);
} catch (Throwable $e) {
    if (db()->inTransaction()) db()->rollBack();
    json_response(['success' => false, 'message' => 'Save attendance failed: ' . $e->getMessage()], 500);
}
?>

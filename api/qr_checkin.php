<?php
require_once __DIR__ . '/config.php';

try {
    ensure_backend_columns();

    $data = get_json_input();
    $token = trim((string)($data['token'] ?? ''));

    $now = date('Y-m-d H:i:s');
    $qr = fetch_one("SELECT * FROM event_qr WHERE qr_token = ? AND status = 'active' AND qr_expiry > ?", [$token, $now]);

    if (!$qr) {
        json_response(['success' => false, 'message' => 'Invalid or expired QR code.'], 400);
    }

    if (!isset($_SESSION['user_id'])) {
        json_response(['success' => false, 'message' => 'Please login first to check in.'], 401);
    }

    $eventId = $qr['event_id'];
    $studentId = find_student_id_by_user_id($_SESSION['user_id']);
    if (!$studentId) {
        json_response(['success' => false, 'message' => 'Student record not found.'], 404);
    }

    $points = 10;
    $status = 'Present';

    $pdo = db();
    $existing = fetch_one('SELECT attendance_id FROM attendance WHERE event_id = ? AND student_id = ? LIMIT 1', [$eventId, $studentId]);
    if ($existing) {
        $stmt = $pdo->prepare('UPDATE attendance SET checkin_time = NOW(), attendance_status = ?, attendance_points = ? WHERE attendance_id = ?');
        $stmt->execute([$status, $points, $existing['attendance_id']]);
    } else {
        $attendanceId = next_code_id('attendance', 'attendance_id', 'ATT', 4);
        $stmt = $pdo->prepare('INSERT INTO attendance (attendance_id, student_id, event_id, checkin_time, attendance_status, attendance_points, is_volunteer) VALUES (?, ?, ?, NOW(), ?, ?, 0)');
        $stmt->execute([$attendanceId, $studentId, $eventId, $status, $points]);
    }

    update_student_total_points($studentId);
    json_response(['success' => true, 'message' => 'Attendance recorded successfully!']);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'ERROR: ' . $e->getMessage()], 500);
}
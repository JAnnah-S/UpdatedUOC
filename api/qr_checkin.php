<?php
require_once __DIR__ . '/config.php';

try {
    ensure_backend_columns();

    $data = get_json_input();
    $token = trim((string)($data['token'] ?? ''));
    
    // Ambil koordinat GPS yang dihantar oleh frontend pelajar
    $studentLat = isset($data['lat']) ? floatval($data['lat']) : 0;
    $studentLng = isset($data['lng']) ? floatval($data['lng']) : 0;

    $now = date('Y-m-d H:i:s');
    // Ambil maklumat QR bersama maklumat lokasi (latitude/longitude) daripada jadual events
    $qr = fetch_one("
        SELECT q.*, e.latitude, e.longitude 
        FROM event_qr q 
        JOIN events e ON q.event_id = e.event_id 
        WHERE q.qr_token = ? AND q.status = 'active' AND q.qr_expiry > ?
    ", [$token, $now]);

    if (!$qr) {
        json_response(['success' => false, 'message' => 'Invalid or expired QR code.'], 400);
    }

    if (!isset($_SESSION['user_id'])) {
        json_response(['success' => false, 'message' => 'Please login first to check in.'], 401);
    }

    // --- PENGIRAAN GEOLOCATION (RADIUS HAD 20 METER) ---
    // Gunakan koordinat dari database (jika ada), jika tiada ia lalai (default) ke koordinat UMPSA Pekan
    $eventLat = !empty($qr['latitude']) ? floatval($qr['latitude']) : 3.5436;
    $eventLng = !empty($qr['longitude']) ? floatval($qr['longitude']) : 103.4289;
    $maxRadiusMeters = 20; // Had jarak 20 meter

    if ($studentLat === 0.0 || $studentLng === 0.0) {
        json_response(['success' => false, 'message' => 'Gagal mengesahkan kehadiran. Sila aktifkan GPS peranti anda.'], 400);
    }

    // Formula Haversine
    $earthRadius = 6371000; // Radius bumi dalam meter
    $latDelta = deg2rad($eventLat - $studentLat);
    $lngDelta = deg2rad($eventLng - $studentLng);

    $a = sin($latDelta / 2) * sin($latDelta / 2) +
         cos(deg2rad($studentLat)) * cos(deg2rad($eventLat)) *
         sin($lngDelta / 2) * sin($lngDelta / 2);

    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $calculatedDistance = $earthRadius * $c;

    // Jika pelajar berada di luar lingkungan 20 meter
    if ($calculatedDistance > $maxRadiusMeters) {
        json_response([
            'success' => false, 
            'message' => 'Daftar masuk gagal! Anda berada ' . round($calculatedDistance, 1) . 'm dari lokasi acara (Had maksima: 20m).'
        ], 400);
    }
    // ---------------------------------------------------

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

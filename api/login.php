<?php
require_once __DIR__ . '/config.php';

try {
    ensure_backend_columns();
    $data = get_json_input();
    $loginId = trim((string)($data['loginId'] ?? ''));
    $password = (string)($data['password'] ?? '');

    if ($loginId === '' || $password === '') {
        json_response(['success' => false, 'message' => 'ID and password are required'], 400);
    }

  
    $lookup = $aliases[strtoupper($loginId)] ?? $loginId;

   $sql = 'SELECT u.*, s.student_id, s.programme, a.department, a.position AS admin_position,
               cc.club_id, cc.position AS committee_position
        FROM `user` u
        LEFT JOIN student s ON BINARY s.user_id = BINARY u.user_id
        LEFT JOIN admin a ON BINARY a.user_id = BINARY u.user_id
        LEFT JOIN club_committee cc 
          ON BINARY cc.user_id = BINARY u.user_id 
         AND cc.status = "active"
        WHERE (
            BINARY u.username = BINARY ? 
            OR BINARY u.user_id = BINARY ? 
            OR BINARY u.email = BINARY ? 
            OR BINARY s.student_id = BINARY ?
        )
          AND u.status = "active"
        ORDER BY u.updated_at DESC, u.created_at DESC
        LIMIT 1';
    $row = fetch_one($sql, [$lookup, $lookup, $lookup, $lookup]);

    if (!$row) {
        json_response(['success' => false, 'message' => 'Invalid Student/Staff ID or password'], 401);
    }

    $validPassword = password_verify($password, (string)$row['password']);

    if (!$validPassword) {
        json_response(['success' => false, 'message' => 'Invalid Student/Staff ID or password'], 401);
    }

    $displayId = $row['student_id'] ?: $row['user_id'];
    $user = [
        'id' => (string)$row['user_id'],
        'studentId' => (string)$displayId,
        'username' => (string)$row['username'],
        'name' => (string)$row['full_name'],
        'email' => (string)$row['email'],
        'role' => (string)$row['role'],
        'phone' => (string)($row['phone'] ?? ''),
        'department' => (string)($row['programme'] ?? $row['department'] ?? 'Faculty of Computing'),
        'clubId' => (string)($row['club_id'] ?? ''),
        'position' => (string)($row['committee_position'] ?? $row['admin_position'] ?? ''),
        'active' => true,
    ];

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['name'] = $user['name'];

    json_response(['success' => true, 'message' => 'Login successful', 'user' => $user]);
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()], 500);
}
?>

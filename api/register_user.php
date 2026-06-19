<?php
require_once __DIR__ . '/config.php';

try {
    ensure_backend_columns();
    require_role(['admin']);
    $data = get_json_input();

    $studentId = strtoupper(trim((string)($data['studentId'] ?? '')));
    $name = trim((string)($data['name'] ?? ''));
    $email = strtolower(trim((string)($data['email'] ?? '')));
    $password = (string)($data['password'] ?? 'student123');
    $role = strtolower(trim((string)($data['role'] ?? 'student')));
    $phone = trim((string)($data['phone'] ?? ''));
    $department = trim((string)($data['department'] ?? 'Faculty of Computing'));
    $clubId = trim((string)($data['clubId'] ?? ''));
    $position = trim((string)($data['position'] ?? 'Committee Member'));
    $existingId = trim((string)($data['id'] ?? ''));

    if ($studentId === '' || $name === '' || $email === '') {
        json_response(['success' => false, 'message' => 'Student/Staff ID, name and email are required.'], 400);
    }
    if (!in_array($role, ['admin', 'committee', 'student'], true)) {
        json_response(['success' => false, 'message' => 'Invalid role.'], 400);
    }

    $pdo = db();
    $pdo->beginTransaction();

    $userId = $existingId !== '' ? $existingId : $studentId;
    if (strlen($userId) > 11) {
        $userId = substr($userId, 0, 11);
    }
    if ($existingId === '') {
        $existing = fetch_one('SELECT user_id FROM `user` WHERE user_id = ? OR username = ? OR email = ? LIMIT 1', [$userId, $studentId, $email]);
        if ($existing) {
            $pdo->rollBack();
            json_response(['success' => false, 'message' => 'User ID, username or email already exists in database.'], 409);
        }
        $stmt = $pdo->prepare('INSERT INTO `user` (user_id, username, password, full_name, email, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, "active")');
        $stmt->execute([$userId, $studentId, password_hash($password, PASSWORD_DEFAULT), $name, $email, $phone, $role]);
    } else {
        $params = [$studentId, $name, $email, $phone, $role];
        $sql = 'UPDATE `user` SET username = ?, full_name = ?, email = ?, phone = ?, role = ?';
        if ($password !== '') {
            $sql .= ', password = ?';
            $params[] = password_hash($password, PASSWORD_DEFAULT);
        }
        $sql .= ' WHERE user_id = ?';
        $params[] = $userId;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    if (in_array($role, ['student', 'committee'], true)) {
        $student = fetch_one('SELECT student_id FROM student WHERE student_id = ? OR user_id = ? LIMIT 1', [$studentId, $userId]);
        if ($student) {
            $stmt = $pdo->prepare('UPDATE student SET student_name = ?, programme = ? WHERE student_id = ?');
            $stmt->execute([$name, $department ?: 'Faculty of Computing', $student['student_id']]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO student (student_id, user_id, student_name, programme, year_of_study, semester, matric_no, total_points) VALUES (?, ?, ?, ?, 1, 1, ?, 0)');
            $stmt->execute([$studentId, $userId, $name, $department ?: 'Faculty of Computing', $studentId]);
        }
    }

    if ($role === 'admin') {
        $admin = fetch_one('SELECT admin_id FROM admin WHERE user_id = ? LIMIT 1', [$userId]);
        if ($admin) {
            $stmt = $pdo->prepare('UPDATE admin SET adminName = ?, position = ?, department = ?, office_phone = ? WHERE user_id = ?');
            $stmt->execute([$name, $position ?: 'FK Staff', $department ?: 'Faculty of Computing', $phone, $userId]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO admin (admin_id, user_id, adminName, position, department, office_phone) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([next_code_id('admin', 'admin_id', 'ADM', 3), $userId, $name, $position ?: 'FK Staff', $department ?: 'Faculty of Computing', $phone]);
        }
    }

    if ($role === 'committee' && $clubId !== '') {
        $validPositions = ['President','Vice President','Secretary','Treasurer','Committee Member'];
        if (!in_array($position, $validPositions, true)) $position = 'Committee Member';
        $committee = fetch_one('SELECT committee_id FROM club_committee WHERE user_id = ? AND club_id = ? LIMIT 1', [$userId, $clubId]);
        if ($committee) {
            $stmt = $pdo->prepare('UPDATE club_committee SET position = ?, status = "active" WHERE committee_id = ?');
            $stmt->execute([$position, $committee['committee_id']]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO club_committee (committee_id, club_id, user_id, position, joined_date, academic_year, status) VALUES (?, ?, ?, ?, CURDATE(), "2025/2026", "active")');
            $stmt->execute([next_code_id('club_committee', 'committee_id', 'COM', 3), $clubId, $userId, $position]);
        }
    }

    if (in_array($role, ['student', 'committee'], true) && $clubId !== '') {
        $member = fetch_one('SELECT membership_id FROM membership WHERE student_id = ? AND club_id = ? LIMIT 1', [$studentId, $clubId]);
        if (!$member) {
            $stmt = $pdo->prepare('INSERT INTO membership (membership_id, student_id, club_id, student_card_path, status, application_date, approved_by, approved_at, remarks) VALUES (?, ?, ?, "admin-created", "Active", CURDATE(), ?, NOW(), "Created by admin dashboard")');
            $stmt->execute([next_code_id('membership', 'membership_id', 'MBR', 3), $studentId, $clubId, $_SESSION['user_id'] ?? null]);
        }
    }

    $pdo->commit();
    json_response(['success' => true, 'message' => 'User saved to database.', 'userId' => $userId]);
} catch (Throwable $e) {
    if (db()->inTransaction()) db()->rollBack();
    json_response(['success' => false, 'message' => 'Register user failed: ' . $e->getMessage()], 500);
}
?>

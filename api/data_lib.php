<?php
require_once __DIR__ . '/config.php';

function build_fk_db_payload(): array
{
    ensure_backend_columns();

    // De-duplicate user rows from the uploaded SQL dump. The latest row for each user_id is used.
    $rawUsers = fetch_all('SELECT * FROM `user` ORDER BY created_at DESC, updated_at DESC');
    $usersById = [];
    foreach ($rawUsers as $u) {
        if (!isset($usersById[$u['user_id']])) {
            $usersById[$u['user_id']] = $u;
        }
    }

    $students = [];
    foreach (fetch_all('SELECT * FROM student') as $s) {
        $students[$s['user_id']] = $s;
        $students[$s['student_id']] = $s;
    }

    $committeeRows = fetch_all('SELECT cc.*, c.club_name FROM club_committee cc LEFT JOIN club c ON c.club_id = cc.club_id WHERE cc.status = "active"');
    $committeeByUser = [];
    foreach ($committeeRows as $c) {
        if (!isset($committeeByUser[$c['user_id']])) {
            $committeeByUser[$c['user_id']] = $c;
        }
    }

    $adminByUser = [];
    foreach (fetch_all('SELECT * FROM admin') as $a) {
        $adminByUser[$a['user_id']] = $a;
    }

    $users = [];
    foreach ($usersById as $u) {
        $student = $students[$u['user_id']] ?? null;
        $committee = $committeeByUser[$u['user_id']] ?? null;
        $admin = $adminByUser[$u['user_id']] ?? null;
        $displayId = $student['student_id'] ?? $u['user_id'];
        $users[] = [
            'id' => (string)$u['user_id'],
            'studentId' => (string)$displayId,
            'username' => (string)$u['username'],
            'name' => (string)$u['full_name'],
            'email' => (string)$u['email'],
            'password' => '',
            'role' => (string)$u['role'],
            'phone' => (string)($u['phone'] ?? ''),
            'department' => (string)($student['programme'] ?? $admin['department'] ?? 'Faculty of Computing'),
            'clubId' => (string)($committee['club_id'] ?? ''),
            'position' => (string)($committee['position'] ?? $admin['position'] ?? ''),
            'photo' => (string)($u['profile_photo'] ?? ''),
            'createdAt' => substr((string)($u['created_at'] ?? date('Y-m-d')), 0, 10),
            'active' => strtolower((string)$u['status']) === 'active',
        ];
    }

    $clubs = array_map(function ($c) {
        return [
            'id' => (string)$c['club_id'],
            'name' => (string)$c['club_name'],
            'code' => (string)$c['club_code'],
            'description' => (string)($c['club_description'] ?? ''),
            'advisor' => (string)($c['advisor_name'] ?? ''),
            'email' => (string)($c['advisor_email'] ?? ''),
            'status' => strtolower((string)$c['status']) === 'active' ? 'Active' : 'Inactive',
            'createdAt' => substr((string)($c['created_at'] ?? date('Y-m-d')), 0, 10),
        ];
    }, fetch_all('SELECT * FROM club ORDER BY club_name'));

    $events = array_map(function ($e) {
        return [
            'id' => (string)$e['event_id'],
            'clubId' => (string)$e['club_id'],
            'title' => (string)$e['event_title'],
            'description' => (string)$e['event_description'],
            'date' => (string)$e['event_date'],
            'time' => substr((string)$e['event_time'], 0, 5),
            'venue' => (string)$e['venue'],
            'capacity' => (int)$e['max_participants'],
            'status' => status_to_ui((string)$e['status']),
            'semester' => (string)($e['semester'] ?: semester_from_date((string)$e['event_date'])),
            'eventType' => (string)($e['event_type'] ?: event_type_from_title((string)$e['event_title'])),
            'createdBy' => (string)($e['committee_id'] ?? ''),
        ];
    }, fetch_all('SELECT * FROM event ORDER BY event_date DESC, event_time DESC'));

    $studentByStudentId = [];
    foreach (fetch_all('SELECT * FROM student') as $s) {
        $studentByStudentId[$s['student_id']] = $s;
    }

    $memberships = [];
    foreach (fetch_all('SELECT * FROM membership') as $m) {
        $student = $studentByStudentId[$m['student_id']] ?? null;
        $memberships[] = [
            'id' => (string)$m['membership_id'],
            'userId' => (string)($student['user_id'] ?? $m['student_id']),
            'clubId' => (string)$m['club_id'],
            'position' => 'Member',
            'type' => 'Member',
            'joinedAt' => (string)$m['application_date'],
            'status' => (string)$m['status'],
        ];
    }
    foreach ($committeeRows as $cc) {
        $memberships[] = [
            'id' => (string)$cc['committee_id'],
            'userId' => (string)$cc['user_id'],
            'clubId' => (string)$cc['club_id'],
            'position' => (string)$cc['position'],
            'type' => 'Committee',
            'joinedAt' => (string)$cc['joined_date'],
            'status' => ucfirst((string)$cc['status']),
        ];
    }

    $registrations = [];
    foreach (fetch_all('SELECT * FROM registrations ORDER BY registered_at DESC') as $r) {
        $student = $studentByStudentId[$r['student_id']] ?? null;
        $status = (string)$r['status'];
        $registrations[] = [
            'id' => (string)$r['registration_id'],
            'eventId' => (string)$r['event_id'],
            'userId' => (string)($student['user_id'] ?? $r['student_id']),
            'status' => $status,
            'registeredAt' => substr((string)$r['registered_at'], 0, 10),
        ];
    }

    $hasLocation = table_has_column('attendance', 'location_stamp');
    $attendance = [];
    foreach (fetch_all('SELECT * FROM attendance ORDER BY checkin_time DESC') as $a) {
        $student = $studentByStudentId[$a['student_id']] ?? null;
        $attendance[] = [
            'id' => (string)$a['attendance_id'],
            'eventId' => (string)$a['event_id'],
            'userId' => (string)($student['user_id'] ?? $a['student_id']),
            'status' => (string)$a['attendance_status'],
            'helper' => (bool)$a['is_volunteer'],
            'checkedAt' => (string)($a['checkin_time'] ?? ''),
            'points' => (int)$a['attendance_points'],
            'location' => $hasLocation ? (string)($a['location_stamp'] ?? 'Recorded in database') : 'Recorded in database',
        ];
    }

    return [
        'version' => 4,
        'backend' => true,
        'databaseName' => DB_NAME,
        'generatedAt' => date('c'),
        'users' => $users,
        'clubs' => $clubs,
        'memberships' => $memberships,
        'events' => $events,
        'registrations' => $registrations,
        'attendance' => $attendance,
    ];
}
?>

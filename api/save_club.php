<?php
require_once __DIR__ . '/config.php';

function make_club_code(string $name): string
{
    $words = preg_split('/\s+/', strtoupper(trim($name)));
    $code = '';

    foreach ($words as $word) {
        $word = preg_replace('/[^A-Z0-9]/', '', $word);
        if ($word !== '') {
            $code .= $word[0];
        }
    }

    return $code !== '' ? substr($code, 0, 10) : 'CLB';
}

try {
    require_role(['admin']);
    $data = get_json_input();

    $id = trim((string)($data['id'] ?? ''));
    $name = trim((string)($data['name'] ?? ''));
    $code = strtoupper(trim((string)($data['code'] ?? '')));
    $advisor = trim((string)($data['advisor'] ?? ''));
    $advisorEmail = trim((string)($data['advisorEmail'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    $statusInput = strtolower(trim((string)($data['status'] ?? 'Active')));
    $status = $statusInput === 'inactive' ? 'inactive' : 'active';

    if ($name === '' || $description === '') {
        json_response(['success' => false, 'message' => 'Please complete club name and description.'], 400);
    }

    if ($code === '') {
        $code = make_club_code($name);
    }

    $code = preg_replace('/[^A-Z0-9]/', '', $code);

    if ($id !== '') {
        $stmt = db()->prepare("
            UPDATE club 
            SET club_name = ?, club_code = ?, club_description = ?, advisor_name = ?, advisor_email = ?, status = ?
            WHERE club_id = ?
        ");
        $stmt->execute([$name, $code, $description, $advisor, $advisorEmail, $status, $id]);

        json_response([
            'success' => true,
            'message' => 'Club updated in database.',
            'clubId' => $id
        ]);
    } else {
        $clubId = next_code_id('club', 'club_id', 'CLB', 3);
        $createdBy = $_SESSION['user_id'] ?? null;

        $stmt = db()->prepare("
            INSERT INTO club 
            (club_id, club_name, club_code, club_description, club_logo, advisor_name, advisor_email, advisor_phone, status, created_by)
            VALUES (?, ?, ?, ?, NULL, ?, ?, NULL, ?, ?)
        ");

        $stmt->execute([
            $clubId,
            $name,
            $code,
            $description,
            $advisor,
            $advisorEmail,
            $status,
            $createdBy
        ]);

        json_response([
            'success' => true,
            'message' => 'Club created in database.',
            'clubId' => $clubId
        ]);
    }
} catch (Throwable $e) {
    json_response([
        'success' => false,
        'message' => 'Save club failed: ' . $e->getMessage()
    ], 500);
}
?>
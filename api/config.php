<?php
// FK Club Hub database connection file
// For XAMPP default: host=localhost, user=root, password='' and database=UOC.
// If your MySQL has a password or uses another port, edit the values below only.

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

const DB_HOST = '10.26.30.17';
const DB_NAME = 'cb24078';
const DB_USER = 'cb24078';
const DB_PASS = 'cb24078';
const DB_CHARSET = 'utf8mb4';

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function get_json_input(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function table_has_column(string $table, string $column): bool
{
    $stmt = db()->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
}

function add_column_if_missing(string $table, string $column, string $definition): void
{
    if (!table_has_column($table, $column)) {
        db()->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
    }
}

function ensure_backend_columns(): void
{
    // Extra columns used by the prototype UI. These are safe to add after importing UOC.sql.
    add_column_if_missing('attendance', 'location_stamp', 'varchar(255) NULL AFTER `is_volunteer`');
    add_column_if_missing('event', 'semester', 'varchar(20) NULL AFTER `committee_id`');
    add_column_if_missing('event', 'event_type', 'varchar(60) NULL AFTER `semester`');
}

function fetch_one(string $sql, array $params = []): ?array
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return $row ?: null;
}

function fetch_all(string $sql, array $params = []): array
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function next_numeric_id(string $table, string $column): int
{
    $stmt = db()->query("SELECT COALESCE(MAX(`$column`), 0) + 1 AS next_id FROM `$table`");
    return (int)$stmt->fetchColumn();
}

function next_code_id(string $table, string $column, string $prefix, int $width = 3): string
{
    $stmt = db()->prepare("SELECT `$column` FROM `$table` WHERE `$column` LIKE ?");
    $stmt->execute([$prefix . '%']);
    $max = 0;
    foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $value) {
        $num = (int)preg_replace('/\D+/', '', (string)$value);
        if ($num > $max) $max = $num;
    }
    return $prefix . str_pad((string)($max + 1), $width, '0', STR_PAD_LEFT);
}

function status_to_ui(string $status): string
{
    $s = strtolower($status);
    if ($s === 'active') return 'Open';
    if ($s === 'completed') return 'Completed';
    if ($s === 'cancelled') return 'Cancelled';
    return ucfirst($s);
}

function status_to_db(string $status): string
{
    $s = strtolower($status);
    if ($s === 'open') return 'active';
    if ($s === 'completed') return 'completed';
    if ($s === 'cancelled') return 'cancelled';
    return 'active';
}

function semester_from_date(?string $date): string
{
    if (!$date) return '2025/2026-2';
    $year = (int)date('Y', strtotime($date));
    $month = (int)date('n', strtotime($date));
    if ($month >= 9) return $year . '/' . ($year + 1) . '-1';
    return ($year - 1) . '/' . $year . '-2';
}

function event_type_from_title(?string $title): string
{
    $t = strtolower((string)$title);
    if (str_contains($t, 'workshop') || str_contains($t, 'bootcamp')) return 'Workshop';
    if (str_contains($t, 'talk') || str_contains($t, 'seminar')) return 'Talk';
    if (str_contains($t, 'competition') || str_contains($t, 'ctf') || str_contains($t, 'hackathon')) return 'Competition';
    if (str_contains($t, 'training')) return 'Training';
    if (str_contains($t, 'sport')) return 'Community Service';
    return 'General';
}

function recognition_label(int $points): string
{
    if ($points < 20) return 'Warning / Please participate more';
    if ($points < 50) return 'Eligible for Participation Certificate';
    if ($points < 80) return 'Eligible for Active Student Award / Bonus Points';
    return 'Outstanding Participation; eligible for leadership / priority registration';
}

function require_role(array $roles): void
{
    if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], $roles, true)) {
        json_response(['success' => false, 'message' => 'Unauthorized. Please login using the correct role.'], 403);
    }
}

function find_student_id_by_user_id(string $userId): ?string
{
    $row = fetch_one('SELECT student_id FROM student WHERE user_id = ? OR student_id = ? LIMIT 1', [$userId, $userId]);
    return $row['student_id'] ?? null;
}

function update_student_total_points(string $studentId): void
{
    $stmt = db()->prepare('SELECT COALESCE(SUM(attendance_points), 0) FROM attendance WHERE student_id = ?');
    $stmt->execute([$studentId]);
    $total = (int)$stmt->fetchColumn();
    $update = db()->prepare('UPDATE student SET total_points = ? WHERE student_id = ?');
    $update->execute([$total, $studentId]);
}
?>
 
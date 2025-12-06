<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        getTasks();
        break;
    case 'POST':
        createTask($input);
        break;
    case 'PUT':
        updateTask($input);
        break;
    case 'DELETE':
        deleteTask($input);
        break;
    default:
        echo json_encode(['error' => 'Method not allowed']);
}

function getTasks() {
    global $pdo;
    $userId = $_GET['user_id'] ?? null;
    
    if (!$userId) {
        echo json_encode(['error' => 'User ID required']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($tasks);
}

function createTask($data) {
    global $pdo;
    
    if (!isset($data['user_id'])) {
        echo json_encode(['error' => 'User ID required']);
        return;
    }
    
    $stmt = $pdo->prepare("INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $data['title'],
        $data['description'] ?? '',
        $data['status'] ?? 'pending',
        $data['user_id']
    ]);
    echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Task created']);
}

function updateTask($data) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?");
    $stmt->execute([
        $data['title'],
        $data['description'],
        $data['status'],
        $data['id'],
        $data['user_id']
    ]);
    echo json_encode(['message' => 'Task updated']);
}

function deleteTask($data) {
    global $pdo;
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    $stmt->execute([$data['id'], $data['user_id']]);
    echo json_encode(['message' => 'Task deleted']);
}
?>
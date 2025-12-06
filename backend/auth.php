<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $action = $input['action'] ?? '';
    
    switch($action) {
        case 'register':
            register($input);
            break;
        case 'login':
            login($input);
            break;
        case 'google-login':
            googleLogin($input);
            break;
        default:
            echo json_encode(['error' => 'Invalid action']);
    }
}

function register($data) {
    global $pdo;
    
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['error' => 'All fields are required']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        echo json_encode(['error' => 'Username or email already exists']);
        return;
    }
    
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $hashedPassword]);
        
        $userId = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email
            ]
        ]);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    }
}

function login($data) {
    global $pdo;
    
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        echo json_encode(['error' => 'Username and password are required']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ]);
    } else {
        echo json_encode(['error' => 'Invalid username or password']);
    }
}

function googleLogin($data) {
    global $pdo;
    
    $googleId = $data['google_id'] ?? '';
    $email = $data['email'] ?? '';
    $name = $data['name'] ?? '';
    
    if (empty($googleId) || empty($email)) {
        echo json_encode(['error' => 'Google authentication data missing']);
        return;
    }
    
    // Check if user exists with this google_id
    $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = ?");
    $stmt->execute([$googleId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // User exists, log them in
        unset($user['password']);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ]);
    } else {
        // Check if email exists (user might have registered with password)
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingUser) {
            // Link Google account to existing user
            $stmt = $pdo->prepare("UPDATE users SET google_id = ? WHERE email = ?");
            $stmt->execute([$googleId, $email]);
            
            unset($existingUser['password']);
            echo json_encode([
                'success' => true,
                'message' => 'Google account linked successfully',
                'user' => $existingUser
            ]);
        } else {
            // Create new user
            try {
                $username = explode('@', $email)[0]; // Use email prefix as username
                
                // Make sure username is unique
                $baseUsername = $username;
                $counter = 1;
                while (true) {
                    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                    $stmt->execute([$username]);
                    if (!$stmt->fetch()) break;
                    $username = $baseUsername . $counter;
                    $counter++;
                }
                
                $stmt = $pdo->prepare("INSERT INTO users (username, email, google_id) VALUES (?, ?, ?)");
                $stmt->execute([$username, $email, $googleId]);
                
                $userId = $pdo->lastInsertId();
                echo json_encode([
                    'success' => true,
                    'message' => 'Account created successfully',
                    'user' => [
                        'id' => $userId,
                        'username' => $username,
                        'email' => $email,
                        'google_id' => $googleId
                    ]
                ]);
            } catch(PDOException $e) {
                echo json_encode(['error' => 'Failed to create account: ' . $e->getMessage()]);
            }
        }
    }
}
?>
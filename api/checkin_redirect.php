<?php
require_once __DIR__ . '/config.php';

// ⚠️ FOR TESTING ONLY: Change these 2 numbers to your current house coordinates!
// Once testing is done, change it back to UMPSA Pekan coordinates (3.5436, 103.4289)
$eventLat = 3.5410; 
$eventLng = 103.4272;
$maxRadiusMeters = 80; // 20 meters safety radius

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $studentLat = isset($data['lat']) ? floatval($data['lat']) : 0;
    $studentLng = isset($data['lng']) ? floatval($data['lng']) : 0;

    if ($studentLat === 0.0 || $studentLng === 0.0) {
        echo json_encode(['success' => false, 'message' => 'Please enable your peranti/device GPS location.']);
        exit;
    }

    // Haversine Formula to calculate GPS distance
    $earthRadius = 6371000;
    $latDelta = deg2rad($eventLat - $studentLat);
    $lngDelta = deg2rad($eventLng - $studentLng);
    $a = sin($latDelta / 2) * sin($latDelta / 2) + cos(deg2rad($studentLat)) * cos(deg2rad($eventLat)) * sin($lngDelta / 2) * sin($lngDelta / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $calculatedDistance = $earthRadius * $c;

    if ($calculatedDistance > $maxRadiusMeters) {
        echo json_encode([
            'success' => false, 
            'message' => 'Check-in failed! You are ' . round($calculatedDistance, 1) . 'm away from the event venue (Max allowed: 80m).'
        ]);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPS Attendance Verification</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 60px 20px; background: #f4f6f9; color: #333; }
        .box { background: white; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); max-width: 400px; margin: 0 auto; }
        h2 { margin-bottom: 10px; color: #222; }
        p { color: #666; font-size: 15px; margin-bottom: 25px; line-height: 1.4; }
        button { background: #007bff; color: white; border: none; padding: 14px 20px; font-size: 16px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; transition: background 0.2s; }
        button:hover { background: #0056b3; }
        .status-msg { font-weight: bold; margin-top: 20px; font-size: 14px; min-height: 20px; }
    </style>
</head>
<body>
    <div class="box">
        <h2>Event Attendance</h2>
        <p>Please click the button below to verify your GPS location before filling up the Google Form.</p>
        <button id="gpsBtn" onclick="verifyLocation()">Verify Location & Open Form</button>
        <div id="status" class="status-msg"></div>
    </div>

    <script>
    function verifyLocation() {
        const statusDiv = document.getElementById('status');
        const gpsBtn = document.getElementById('gpsBtn');
        
        statusDiv.style.color = "orange";
        statusDiv.innerText = "Calculating your GPS distance...";
        gpsBtn.disabled = true;

        if (!navigator.geolocation) {
            statusDiv.style.color = "red";
            statusDiv.innerText = "Your browser does not support GPS features.";
            gpsBtn.disabled = false;
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            fetch('checkin_redirect.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    statusDiv.style.color = "green";
                    statusDiv.innerText = "Location Verified! Redirecting to Google Form...";
                    
                    // Directly redirect to your Google Form link
                    setTimeout(() => {
                        window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSf7uAlvC3BAN0qemyhC5pX9N9-urlD0zCXU4i1w5Vik0YR-AA/viewform";
                    }, 1200);
                } else {
                    statusDiv.style.color = "red";
                    statusDiv.innerText = data.message;
                    gpsBtn.disabled = false;
                }
            })
            .catch(err => {
                statusDiv.style.color = "red";
                statusDiv.innerText = "Server communication error.";
                gpsBtn.disabled = false;
            });
        }, (error) => {
            statusDiv.style.color = "red";
            statusDiv.innerText = "Access denied. Please enable GPS location permission on your peranti/device.";
            gpsBtn.disabled = false;
        });
    }
    </script>
</body>
</html>

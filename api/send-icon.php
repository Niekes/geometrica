<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require './Exception.php';
require './PHPMailer.php';
require './SMTP.php';

if ($_SERVER["HTTP_REFERER"] !== "https://geometrica.niekes.com/") {
    http_response_code(403);
    echo "";
    return;
}

/*
    Define upload directory
*/
define('UPLOAD_DIR', './images/');

/*
    Create upload directory if it does not exist
*/
if (!is_dir('images')) {
    mkdir('images');
}

/*
    Read data from request as JSON
*/
$data = json_decode(file_get_contents("php://input"), true);

/*
    Check if email is correct
*/
if (!filter_var($data["recipient"], FILTER_VALIDATE_EMAIL)) {
    http_response_code(404);
    echo "";
    return;
}

/*
    Create unique id
*/
$uniqid = uniqid();

/*
    Add filenames
*/
$filenamePng = 'geometrica-' . $uniqid . '.'. 'png';
$filePng = UPLOAD_DIR . $filenamePng;

/*
    Convert base64 to to png
*/
$img = str_replace('data:image/png;base64,', '', $data['image']);
$img = str_replace(' ', '+', $img);

/*
    Write png file to server
*/
file_put_contents($filePng, base64_decode($img));

/*
    Prepare e-mail
*/
$email = new PHPMailer();
$email->SetFrom('geometrica@niekes.com');
$email->Subject = 'Your icon from geometrica.niekes.com';
$email->Body = "Hi,\r\n\r\nThank you for using geometrica.niekes.com\r\n\r\nPlease find your icon attached.\r\n\r\n\r\n\r\nYour geometrica team";
$email->AddAddress($data["recipient"]);
$email->AddAttachment($filePng, $filenamePng);

/*
    Send email
*/
$send = $email->Send();


/*
    Send response, delete files in success
*/
if ($send) {
    http_response_code(201);

    $response->recipient = $data["recipient"];
    $response_json = json_encode($response);

    unlink($filePng);

    $imagick->clear();
    $imagick->destroy();

    echo $response_json;
} else {
    http_response_code(400);
    echo '';
}
?>

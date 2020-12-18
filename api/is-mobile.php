<?php

if ($_SERVER["HTTP_REFERER"] !== "https://geometrica.niekes.com/") {
    http_response_code(403);
    echo "";
    return;
}

require_once './MobileDetect.php';
$detect = new Mobile_Detect;

$response->isMobile = $detect->isMobile();
$response->isTablet = $detect->isTablet();
$response->isiOS = $detect->isiOS();
$response->isAndroidOS = $detect->isAndroidOS();

$response_json = json_encode($response);

http_response_code(200);
echo $response_json;
?>

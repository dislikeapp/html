<?php

if ($_POST["className"] !== NULL) {
	$className = $_POST["className"];
	
	$json = file_get_contents("reports.json");
	$reports = json_decode($json, true);
	if ($reports[$className] === NULL) {
		$reports[$className] = 0;
	}
	$reports[$className]++;
	
	$json = json_encode($reports);
	file_put_contents("reports.json", $json);
}

?>
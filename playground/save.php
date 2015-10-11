<?php

function emit($response) {
	echo json_encode($response);
}

$code = $_POST['code'];

if ($code !== NULL) {
	$save_id = NULL;
	for ($tries = 0; $tries < 10; $tries++) {
		$id = ''.rand(100000000,
					  999999999);
		$fpath = 'saves/'.$id.'.js';
		if (!file_exists($fpath)) {
			$save_id = $id;
			break;
		}
	}
	if ($save_id !== NULL) {
		$fpath = 'saves/'.$save_id.'.js';
		$abs_path = $_SERVER['SERVER_NAME'] . dirname($_SERVER['REQUEST_URI']);
		$abs_path = $abs_path.'/?save='.$save_id;
		file_put_contents($fpath, $code);
		emit(array(
			'status' => 'OK',
			'link' => $abs_path
		));
	}
	else {
		emit(array(
			'status' => 'error',
			'message' => 'Could not generate unique ID.'
		));
	}
	
}
else {
	emit(array(
		'status' => 'error',
		'message' => 'Must write to "code" post variable.'
	));
}

?>
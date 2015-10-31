<?php

function scandirEx($dir) {
	return array_diff(scandir($dir), array(".", ".."));
}

function searchDocFile($docName) {
	$modules = scandirEx("data");
	foreach ($modules as $mName) {
		$mPath = "data/".$mName;
		if (is_dir($mPath)) {
			$docs = scandirEx($mPath);
			foreach ($docs as $d) {
				$docFile = $mPath."/".$d;
				if (is_file($docFile)) {
					$n = basename($d, ".json");
					if ($docName === $n) {
						return $docFile;
					}
				}
			}
		}
	}
	return NULL;
}

function include_get_contents($path) {
	if (is_file($path)) {
		$prevDir = getcwd();
		$tempDir = dirname($path);
		
		chdir($tempDir);
		ob_start();
		include($path);
		$contents = ob_get_contents();
		ob_end_clean();
		chdir($prevDir);
		
		return $contents;
	}
	return false;
	
	//return http_get($path);
	
	/*$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $path);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	$data = curl_exec($ch);
	curl_close($ch);
	return $data;*/
}

function code_start() {
	echo '
<div class="codeBlockHeader">CODE</div>
<pre class="codeBlock prettyprint">';
}
function code_end() {
	echo '
</pre>';
}
function code_include($src) {
	code_start();
	echo htmlspecialchars(include_get_contents($src));
	code_end();
}

?>
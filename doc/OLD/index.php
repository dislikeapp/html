<?php include('utils.php'); ?>
<html>
<head>
	<title>OE::Docs</title>
	<link rel="stylesheet" href="google-code-prettify/prettify.css" />
	<link rel="stylesheet" href="css/style.css" />
	<link rel="stylesheet" href="css/docs.css" />
	<script src="../bin/OmniEngine.js"></script>
	<script src="google-code-prettify/run_prettify.js"></script>
	<script src="js/utils.js"></script>
	<script src="js/AutoDoc.js"></script>
</head>
<body>
	<table class="fullsize layout">
		<tr>
			<td width="200">
				<div class="fullsize" style="overflow: auto;">
					<?php include("sidebar.php"); ?>
				</div>
			</td><td>
				<div class="fullsize" style="overflow: auto;">
<?php

$docFile = NULL;
$className = NULL;

function js_doc_file() {
	global $docFile;
	echo ($docFile === NULL ? 'undefined' : '"'.$docFile.'"');
}
function js_class_name() {
	global $className;
	echo ($className === NULL ? 'undefined' : '"'.$className.'"');
}
function auto_doc() {
	include('pages/auto_doc_page.php');
}

function gen_page() {
	global $docFile;
	global $className;
	
	$module = $_GET['m'];
	$class = $_GET['c'];
	$doc = $_GET['d'];
	$page = $_GET['p'];

	if ($page !== NULL) {
		include('pages/'.$page.'.php');
	}
	else if ($class !== NULL) {
		$className = $class;
		$docFile = searchDocFile($className);
		auto_doc($docFile, $className);
	}
	else if ($module !== NULL) {
		$mPath = 'modules/'.$module;
		$index = '/index.php';
		if ($doc !== NULL) {
			$className = $doc;
			$docFile = 'data/'.$module.'/'.$doc.'.json';
			auto_doc($docFile, $doc);
		}
		else {
			if (file_exists($mPath.$index))
				include($mPath.$index);
			else
				echo 'Module page not found.';
		}
	}
	else if ($doc !== NULL) {
		$className = $doc;
		$docFile = searchDocFile($doc);
		auto_doc($docFile, $doc);
	}
	else {
		include('pages/home.php');
	}
}

gen_page();

?>
				</div>
			</td>
		</tr>
	</table>
</body>
</html>
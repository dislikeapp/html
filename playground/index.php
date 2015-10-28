<?php include("../common/oejs.php"); ?>
<html>
	<head>
		<?php oejs_script(); ?>
		<link rel="stylesheet" href="../common/style.css" />
		<link rel="stylesheet" href="style.css" />
		<script src="libs/ace/src-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
		<script src="main.js"></script>
		<script src="Application.js"></script>
		<script src="BatchedGeom.js"></script><?php
		if ($_GET['save'] !== NULL) {
			echo '
		<script> var SAVE_ID = "'.$_GET['save'].'"; </script>';
		} ?>
	</head>
	<body>
		<div class="Flex V Fullheight">
			<div class="Flex H header controlList Fullwidth">
				<a class="btn red" id="run"><img src="images/run.png" class="icon" /> Run</a>
				<a class="btn yellow" id="new"><img src="images/new.png" class="icon" /> New</a>
				<a class="btn blue" id="save"><img src="images/save.png" class="icon" /> Save</a>
				<div class="btn green group">
					<select class="btn gray" id="examples">
						<option value="-1" selected="true">-- Load Example --</option>
						<option value="basic-scene">Basic Scene</option>
						<option value="basic-motion">Basic Motion</option>
						<option value="entity">Entity</option>
						<option value="terrain">Terrain</option>
					</select>
					<a class="btn green" id="load"><img src="images/load.png" class="icon" /> Load</a>
				</div>
			</div>
			<div class="Grow Flex H">
				<div class="ContentGrows" style="flex-basis: 50%;">
					<div class="editorFrame Flex V Fullsize">
						<div>function initScene(scene) {</div>
						<div class="Grow" id="editor"></div>
						<div>}</div>
					</div>
				</div>
				<div class="ContentGrows" style="flex-basis: 50%;" id="appFrame"></div>
			</div>
		</div>
	</body>
</html>
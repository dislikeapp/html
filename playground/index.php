<?php include("../common/demos.php"); ?>
<html>
	<head>
		<?php oejs_script(); ?>
		<link rel="stylesheet" href="../common/style.css" />
		<link rel="stylesheet" href="style.css" />
		<script src="libs/ace/src-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
		<script src="main.js"></script>
		<script src="Application.js"></script>
		<script src="BatchedGeom.js"></script>
	</head>
	<body>
		<div class="Flex V Fullheight">
			<div class="Flex H header controlList">
				<input class="red" type="button" value="8" style="font-family:webdings;color:#FF7F7F;font-weight:bold;font-size:24px;" id="run" />
				<input class="yellow" type="button" value="New" id="new" />
				<select class="blue" id="examples">
					<option value="-1" selected="true">-- Load Example --</option>
					<option value="basic-scene">Basic Scene</option>
					<option value="terrain">Terrain</option>
				</select>
				<input class="blue" type="button" value="Load" id="load" />
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
			<div class="footer">Bottom bar</div>
		</div>
	</body>
</html>
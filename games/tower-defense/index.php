<?php include("../../common/oejs.php"); ?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<link rel="stylesheet" href="../../common/style.css" />
	<link rel="stylesheet" href="style.css" />
	
	<?php oejs_script(); ?>
	<script src="../../common/DOM.js"></script>
	
	<script src="game/WeatherSystem.js"></script>
	<script src="game/MapSystem.js"></script>
	<script src="game/Tower.js"></script>
	<script src="game/Actor.js"></script>
	<script src="game/Application.js"></script>
	
	<script src="main.js"></script>
</head>
<body>
	<div class="appFrame" id="appFrame">
		<div class="appOverlay nodisplay" id="loadingOverlay">
			<div class="frame1" style="margin: 24px;">
				Loading...<br />
				Status:<span name="status"></span>
			</div>
		</div>
		<div class="appOverlay nodisplay" id="ingameOverlay">
			<div class="frame1 absolute" style="bottom: 0px; right: 0px; width: 300px; height: 100%;">
				Right Panel
			</div>
		</div>
	</div>
</body>
</html>
<?php include("../../common/oejs.php"); ?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<link rel="stylesheet" href="../../common/style.css" />
	<link rel="stylesheet" href="style.css" />
	
	<?php oejs_script(); ?>
	<script src="../../common/DOM.js"></script>
	
	<script src="libs/DOM.js"></script>
	<script src="libs/Map.js"></script>
	
	<script src="game/Application.js"></script>
	<script src="game/UserData.js"></script>
	<script src="game/GUI.js"></script>
	<script src="game/WeatherSystem.js"></script>
	<script src="game/MapSystem.js"></script>
	<script src="game/Tower.js"></script>
	<script src="game/Actor.js"></script>
	<script src="game/Waypoint.js"></script>
	
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
		<div class="appOverlay" id="ingameOverlay">
			<div name="frame" class="frame1 absolute" style="top: 4px; right: 4px; bottom: 4px; width: 300px;">
				<input type="button" name="toggle" value="Show/Hide" />
				<div name="content">
					<div class="pane userInfo" name="userInfo"></div>
					<div class="pane shop" name="shop"></div>
					<div class="pane shopInfo" name="shopInfo"></div>
					<div class="pane selection" name="selection"></div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>
var sphere = scene.addObject(new OE.Sphere());
sphere.setMaterial("DefaultWhite");

var plane = scene.addObject(new OE.TerrainPatch(10,10));
plane.setMaterial("DefaultWhite");
plane.setPosf(0,-1,0);

var t = 0;
sphere.onUpdate = function() {
	t += 0.05;
	this.setPosf(
		Math.cos(t) * 2.0, 0.0,
		Math.sin(t) * 2.0
	);
};
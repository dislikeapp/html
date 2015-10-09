var patch = scene.addObject(new OE.TerrainPatch(30.0, 30.0, 64, 64));
patch.setMaterial("DefaultWhite");
patch.setPosf(0, -10, 0);

var terrainHeight = 10.0;
patch.setHeightmap(
	function(x, y) {
		var noise = OE.Noise.ridgedNoise2([x, y], 10, (1.0/50.0), 0.5);
		noise = OE.Math.atanBias(noise, 2.0);
		return (noise * 0.5 + 0.5) * terrainHeight;
	},
	function() {
		// All done!
	}
);
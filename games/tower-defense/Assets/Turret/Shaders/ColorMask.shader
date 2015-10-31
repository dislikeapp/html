
{
	"shader": {
		"vert": "ColorMask.vert",
		"frag": "ColorMask.frag",
		"attributes": {
			"vertPosition":	"POSITION",
			"vertNormal":	"NORMAL",
			"vertTexCoord":	"TEXCOORD"
		},
		"uniforms": {
			"mvpMatrix":	"MVP_MATRIX",
			"mvMatrix":		"MV_MATRIX",
			"vMatrix":		"V_MATRIX",
			"nMatrix":		"N_MATRIX",
			"diffSampler":		{"INT":		0},
			"diffMask":			{"INT":		1},
			"diffuse":			{"VEC3":	[1, 1, 1]},
			"specular":			{"VEC3":	[1, 1, 1]},
			"shininess":		{"FLOAT":	16.0},
			"emission":			{"FLOAT":	0.125}
		}
	}
}

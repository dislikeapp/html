
precision highp float;

uniform sampler2D sampler;
uniform float health;

varying vec2 fragTexCoord;

void main()
{
	vec4 color = vec4(0.0,0.0,0.0,1.0);
	
	float xMax = mix(0.05, 0.95, health);
	
	if (fragTexCoord.x < 0.05 || fragTexCoord.x > xMax ||
		fragTexCoord.y < 0.2 || fragTexCoord.y > 0.8) {
		
		color.a = 0.5;
	}
	else {
		color.rgb = (health < 0.5) ?
			mix(vec3(1.0,0.0,0.0), vec3(1.0,1.0,0.0), health) :
			mix(vec3(1.0,1.0,0.0), vec3(0.0,1.0,0.0), health);
	
	}
	
	gl_FragColor = color;
}

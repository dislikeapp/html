
precision highp float;

uniform sampler2D sampler;

varying vec2 fragTexCoord;

void main()
{
	vec3 color = texture2D(sampler, fragTexCoord).rgb;
	
	color = max(vec3(0.0), color - 0.8);
	
	gl_FragColor = vec4(color, 1.0);
}

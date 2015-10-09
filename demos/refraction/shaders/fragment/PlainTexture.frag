
precision highp float;

uniform mat3 nMatrix;
uniform mat4 vMatrix;
uniform mat4 mvMatrix;

uniform sampler2D diffSampler;

uniform vec3 diffuse;

varying vec3 fragPosition;
varying vec3 fragNormal;
varying vec2 fragTexCoord;

void main()
{
	vec4 diffSample = texture2D(diffSampler, fragTexCoord);
	
	vec3 color = diffSample.rgb * diffuse;
	
	gl_FragColor = vec4(color, diffSample.a);
}

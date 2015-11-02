
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform mat3 nMatrix;
uniform mat4 vMatrix;
uniform mat4 mvMatrix;

uniform sampler2D diffSampler;
uniform sampler2D diffMask;

uniform vec3 diffuse;
uniform vec3 specular;
uniform float emission;
uniform float shininess;

varying vec3 fragPosition;
varying vec3 fragNormal;
varying vec2 fragTexCoord;

const float PI = 3.14159265358979323846264338327950;

vec3 overlay(vec3 a, vec3 b) {
	float lum = dot(a, vec3(0.2126, 0.7152, 0.0722));
	if (lum < 0.5)
		return mix(vec3(0.0), b, lum);
	return mix(b, vec3(1.0, 1.0, 1.0), lum);
}

void main()
{
	vec3 E = normalize(-fragPosition);
	vec3 N;
	
	vec3 lightPos = (vMatrix * vec4(vec3(4000.0, 8000.0, 7000.0), 1.0)).xyz;
	vec3 L = normalize(lightPos - fragPosition);
	vec3 R;
	
	N = normalize(fragNormal);
	R = reflect(-L, N);
	
	float kD = mix(max(dot(N, L), 0.0), 1.0, emission);
	float kS = pow(max(dot(R, E), 0.0), shininess);
	
	vec4 diffSample = texture2D(diffSampler, fragTexCoord);
	vec4 diffMaskSample = texture2D(diffMask, fragTexCoord);
	
	vec3 diffFinal = mix(diffSample.rgb, overlay(diffSample.rgb, diffuse), diffMaskSample.rgb);
	vec3 specFinal = specular;
	
	vec3 color = diffFinal * kD + specFinal * kS;
	
	float fog = pow(clamp(-fragPosition.z / 1000.0, 0.0, 1.0), 3.0);
	color *= (1.0 - fog);
	
	gl_FragColor = vec4(color, diffSample.a);
}


precision mediump float;

uniform mat4 vMatrix;

uniform vec3 diffuse;
uniform vec3 specular;
uniform float emission;
uniform float shininess;

varying vec3 fragPosition;
varying vec3 fragNormal;

mat3 transpose(mat3 matrix) {
	vec3 i0 = matrix[0];
	vec3 i1 = matrix[1];
	vec3 i2 = matrix[2];
	return mat3(
		vec3(i0.x, i1.x, i2.x),
		vec3(i0.y, i1.y, i2.y),
		vec3(i0.z, i1.z, i2.z)
	);
}
mat4 transpose(mat4 matrix) {
	vec4 i0 = matrix[0];
	vec4 i1 = matrix[1];
	vec4 i2 = matrix[2];
	vec4 i3 = matrix[3];
	return mat4(
		vec4(i0.x, i1.x, i2.x, i3.x),
		vec4(i0.y, i1.y, i2.y, i3.y),
		vec4(i0.z, i1.z, i2.z, i3.z),
		vec4(i0.w, i1.w, i2.w, i3.w)
	);
}

void main()
{
	vec3 E = normalize(-fragPosition);
	vec3 N = normalize(fragNormal);
	
	vec3 lightPos = (vMatrix * vec4(vec3(4000.0, 8000.0, 7000.0), 1.0)).xyz;
	vec3 L = normalize(lightPos - fragPosition);
	vec3 R = reflect(-L, N);
	
	float kD = mix(max(dot(N, L), 0.0), 1.0, emission);
	float kS = pow(max(dot(R, E), 0.0), shininess);
	
	vec3 diffFinal = diffuse * kD;
	vec3 specFinal = specular * kS;
	vec3 color = diffFinal + specFinal;
	
	gl_FragColor = vec4(color, 1.0);
}


#extension GL_OES_standard_derivatives : enable
#extension GL_EXT_draw_buffers : require

precision highp float;

uniform mat3 nMatrix;
uniform mat4 vMatrix;
uniform mat4 mvMatrix;

uniform sampler2D diffSampler;
uniform sampler2D normSampler;
uniform sampler2D specSampler;

uniform float normMapIntensity;
uniform float specMapIntensity;

uniform vec3 diffuse;
uniform float specularity;
uniform float shininess;
uniform float emission;

varying vec4 fragViewPos;
varying vec4 fragProjPos;
varying vec3 fragNormal;
varying vec2 fragTexCoord;

const float PI = 3.14159265358979323846264338327950;

vec4 pack_float(float f) {
	const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
	const vec4 bit_mask = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
	vec4 res = fract(f * bit_shift);
	res -= res.xxyz * bit_mask;
	return res;
}
float unpack_float(vec4 rgba) {
	const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
	float res = dot(rgba, bit_shift);
	return res;
}

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

mat3 calcTBN(vec3 pos, vec2 texcoord, vec3 normal) {
	// compute derivations of the world position
	vec3 p_dx = dFdx(pos);
	vec3 p_dy = dFdy(pos);
	// compute derivations of the texture coordinate
	vec2 tc_dx = dFdx(texcoord);
	vec2 tc_dy = dFdy(texcoord);
	// compute initial tangent and bi-tangent
	vec3 t = normalize( tc_dy.y * p_dx - tc_dx.y * p_dy );
	vec3 b = normalize( tc_dy.x * p_dx - tc_dx.x * p_dy ); // sign inversion
	// get new tangent from a given mesh normal
	vec3 n = normalize(normal);
	vec3 x = cross(n, t);
	t = cross(x, n);
	t = normalize(t);
	// get updated bi-tangent
	x = cross(b, n);
	b = cross(n, x);
	b = normalize(b);
	return mat3(t, b, n);
}

void main()
{
	vec3 N;
	
	if (normMapIntensity > 0.0) {
		vec3 normSample = normalize((texture2D(normSampler, fragTexCoord).xyz * 2.0 - 1.0));
		normSample.xy *= normMapIntensity;
		normSample = normalize(normSample);
		mat3 tbn = calcTBN(fragViewPos.xyz, fragTexCoord, fragNormal);
		N = tbn * normSample;
	}
	else {
		N = normalize(fragNormal);
	}
	
	vec3 diffFinal = diffuse;
	float specFinal = specularity;
	
	vec4 diffSample = texture2D(diffSampler, fragTexCoord);
	diffFinal *= diffSample.rgb;
	
	if (specMapIntensity > 0.0) {
		vec3 specSample = texture2D(specSampler, fragTexCoord).xyz;
		specSample = 1.0 + (specSample - 1.0) * specMapIntensity;
		specFinal *= specSample.r;
	}
	
	float depth = fragProjPos.z / fragProjPos.w;
	gl_FragData[0] = pack_float(depth);
	gl_FragData[1] = vec4(N, 1.0);
	gl_FragData[2] = vec4(diffFinal, specFinal);
}

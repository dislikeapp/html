
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform mat3 nMatrix;
uniform mat4 vMatrix;
uniform mat4 mvMatrix;

uniform sampler2D diffSampler;
uniform sampler2D normSampler;
uniform sampler2D specSampler;
uniform sampler2D envSampler;

uniform vec2 envImageSize;

uniform float normMapIntensity;
uniform float specMapIntensity;

uniform vec3 diffuse;
uniform vec3 specular;
uniform float emission;
uniform float shininess;
uniform float diffusivity;
//uniform float reflectivity;
uniform float refractivity;
uniform float refractiveIndex;
uniform float chromAberration;

varying vec3 fragPosition;
varying vec3 fragNormal;
varying vec2 fragTexCoord;

const float PI = 3.14159265358979323846264338327950;

float arctan(float x) {
	float bx = 0.596227*x;
	float x2 = x*x;
	return (bx + x2) / (1.0 + 2.0*bx + x2);
//	return 0.25*PI*x - x*(abs(x) - 1)*(0.2447 + 0.0663*abs(x));
}
float arctan(float x, float y) {
	return atan(x, y);
	if (x>0.0)
		return arctan(y/x);
	else if (x<0.0) {
		if (y>=0.0) return arctan(y/x)+PI;
		else return arctan(y/x)-PI;
	}
	else {
		if (y>0.0) return PI/2.0;
		else if (y<0.0) return -PI/2.0;
		else return 0.0;
	}
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
	vec3 E = normalize(-fragPosition);
	vec3 N;
	
	vec3 lightPos = (vMatrix * vec4(vec3(4000.0, 8000.0, 7000.0), 1.0)).xyz;
	vec3 L = normalize(lightPos - fragPosition);
	vec3 R;
	
	if (normMapIntensity > 0.0) {
		vec3 normSample = normalize((texture2D(normSampler, fragTexCoord).xyz * 2.0 - 1.0));
		normSample.xy *= normMapIntensity;
		normSample = normalize(normSample);
		mat3 tbn = calcTBN(fragPosition, fragTexCoord, fragNormal);
		N = tbn * normSample;
	}
	else {
		N = normalize(fragNormal);
	}
	R = reflect(-L, N);
	
//	gl_FragColor = vec4(N*0.5+0.5, 1.0); return;
//	gl_FragColor = vec4(vec3(-fragPosition*0.5+0.5), 1.0); return;
//	gl_FragColor = vec4(E*10.0+0.5, 1.0); return;
//	gl_FragColor = vec4(N*10.0+0.5, 1.0); return;
	
	float kD = mix(max(dot(N, L), 0.0), 1.0, emission);
	float kS = pow(max(dot(R, E), 0.0), shininess);
	
	vec3 diffFinal = diffuse * kD;
	vec3 specFinal = specular * kS;
	
	vec4 diffSample = texture2D(diffSampler, fragTexCoord);
	diffFinal *= diffSample.rgb * diffusivity;
	
	if (refractivity > 0.0) {
		vec3 viewSpaceNorm = N;
		vec3 fwd = vec3(0.0, 0.0, -1.0);
		
		vec3 refractSample[3];
		float ratio[3];
		ratio[0] = 1.0 - chromAberration;
		ratio[1] = 1.0;
		ratio[2] = 1.0 + chromAberration;
		
		for (int i=0; i<3; i++) {
			vec3 refraction = refract(viewSpaceNorm, fwd, 1.0-refractiveIndex*ratio[i]);
			//vec2 texelSize = 1.0 / vec2(textureSize(envSampler, 0));
			vec2 texelSize = 1.0 / envImageSize;
			vec2 screenCoords = gl_FragCoord.xy * texelSize;
			vec2 envCoord = screenCoords;
			vec2 offset = vec2(
				arctan(refraction.x, refraction.z) / PI,
				dot(refraction, vec3(0.0, 1.0, 0.0)));
			envCoord += offset * 0.5;
			
			const float fogAmt = 0.5;
			const float fogExp = 4.0;
			const float fogBlur = 4.0;
			const float glintingBlur = 4.0;
			vec2 overflow = abs(envCoord*2.0-1.0) - 1.0;
			vec2 fog = (clamp(overflow, -fogAmt, 0.0) + fogAmt) / fogAmt;
			fog = clamp(fog, 0.0, 1.0);
			fog.x = pow(fog.x, fogExp);
			fog.y = pow(fog.y, fogExp);
			float glinting = clamp(1.0+dot(viewSpaceNorm, fwd), 0.0, 1.0);
			float fogFinal = clamp(fog.x + fog.y + glinting, 0.0, 1.0);
			
			envCoord = clamp(envCoord, 0.01, 0.99);
			
			refractSample[i] = texture2D(envSampler, envCoord, 0.0 + fogFinal * fogBlur + glinting * glintingBlur).xyz;
		}
		specFinal += vec3(	refractSample[0].r,
							refractSample[1].g,
							refractSample[2].b) * refractivity;
	}
	
	if (specMapIntensity > 0.0) {
		vec3 specSample = texture2D(specSampler, fragTexCoord).xyz;
		specSample = 1.0 + (specSample - 1.0) * specMapIntensity;
		specFinal *= specSample;
	}
	
	vec3 color = diffFinal + specFinal;
	
	float fog = pow(clamp(-fragPosition.z / 1000.0, 0.0, 1.0), 3.0);
	color *= (1.0 - fog);
	
	gl_FragColor = vec4(color, diffSample.a);
}

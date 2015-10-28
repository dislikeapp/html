
precision highp float;

uniform sampler2D depthSampler;
uniform sampler2D normalSampler;
uniform sampler2D albedoSampler;

varying vec4 fragViewPos;
varying vec4 fragProjPos;
varying vec3 fragNormal;
varying vec2 fragTexCoord;

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

void main()
{
	vec2 texcoord = (fragProjPos.xy / fragProjPos.w) * 0.5 + 0.5;
	
	float depthSample = unpack_float(texture2D(depthSampler, texcoord));
	float depth = fragProjPos.z / fragProjPos.w;
	
	if (depth > depthSample)
		discard;
	
	vec4 normSample = texture2D(normalSampler, texcoord);
	vec4 albedoSample = texture2D(albedoSampler, texcoord);
	
	float specularity = albedoSample.w;
	
	vec3 lightColor = vec3(1.0, 1.0, 1.0);
	
	float dp = (clamp(dot(normalize(fragNormal), vec3(0.0,0.0,1.0)), 0.0, 1.0)-0.5)*2.0;
	float depthFalloff = clamp(abs(depth - depthSample), 0.0, 1.0);
	
	vec3 diffuse = albedoSample.rgb * lightColor * dp * depthFalloff;
	gl_FragColor = vec4(diffuse, 1.0);
}


uniform mat4 mvMatrix;
uniform mat4 pMatrix;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
attribute float vertDist;
attribute float vertDomain;

varying vec4 fragProjPos;
varying vec2 fragTexCoord;
varying float fragDist;
varying float fragDomain;
varying float fragSizeScalar;

void main()
{
	fragTexCoord = vertTexCoord;
	fragDist = vertDist;
	fragDomain = vertDomain;
	
	vec4 lightViewPos4 = mvMatrix * vec4(0.0, 0.0, 0.0, 1.0);
	vec3 lightViewPos = lightViewPos4.xyz;
	vec3 camViewPos = vec3(0.0, 0.0, lightViewPos.z);
	vec3 flareViewPos = mix(lightViewPos, camViewPos, vertDist*2.0);
	
	const float base_size = 400.0;
	fragSizeScalar = base_size;
	if (vertDomain <= 0.95) {
		fragSizeScalar = max(vertDomain, 0.05) * base_size * 2.0;
		fragSizeScalar *= clamp(pow(abs(vertDist-0.5)*2.0, 8.0), 0.25, 1.0);
	}
	vec3 vp = vertPosition * fragSizeScalar;
	
	vec4 fragViewPos = vec4(flareViewPos, 1.0);
	fragViewPos.xy += vp.xy;
	
	fragProjPos = pMatrix * fragViewPos;
	gl_Position = fragProjPos;
}

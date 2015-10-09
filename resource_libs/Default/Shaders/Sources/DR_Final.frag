
precision highp float;

uniform sampler2D depthSampler;
uniform sampler2D normalSampler;
uniform sampler2D albedoSampler;
uniform sampler2D lightSampler;

varying vec2 fragTexCoord;

void main()
{
	float depth = texture2D(depthSampler, fragTexCoord).r;
	vec4 normal = texture2D(normalSampler, fragTexCoord);
	vec4 albedo = texture2D(albedoSampler, fragTexCoord);
	vec3 light = texture2D(lightSampler, fragTexCoord).rgb;
	
	float x = (0.5 - clamp(distance(fragTexCoord, vec2(0.5, 0.5)), 0.0, 1.0)) / 0.5;
	light += 0.25 * vec3(x, x*0.75, x*0.5);
	
	// vec3 color = albedo.rgb * light.rgb;
	vec3 color = albedo.rgb * mix(vec3(0.25), vec3(1.0), light.rgb);
	gl_FragColor = vec4(color, 1.0);
}


precision highp float;

uniform sampler2D sampler;

varying vec4 fragProjPos;
varying vec2 fragTexCoord;
varying float fragDist;
varying float fragDomain;
varying float fragSizeScalar;

const float PI = 3.14159265358979323846264338327950;

void main()
{
	vec4 color = vec4(1.0, 0.75, 0.5, 1.0);
	if (fragDomain > 0.95) {
		color.rgb *= texture2D(sampler, fragTexCoord).rgb * 2.0;
	}
	else {
		float d = clamp(0.5-length(fragTexCoord-vec2(0.5)), 0.0, 0.5) / 0.5;
		float ringness = pow(1.0 - clamp(abs(fragDomain-0.5), 0.0, 0.5) / 0.5, 0.75);
		d = pow(d, 1.25);
		d -= pow(max(d-0.25,0.0)/0.75, 0.625) * ringness;
		d = clamp(d, 0.0, 1.0);
		color.rgb *= d;
		color.a *= pow(min(1.5 / abs(fragDist), 1.0), 1.0);
		color.a *= clamp(1.0-pow(fragSizeScalar, 0.0), 0.5, 1.25);
	}
	
	gl_FragColor = color;
}

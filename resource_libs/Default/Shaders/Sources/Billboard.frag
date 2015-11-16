
precision highp float;

uniform mat4 vMatrix;
uniform mat4 mvMatrix;

uniform sampler2D sampler;
uniform vec4 color;

varying vec4 fragProjPos;
varying vec2 fragTexCoord;
varying vec4 fragColor;

const float PI = 3.14159265358979323846264338327950;

void main()
{
	gl_FragColor = fragColor * color * texture2D(sampler, fragTexCoord);
}

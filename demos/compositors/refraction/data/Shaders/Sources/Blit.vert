
attribute vec3 vertPosition;

varying vec2 fragTexCoord;

void main()
{
	fragTexCoord = vertPosition.xy * 0.5 + 0.5;
	gl_Position = vec4(vertPosition.xy, 0.0, 1.0);
}

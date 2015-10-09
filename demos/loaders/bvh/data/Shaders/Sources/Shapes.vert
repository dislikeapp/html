
uniform mat4 mvpMatrix;

attribute vec3 vertPosition;
attribute vec4 vertColor;
attribute float vertSize;

varying vec4 fragColor;

void main()
{
	gl_PointSize = vertSize;
	fragColor = vertColor;
	gl_Position = mvpMatrix * vec4(vertPosition, 1.0);
}

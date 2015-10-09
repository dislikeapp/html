
precision mediump float;

uniform mat4 mvpMatrix;
uniform mat4 mvMatrix;
uniform mat3 nMatrix;

attribute vec3 vertPosition;
attribute vec3 vertNormal;

varying vec3 fragPosition;
varying vec3 fragNormal;

void main()
{
	fragNormal = nMatrix * vertNormal;
	fragPosition = (mvMatrix * vec4(vertPosition, 1.0)).xyz;
	gl_Position = mvpMatrix * vec4(vertPosition, 1.0);
}

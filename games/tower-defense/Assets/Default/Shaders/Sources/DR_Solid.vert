
uniform mat4 mvpMatrix;
uniform mat4 mvMatrix;
uniform mat3 nMatrix;

attribute vec3 vertPosition;
attribute vec3 vertNormal;
attribute vec2 vertTexCoord;

varying vec4 fragViewPos;
varying vec4 fragProjPos;
varying vec3 fragNormal;
varying vec2 fragTexCoord;

void main()
{
	gl_Position = mvpMatrix * vec4(vertPosition, 1.0);
	fragViewPos = mvMatrix * vec4(vertPosition, 1.0);
	fragProjPos = gl_Position;
	fragNormal = nMatrix * vertNormal;
	fragTexCoord = vertTexCoord;
}


uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
attribute vec4 vertColor;

varying vec4 fragProjPos;
varying vec2 fragTexCoord;
varying vec4 fragColor;

void main()
{
	fragTexCoord = vertTexCoord;
	fragColor = vertColor;
	
	vec4 mvpos = vMatrix * vec4(mMatrix[3].xyz, 1.0);
	mvpos.xyz += (mMatrix * vec4(vertPosition, 0.0)).xyz;
	
	fragProjPos = pMatrix * mvpos;
	gl_Position = fragProjPos;
}

/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

var MountainGradientShader = {

	uniforms: {
		"maxheight": {type: "f", value: 300.0},
		"colorTop": {type: "c", value: new THREE.Color(0xFF0000)},
		"colorBottom": {type: "c", value: new THREE.Color(0x0000FF)}
	},

	vertexShader: [

		"varying float vHeight;",

		"void main() {",
			"vHeight = position.y;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float maxheight;",
		"uniform vec3 colorTop;",
		"uniform vec3 colorBottom;",

		"varying float vHeight;",

		"void main() {",
			"float ratioHeight = vHeight / maxheight;",
			"vec3 gradient = mix(colorTop, colorBottom, ratioHeight - 0.3);",
			"gl_FragColor = vec4( gradient, 1.0 );",

		"}"

	].join("\n")

};

var SnowParticleShader = {

    uniforms: {
        "texture": {type: "t", value: null},
        "color": {type: "c", value: new THREE.Color(0xFFFFFF)},
        "size": {type: "f", value: 1.0}
    },

    vertexShader: [

        "uniform float size;",

        "void main() {",

            "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "gl_PointSize = size * ( 1000.0 / length( mvPosition.xyz ) );",
            "gl_Position = projectionMatrix * mvPosition;",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform vec3 color;",
        "uniform sampler2D texture;",

        "void main() {",

            "gl_FragColor = vec4( color, 1.0 );",
            "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",

        "}",

    ].join("\n")

};

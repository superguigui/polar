var TextureMaskShader = {

    uniforms: {

        "tDiffuse1": { type: "t", value: null },
        "tDiffuse2": { type: "t", value: null },
        "tMask":     { type: "t", value: null }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [
        "uniform sampler2D tDiffuse1;",
        "uniform sampler2D tDiffuse2;",
        "uniform sampler2D tMask;",

        "varying vec2 vUv;",

        "void main() {",

            "vec4 texel1 = texture2D( tDiffuse1, vUv );",
            "vec4 texel2 = texture2D( tDiffuse2, vUv );",
            "vec4 texelMask = texture2D( tMask, vUv );",
            "gl_FragColor = mix( texel1, texel2, texelMask.r);",

        "}"

    ].join("\n")

};

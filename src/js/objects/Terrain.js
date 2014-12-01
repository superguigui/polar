var Terrain = (function(){

    function Terrain(width, height){
        THREE.Object3D.call(this);

        this.sceneRenderTarget = new THREE.Scene();
        this.cameraOrtho = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, -10000, 10000);
        this.cameraOrtho.position.z = 100;
        this.sceneRenderTarget.add(this.cameraOrtho);

        var normalShader = THREE.NormalMapShader;
        var rx = 256, ry = 256;
        var pars = { 
            minFilter: THREE.LinearMipmapLinearFilter, 
            magFilter: THREE.LinearFilter, 
            format: THREE.RGBFormat 
        };

        this.heightMap = new THREE.WebGLRenderTarget(rx, ry, pars);
        this.normalMap = new THREE.WebGLRenderTarget(rx, ry, pars);

        this.uniformsNormal = THREE.UniformsUtils.clone(THREE.NormalMapShader.uniforms);
        this.uniformsNormal.height.value = 0.05;
        this.uniformsNormal.resolution.value.set(rx, ry);
        this.uniformsNormal.heightMap.value = this.heightMap;
        var materialNormal = new THREE.ShaderMaterial({
            uniforms: this.uniformsNormal,
            vertexShader: THREE.NormalMapShader.vertexShader,
            fragmentShader: THREE.NormalMapShader.fragmentShader
        });

        this.uniformsNoise = THREE.UniformsUtils.clone(SimplexNoiseShader.uniforms);
        this.uniformsNoise.scale.value.set(1, 1);
        var materialNoise = new THREE.ShaderMaterial({
            uniforms: this.uniformsNoise,
            vertexShader: SimplexNoiseShader.vertexShader,
            fragmentShader: SimplexNoiseShader.fragmentShader
        });

        this.planeNoise = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), materialNoise);
        this.sceneRenderTarget.add(this.planeNoise);
        this.planeNoise.position.z = -500;

        this.planeNormal = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), materialNormal);
        this.sceneRenderTarget.add(this.planeNormal);
        this.planeNormal.position.z = -500;

        var shaderTerrain = THREE.ShaderLib['normalmap'];

        this.uniformsTerrain = THREE.UniformsUtils.clone(shaderTerrain.uniforms);
        this.uniformsTerrain[ "enableSpecular" ].value = true;
        this.uniformsTerrain[ "enableDisplacement" ].value = true;
        this.uniformsTerrain[ "tNormal" ].value = this.normalMap;
        this.uniformsTerrain[ "tSpecular" ].value = this.heightMap;
        this.uniformsTerrain[ "tDisplacement" ].value = this.heightMap;
        this.uniformsTerrain[ "uDisplacementScale" ].value = 1000.0;
        this.uniformsTerrain[ "uNormalScale" ].value.set(0.0, 0.5);
        this.uniformsTerrain[ "diffuse" ].value.setHex( 0xFFFFFF );
        this.uniformsTerrain[ "shininess" ].value = 50.0;

        this.terrainMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniformsTerrain,
            vertexShader: shaderTerrain.vertexShader,
            fragmentShader: shaderTerrain.fragmentShader,
            lights: true,
            fog: true
        });
        this.terrainGeometry = new THREE.PlaneBufferGeometry(16000, 16000, 300, 300)
        this.terrainGeometry.computeTangents();
        this.debugMesh = new THREE.Mesh(this.terrainGeometry, this.terrainMaterial);
        this.add(this.debugMesh);
        this.debugMesh.rotation.x = -Math.PI * 0.5;
        this.debugMesh.position.y = -1200;
        this.debugMesh.position.z = -7000;
    }

    Terrain.prototype = new THREE.Object3D;
    Terrain.prototype.constructor = Terrain;

    Terrain.prototype.update = function(t, renderer) {
        this.uniformsNoise.offset.value.x += 0.01;
        this.planeNormal.visible = false;
        this.planeNoise.visible = true;
        renderer.render(this.sceneRenderTarget, this.cameraOrtho, this.heightMap, true);
        this.planeNormal.visible = true;
        this.planeNoise.visible = false;
        renderer.render(this.sceneRenderTarget, this.cameraOrtho, this.normalMap, true);
    };

    return Terrain;
})();


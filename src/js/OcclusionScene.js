var OcclusionScene = (function(){

    function OcclusionScene(width, height, renderer){
        this.width = width;
        this.height= height;
        this.sunColor = 0x795a38;
        
        this.scene = new THREE.Scene();
         
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100000);
        this.camera.position.set(0, 100, 1000);
        this.camera.lookAt(new THREE.Vector3(0, 100, 0));

        this.mountain = new Mountain(true);
        this.scene.add(this.mountain);
        this.mountain.position.set(0, -2000, -20000);

        this.sunMesh = new THREE.Mesh(new THREE.CircleGeometry(800, 64), new THREE.MeshBasicMaterial({color: this.sunColor}));
        this.scene.add(this.sunMesh);
        this.sunMesh.position.set(0, 1600, -22000);

        this.tunnel = new Tunnel(true);
        this.scene.add(this.tunnel);

        var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
        this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, renderTargetParameters);
                
        this.addPostprocessing(renderer);
    }

    OcclusionScene.prototype.addPostprocessing = function(renderer) {
        this.composer = new THREE.EffectComposer(renderer, this.renderTarget);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

        var hblur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
        var vblur = new THREE.ShaderPass(THREE.VerticalBlurShader);
        hblur.uniforms.h.value = 8 / this.width;
        vblur.uniforms.v.value = 8 / this.height;
        
        this.composer.addPass(hblur);
        this.composer.addPass(vblur);
        this.composer.addPass(hblur);
        this.composer.addPass(vblur);
        
        
        var grPass = new THREE.ShaderPass(GodraysShader);
        this.composer.addPass(grPass);

        // vblur.renderToScreen = true;
    };

    OcclusionScene.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.width = width;
        this.height = height;
    };

    OcclusionScene.prototype.render = function(renderer) {
        this.mountain.update();
        this.tunnel.update();
        renderer.setClearColor(0x000000)
        // renderer.render(this.scene, this.camera);
        this.composer.render();

    };

    return OcclusionScene;

})();
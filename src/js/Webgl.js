var Webgl = (function(){

    function Webgl(width, height, painterCanvas, container){
        this.width = width;
        this.height= height;
        this.backgroundColor = 0x75b6d8;
        this.ambientColor = 0x2d6785;
        this.fogColor = 0x51B5E8;
        this.enablePainter = true;
        this.painterCanvasTexture = new THREE.Texture(painterCanvas);

        this.debug = false;
        this.switchColorScheme = false;

        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.fogColor, 0.0001);
        
        this.frontScene = new THREE.Scene();
        
        
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100000);
        this.camera.position.set(0, 100, 1000);
        this.camera.lookAt(new THREE.Vector3(0, 100, 0));

        this.renderer = new THREE.WebGLRenderer({autoClear: false});
        this.renderer.autoClear = false;
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(this.backgroundColor);
        container.appendChild(this.renderer.domElement);

        this.light = new THREE.PointLight(0xFFFFFF, 1);
        this.scene.add(this.light);
        this.light.position.set(0, 1200, -7000);

        this.ambientLight = new THREE.AmbientLight(this.ambientColor);
        this.scene.add(this.ambientLight);

        this.terrain = new Terrain(width, height);
        this.scene.add(this.terrain);

        this.fallingSnow = new FallingSnow();
        this.scene.add(this.fallingSnow);

        this.tunnel = new Tunnel();
        this.frontScene.add(this.tunnel);


        this.mountain = new Mountain();
        this.scene.add(this.mountain);
        this.mountain.position.set(0, -2000, -20000);

        this.backgroundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(400000, 10000), new THREE.MeshBasicMaterial({color: this.mountain.colors.top, fog: false}));
        this.scene.add(this.backgroundMesh);
        this.backgroundMesh.position.set(0, -7000, -20010);

        this.occlusion = new OcclusionScene(width, height, this.renderer);

        if(this.debug) {
            this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
        }
        else {
            this.addPostprocessing();
        }

        if(this.debug) {
            gui.addColor(this, 'backgroundColor').listen().onChange(function(){
                this.renderer.setClearColor(this.backgroundColor);
            }.bind(this)).name('Clear Color');
            gui.addColor(this, 'fogColor').onChange(function(){
                this.scene.fog.color.setHex(this.fogColor);
            }.bind(this)).listen().name('Fog Color');
            gui.addColor(this, 'ambientColor').listen().onChange(function(){
                this.ambientLight.color.setHex(this.ambientColor);
            }.bind(this)).name('Ambient Color');
            gui.addColor(this.occlusion, 'sunColor').onChange(function(){
                this.occlusion.sunMesh.material.color.setHex(this.occlusion.sunColor);
            }.bind(this)).listen().name('Sun Color');
            gui.add(this.fallingSnow, 'visible').name('Show Snow');

            gui.add(this, 'switchColorScheme').onChange(this.toggleColorScheme.bind(this)).name('Toggle Hot');
        }
    }

    Webgl.prototype.tunnelTransition = function() {
        if(!this.tunnelTransitionRunning) {
            this.tunnelTransitionRunning = true;
            this.switchColorScheme = !this.switchColorScheme;
            this.tunnel.start(function(){
                audio.startTunnel();
                window.painter.drawSolar = this.switchColorScheme;
                window.painter.reset();
                TweenMax.to(this.lightenPass.uniforms.brightness, 0.3, {value: 0});
                TweenMax.to(this.lightenPass.uniforms.contrast, 0.3, {value: 0});
            }.bind(this), function(){
                audio.stopTunnel();
                if(this.switchColorScheme) {
                    TweenMax.to(this.lightenPass.uniforms.brightness, 0.3, {value: 0.05});
                    TweenMax.to(this.lightenPass.uniforms.contrast, 0.3, {value: 0.1});
                }
                else {
                    TweenMax.to(this.lightenPass.uniforms.brightness, 0.3, {value: 0.1});
                    TweenMax.to(this.lightenPass.uniforms.contrast, 0.3, {value: -0.2});
                }
                this.tunnelTransitionRunning = false;
            }.bind(this));
            this.occlusion.tunnel.start();
            TweenMax.delayedCall(1, function(){
                this.toggleColorScheme();
            }.bind(this));
        }
    };

    Webgl.prototype.toggleColorScheme = function() {
        if(this.switchColorScheme) {
            this.backgroundColor = 0x117cb3;
            this.fogColor = 0x9d8469;
            this.ambientColor = 0xb36E0F;
            this.occlusion.sunColor = 0xFF5A00;
            this.mountain.colors.top = 0x988264;
            this.mountain.colors.bottom = 0x7d7d3d;
            this.fallingSnow.visible = false;
        }
        else {
            this.backgroundColor = 0x75b6d8;
            this.fogColor = 0x51B5E8;
            this.ambientColor = 0x2d6785;
            this.occlusion.sunColor = 0x795a38;
            this.mountain.colors.top = 0x5aa9d2;
            this.mountain.colors.bottom = 0x415d6c;
            this.fallingSnow.visible = true;
        }

        this.renderer.setClearColor(this.backgroundColor);
        this.scene.fog.color.setHex(this.fogColor);
        this.ambientLight.color.setHex(this.ambientColor);
        this.occlusion.sunMesh.material.color.setHex(this.occlusion.sunColor);
        this.mountain.uniforms.colorTop.value.setHex(this.mountain.colors.top);
        this.mountain.uniforms.colorBottom.value.setHex(this.mountain.colors.bottom);
        this.backgroundMesh.material.color.setHex(this.mountain.colors.top);
    };

    Webgl.prototype.addPostprocessing = function() {
        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderPass = new THREE.RenderPass(this.scene, this.camera)
        this.composer.addPass(this.renderPass);

        // Render tunnel in front of everything
        this.renderPassFront = new THREE.RenderPass(this.frontScene, this.camera)
        this.renderPassFront.clear = false;
        this.renderPassFront.clearDepth = true;
        this.composer.addPass(this.renderPassFront);

        // Vignette
        this.composer.addPass(new THREE.ShaderPass(THREE.VignetteShader));

        // Light effects from occlusion scene
        this.glowPass = new THREE.ShaderPass(AdditiveTextureShader);
        this.glowPass.uniforms.tDiffuse2.value = this.occlusion.renderTarget;
        this.composer.addPass(this.glowPass);

        // Save untouched rendering for later use
        var renderTargetParams = { 
            minFilter: THREE.LinearFilter, 
            magFilter: THREE.LinearFilter, 
            format: THREE.RGBFormat, 
            stencilBuffer: false 
        };
        this.savedRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height, renderTargetParams);
        this.savePass = new THREE.SavePass(this.savedRenderTarget);
        this.composer.addPass(this.savePass);

        // Blur
        this.vBlurCold = new THREE.ShaderPass(THREE.VerticalBlurShader);
        this.hBlurCold = new THREE.ShaderPass(THREE.HorizontalBlurShader);
        this.bluriness = 2;
        this.vBlurCold.uniforms.v.value = this.bluriness / this.height;
        this.hBlurCold.uniforms.h.value = this.bluriness / this.width;
        this.composer.addPass(this.vBlurCold);
        this.composer.addPass(this.hBlurCold);

        // Lighten
        this.lightenPass = new THREE.ShaderPass(THREE.BrightnessContrastShader);
        this.composer.addPass(this.lightenPass);
        this.lightenPass.uniforms.brightness.value = 0.1;
        this.lightenPass.uniforms.contrast.value = -0.2;

        // Copy needed here for lighten to work...
        this.copyPass = new THREE.ShaderPass(THREE.CopyShader);
        this.composer.addPass(this.copyPass);
        
        // Apply masked saved rendering on top of blurry lightened
        this.maskPass = new THREE.ShaderPass(TextureMaskShader);
        this.composer.addPass(this.maskPass);
        this.maskPass.uniforms.tDiffuse2.value = this.savedRenderTarget;
        this.maskPass.uniforms.tMask.value = this.painterCanvasTexture;
        this.maskPass.renderToScreen = true;
    };

    Webgl.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
        this.occlusion.resize(width, height);
        // this.savedRenderTarget.setSize(width, height);
        this.vBlurCold.uniforms.v.value = this.bluriness / this.height;
        this.hBlurCold.uniforms.h.value = this.bluriness / this.width;
        this.savePass.clear = true;
    };

    Webgl.prototype.render = function() {
        var t = this.clock.getElapsedTime();

        this.painterCanvasTexture.needsUpdate = true;
        
        this.terrain.update(t, this.renderer);
        this.fallingSnow.update();
        this.mountain.update();
        this.tunnel.update();

        this.occlusion.render(this.renderer);

        if(this.debug) {
            this.renderer.render(this.scene, this.camera);
            this.controls.update();
        }
        else {
            this.renderer.setClearColor(this.backgroundColor);
            this.composer.render();
        }
    };

    return Webgl;

})();
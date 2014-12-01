var FallingSnow = (function(){

    function FallingSnow(){
        THREE.Object3D.call(this);

        this.zone = new THREE.Vector3(4000, 1000, 2000);
        this.nbParticles = 20000;

        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(this.nbParticles * 3);
        
        for(var i = 0, j = 0; i < this.nbParticles; i++, j += 3) {
            positions[j + 0] = Math.random() * this.zone.x - this.zone.x * 0.5;
            positions[j + 1] = Math.random() * this.zone.y - this.zone.y * 0.5;
            positions[j + 2] = Math.random() * this.zone.z - this.zone.z * 0.5;
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

        var snowFlakeTexture = THREE.ImageUtils.loadTexture('assets/textures/snowflake.png');
        var uniforms = THREE.UniformsUtils.clone(SnowParticleShader.uniforms);
        uniforms.texture.value = snowFlakeTexture;
        uniforms.color.value.setHex(0xFFFFFF);
        uniforms.size.value = 2.0;

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: SnowParticleShader.vertexShader,
            fragmentShader: SnowParticleShader.fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        this.pointCloud = new THREE.PointCloud(geometry, material);
        this.add(this.pointCloud);
    }

    FallingSnow.prototype = new THREE.Object3D;
    FallingSnow.prototype.constructor = FallingSnow;

    FallingSnow.prototype.update = function() {
        var positions = this.pointCloud.geometry.attributes.position.array;
        for(var i = 0, j = 0; i < this.nbParticles; i++, j += 3) {
            positions[j + 1] -= 1;
            positions[j + 0] -= 2.5;
            if(positions[j + 1] < (-this.zone.y * 0.5)) {
                positions[j + 1] = this.zone.y * 0.5;
                positions[j + 0] = -positions[j + 0];
            }
        }
        this.pointCloud.geometry.attributes.position.needsUpdate = true;
    };

    return FallingSnow;
})();
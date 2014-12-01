var Tunnel = (function(){

    function Tunnel(isOccluding){
        THREE.Object3D.call(this);

        this.tunnelLength = 30000;
        var geometry = new THREE.PlaneBufferGeometry(this.tunnelLength, 1000);
        var material;
        if(isOccluding) {
            material = new THREE.MeshBasicMaterial({color: 0x000000});
        }
        else {
            material = new THREE.MeshLambertMaterial({color: 0x232323, ambient: 0x000000});
        }

        var windowGeometry = new THREE.PlaneBufferGeometry(100, 30);
        var windowMaterial = new THREE.MeshBasicMaterial({color: isOccluding ? 0xFFCD72 : 0xFFCD72});


        this.wallMesh = new THREE.Mesh(geometry, material);
        this.add(this.wallMesh);


        // this.wallMesh.position.x = 5000;
        this.wallMesh.position.z = -3;

        this.windows = [];
        this.windowStep = 2000;
        this.nbWindows =  ~~(this.tunnelLength / this.windowStep) - 1;

        if(isOccluding) {
            var exitGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
            var exitMaterial = new THREE.MeshBasicMaterial({color: 0x372716});
            var exitMesh = new THREE.Mesh(exitGeometry, exitMaterial);
            var entranceMesh = new THREE.Mesh(exitGeometry, exitMaterial);
            this.add(exitMesh);
            this.add(entranceMesh);
            exitMesh.position.set(this.tunnelLength * 0.5 + 250, 0, 0);
            entranceMesh.position.set(-(this.tunnelLength * 0.5 + 250), 0, 0);
        }



        var mesh;
        for (var i = 0; i < this.nbWindows; i++) {
        	mesh = new THREE.Mesh(windowGeometry, windowMaterial);
	        this.add(mesh);
	        this.windows.push(mesh);
            mesh.position.x = -(this.nbWindows * this.windowStep * 0.5) + i * this.windowStep;
	        mesh.position.y = 200;
        }

        this.position.x = this.tunnelLength * 0.5 + 3000;
        this.finished = true;
        
    }

    Tunnel.prototype = new THREE.Object3D;
    Tunnel.prototype.constructor = Tunnel;

    Tunnel.prototype.start = function(enterCallback, leaveCallback) {
        this.finished = false;
        this.enterCallback = enterCallback;
        this.leaveCallback = leaveCallback;
        this.entered = false;
        this.left = false;
    };

    Tunnel.prototype.update = function() {
        if(!this.finished) {
        	this.position.x -= 300;
            if(this.position.x <= (this.tunnelLength * 0.5) && !this.entered) {
                this.entered = true;
                if(this.enterCallback) this.enterCallback();
            }
            if(this.position.x <= (-this.tunnelLength * 0.5) && !this.left) {
                this.left = true;
                if(this.leaveCallback) this.leaveCallback();
            }
            if(this.position.x < -(this.tunnelLength * 0.5 + 3000)) {
                this.position.x = this.tunnelLength * 0.5 + 3000;
                this.finished = true;
            }
        }
    };

    return Tunnel;
})();
var Painter = (function(){

    function Painter(width, height){
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineJoin = this.ctx.lineCap = 'round';

        this.resize(width, height);

        this.brushImage = new Image();
        this.brushImage.src = 'assets/textures/brush5.png';

        this.titleImagePolar = new Image();
        this.titleImagePolar.src = 'assets/textures/polar.png';
        this.titleWidth = 524;
        this.titleHeight = 54;

        this.titleImageSolar = new Image();
        this.titleImageSolar.src = 'assets/textures/solar.png';

        this.isDrawing = false;
        this.lastPoint = null;

        this.drawSolar = false;

        this.lastTime = 0;
        this.clearInterval = 0.25;

        this.ctx.fillRect(0, 0, width, height);
    }

    Painter.prototype.mouseDown = function(e) {
        if(!this.introOver) return;
        this.isDrawing = true;
        this.lastPoint = { x: e.clientX, y: e.clientY };
    };

    Painter.prototype.mouseUp = function(e) {
        this.isDrawing = false;
    };

    Painter.prototype.mouseMove = function(e) {
        if(!this.isDrawing || !this.introOver) return;

        this.drawCurrentPointBrush(e.clientX, e.clientY);
    };

    Painter.prototype.drawCurrentPointBrush = function(x, y) {
        var currentPoint = { x: x, y: y };
        var dist = this.distanceBetween(this.lastPoint, currentPoint);
        var angle = this.angleBetween(this.lastPoint, currentPoint);

        for(var i = 0; i < dist; i++) {
            x = this.lastPoint.x + (Math.sin(angle) * i) - 25;
            y = this.lastPoint.y + (Math.cos(angle) * i) - 25;
            this.ctx.drawImage(this.brushImage, x, y);
        }
        this.ctx.drawImage(this.drawSolar ? this.titleImageSolar : this.titleImagePolar, this.width * 0.5 - this.titleWidth * 0.5, this.height * 0.5 - this.titleHeight * 0.5);
        this.lastPoint = currentPoint;
    };

    Painter.prototype.distanceBetween = function(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    };

    Painter.prototype.angleBetween = function(point1, point2) {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    };

    Painter.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    };

    Painter.prototype.reset = function() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
        this.ctx.fillRect(0, 0, this.width, this.height);
    };

    Painter.prototype.startIntro = function() {
        var point = {x: this.width * 0.5 - 350, y: this.height * 0.5 + 50};
        this.lastPoint = { x: point.x, y: point.y };
        var tl = new TimelineMax({onUpdate: function(){
            this.drawCurrentPointBrush(point.x, point.y);
        }.bind(this), onComplete: function(){
            this.introOver = true;
        }.bind(this)});
        tl.to(point, 0.4, {x: point.x + 100, y: point.y - 150, ease: Quart.easeIn});
        tl.to(point, 0.15, {x: point.x + 140, y: point.y, ease: Linear.easeNone});
        tl.to(point, 0.15, {x: point.x + 210, y: point.y - 160, ease: Linear.easeNone});
        tl.to(point, 0.15, {x: point.x + 250, y: point.y, ease: Linear.easeNone});
        tl.to(point, 0.15, {x: point.x + 320, y: point.y - 140, ease: Linear.easeNone});
        tl.to(point, 0.15, {x: point.x + 360, y: point.y, ease: Linear.easeNone});
        tl.to(point, 0.15, {x: point.x + 400, y: point.y - 150, ease: Linear.easeNone});
        tl.to(point, 0.15, {x: point.x + 410, y: point.y, ease: Linear.easeNone});
        tl.to(point, 0.15, {x: point.x + 490, y: point.y - 160, ease: Linear.easeNone});
        tl.to(point, 0.15, {x: point.x + 550, y: point.y, ease: Linear.easeNone});
        tl.to(point, 0.4, {x: point.x + 600, y: point.y - 150, ease: Quart.easeOut});
    };

    Painter.prototype.render = function(time) {
        if((time - this.lastTime) > this.clearInterval) {
            this.lastTime = time;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.drawImage(this.drawSolar ? this.titleImageSolar : this.titleImagePolar, this.width * 0.5 - this.titleWidth * 0.5, this.height * 0.5 - this.titleHeight * 0.5);
        }
    };

    return Painter;

})();
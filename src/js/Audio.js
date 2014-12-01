var Audio = (function(){

    function Audio(){
        this.sound = new buzz.sound( "assets/sounds/train", {
            formats: [ "wav" ],
            volume: 0
        });
        this.duration = 3115;
        this.sound.play()
            .fadeTo(25)
            .loop();
    }

    Audio.prototype.startTunnel = function() {
        
    };

    Audio.prototype.stopTunnel = function() {
        
    };

    Audio.prototype.update = function() {
        if(this.sound.getTime() > 3.00) {
            this.sound.setTime(0);
        }
    };

    return Audio;

})();
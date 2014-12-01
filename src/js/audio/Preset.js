var Preset = (function(){

    function Preset(presetIndex, title, sampleIndex, impulseResponseIndex, mainGain, sendGain) {
        this.mainGain = mainGain;
        this.sendGain = sendGain;

        this.title = title;
        this.presetIndex = presetIndex;
        this.sampleIndex = sampleIndex;
        this.impulseResponseIndex = impulseResponseIndex + responseOffset; // passed in index starts at 0 for responses
        this.sampleBuffer = 0;
        this.impulseResponseBuffer = 0;
    }

    Preset.prototype.assetFinishedLoading = function(asset) {
        switch (asset.type) {
            case 0: this.sampleBuffer = asset.buffer; break;
            case 1: this.impulseResponseBuffer = asset.buffer; break;
        }
        
        if (this.isFullyLoaded()) {
            // Autoplay first preset
            if (this.presetIndex == 0) {
                this.play();
            }
        }
    }

    Preset.prototype.isFullyLoaded = function() {
        return this.sampleBuffer && this.impulseResponseBuffer;
    }

    Preset.prototype.load = function() {
        sampleAsset = assetList[this.sampleIndex];
        impulseResponseAsset = assetList[this.impulseResponseIndex];
        
        sampleAsset.load(this);
        impulseResponseAsset.load(this);    
    }

    Preset.prototype.play = function() {
        source.buffer = this.sampleBuffer;
        convolver.buffer = this.impulseResponseBuffer;

        gainNode1.gain.value = this.mainGain;
        gainNode2.gain.value = this.sendGain;

        if (!isStarted) {
            isStarted = true;
            source.start(0);
        }
    }

    return Preset;

})();
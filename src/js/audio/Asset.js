var Asset = (function(){

    function Asset(url, index, type) {
        this.url = url;
        this.index = index;
        this.type = type;
        this.startedLoading = false;
        this.loaded = false;
        this.buffer = 0;
        this.presetList = new Array();
    }

    Asset.prototype.load = function(preset) {
        if (this.loaded) {
            // Already loaded
            preset.assetFinishedLoading(this);
            return;
        }

        // Keep track of this preset as a dependency
        var n = this.presetList.length;
        this.presetList[n] = preset;
        
        if (this.startedLoading) {
            return;
        }

        this.startedLoading = true;
            
        // Load asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", this.url, true);
        request.responseType = "arraybuffer";
        this.request = request;
        
        var asset = this;

        request.onload = function() {
            context.decodeAudioData(
                request.response,
                function(buffer) {
                    asset.buffer = buffer;
                    asset.loaded = true;
                    
                    // Tell all the presets that depend on us that we're ready
                    for (i = 0; i < asset.presetList.length; i++) {
                        var preset = asset.presetList[i];
                        preset.assetFinishedLoading(asset);
                    }
                },
                
                function(buffer) {
                    // alert("ERROR!!!!! " + asset.url);
                }
            );
        }

        request.send();
    }
    
    return Asset;
})();

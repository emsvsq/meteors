
    var assetsToLoadURLs = {
        background: { url: 'Images/background.jpg' }, 
        character: { url: "Images/sprites2.png" },
        character2: { url:"Images/sprites3.png" },
        ground: { url:"Images/ground1.png" },
        meteor: { url: "Images/spritemeteor.png" },
        explosion: { url: "Images/explosion.png" },
        menu: { url: "Images/menu1980.jpg" },
        options: { url: "Images/options.jpg" },

        button: { url: 'Sounds/MouseClick1.mp3', buffer: false, loop: false, volume: 1.0 },
        meteorLaunch1: { url: 'Sounds/GlueScreenMeteorLaunch1.mp3', buffer: true, loop: true, volume: 1.0 },
        meteorLaunch2: { url: 'Sounds/InfernalBirth1.mp3', buffer: true, loop: true, volume: 1.0 },
        meteorLaunch3: { url: 'Sounds/GlueScreenMeteorLaunch3.mp3', buffer: true, loop: true, volume: 1.0 },
        meteorHit: { url: 'Sounds/GlueScreenMeteorHit3.mp3', buffer: true, loop: true, volume: 1.0 }

    };

    function loadAssets(callback) {
        // here we should load the souds, the sprite sheets etc.
        // then at the end call the callback function           
        loadAssetsUsingHowlerAndNoXhr(assetsToLoadURLs, callback);
    }

    // You do not have to understand in details the next lines of code...
    // just use them!

    /* ############################
        BUFFER LOADER for loading multiple files asyncrhonously. The callback functions is called when all
        files have been loaded and decoded 
     ############################## */
    function isImage(url) {
        return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    function isAudio(url) {
        return (url.match(/\.(mp3|ogg|wav)$/) != null);
    }

    function loadAssetsUsingHowlerAndNoXhr(assetsToBeLoaded, callback) {
        var assetsLoaded = {};
        var loadedAssets = 0;
        var numberOfAssetsToLoad = 0;

        // define ifLoad function
        var ifLoad = function () {
            if (++loadedAssets >= numberOfAssetsToLoad) {
                callback(assetsLoaded);
            }
            console.log("Loaded asset " + loadedAssets);
        };

        // get num of assets to load
        for (var name in assetsToBeLoaded) {
            numberOfAssetsToLoad++;
        }

        console.log("Nb assets to load: " + numberOfAssetsToLoad);

        for (name in assetsToBeLoaded) {
            var url = assetsToBeLoaded[name].url;
            console.log("Loading " + url);
            if (isImage(url)) {
                assetsLoaded[name] = new Image();

                assetsLoaded[name].onload = ifLoad;
                // will start async loading. 
                assetsLoaded[name].src = url;
            } else {

                assetsLoaded[name] = new Audio([url]);

                if (++loadedAssets >= numberOfAssetsToLoad) {
                            callback(assetsLoaded);
                 }
            } // if

        } // for
    } // function
var _iconAnimation = new IconAnimation();

_iconAnimation.updated.add(function(){
    chrome.browserAction.setIcon({'imageData':_iconAnimation.getImageData()});
});

chrome.runtime.onConnect.addListener(function(port) {
    _iconAnimation.fadeIn();

    port.onDisconnect.addListener(function() {
        _iconAnimation.fadeOut();
    });
});


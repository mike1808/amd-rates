var _iconAnimation = new IconAnimation();

_iconAnimation.updated.add(function(){
    chrome.browserAction.setIcon({'imageData':_iconAnimation.getImageData()});
});

chrome.runtime.onConnect.addListener(function(port) {
    console.log("Connected .....");

    _iconAnimation.fadeIn();

    port.onMessage.addListener(function(msg) {
        console.log("Message received. " + msg);
        if (msg == 'Send current rates')
            port.postMessage(currentRates);
        if (msg = 'Update current rates')
            getCurrentRates();
        if (msg = 'Update "update rate"')
            setUpdateInterval();
    });

    port.onDisconnect.addListener(function() {
        _iconAnimation.fadeOut();
    });


});

var currentRates = {};
var currencies = {};

$.getJSON("/js/currencies.json", function(json){
    currencies = json;
});

function getCurrentRates() {
    var selectedBanks = JSON.parse(localStorage['selected-banks']);

    $.ajax({
        url: 'http://www.rate.am/',
        type: 'GET',
        cache: false,
        dataType: 'xml'
    })
        .success(function(html){
            for(var i=0; i<selectedBanks.length; i++) {
                // Parsing rates
                var rates = $('.rb tr', html)[selectedBanks[i]].children;

                // Updating rates for currency calculator
                currentRates[selectedBanks[i]] = {
                    USD: {
                        buy: rates[5].innerText,
                        sell: rates[6].innerText
                    },
                    EUR: {
                        buy: rates[7].innerText,
                        sell: rates[8].innerText
                    },
                    RUR: {
                        buy: rates[9].innerText,
                        sell: rates[10].innerText
                    },
                    GBP: {
                        buy: rates[11].innerText,
                        sell: rates[12].innerText
                    },
                    AMD: {
                        buy: 1,
                        sell: 1
                    }
                };
            }
        });
};

getCurrentRates();


var intervalId;
function setUpdateInterval() {
    if (intervalId)
        clearInterval(intervalId);

    var updateTime = parseInt(JSON.parse(localStorage['update-time']));
    intervalId = setInterval(getCurrentRates, updateTime);
}

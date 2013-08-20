var iconAnimation          = new IconAnimation(),
    currentRates           = {},
    currencies             = {},
    bestCurrencies         = {},
    intervalId,
    parseUrl               = 'http://rate.am/ru/armenian-dram-exchange-rates/banks/non-cash';

function getCurrencies(callback) {
    if (!$.isEmptyObject(currencies)) {
        callback();
    } else {
        $.getJSON("/js/currencies.json", function(json){
            $.extend(currencies, json);

            callback();
        });
    }
}


iconAnimation.updated.add(function(){
    chrome.browserAction.setIcon({'imageData':iconAnimation.getImageData()});
});

chrome.runtime.onConnect.addListener(function(port) {
    console.log("Connected .....");

    iconAnimation.fadeIn();

    port.onMessage.addListener(function(msg) {
        console.log("Message received. " + msg);
        if (msg == 'Send current rates')
            port.postMessage(currentRates);
        if (msg == 'Update current rates')
            getCurrencies(getCurrentRates);
        if (msg == 'Update "update rate"')
            setUpdateInterval();
    });

    port.onDisconnect.addListener(function() {
        iconAnimation.fadeOut();
    });


});



function getCurrentRates() {
    var selectedBanks = JSON.parse(localStorage['selected-banks']);

    $.ajax({
        url: parseUrl,
        type: 'GET',
        cache: false,
        dataType: 'text'
    })
        .success(function(html){
            var rates = $('#rb tr', html);

            for(var i=0; i<selectedBanks.length; i++) {
                // Parsing rates

                currentRates[selectedBanks[i]] = {};
                currentRates[selectedBanks[i]].AMD = {
                    buy: 1,
                    sell: 1
                };
                var rate = rates[selectedBanks[i]].children;

                for (var currency in currencies){
                    if(rate[currencies[currency].buy].innerText) {
                        currentRates[selectedBanks[i]][currency] = {
                            buy: rate[currencies[currency].buy].innerText,
                            sell: rate[currencies[currency].sell].innerText
                        };

                        if (rate[currencies[currency].buy].firstChild.className &&
                            rate[currencies[currency].buy].firstChild.className == 'best')
                            currentRates[selectedBanks[i]][currency].buyIsBest = true;
                        if (rate[currencies[currency].sell].firstChild.className &&
                            rate[currencies[currency].sell].firstChild.className == 'best')
                            currentRates[selectedBanks[i]][currency].sellIsBest = true;
                    }
                }
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.log('rate.am can\'t be loaded!');
            console.log(textStatus);
            console.log(errorThrown);
            console.log(jqXHR);

        });
}

getCurrencies(getCurrentRates);

function setUpdateInterval() {
    if (intervalId)
        clearInterval(intervalId);

    var updateTime = parseInt(JSON.parse(localStorage['update-time']));
    intervalId = setInterval(function() {getCurrencies(getCurrentRates); }, updateTime);
}

function isBestRate(rate) {
    return rate && rate.firstChild.className;
}
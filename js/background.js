var iconAnimation          = new IconAnimation(),
    currentRates           = {},
    currencies             = {},
    banks                  = {},
    bestCurrencies         = {},
    intervalId,
    parseUrl               = 'http://rate.am/ru/armenian-dram-exchange-rates/banks/non-cash';


function getData(callback) {
    if (!$.isEmptyObject(currencies) || !$.isEmptyObject(banks)) {
        callback();
    } else {
        $.getJSON('/js/currencies.json', function(currenciesJson){
            $.extend(currencies, currenciesJson);

            $.getJSON('/js/banks.json', function(bankJson){
                $.extend(banks, bankJson);

                callback();
            });
        });
    }
}


iconAnimation.updated.add(function(){
    chrome.browserAction.setIcon({'imageData':iconAnimation.getImageData()});
});

chrome.runtime.onConnect.addListener(function(port) {
    console.log('Connected .....');

    iconAnimation.fadeIn();

    port.onMessage.addListener(function(msg, iPort) {
        console.log('%s connected', iPort.name);
        console.log('Message: %s', msg);
    });

    port.onDisconnect.addListener(function() {
        iconAnimation.fadeOut();
    });


});



function getCurrentRates() {
    $.ajax({
        url: parseUrl,
        type: 'GET',
        cache: false,
        dataType: 'text'
    })
    .done(function(html){
        var rates = $('#rb tr', html);

        for(var bank in banks) {
            // Parsing rates
            currentRates[bank] = {};
            currentRates[bank].AMD = {
                buy: 1,
                sell: 1
            };
            var rate = rates[banks[bank]].children;

            for (var currency in currencies){
                if(rate[currencies[currency].buy].innerText) {
                    currentRates[bank][currency] = {
                        buy: rate[currencies[currency].buy].innerText,
                        sell: rate[currencies[currency].sell].innerText
                    };

                    if (rate[currencies[currency].buy].firstChild.className &&
                        rate[currencies[currency].buy].firstChild.className == 'best')
                        currentRates[bank][currency].buyIsBest = true;
                    if (rate[currencies[currency].sell].firstChild.className &&
                        rate[currencies[currency].sell].firstChild.className == 'best')
                        currentRates[bank][currency].sellIsBest = true;
                }
            }

            chrome.storage.local.set({ currentRates: currentRates });
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown){
        console.error('rate.am can\'t be loaded!');
        console.dir(textStatus);
        console.dir(errorThrown);
        console.dir(jqXHR);

    });
}

getData(getCurrentRates);

function setUpdateInterval() {
    if (intervalId)
        clearInterval(intervalId);

    var updateTime = parseInt(JSON.parse(localStorage['update-time']));
    intervalId = setInterval(function() {getData(getCurrentRates); }, updateTime);
}

function isBestRate(rate) {
    return rate && rate.firstChild.className;
}
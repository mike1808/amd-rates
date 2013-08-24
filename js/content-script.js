var port = chrome.runtime.connect({name: 'content-script' }),
    currentRates = {};

port.onMessage.addListener(function(msg, iPort) {
    console.log('%s connected', iPort.name);

    switch (msg.type) {
        case 'init': currentRates = msg.data; break;
        case 'refresh': addTooltip(); break;
    }

    $(function() {
        addTooltip();
    });
});

port.postMessage('rates');

function calculateCurrency(text) {
    var currency = text.match(/\$|£|€|USD|EUR|GBP|RUR|РУБ|руб/gi)[0],
        value = parseFloat(text.match(/\d+([,.]?\d+)?/g)[0].replace(/,/,''));

    if (!currency)
        return 'N/A';

    switch(currency) {
        case '$': currency = 'USD'; break;
        case '£': currency = 'GBR'; break;
        case '€': currency = 'EUR'; break;
        case 'РУБ': currency = 'RUR'; break;
        case 'руб': currency = 'RUR'; break;
    }

    return (currentRates['15'][currency].sell * value).toFixed(2);
}

function addTooltip(){
    var regexp = /(\$|£|€|USD|EUR|GBP|RUR|РУБ|руб)(\s*\d+([,.]?\d+)*)|(\s*\d+([,.]?\d+)*)\s*(\$|£|€|USD|EUR|GBP|RUR|РУБ|руб)/gi;

    $('span, div, a, strong, p, em, i, b')
        .filter(function(){
            return regexp.test(
                $(this)
                    .clone()
                    .children()
                    .remove()
                    .end()
                    .text()
            );
        })
        .each(function() {
            $(this).tooltip({ placement: 'right', title: calculateCurrency($(this).text()) + ' AMD' });
        });
}



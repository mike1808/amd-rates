var currentRates = {},
    tooltipState = true,
    tooltipTags = [],
    tooltipBank = 'VTB';

chrome.storage.local.get({
    currentRates: {},
    tooltipState: true,
    tooltipTags: ['span', 'a', 'strong', 'p', 'em', 'i', 'b'],
    tooltipBank: 'VTB'
    }, function (items) {
        currentRates = items.currentRates;
        tooltipState = items.tooltipState;
        tooltipTags = items.tooltipTags;
        tooltipBank = items.tooltipBank;

        if (tooltipState)
            addTooltip();
});

chrome.storage.onChanged.addListener(function (changes) {
    if (changes.tooltipState) {
        tooltipState = changes.tooltipState.newValue;
    }

    if (changes.refresh) {
        if (tooltipState)
            addTooltip();
    }
});

function calculateCurrency(text) {
    var currency = text.match(/\$|£|€|USD|EUR|GBP|RUR|РУБ|руб/gi)[0].toUpperCase(),
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

    return (currentRates[tooltipBank][currency].sell * value).toFixed(2);
}

function addTooltip(){
    var regexp = /(\$|£|€|USD|EUR|GBP|RUR|РУБ|руб)(\s*\d+([,.]?\d+)*)|(\s*\d+([,.]?\d+)*)\s*(\$|£|€|USD|EUR|GBP|RUR|РУБ|руб)/gi;

    $(tooltipTags.join(', '))
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



var banks               = {},
    currentRates        = {},
    selectedCurrencies  = JSON.parse(localStorage['selected-currencies']),
    selectedBanks       = JSON.parse(localStorage['selected-banks']),

    calcCurrencies      = {
                            in: 'AMD',
                            out: 'AMD'
    },

    port = chrome.runtime.connect({name: 'popup'});

port.onMessage.addListener(function (msg){
    console.log('Message received. ' + msg);
    if (msg == 'Unknown message') {
        return console.log(msg);
    }
    currentRates = msg;

    loadData(getRates);
});
port.postMessage('rates');

// Get banks list from json
function loadData(callback) {
    $.getJSON('/js/banks.json', function(json){
        banks = json;

        callback();
    });

}


// Get rates
function getRates(onRateLoad) {
    var fragment = document.createDocumentFragment();

    // Creating dropdown list of banks for currency calculator
    var bankList = document.createElement('select');
    bankList.setAttribute('name', 'currency-calc-banks');
    bankList.setAttribute('id', 'bank-list');

    for(var i=0; i<selectedBanks.length; i++) {

            // Creating markup for rates
            var tr = document.createElement('tr');
            var td = document.createElement('td');

            td.setAttribute('colspan', '2');
            td.innerText = banks[selectedBanks[i]];

            tr.appendChild(td);

            for (var j in selectedCurrencies) {
                for (var k=0; k<2; k++) {
                    td = document.createElement('td');
                    if (currentRates[selectedBanks[i]][selectedCurrencies[j]]) {
                        td.innerText = currentRates[selectedBanks[i]][selectedCurrencies[j]][k ? 'sell' : 'buy'];
                        if (currentRates[selectedBanks[i]][selectedCurrencies[j]][k ? 'sellIsBest' : 'buyIsBest'])
                            td.className = 'best';
                    }

                    tr.appendChild(td);
                }

            fragment.appendChild(tr);
        }



        // Creating options for banks dropdown
        var bankOption = document.createElement('option');
        bankOption.setAttribute('value', selectedBanks[i]);
        bankOption.appendChild(document.createTextNode(banks[selectedBanks[i]]));
        bankList.appendChild(bankOption);
    }


    $('#currency-table tbody').append(fragment);
    $('.calc').prepend(bankList);
    $('#bank-list').change(function() {
        $('#in').change();
    });

    if (onRateLoad)
        onRateLoad();

}

// Is the current currency is the best
/*function isBest(cell) {
    if (currentCur.firstChild && currentCur.firstChild.className == 'best')
}*/

// Event handlers
function setCurrency(e, data) {
    var currentElement = $(this);
    var value = currentElement.val();
    var inputType = currentElement.attr('id').substr(0, currentElement.attr('id').indexOf('select') - 1);

    calcCurrencies[inputType] = value;
    $('#cur-img-' + inputType).attr('src', 'img/' + value + '.gif');
    if (!data || !data.swap)
        $('#' + inputType).change();
}

function calculateCurrency(e) {
    var input = $(this);
    var inputType = input.attr('id');
    var reversedType = inputType == 'in' ? 'out' : 'in';
    var expressionRegExp = /^[0-9\*\+\-\/\(\)\.\s]+$/;
    var currentBank = parseInt($('#bank-list').val());

    if (inputType == 'in')
        var ratio = currentRates[currentBank][calcCurrencies[inputType]].buy /
                    currentRates[currentBank][calcCurrencies[reversedType]].buy;
    else {
        ratio = currentRates[currentBank][calcCurrencies[inputType]].sell /
            currentRates[currentBank][calcCurrencies[reversedType]].sell;
    }
    var value = 0;
    if (expressionRegExp.test(input.val()))
        value = parseInt(eval(input.val())) * ratio;

    $('#' + reversedType).val(value.toFixed(2));
}

function initTable() {
    var currencyImgTr = document.createElement('tr');
    var buySellTr = document.createElement('tr');
    var fragment1 = document.createDocumentFragment();
    var fragment2 = document.createDocumentFragment();

    var buyTh = document.createElement('th');
    var sellTh = document.createElement('th');
    buyTh.innerText = 'Buy';
    sellTh.innerText = 'Sell';

    var bankTh = document.createElement('th');
    bankTh.setAttribute('colspan', 2);
    bankTh.setAttribute('rowspan', 2);
    bankTh.innerText = 'Bank';
    fragment1.appendChild(bankTh);

    for(var currency in selectedCurrencies) {
        var td = document.createElement('td');
        td.setAttribute('colspan', 2);
        var img = document.createElement('img');
        img.setAttribute('src', '/img/' + selectedCurrencies[currency] + '.gif');
        td.appendChild(img);

        fragment1.appendChild(td);

        fragment2.appendChild(buyTh.cloneNode(true));
        fragment2.appendChild(sellTh.cloneNode(true));
    }

    currencyImgTr.appendChild(fragment1);
    buySellTr.appendChild(fragment2);

    var table = document.getElementById('currency-table');
    table.tHead.appendChild(currencyImgTr);
    table.tHead.appendChild(buySellTr);
}

function initCalc(){
    var fragment = document.createDocumentFragment();

    for (var currency in selectedCurrencies) {
        var option = document.createElement('option');
        option.setAttribute('value', selectedCurrencies[currency]);
        option.appendChild(document.createTextNode(selectedCurrencies[currency]));
        fragment.appendChild(option);
    }

    var calcDL = document.getElementsByName('currency-calc-cur');
    calcDL[0].appendChild(fragment.cloneNode(true));
    calcDL[1].appendChild(fragment.cloneNode(true));
}

function onRatesLoad() {
    initTable();
    initCalc();



    $('#in-select').change(setCurrency);
    $('#out-select').change(setCurrency);

    $('#in').on('change keyup', calculateCurrency);
    $('#out').on('change keyup', calculateCurrency);

    $('#swap-cur').click(function (){
        var outVal = $('#out-select').val();
        $('#out-select').val($('#in-select').val()).trigger('change', { swap: true })
        $('#in-select').val(outVal).change();
    });

    $('#options').click(function() {
        var optionsUrl = chrome.extension.getURL('options.html');

        chrome.tabs.query({url: optionsUrl}, function(tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, {active: true});
            } else {
                chrome.tabs.create({url: optionsUrl});
            }
        });
    });
}

$(onRatesLoad);
var banks = {};
var currencies = {};

var currentRates = {};

var calcCurrencies = {
    in: "AMD",
    out: "AMD"
};

var selectedCurrencies = JSON.parse(localStorage['selected-currencies']) || [];
var selectedBanks = JSON.parse(localStorage['selected-banks']) || [];

// Get banks and currencies table indexes list from json
function loadData() {
    $.getJSON("/js/banks.json", function(json){
        banks = json;
    });
    $.getJSON("/js/currencies.json", function(json){
        currencies = json;
    });
}

// Get HTML and parse rates
function getRates(onRateLoad) {
    loadData();

    $.ajax({
        url: 'http://www.rate.am/',
        type: 'GET',
        cache: false,
        dataType: 'xml'
    })
        .success(function(html){
            var fragment = document.createDocumentFragment();

            // Default bank is VTB
            if (!selectedBanks || selectedBanks.length == 0) selectedBanks = [15];

            // Creating dropdown list of banks for currency calculator
            var bankList = document.createElement('select');
            bankList.setAttribute('name', 'currency-calc-banks');
            bankList.setAttribute('id', 'bank-list');

            for(var i=0; i<selectedBanks.length; i++) {
                // Parsing rates
                var rates = $('.rb tr', html)[selectedBanks[i]].children;
                // Creating markup for rates
                var tr = document.createElement('tr');
                var td = document.createElement('td');
                td.setAttribute('colspan', '2');
                td.appendChild(document.createTextNode(banks[selectedBanks[i]]));
                tr.appendChild(td);
                for (var j in selectedCurrencies) {
                    for (var k in currencies[selectedCurrencies[j]]) {
                        var td = document.createElement('td');
                        var currentCur = rates[currencies[selectedCurrencies[j]][k]];
                        td.appendChild(document.createTextNode(currentCur.innerText));
                        if (currentCur.firstChild && currentCur.firstChild.className == 'best')
                            td.setAttribute('class', 'best');
                        tr.appendChild(td);
                    }
                }
                fragment.appendChild(tr);

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

           onRateLoad();
        });
}


// Event handlers
function setCurrency(e, data) {
    var currentElement = $(this);
    var value = currentElement.val();
    var inputType = currentElement.attr('id').substr(0, currentElement.attr('id').indexOf('select') - 1);

    calcCurrencies[inputType] = value;
    $('#cur-img-' + inputType).attr('src', 'img/' + value + ".gif");
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
    buyTh.innerText = "Buy";
    sellTh.innerText = "Sell";

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

$(function() {
    initTable();
    initCalc();
    getRates(function(){});


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
});
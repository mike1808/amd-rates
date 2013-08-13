var self = this;


var banks = {};
var currentRates = {};
var selectedCurrencies = JSON.parse(localStorage['selected-currencies'])
var selectedBanks = JSON.parse(localStorage['selected-banks']);

var calcCurrencies = {
    in: "AMD",
    out: "AMD"
};


var port = chrome.runtime.connect({name: "Background"});
port.onMessage.addListener(function (msg){
    console.log("Message received. " + msg);
    currentRates = msg;

    getRates(function(){
        $('.spinner').addClass('hidden');
        $('.container').removeClass('hidden');
    });
});
port.postMessage('Send current rates');


// Get banks and currencies table indexes list from json
function loadData() {
    $.getJSON("/js/banks.json", function(json){
        self.banks = json;
    });

}

loadData();

// Get HTML and parse rates
function getRates(onRateLoad) {
    var fragment = document.createDocumentFragment();

    // Creating dropdown list of banks for currency calculator
    var bankList = document.createElement('select');
    bankList.setAttribute('name', 'currency-calc-banks');
    bankList.setAttribute('id', 'bank-list');

    for(var i=0; i<self.selectedBanks.length; i++) {

            // Creating markup for rates
            var tr = document.createElement('tr');
            var td = document.createElement('td');

            td.setAttribute('colspan', '2');
            td.innerText = self.banks[self.selectedBanks[i]];

            tr.appendChild(td);

            for (var j in self.selectedCurrencies) {
                for (var k=0; k<2; k++) {
                    td = document.createElement('td');
                    td.innerText = self.currentRates[self.selectedBanks[i]][self.selectedCurrencies[j]][j ? 'sell' : 'buy'];
                    tr.appendChild(td);
                }

            fragment.appendChild(tr);
        }



        // Creating options for banks dropdown
        var bankOption = document.createElement('option');
        bankOption.setAttribute('value', self.selectedBanks[i]);
        bankOption.appendChild(document.createTextNode(self.banks[self.selectedBanks[i]]));
        bankList.appendChild(bankOption);
    }


    $('#currency-table tbody').append(fragment);
    $('.calc').prepend(bankList);
    $('#bank-list').change(function() {
        $('#in').change();
    });

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
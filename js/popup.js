var self = this;
var banks = {};

// Getting banks list from json
function loadBanks() {
    $.getJSON("/js/banks.json", function(json){
        self.banks = json;
    });
}

// Get HTML and parse rates
function getRates() {
    self.loadBanks();
    $.ajax({
        url: 'http://www.rate.am/',
        type: 'GET',
        cache: false,
        dataType: 'xml'
    })
        .success(function(html){
            var selectedBanks = JSON.parse(localStorage['selected-banks']);
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
                td.appendChild(document.createTextNode(self.banks[selectedBanks[i]]));
                tr.appendChild(td);
                for (var j = 5; j <= 10; j++) {
                    var td = document.createElement('td');
                    td.appendChild(document.createTextNode(rates[j].innerText));
                    if (rates[j].firstChild && rates[j].firstChild.className == 'best')
                        td.setAttribute('class', 'best');
                    tr.appendChild(td);
                }
                fragment.appendChild(tr);

                // Updating rates for currency calculator
                self.currentRates[selectedBanks[i]] = {
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
                   AMD: {
                       buy: 1,
                       sell: 1
                   }
                };

                // Creating options for banks dropdown
                var bankOption = document.createElement('option');
                bankOption.setAttribute('value', selectedBanks[i]);
                bankOption.appendChild(document.createTextNode(self.banks[selectedBanks[i]]));
                bankList.appendChild(bankOption);
           }

           $('tbody').append(fragment);
           $('.calc').prepend(bankList);
           $('#bank-list').change(function() {
                $('#in').change();
           });
        });
}

var currentRates = {};



function setCurrency(e, data) {
    var currentElement = $(this);
    var value = currentElement.val();
    var inputType = currentElement.attr('id').substr(0, currentElement.attr('id').indexOf('select') - 1);

    self.calcCurrencies[inputType] = value;
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
        var ratio = self.currentRates[currentBank][calcCurrencies[inputType]].buy /
                    self.currentRates[currentBank][calcCurrencies[reversedType]].buy;
    else {
        var ratio = self.currentRates[currentBank][calcCurrencies[inputType]].sell /
            self.currentRates[currentBank][calcCurrencies[reversedType]].sell;
    }
    var value = 0;
    if (expressionRegExp.test(input.val()))
        value = parseInt(eval(input.val())) * ratio;

    $('#' + reversedType).val(value.toFixed(2));
}



var calcCurrencies = {
    in: "AMD",
    out: "USD"
}

$(function() {
    getRates();


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
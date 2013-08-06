var self = this;
var banls = {};

function loadBanks() {
    $.getJSON("/js/banks.json", function(json){
        self.banks = json;
    });
}
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

            for(var i=0; i<selectedBanks.length; i++) {
               var rates = $('.rb tr', html)[selectedBanks[i]].children;
               var tr = document.createElement('tr');
               var td = document.createElement('td');
               td.setAttribute('colspan', '2');
               td.appendChild(document.createTextNode(self.banks[selectedBanks[i]]));
               tr.appendChild(td);

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

               for (var j = 5; j <= 10; j++) {
                   var td = document.createElement('td');
                   td.appendChild(document.createTextNode(rates[j].innerText));
                   if (rates[j].firstChild.className == 'best')
                        td.setAttribute('class', 'best');
                   tr.appendChild(td);
               }

               fragment.appendChild(tr);

           }

           $('tbody').append(fragment);

        });
}

var currentRates = {};

function setCurrency(e) {
    var currentElement = $(this);
    var value = currentElement.val();
    var inputType = currentElement.attr('id').substr(0, currentElement.attr('id').indexOf('select') - 1);

    self.calcCurrencies[inputType] = value;
    $('#cur-img-' + inputType).attr('src', 'img/' + value + ".gif");
}

function calculateCurrency(e) {
    var input = $(this);
    var inputType = input.attr('id');
    var reversedType = inputType == 'in' ? 'out' : 'in';
    var expressionRegExp = /^[0-9\*\+\-\/\(\)\.\s]+$/;

    var ratio = currentRates[calcCurrencies[inputType]].sell /
        currentRates[calcCurrencies[reversedType]].sell;
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

    $('#in').change(calculateCurrency);
    $('#in').keyup(calculateCurrency);
    $('#out').change(calculateCurrency);
    $('#out').keyup(calculateCurrency);
});
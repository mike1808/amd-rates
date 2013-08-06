var self = this;

function getRates() {
    $.ajax({
        url: 'http://www.rate.am/',
        type: 'GET',
        cache: false,
        dataType: 'xml'
    })
        .success(function(html){
            var rates = $('.rb tr', html)[15].children;

            var tr = document.createElement('tr');

            self.currentRates.USD.buy = rates[5].innerText;
            self.currentRates.USD.sell = rates[6].innerText;
            self.currentRates.EUR.buy = rates[7].innerText;
            self.currentRates.EUR.sell = rates[8].innerText;
            self.currentRates.RUR.buy = rates[9].innerText;
            self.currentRates.RUR.sell = rates[10].innerText;

            for (var i = 5; i <= 10; i++) {
                var td = document.createElement('td');
                td.appendChild(document.createTextNode(rates[i].innerText));
                tr.appendChild(td);
            }

            $('tbody').append(tr);
        });
}

var currentRates = {
    USD: { sell: 1, buy: 1},
    RUR: { sell: 1, buy: 1},
    EUR: { sell: 1, buy: 1},
    AMD: { sell: 1, buy: 1}
}

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

    var ratio = currentRates[calcCurrencies[inputType]].sell /
        currentRates[calcCurrencies[reversedType]].sell;
    var value = 0;
    if (!isNaN(input.val()))
        value = parseInt(input.val()) * ratio;

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
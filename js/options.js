var self = this;
var selectedBanks = [];
var selectedCurrencies = [];

var port = chrome.runtime.connect({name: "Background"});


function loadData() {
    $.getJSON("/js/banks.json", function(json){
        if (localStorage['selected-banks'])
            self.selectedBanks = JSON.parse(localStorage['selected-banks']);
        else
            self.selectedBanks = JSON.parse('[]');

        self.generateBanksList(json);

        $('.bank-list [type="checkbox"]').change(function(e) {
            var id = parseInt($(this).attr('id'));

            if ($(this).is(':checked')) {
                self.selectedBanks.push(id);
                port.postMessage('Update current rates');
            }
            else {
                self.selectedBanks.remove(id);
                port.postMessage('Update current rates');
            }

            localStorage['selected-banks'] = JSON.stringify(!self.selectedBanks.length ? [15] : self.selectedBanks);
        });
    });

    $.getJSON("/js/currencies.json", function(json){
        if (localStorage['selected-currencies'])
            self.selectedCurrencies = JSON.parse(localStorage['selected-currencies']);
        else
            self.selectedCurrencies = JSON.parse('[]');

        self.generateCurrenciesList(json);

        $('.currency-list [type="checkbox"]').change(function(e) {
            var currency = $(this).attr('id');

            if ($(this).is(':checked')) {
                self.selectedCurrencies.push(currency);
            }
            else {
                self.selectedCurrencies.remove(currency);
            }

            localStorage['selected-currencies'] = JSON.stringify(!self.selectedCurrencies.length ? ["USD"]:
                self.selectedCurrencies.sort());
        });
    });
}

function generateBanksList(banks) {
    for (var bankId in banks) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', bankId);

        if (self.selectedBanks.indexOf(parseInt(bankId)) > -1)
            checkbox.setAttribute('checked', '');

        var label = document.createElement('label');
        label.setAttribute('for', bankId);
        label.appendChild(checkbox);
        label.innerHTML = label.innerHTML + banks[bankId];

        var span = document.createElement('span');
        span.appendChild(label);

        document.getElementsByClassName('bank-list')[0].appendChild(span);
    }
}

function generateCurrenciesList(currencies) {
    for (var currency in currencies) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', currency);

        if (self.selectedCurrencies.indexOf(currency) > -1)
            checkbox.setAttribute('checked', '');

        var img = document.createElement('img');
        img.setAttribute('src', '/img/' + currency + '.gif');

        var label = document.createElement('label');
        label.setAttribute('for', currency);
        label.appendChild(checkbox);
        label.appendChild(img);

        var span = document.createElement('span');
        span.appendChild(label);

        document.getElementsByClassName('currency-list')[0].appendChild(span);
    }
}

$(function(){
    loadData();

    $('#check-all').click(function () {
        $('.bank-list input[type="checkbox"]').each(function() {
            if (!$(this).is(':checked'))
                $(this).prop('checked', true).change()});
    });

    $('#uncheck-all').click(function () {
        $('.bank-list input[type="checkbox"]').each(function() {
            if ($(this).is(':checked'))
                $(this).prop('checked', false).change()});
    });

    var updateRate = $('#update-rate');
    updateRate.val(parseInt(localStorage['update-time']) / (1000 * 60));
    updateRate.on('change', function(e) {
        localStorage['update-time'] = parseInt(e.currentTarget.value) * 1000 * 60;
        port.postMessage('Update "update rate"');
    });
});

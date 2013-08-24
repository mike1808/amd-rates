var selectedBanks = [],
    selectedCurrencies = [],
    tooltipBankValue = '';

var port = chrome.runtime.connect({name: "options"});


function loadData() {
    chrome.storage.local.get({ selectedBanks: ['VTB'], selectedCurrencies: ['USD'], tooltipBank: 'VTB' }, function(items) {
        selectedBanks = items.selectedBanks.length == 0? ['VTB'] : items.selectedBanks;
        selectedCurrencies = items.selectedCurrencies == 0? ['USD']: items.selectedCurrencies;
        tooltipBankValue = items.tooltipBank;

        $.getJSON('/js/banks.json', function(json){
            generateBanksList(json);

            $('.bank-list [type="checkbox"]').change(function(e) {
                var bank = $(this).attr('id');

                if ($(this).is(':checked')) {
                    selectedBanks.push(bank);
                }
                else {
                    selectedBanks.remove(bank);
                }

                chrome.storage.local.set({ selectedBanks:  selectedBanks });
            });
        });

        $.getJSON('/js/currencies.json', function(json){
            generateCurrenciesList(json);

            $('.currency-list [type="checkbox"]').change(function(e) {
                var currency = $(this).attr('id');

                if ($(this).is(':checked')) {
                    selectedCurrencies.push(currency);
                }
                else {
                    selectedCurrencies.remove(currency);
                }

                chrome.storage.local.set({ selectedCurrencies:  selectedCurrencies.sort() });

            });
        });

    });
}

function generateBanksList(banks) {
    var banksList = document.getElementsByClassName('bank-list')[0];
    var tooltipBank = document.getElementById('tooltipBank');

    for (var bank in banks) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', bank);

        if (selectedBanks.indexOf(bank) > -1)
            checkbox.setAttribute('checked', '');

        var label = document.createElement('label');
        label.setAttribute('for', bank);
        label.appendChild(checkbox);
        label.innerHTML = label.innerHTML + bank;

        var span = document.createElement('span');
        span.appendChild(label);

        banksList.appendChild(span);

        var option = document.createElement('option');
        option.setAttribute('value', bank);
        option.innerText = bank;
        if (tooltipBankValue == bank) {
            option.setAttribute('selected', true);
        }
        tooltipBank.appendChild(option);
    }
}

function generateCurrenciesList(currencies) {
    for (var currency in currencies) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', currency);

        if (selectedCurrencies.indexOf(currency) > -1)
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

    var $tooltipState = $('input:radio[name=tooltipState]');
    $tooltipState.change(function() {
        chrome.storage.local.set({ tooltipState: $(this).val() === 'true' });
    });

    var $updateRate = $('#update-rate');
    $updateRate.on('change', function(e) {
        chrome.storage.local.set({ updateTime: parseInt(e.currentTarget.value) * 1000 * 60 });
    });

    var $tooltipTags = $('#tooltipTags');
    $tooltipTags.blur(function() {
        chrome.storage.local.set({ tooltipTags: $(this).val().split(',') });
    });

    var $tooltipBank = $('#tooltipBank');
    $tooltipBank.change(function() {
        chrome.storage.local.set({ tooltipBank: $(this).val() });
    });

    chrome.storage.local.get({
        updateTime: 15 * 60 *1000, // 15 minutes in milliseconds
        tooltipState: true,
        tooltipTags: ['span', 'a', 'strong', 'p', 'em', 'i', 'b'],
        tooltipBank: 'VTB'
    }, function(items) {
        $updateRate.val(items.updateTime / (1000 * 60));
        $tooltipState.filter('[value=' + items.tooltipState + ']').prop('checked', true);
        $tooltipTags.val(items.tooltipTags);
    });


});

var self = this;
var banks = {};
var selectedBanks = [];

function loadBanks() {
    $.getJSON("/js/banks.json", function(json){
        self.banks = json;

        if (localStorage['selected-banks'])
            self.selectedBanks = JSON.parse(localStorage['selected-banks']);
        else
            self.selectedBanks = JSON.parse('[]');

        self.generateBanksList();


        $('input[type="checkbox"]').change(function(e) {
            var id = parseInt($(this).attr('id'));

            if ($(this).is(':checked')) {
                self.selectedBanks.push(id);
            }
            else {
                self.selectedBanks.remove(id);
            }

            localStorage['selected-banks'] = JSON.stringify(selectedBanks);
        });
    });
}

function generateBanksList() {
    for (var bankId in banks) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', bankId);

        if (selectedBanks.indexOf(parseInt(bankId)) > -1)
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

$(function(){
    loadBanks();

    $('#check-all').click(function () {
        $('.bank-list input[type="checkbox"]').each(function() {
            if (!$(this).is(':checked'))
                $(this).prop('checked', true).change()});
    });

    $('#uncheck-all').click(function () {
        $('.bank-list input[type="checkbox"]').each(function() {
            if ($(this).is(':checked'))
                $(this).prop('checked', false).change()});
    })
});

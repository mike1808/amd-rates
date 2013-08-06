var self = this;
var banks = [];
var selectedBanks = [];

function loadBanks() {
    $.getJSON("/js/banks.json", function(json){
        self.banks = json.banks;
        self.generateBanksList();
        $(':checkbox').change(function(e) {
            if ($(this).is(':checked'))
                self.selectedBanks.push(parseInt($(this).attr('id')));
            else
                self.selectedBanks.remove(parseInt($(this).attr('id')));

        })
    });
}

function generateBanksList() {
    for (var i = 0; i < banks.length; i++) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', banks[i].index);
        var label = document.createElement('label');
        label.setAttribute('for', banks[i].index);
        label.appendChild(checkbox);
        label.innerHTML = label.innerHTML + banks[i].name;
        document.getElementsByClassName('bank-list')[0].appendChild(label);
    }
}

$(function(){
    loadBanks();

});
var self = this;
var banks = {};
var selectedBanks = [];

function loadBanks() {
    $.getJSON("banks.json", function(json){
        self.banks = json;
    });
}

function generateBanksList() {
    for (var i = 0; i < banks.length)
}
(function() {
    localStorage['selected-currencies'] = localStorage['selected-currencies'] || JSON.stringify(["USD"]);
    localStorage['selected-banks'] = localStorage['selected-banks'] || JSON.stringify([15]);
    localStorage['update-time'] = localStorage['update-time'] || JSON.stringify(15 * 60 * 1000); // 15m

})();
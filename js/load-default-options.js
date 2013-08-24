(function() {
    chrome.storage.local.get({
        selectedBanks: ['VTB'],
        selectedCurrencies: ['USD'],
        updateTime: 15 * 60 * 1000,
        tooltipState: true,
        tooltipTags: ['span', 'a', 'strong', 'p', 'em', 'i', 'b'],
        tooltipBank: 'VTB'
    }, function(items) {
        chrome.storage.local.set({
            selectedBanks : items.selectedBanks.length == 0? ['VTB'] : items.selectedBanks,
            selectedCurrencies : items.selectedCurrencies == 0? ['USD']: items.selectedCurrencies,
            updateTime : items.updateTime == 0 ? 15 * 60 * 1000 : items.updateTime,
            tooltipState: !items.tooltipState ? true : items.tooltipState,
            tooltipTags: items.tooltipTags.length == 0 && !items.tooltipTags? ['span', 'a', 'strong', 'p', 'em', 'i', 'b'] : items.tooltipTags,
            tooltipBank: !tooltipBank ? item.tooltipBank : 'VTB'
        });
    });
})();
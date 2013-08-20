function getMoneyText(){
    var regexp = /(\$|£|€|USD|EUR|GBP|RUR|РУБ|руб)(\s*\d+([,.]?\d+)*)|(\s*\d+([,.]?\d+)*)(\$|£|€|USD|EUR|GBP|RUR|РУБ|руб)/gi

    var $matches = $('*').filter(function(){
        return regexp.test(
            $(this)
                .clone()
                .children()
                .remove()
                .end()
                .text()
        );
    });

    $matches.css('background-color', 'red');
}

getMoneyText();
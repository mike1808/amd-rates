function arrayIndexOf(array, item) {
    if (typeof Array.prototype.indexOf == "function")
        return Array.prototype.indexOf.call(array, item);
    for (var i = 0, j = array.length; i < j; i++)
        if (array[i] === item)
            return i;
    return -1;
}

function arrayRemoveItem(array, itemToRemove) {
    var index = arrayIndexOf(array, itemToRemove);
    if (index >= 0)
        array.splice(index, 1);
}

Array.prototype.remove = function(itemToRemove) {
    arrayRemoveItem(this, itemToRemove);
}
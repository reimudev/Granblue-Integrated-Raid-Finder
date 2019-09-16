window.addEventListener('blur', function (e) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
}, false);

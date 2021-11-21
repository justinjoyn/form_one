tippy('.button-outline', {
    placement: 'right'
});

function setText(field) {
    document.getElementById(field.id + '-text').innerText = field.value;
}

function copyAddress(field) {
    document.getElementById('q8').value = field.value;
    document.getElementById('q8-text').innerText = field.value;
}
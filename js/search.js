const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q');
document.getElementById('searched-text').innerText = `"${query}"`;
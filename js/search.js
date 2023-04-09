const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q');
if (query !== null) {
    document.getElementById('searched-text').innerText = `"${query}"`;
} else {
    document.getElementById('searched-text').style.display = 'none';
    document.getElementById('search-results-title').style.display = 'none';
}

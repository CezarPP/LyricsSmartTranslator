function submitForm(event) {
    event.preventDefault();
    var query = document.getElementById('myInput').value;
    if (query.trim() !== '') {
        window.location.href = 'search.html?q=' + encodeURIComponent(query);
    }
}

document.getElementById('myInput').onsubmit = function (event) {
    event.preventDefault();
    submitForm(event);
};

document.addEventListener('DOMContentLoaded', function () {
    const searchedText = document.getElementById('searched-text');
    const resultsTitle = document.getElementById('search-title');
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query) {
        searchedText.innerText = `Searching...`;
        getAllSongs()
            .then(data => {
                const filteredSongs = data.filter(song =>
                    song.title.toLowerCase().startsWith(query.toLowerCase())
                );

                // Create a list element to display the song names and authors
                const list = document.createElement('ul');
                filteredSongs.forEach(song => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    const titleElement = document.createElement('strong');
                    const authorElement = document.createElement('strong');
                    titleElement.innerText = song.title;
                    authorElement.innerText = song.artist;
                    link.href = `/song-page/${song.primary_translation}`;
                    link.style.color = 'blue'; // Add CSS styling to make the link blue
                    link.appendChild(titleElement);
                    listItem.appendChild(link);
                    listItem.appendChild(document.createTextNode(' written by '));
                    listItem.appendChild(authorElement);
                    list.appendChild(listItem);
                });

                // Clear the existing list and append the new one
                searchedText.innerText = `You searched: "${query}"`;
                const searchResults = document.getElementById('search-results');
                searchResults.innerHTML = '';

                if (filteredSongs.length === 0) {
                    const noResults = document.createElement('p');
                    noResults.innerHTML = '<strong>No results found</strong>';
                    searchResults.appendChild(noResults);
                } else {
                    resultsTitle.innerHTML = '<strong>Results:</strong>';
                    searchResults.appendChild(list);
                }
            })
            .catch(error => {
                console.error('Error: ', error);
            });
    } else {
        searchedText.innerText = '';
        resultsTitle.style.display = 'none';
        document.getElementById('search-results').innerHTML = '';
    }
});

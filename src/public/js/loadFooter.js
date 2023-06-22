async function loadFooter() {
    try {
        const response = await fetch('/footer.html');
        document.getElementById('footer-container').innerHTML = await response.text();

        const csvIcon = document.querySelector('.csv-icon');
        csvIcon.addEventListener('click', handleCSVIconClick);
    } catch (error) {
        console.error('Error fetching footer:', error);
    }
}

function handleCSVIconClick(event) {
    event.preventDefault();

    fetch('/all-songs', {
        method: 'GET'
    })
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'songs.csv';

            link.click();
            URL.revokeObjectURL(link.href);
        })
        .catch(error => {
            console.error('Error fetching CSV file:', error);
        });

    console.log('CSV icon clicked');
}


loadFooter().then(() =>
    console.log("Loaded footer"));

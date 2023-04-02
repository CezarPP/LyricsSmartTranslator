async function loadFooter() {
    try {
        const response = await fetch('pages/footer.html');
        document.getElementById('footer-container').innerHTML = await response.text();
    } catch (error) {
        console.error('Error fetching footer:', error);
    }
}

loadFooter();
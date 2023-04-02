const loadNavbar = async () => {
    try {
        const response = await fetch('/pages/navbar.html');
        document.getElementById('navbar-container').innerHTML = await response.text();
    } catch (error) {
        console.error('Error fetching navbar:', error);
    }
};
loadNavbar();
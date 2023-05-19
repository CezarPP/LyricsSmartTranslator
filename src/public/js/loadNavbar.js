async function loadNavbar() {
    try {
        const response = await fetch('/navbar.html');
        document.getElementById('navbar-container').innerHTML = await response.text();
    } catch (error) {
        console.error('Error fetching navbar:', error);
    }
}

loadNavbar().then(() => {
        console.log("Added nav bar");
    }
)
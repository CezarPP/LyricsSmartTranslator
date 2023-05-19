async function loadNavbar() {
    try {
        const response = await fetch('/navbar.html');
        document.getElementById('navbar-container').innerHTML = await response.text();

        const loginButton = document.getElementById('loginButton');
        const userStatus = await fetch('/stats', { method: 'GET' });

        if (userStatus.ok) {
            const data = await userStatus.json(); // Await the JSON data
            loginButton.textContent = data.username;
            loginButton.href = '/profile';
        }
    } catch (error) {
        console.error('Error fetching navbar:', error);
    }
}

loadNavbar().then(() => {
    console.log("Added nav bar");
});

async function loadNavbar() {
    try {
        const response = await fetch('/navbar.html');
        document.getElementById('navbar-container').innerHTML = await response.text();

        const loginButton = document.getElementById('loginButton');
        const addSongButton = document.getElementById('add-song-button');
        const updatesButton = document.getElementById('updates-button');
        const recoveriesButton = document.getElementById('recoveries-button');

        try {
            const userStatus = await fetch('/api/me', {method: 'GET'});
            if (userStatus.ok) {
                const data = await userStatus.json(); // Await the JSON data
                loginButton.textContent = data.username;
                loginButton.href = '/profile/' + data.username;
                if (data.id !== 1) {
                    updatesButton.style.display = 'none';
                    recoveriesButton.style.display = 'none';
                }
            } else {
                addSongButton.style.display = 'none';
                updatesButton.style.display = 'none';
                recoveriesButton.style.display = 'none';
            }
        } catch (error) {
            addSongButton.style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching navbar:', error);
    }
}

loadNavbar().then(r => {
    const checkbox = document.getElementById("check");
    const elementsChangeLinks = document.getElementsByClassName("change-links");
    const featured = elementsChangeLinks[0];
    const charts = elementsChangeLinks[1];
    checkbox.addEventListener("change", function () {
        console.log("Entered event listener");
        if (checkbox.checked) {
            document.body.classList.add("no-scroll");

            for (let element of elementsChangeLinks) {
                element.onclick = function () {
                    window.location.reload();
                }
                element.setAttribute("href", "/");
            }
        } else {
            document.body.classList.remove("no-scroll");
            featured.setAttribute("href", "/#news");
            charts.setAttribute("href", "/#charts-container");
            featured.removeAttribute("onclick");
            charts.removeAttribute("onclick");
        }
    });
    console.log("added event listener");
});

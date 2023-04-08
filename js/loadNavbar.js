async function loadNavbar() {
    try {
        const response = await fetch('/pages/navbar.html');
        document.getElementById('navbar-container').innerHTML = await response.text();
    } catch (error) {
        console.error('Error fetching navbar:', error);
    }
}

loadNavbar().then(r => {
        console.log("Added nav bar");
        const checkbox = document.getElementById("check");
        checkbox.addEventListener("change", function () {
            console.log("Entered event listener");
            if (checkbox.checked) {
                document.body.classList.add("no-scroll");
            } else {
                document.body.classList.remove("no-scroll");
            }
        });
        console.log("added event listener");
    }
)
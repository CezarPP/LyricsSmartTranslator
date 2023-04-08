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
                    element.setAttribute("href", "index.html");
                }
            } else {
                document.body.classList.remove("no-scroll");
                featured.setAttribute("href", "index.html#news");
                charts.setAttribute("href", "index.html#charts-container");
                featured.removeAttribute("onclick");
                charts.removeAttribute("onclick");
            }
        });
        console.log("added event listener");
    }
)
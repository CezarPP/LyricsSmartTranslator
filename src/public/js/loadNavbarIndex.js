async function loadNavbar() {
    try {
        const response = await fetch('./assets/pages/navbarIndex.html');
        const el = document.getElementById('navbar-container');
        if (el)
            el.innerHTML = await response.text();
        else
            console.error("Failed to load navbar");
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
        if (checkbox != null)
            checkbox.addEventListener("change", function () {
                console.log("Entered event listener");
                if (checkbox.checked) {
                    document.body.classList.add("no-scroll");

                    featured.onclick = function () {
                        window.location.reload();
                    }
                    charts.onclick = function () {
                        window.location.reload();
                    }
                    featured.setAttribute("href", "index.html");
                    charts.setAttribute("href", "index.html");
                } else {
                    document.body.classList.remove("no-scroll");
                    featured.setAttribute("href", "index.html#news");
                    charts.setAttribute("href", "index.html#charts-container");
                    featured.removeAttribute("onclick");
                    charts.removeAttribute("onclick");
                }
            });
        else
            console.error("No checkbox found");
        console.log("added event listener");
    }
)
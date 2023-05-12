async function loadFooter() {
    try {
        const response = await fetch('./assets/pages/footerIndex.html');
        let el = document.getElementById('footer-container');
        if (el != null)
            el.innerHTML = await response.text();
        else
            console.error("Failed to load footer");
    } catch (error) {
        console.error('Error fetching footer:', error);
    }
}

loadFooter().then(() => console.log("Footer loaded"));
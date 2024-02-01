// Script for main page to check for sale every second
window.addEventListener("load", () => {
    const body = document.body;

    // Dynamically add sale banner to mainpage html
    // 1. Get div.bottom
    let bottom = body.querySelector(".bottom");
    // 2. Create span node with text
    let banner = document.createElement("span");
    let bannerText = document.createTextNode("");
    banner.appendChild(bannerText);
    banner.style.backgroundColor = "red";
    banner.style.marginTop = "1em";
    // Make banner invisible initially
    banner.style.display = "none";
    // 3. Add new node to top of div
    bottom.prepend(banner);

    // Check for sale every second
    setInterval(async () => {
        // Send GET request to get sale status
        const res = await fetch('/api/sale', {method: 'GET'});
        // If good response from server, check response
        if (res.status == 200) {
            try {
                const jsonData = await res.json();
                // If there's an active sale
                if (jsonData.active == true) {
                    const msg = jsonData.message;
                    // Update sale banner
                    bannerText.nodeValue = msg;
                    banner.style.display = "block";
                } else { // No active sale
                    // Hide sale banner
                    banner.style.display = "none";
                    bannerText.nodeValue = "";
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            // Hide sale banner
            banner.style.display = "none";
            bannerText.nodeValue = "";
        }
    }, 1000);
})
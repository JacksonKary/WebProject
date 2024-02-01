function toggle_style() {
    // set style to light if uninitialized
    const theme = localStorage.getItem('theme');
    if (theme == null) {
        localStorage.setItem('theme', 'light');
    }

    // toggle <body id="dark-mode">
    const body = document.body;
    body.classList.toggle("dark-mode");
    
    // // change localStorage 'theme'
    if (theme === 'light') {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// window.addEventListener("load", () => {
//     // call toggle_style when button is clicked
//     document.getElementById("theme").addEventListener("click", toggle_style);

//     const body = document.body;

//     // check localStorage 'theme'
//     const theme = localStorage.getItem('theme');
//     if (theme == null) {
//         // set style to light if uninitialized
//         localStorage.setItem('theme', 'light');
//     } else if (theme === 'dark') {
//         // if 'theme' is already set to 'dark' upon load, make sure page is dark
//         body.classList.add("dark-mode");
//     }
//     // if 'theme' === 'light', do nothing


//     // Dynamically add sale banner to mainpage html
//     // 1. Get div.bottom
//     let bottom = body.querySelector(".bottom");
//     // 2. Create span node with text
//     let banner = document.createElement("span");
//     let bannerText = document.createTextNode("");
//     banner.appendChild(bannerText);
//     banner.style.backgroundColor = "red";
//     banner.style.marginTop = "1em";
//     // Make banner invisible initially
//     banner.style.display = "none";
//     // 3. Add new node to top of div
//     bottom.prepend(banner);

//     // Check for sale every second
//     setInterval(async () => {
//         // Send GET request to get sale status
//         const res = await fetch('/api/sale', {method: 'GET'});
//         // If good response from server, check response
//         if (res.status == 200) {
//             try {
//                 const jsonData = await res.json();
//                 // If there's an active sale
//                 if (jsonData.active == true) {
//                     const msg = jsonData.message;
//                     // Update sale banner
//                     bannerText.nodeValue = msg;
//                     banner.style.display = "block";
//                 } else { // No active sale
//                     // Hide sale banner
//                     banner.style.display = "none";
//                     bannerText.nodeValue = "";
//                 }
//             } catch (error) {
//                 console.log(error);
//             }
//         } else {
//             // Hide sale banner
//             banner.style.display = "none";
//             bannerText.nodeValue = "";
//         }
//     }, 1000);
// })
window.addEventListener("load", () => {
    // call toggle_style when button is clicked
    document.getElementById("theme").addEventListener("click", toggle_style);

    const body = document.body;

    // check localStorage 'theme'
    const theme = localStorage.getItem('theme');
    if (theme == null) {
        // set style to light if uninitialized
        localStorage.setItem('theme', 'light');
    } else if (theme === 'dark') {
        // if 'theme' is already set to 'dark' upon load, make sure page is dark
        body.classList.add("dark-mode");
    }
    // if 'theme' === 'light', do nothing
})
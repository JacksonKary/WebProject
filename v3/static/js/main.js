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
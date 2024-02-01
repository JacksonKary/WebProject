// get an array of the table row buttons
const buttons = Array.from(document.querySelectorAll(".deleteMe"));

// for each button
buttons.forEach(button => {
    // on click, get grandparent node (button->td->tr)
    button.addEventListener("click", () => {
        let parent = button.parentNode;
        if (parent) {
            let grandparent = parent.parentNode;
            if (grandparent) {
                // remove tr from dom tree
                grandparent.remove();
            }
        }
    });
});

/////////////////

function addTimeUntil(date, node) {
    // Define a function to update the time left for a specific node
    function update() {
        const currentDate = new Date();
        const timeDifference = date - currentDate;

        const originalDateStr = date.toISOString().split('T')[0]; // Format the original date as YYYY-MM-DD

        if (timeDifference <= 0) {
            node.innerText = originalDateStr + " - PAST";
        } else {
            const seconds = Math.floor(timeDifference / 1000) % 60;
            const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
            const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

            const currentOutput = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds left`;
            node.innerText = originalDateStr + " - " + currentOutput;
        }
    }

    // Call the function initially
    update();

    // Set an interval to update the node every second
    setInterval(update, 1000);
}

// Get the table element by its tag name
let table = document.getElementsByTagName('table')[0];

if (table) {
    // Get "Date" column index
    let headers = table.getElementsByTagName('th');
    let idx = 0;
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].innerText === "Date") {
            idx = i;
        }
    }

    // Get all the rows in the table's tbody
    let rows = table.getElementsByTagName('tr');

    // Iterate through the rows
    for (let i = 1; i < rows.length; i++) {
        // Get the "Date" cell in each row
        let dateCell = rows[i].getElementsByTagName('td')[idx];

        // Get the text content of the "Date" cell
        let dateValue = dateCell.textContent.trim();

        try {
            // Attempt to parse the date
            const date = new Date(dateValue);

            // Ensure it's a valid date
            if (!isNaN(date.getTime())) {
                // Call addTimeUntil for this date and cell
                addTimeUntil(date, dateCell);
            }
        } catch (error) {
            console.error(`Invalid date: ${dateValue}`);
        }
    }
}

// get an array of the table row buttons
const buttons = Array.from(document.querySelectorAll(".deleteMe"));

buttons.forEach(button => {
    // on click, get grandparent node (button->td->tr)
    button.addEventListener("click", async () => {
        let parent = button.parentNode;
        // Find the previous HTML element sibling
        // Structure is {...,td,td{button}}. We want button's parent's previous sibling, which is a td containing the id
        let previousSibling = parent.previousSibling;
        // Skip over pesky text nodes
        while (previousSibling && previousSibling.nodeType === Node.TEXT_NODE) {
            previousSibling = previousSibling.previousSibling;
        }
        // Get Id of row to DELETE
        const row_id = previousSibling.innerText.trim();

        // Define the request data as an object
        const requestData = {
            id: row_id
        };
        // Define the request headers
        const headers = {
            'Content-Type': 'application/json'
        };
        
        try {
            // Send DELETE request to the server using fetch
            const res = await fetch(`/api/contact`, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(requestData)
            });
            
            if (res.status == 200 || res.status == 404) {
                if (parent) {
                    let grandparent = parent.parentNode;
                    if (grandparent) {
                        // remove tr from the DOM tree
                        grandparent.remove();
                    }
                }
            }

            
        } catch (error) {
            console.error("An error occurred:", error);
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


// Service the sale interface
const setSale = document.getElementById("Set");
const endSale = document.getElementById("End");
// const confirmSale = document.querySelector("span#confirmation");

// Create a visual confirmation
let confirmSale = document.createElement("span");
confirmSale.classList.id = "confirmation";
confirmSale.style.display = "none";
confirmSale.style.textAlign = "center";
confirmSale.style.backgroundColor = "lightblue";
confirmSale.style.marginBottom = "1em";
// Insert confirmation node above table
const par = document.body;
par.style.textAlign = "center";
const refNode = par.querySelector("div.table");
par.insertBefore(confirmSale, refNode);

setSale.addEventListener("click", async () => {
    const saleMessage = document.getElementById("Input").value;
    const headers = {
        'Content-Type': 'application/json'
    };
    const jsonData = { message: saleMessage };
    try {
        // Send POST request to the server using fetch
        const res = await fetch('/api/sale', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(jsonData)
        });
        if (res.status == 200) {
            confirmSale.innerText = "Sale successfully created";
            confirmSale.style.display = "inline-block";
        } else {
            confirmSale.innerText = "Failed to create sale"
            console.error(`POST response status: ${res.status}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }

});
endSale.addEventListener("click", async () => {
    const headers = {
        'Content-Type': 'application/json'
    };
    try {
        // Send DELETE request to the server using fetch
        const res = await fetch('/api/sale', {
            method: 'DELETE',
            headers: headers
        });
        if (res.status == 200) {
            confirmSale.innerText = "Sale successfully deleted";
            confirmSale.style.display = "inline-block";
        } else {
            confirmSale.innerText = "Failed to delete sale"
            console.error(`POST response status: ${res.status}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }

});

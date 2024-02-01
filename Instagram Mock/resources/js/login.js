document.getElementById('createUserForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the default way

    const username = document.getElementById('createUsername').value;
    const password = document.getElementById('createPassword').value;

    try {
        const response = await fetch('/user/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Parse JSON response

        // Store the token in localStorage
        localStorage.setItem('token', data.token);
        const tokenMessageDiv = document.getElementById('tokenMessage');
        tokenMessageDiv.innerText = `Token: ${data.token}`;
        // Update the content inside the 'tokenMessage' div
    } catch (error) {
        console.error('Error creating user:', error);
        // Handle error (display error message, etc.)
    }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the default way

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Parse JSON response

        // Store the token in localStorage
        localStorage.setItem('token', data.token);
        const tokenMessageLoginDiv = document.getElementById('tokenMessageLogin');
        tokenMessageLoginDiv.innerText = `Token: ${data.token}`;
        // Update the content inside the 'tokenMessage' div
    } catch (error) {
        console.error('Error creating user:', error);
        // Handle error (display error message, etc.)
    }
});
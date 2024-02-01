# Version 4
## Change Log
1. Contact log is now restricted to **authorized users only**. It now prompts the user to log in to view the contact log, using basic auth. 
    - Most secure login ever: (admin, password)

2. **NEW SALE FEATURE ON CONTACT LOG PAGE**
    - Add or remove a sale, which will appear as a banner on the homepage.

3. Contact log deletions are now persistent.

4. Parameter parser is more involved - checks emails and dates with regex to ensure proper format, sanitizes all other form inputs.

## How to run
This version can be ran in a few simple steps:

- Ensure you have a recent version of Python on your computer
- Clone this repo and open a terminal in the <code>v4</code> directory
- Run this command: <code>python3 server.py</code>
- Open <code>http://localhost:4131/</code> in your local browser

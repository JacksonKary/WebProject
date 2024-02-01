# Version 6
## Change Log

### Data is now stored in MYSQL instead of a global variable in the server code.
- All data about Sales and Contacts will be stored in MYSQL - meaning it survives even when our server restarts!
- <code>data.js</code> creates a connection to the MYSQL server using mysql-await.
    - This is where I directly interact with the database with queries and handle the response (just routing it back to the express endpoints).
- I used a server provided by UMN, but this should work for any MYSQL server.
    - One caveat about using a school server on a personal computer outside the campus network is F I R E W A L L.
    - Since the school's firewall is doing its thing, blocking connections from outside the campus network, I have to workaround with tunneling.
    - <code>tunnel.js</code> is the workaround. All it does is SSH into a UMN-CSE machine before connecting to the UMN MYSQL server, forwarding the port to my machine. This allows me to access the server despite the external firewall.
- My SQL schema can be found in <code>schema.sql</code>


Is it just me, or does the knight keep getting longer? Someone stop this man! He's just too long!

<br>

## How to run
This version can be ran, or so they say.

### TO RUN THIS YOURSELF, YOU WILL NEED ACCESS TO YOUR OWN MYSQL SERVER & LOGIN

- Ensure you have a recent version of Node.js on your computer
- Clone this repo and open a terminal in the <code>v6</code> directory
- Enter your login information for `user`, `database`, `password` in <code>data.js</code>.
    - **NOTE: these values should *really* be stored as environment variables for safety, but I ignored it for this project.**
1. Assuming your MYSQL server is *NOT* behind a firewall:
    - Open your MYSQL database in another terminal. Create both `sale` and `contact` tables with the CREATE commands in <code>schema.sql</code>.
    - Run these commands:
        - <code>npm install</code>
        - <code>node server.js</code>
2. If you, too, are an unfortunate soul, here's how to tunnel under the firewall:
    - Open your MYSQL database in another terminal (you will probably need to SSH into the network first). Create both `sale` and `contact` tables with the CREATE commands in <code>schema.sql</code>.
    - In <code>tunnel.js</code>, change the final line to be the following format:
        - <code>start_server('name of network machine', 'name of network's internal MYSQL server', 3306);</code>
        - Note: the last argument must be 3306, as that is the MYSQL port.
    - Run these commands: <b>NOTE: DO THESE IN ORDER</b>
        - <code>npm install</code>
        - <code>node tunnel.js</code> : run the tunnel and sign in to it.
        - <code>node server.js</code> : run the project server

- Open <code>http://localhost:4131/</code> in your local browser

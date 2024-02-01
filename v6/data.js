// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "localhost", // this will work
  user: "username",
  database: "database name",
  password: "password", // we really shouldn't be saving this here long-term -- environment variables are safer, but this project doesn't need any security
});

// later you can use connPool.awaitQuery(query, data) -- it will return a promise for the query results.

async function addContact(data) {
  try {
    if (!data || !data.Name || !data.Email) {
      throw new Error('Missing required data fields.');
    }
    const name = data.Name;
    const email = data.Email;
    const date = data.Date || null;
    const dropdown = data.Dropdown || "Claymore";
    const spooky = data.Spooky || "No";

    // there are cleaner ways to do this, but this is probably more straightforward and legible
    let result = await connPool.awaitQuery('INSERT INTO contact (ContactName, Email, ScheduledDate, Dropdown, Spooky) VALUES (?, ?, ?, ?, ?);', [name, email, date, dropdown, spooky]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error adding contact:', error);
    return false;
  }
}

async function deleteContact(id) {
  try {
    let result = await connPool.awaitQuery('DELETE FROM contact WHERE Id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting contact:', error);
    return false;
  }
}

async function getContacts() {
  try {
    let result = await connPool.awaitQuery('SELECT * FROM contact ORDER BY Id ASC;');
    let contacts = {
      "Name": [],
      "Email": [],
      "Date": [],
      "Dropdown": [],
      "Spooky": [],
      "Id": []
    }
    result.map(row => {
      contacts["Name"].push(row.ContactName)
      contacts["Email"].push(row.Email)
      contacts["Date"].push(row.ScheduledDate || "")
      contacts["Dropdown"].push(row.Dropdown)
      contacts["Spooky"].push(row.Spooky)
      contacts["Id"].push(row.Id)
    })

    return contacts
  } catch (error) {
    console.error('Error getting contacts:', error);
    return false;
  }
      
}

async function addSale(message) {
  try {
    let result = await connPool.awaitQuery('INSERT INTO sale (Msg) VALUES (?);', [message]);
  } catch (error) {
    console.error('Error adding sale:', error);
  }
}

async function endSale() {
  try {
    let result = await connPool.awaitQuery('UPDATE sale SET Endt=CURRENT_TIMESTAMP WHERE Endt IS NULL;');
  } catch (error) {
    console.error('Error ending sales:', error);
  }
}

async function getRecentSales() {
  try {
    let result = await connPool.awaitQuery('SELECT * FROM sale ORDER BY Startt DESC LIMIT 3;');
    return result;
  } catch (error) {
    console.error('Error getting sales:', error);
  }
}

module.exports = {addContact, getContacts, deleteContact, addSale, endSale, getRecentSales}
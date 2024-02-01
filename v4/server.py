from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib #Only for parse.unquote and parse.unquote_plus.
import json
import base64
from typing import Union, Optional
import re


next_id = 1

contacts = {
    "Name": ["test"],
    "Email": ["test@gmail.com"],
    "Date": ["2023-10-11"],
    "Dropdown": ["Claymore"],
    "Spooky": ["Yes"],
    "Id": [0]
}

sale = False
saleMessage = ""

def parameterParser(url):
    """
    helper function to parse parameter section of URL
    """
    # list of key=value strings
    parameters_list = url.split("&")
    # list of contact form input variable names
    keysList = list(contacts.keys())
    # keep booleans to determine whether all required data is included
    real_name = False
    real_email = False
    # keep a temporary dictionary of potential values to add to contacts once both valid email and name are parsed
    temp_contact = {
        "Name": "",
        "Email": "",
        "Date": "",
        "Dropdown": "",
        "Spooky": "",
        "Id": ""
    }
    # for each parameter
    for param in parameters_list:
        # split key=value into [key, value]
        keyValues = param.split("=")
        # if valid key,value pair (sanitizes for naughty input, e.g. URL = "/resource?name=name=value&name=value"... "name=name=value" doesn't enter if-statement)
        if len(keyValues) != 2:
            # return indicates we need to return 400 error to client
            return False
        if len(keyValues) == 2:
            # set the key
            key = keyValues[0]
            # set the value
            value = keyValues[1]
            # decode key and value strings now that all proper splitting has been done
            key = urllib.parse.unquote(key, encoding='utf-8', errors='replace')
            value = urllib.parse.unquote(value, encoding='utf-8', errors='replace')
            # if key corresponds to a variable name, add it to the TEMPORARY contact list
            if key in keysList:
                temp_contact[key] = value
                global next_id
                temp_contact["Id"] = next_id
                next_id = next_id + 1
                # Check for presence of Name and valid Email
                if (key == "Name"):
                    real_name = True
                elif (key == "Email"):
                    # regular expression (email template) passed into re.match
                    pattern = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
                    # use re.match to see if the provided email matches the email pattern template
                    if (re.match(pattern, value)):
                        real_email = True
                # Validate Date and Dropdown and Spooky
                elif (key == "Date"):
                    # empty string is okay
                    if (value != ""):
                        # regular expression (YYYY-MM-DD date format) passed into re.match
                        # this also does bounds-checks on the dates
                        pattern = r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$"
                        # use re.match to see if the provided date matches the expected format
                        if (not re.match(pattern, value)):
                            # return indicates we need to return 400 error to client
                            return False
                        
                elif (key == "Dropdown"):
                    # no need for re.match here
                    # empty string is okay
                    if (value != ""):
                        if (not (value == "Claymore" or value == "Halberd" or value == "Voulge")):
                            # return indicates we need to return 400 error to client
                            return False
                elif (key == "Spooky"):
                    # can either be Yes or No (or empty string)
                    if (value != ""):
                        if (value != "Yes" and value != "No"):
                            # invalid input
                            # return indicates we need to return 400 error to client
                            return False

    # check if both valid email and name are provided
    # if name & email were both present, move info from temp_contact to contacts list
    if (real_name and real_email):
        # loop through all keys
        for name in temp_contact.keys():
            # add temp values into global contacts list
            contacts[name].append(temp_contact[name])

    return (real_name and real_email)

def contactlogWriter():
    """
    helper function to dynamically write contactlog.html
    """
    final_table_string = "<table>\n\t<tr>\n"
    table_row_string = ""
    for key in contacts.keys():
        if (key == "Id"):
            table_row_string = table_row_string + "\t\t<th class='hide'>" + key + "</th>\n"
        else:
            table_row_string = table_row_string + "\t\t<th>" + key + "</th>\n"
    final_table_string = final_table_string + table_row_string + "\t\t<th>Delete Row</th>\n"
    final_table_string = final_table_string + "\t</tr>\n"

    # log_depth is the number of customer entries logged (since name is a required field, #names==#contacts)
    log_depth = len(contacts["Name"])
    # log_width is the number of columns/ input fields
    # log_width = len(contacts.keys()) - 1
    log_width = len(contacts.keys())
    # list of contact form input variable names
    keysList = list(contacts.keys())
    # generate a table row for each customer logged (outer loop)
    for i in range(log_depth):
        table_row_string = "\t<tr>\n"
        # generate table data for each input variable (inner loop)
        for j in range(log_width):
            key_at_index = keysList[j]
            # if key=="email", use mailto: format link. Otherwise, normal format
            if (key_at_index == "Email"):
                table_row_string = table_row_string + "\t\t<td><a href=\"mailto:" + contacts[key_at_index][i] + "\">" + contacts[key_at_index][i] + "</a></td>\n"
            elif (key_at_index == "Id"):
                table_row_string = table_row_string + "\t\t<td class='hide'>" + str(contacts[key_at_index][i]) + "</td>\n"
            else:
                table_row_string = table_row_string + "\t\t<td>" + contacts[key_at_index][i] + "</td>\n"
        table_row_string = table_row_string + "\t\t<td><button class=\"deleteMe\">DELETE ME</button></td>\n"
        table_row_string = table_row_string + "\t</tr>\n"
        final_table_string = final_table_string + table_row_string
    final_table_string = final_table_string + "</table>\n"        
    return f"""
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Contact Log</title>
        <link rel="stylesheet" href="/main.css">
        <link rel="stylesheet" href="/main.dark.css">
        <link href="https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap" rel="stylesheet">
        <style>
            td.hide, th.hide {{
                display: none;
            }}
            div#adminInterface {{
                display: inline-block;
                align-self: center;
                margin-top: 1em;
                padding: 1em;
                text-align: center;
                background-color: gray;
            }}
        </style>
        <script src="/main.js"></script>
        <script src="/table.js" async defer></script>
    </head>
    <body>
        <div class="top">
            <nav>
                <span><a href="/main">Home</a></span>
                <span><a href="/testimonies">Testimonies</a></span>
                <span><a href="/contact">Summon Us</a></span>
                <span><a href="/admin/contactlog">Contacts List</a></span>
                <span><button id="theme">Toggle Theme</button></span>
            </nav>
        </div>
        <div class="bottom">
            <div id="adminInterface">
                <p>SET SALE</p>
                <label for="Input">Sale Text:</label>
                <input type="text" id="Input" name="Input">
                <br>
                <button id="Set">Set Sale</button>
                <button id="End">End Sale</button>
            </div>
        </div>
        <h1 id="logheader">Prank List</h1>
        <div class="table">
            {final_table_string}
        </div>
    </body>
</html>"""

# The method signature is a bit "hairy", but don't stress it -- just check the documentation below.
def server(method: str, url: str, body: Optional[str], headers: dict[str, str]) -> tuple[Union[str, bytes], int, dict[str, str]]:    
    """
    method will be the HTTP method used, for our server that's GET, POST, DELETE
    url is the partial url, just like seen in previous assignments
    body will either be the python special None (if the body wouldn't be sent)
         or the body will be a string-parsed version of what data was sent.
    headers will be a python dictionary containing all sent headers.

    This function returns 3 things:
    The response body (a string containing text, or binary data)
    The response code (200 = ok, 404=not found, etc.)
    A _dictionary_ of headers. This should always contain Content-Type as seen in the example below.
    """
    global sale
    global saleMessage
    # Parse URL
    if "?" in url:
        # Split the URL into parts at the "?" character
        url, remaining_parts = url.split("?", 1)
        # Decode the resource part
        resource = urllib.parse.unquote(url, encoding='utf-8', errors='replace')
        # Initialize parameters and anchor
        parameters = ""
        anchor = ""
        if remaining_parts:
            # Split the remaining parts at the "#" character
            if "#" in remaining_parts:
                remaining_parts = remaining_parts.split("#", 1)
                parameters = remaining_parts[0]

                if (method == "POST"):
                    if (resource == "/contact"):
                        retval = False
                        retval = parameterParser(body)
                        if (retval == True):
                            return open("static/html/confirm.html").read(), 201, {"Content-Type": "text/html; charset=utf-8"}
                        else:
                            return open("static/html/deny.html").read(), 400, {"Content-Type": "text/html; charset=utf-8"}
                    else:
                        open("static/html/404.html").read(), 404, {"Content-Type": "text/html; charset=utf-8"}
                else: # if method not POST
                    # Decode the parameters part
                    parameters = urllib.parse.unquote(parameters, encoding='utf-8', errors='replace')
                    if (len(remaining_parts) > 1):
                        anchor = remaining_parts[1]
                        # Decode the anchor part
                        anchor = urllib.parse.unquote(anchor, encoding='utf-8', errors='replace')
            else:
                parameters = remaining_parts
                if (method == "POST"):
                    if (resource == "/contact"):
                        retval = False
                        retval = parameterParser(body)
                        if (retval == True):
                            return open("static/html/confirm.html").read(), 201, {"Content-Type": "text/html; charset=utf-8"}
                        else:
                            return open("static/html/deny.html").read(), 400, {"Content-Type": "text/html; charset=utf-8"}
                    else:
                        open("static/html/404.html").read(), 404, {"Content-Type": "text/html; charset=utf-8"}
                else: # if method not POST
                    # Decode the parameters part
                    parameters = urllib.parse.unquote(parameters, encoding='utf-8', errors='replace')
    else: # "?" not in url
        # Decode the resource part
        resource = urllib.parse.unquote(url, encoding='utf-8', errors='replace')

    # Handle admin login
    if ((method == "GET" and resource == "/admin/contactlog") or
        (method == "POST" and resource == "/api/sale") or
        (method == "DELETE" and (resource == "/api/contact" or resource == "/api/sale"))):
        # Decode/parse username/id and password
        try:
            responseHeader = {
                "Content-Type": "text/plain; charset=utf-8",
                'WWW-Authenticate': 'Basic realm="User Visible Realm", charset="UTF-8"',
            }
            if ("Authorization" not in headers):
                return "Please include 'Authorization' header", 401, responseHeader

            auth = headers["Authorization"]

            if (not auth or auth == ""):
                raise ValueError("Authorization header is missing a proper value")

            encoded = auth.lstrip("Basic ")
            decoded = base64.b64decode(encoded).decode("utf-8")

            username, password = decoded.split(':', 2)

            if (username != "admin" or password != "password"):
                return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Forbidden</title>
        </head>
        <body>
            <p>Forbidden</p>
        </body>
        </html>
        """, 403, {"Content-Type": "text/html; charset=utf-8"}

        except (KeyError, ValueError) as e:
            return f"Login: {e}", 400, {"Content-Type": "text/plain; charset=utf-8"}
        except Exception as e:
            return f"Login error: {e}", 400, {"Content-Type": "text/plain; charset=utf-8"}


    if (method == "GET"):
        if (resource == "/main" or resource == "/"):
            return open("static/html/mainpage.html").read(), 200, {"Content-Type": "text/html; charset=utf-8"}

        elif (resource == "/contact"):
            return open("static/html/contactform.html").read(), 200, {"Content-Type": "text/html; charset=utf-8"}

        elif (resource == "/testimonies"):
            return open("static/html/testimonies.html").read(), 200, {"Content-Type": "text/html; charset=utf-8"}
    
        elif (resource == "/admin/contactlog"):
            return contactlogWriter(), 200, {"Content-Type": "text/html; charset=utf-8"}
    
        elif (resource == "/main.css"):
            return open("static/css/main.css").read(), 200, {"Content-Type": "text/css; charset=utf-8"}
    
        elif (resource == "/main.dark.css"):
            return open("static/css/main.dark.css").read(), 200, {"Content-Type": "text/css; charset=utf-8"}
    
        elif (resource == "/main.js" or resource == "/js/main.js"):
            return open("static/js/main.js").read(), 200, {"Content-Type": "text/javascript; charset=utf-8"}
    
        elif (resource == "/contact.js" or resource == "/js/contact.js"):
            return open("static/js/contact.js").read(), 200, {"Content-Type": "text/javascript; charset=utf-8"}
    
        elif (resource == "/table.js" or resource == "/js/table.js"):
            return open("static/js/table.js").read(), 200, {"Content-Type": "text/javascript; charset=utf-8"}
        
        elif (resource == "/sale.js" or resource == "/js/sale.js"):
            return open("static/js/sale.js").read(), 200, {"Content-Type": "text/javascript; charset=utf-8"}
    
        elif (resource == "/images/main"):
            return open("static/images/main.jpg", "rb").read(), 200, {"Content-Type": "image/jpeg; charset=utf-8"}
        
        elif (resource == "/api/sale"):
            if not sale:
                saleMessage = ""
            saleDict = {
                "active": sale,
                "message": saleMessage
            }
            json_string = json.dumps(saleDict)
            return json_string, 200, {"Content-Type": "application/json; charset=utf-8"}

        else:
            return open("static/html/404.html").read(), 404, {"Content-Type": "text/html; charset=utf-8"}
    elif (method == "POST"):
        if (resource == "/contact"):
            retval = False
            retval = parameterParser(body)
            if (retval == True):
                return open("static/html/confirm.html").read(), 201, {"Content-Type": "text/html; charset=utf-8"}
            else:
                return open("static/html/deny.html").read(), 400, {"Content-Type": "text/html; charset=utf-8"}
        elif (resource == "/api/sale"):
            ct = headers["Content-Type"]
            if (ct is None or ct != "application/json"):
                return "Content-Type is not 'application/json'", 400, {"Content-Type": "text/plain; charset=utf-8"}
            try:
                jsonContent = json.loads(body)
                msg = jsonContent["message"]
                if (msg == [] or msg is None):
                    raise KeyError("message is missing from JSON body")
                sale = True
                saleMessage = msg
                return "Successful Update", 200, {"Content-Type": "text/plain; charset=utf-8"}
            except json.JSONDecodeError as e:
                return "Invalid JSON data: " + str(e), 400, {"Content-Type": "text/plain; charset=utf-8"}
            except KeyError as e:
                return "KeyError: " + str(e), 400, {"Content-Type": "text/plain; charset=utf-8"}
            except Exception as e:
                return "An error occurred: " + str(e), 400, {"Content-Type": "text/plain; charset=utf-8"}

        else:
            open("static/html/404.html").read(), 404, {"Content-Type": "text/html; charset=utf-8"}
    elif (method == "DELETE"):
        if (resource == "/api/contact"):
            ct = headers["Content-Type"]
            if (ct is None or ct != "application/json"):
                return "Content-Type is not 'application/json'", 400, {"Content-Type": "text/plain; charset=utf-8"}
            try:
                jsonContent = json.loads(body)
                id = jsonContent["id"]
                if id == [] or id is None:
                    raise KeyError("id is missing from JSON body")
                if (int(id) < 0 or int(id) >= (next_id)):
                    return "No contact with the given ID exists", 404, {"Content-Type": "text/plain; charset=utf-8"}
                
                # Find the index of 'id' in the 'contacts["Id"]' list
                try:
                    id_index = contacts["Id"].index(int(id))
                    for key in contacts.keys():
                        # Remove the element at the 'id_index' for this key
                        del contacts[key][id_index]
                    # return contactlogWriter(), 200, {"Content-Type": "text/html; charset=utf-8"}
                    return "Successful delete", 200, {"Content-Type": "text/plain; charset=utf-8"}
                except ValueError as e:
                    return "No contact with the given ID exists. ValueError: " + str(e), 404, {"Content-Type": "text/plain; charset=utf-8"}
                except Exception as e:
                    return "No contact with the given ID exists. Exception: " + str(e), 404, {"Content-Type": "text/plain; charset=utf-8"}
            
            except json.JSONDecodeError as e:
                return "Invalid JSON data: " + str(e), 400, {"Content-Type": "text/plain; charset=utf-8"}
            except KeyError as e:
                return "KeyError: " + str(e), 400, {"Content-Type": "text/plain; charset=utf-8"}
            except Exception as e:
                return "An error occurred: " + str(e), 400, {"Content-Type": "text/plain; charset=utf-8"}
        elif (resource == "/api/sale"):
            sale = False
            saleMessage = ""
            return "Successful delete", 200, {"Content-Type": "text/plain; charset=utf-8"}
        else:
            return open("static/html/404.html").read(), 404, {"Content-Type": "text/html; charset=utf-8"}
    else:
        return open("static/html/404.html").read(), 404, {"Content-Type": "text/html; charset=utf-8"}


class RequestHandler(BaseHTTPRequestHandler):
    def c_read_body(self):
        # Read the content-length header sent by the BROWSER
        content_length = int(self.headers.get("Content-Length", 0))
        # read the data being uploaded by the BROWSER
        body = self.rfile.read(content_length)
        # we're making some assumptions here -- but decode to a string.
        body = str(body, encoding="utf-8")
        return body

    def c_send_response(self, message, response_code, headers):
        # Convert the return value into a byte string for network transmission
        if type(message) == str:
            message = bytes(message, "utf8")
        
        # Send the first line of response.
        self.protocol_version = "HTTP/1.1"
        self.send_response(response_code)
        
        # Send headers (plus a few we'll handle for you)
        for key, value in headers.items():
            self.send_header(key, value)
        self.send_header("Content-Length", len(message))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()

        # Send the file.
        self.wfile.write(message)
        

    def do_POST(self):
        # Step 1: read the last bit of the request
        try:
            body = self.c_read_body()
        except Exception as error:
            # Can't read it -- that's the client's fault 400
            self.c_send_response("Couldn't read body as text", 400, {'Content-Type':"text/plain"})
            raise
                
        try:
            # Step 2: handle it.
            message, response_code, headers = server("POST", self.path, body, self.headers)
            # Step 3: send the response
            self.c_send_response(message, response_code, headers)
        except Exception as error:
            # If your code crashes -- that's our fault 500
            self.c_send_response("The server function crashed.", 500, {'Content-Type':"text/plain"})
            raise
        

    def do_GET(self):
        try:
            # Step 1: handle it.
            message, response_code, headers = server("GET", self.path, None, self.headers)
            # Step 3: send the response
            self.c_send_response(message, response_code, headers)
        except Exception as error:
            # If your code crashes -- that's our fault 500
            self.c_send_response("The server function crashed.", 500, {'Content-Type':"text/plain"})
            raise


    def do_DELETE(self):
        # Step 1: read the last bit of the request
        try:
            body = self.c_read_body()
        except Exception as error:
            # Can't read it -- that's the client's fault 400
            self.c_send_response("Couldn't read body as text", 400, {'Content-Type':"text/plain"})
            raise
        
        try:
            # Step 2: handle it.
            message, response_code, headers = server("DELETE", self.path, body, self.headers)
            # Step 3: send the response
            self.c_send_response(message, response_code, headers)
        except Exception as error:
            # If your code crashes -- that's our fault 500
            self.c_send_response("The server function crashed.", 500, {'Content-Type':"text/plain"})
            raise



def run():
    PORT = 4131
    print(f"Starting server http://localhost:{PORT}/")
    server = ("", PORT)
    httpd = HTTPServer(server, RequestHandler)
    httpd.serve_forever()


run()

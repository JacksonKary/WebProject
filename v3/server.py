from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib

# dictionary with contact information. Referred to as "contacts list"
contacts = {
    "Name": ["test"],
    "Email": ["test@gmail.com"],
    "Date": ["2023-10-11"],
    "Dropdown": ["Claymore"],
    "Spooky": ["Yes"]
}

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
        "Spooky": ""
    }
    # for each parameter
    for param in parameters_list:
        # split key=value into [key, value]
        keyValues = param.split("=")
        # if valid key,value pair (sanitizes for naughty input, e.g. URL = "/resource?name=name=value&name=value"... "name=name=value" doesn't enter if-statement)
        if len(keyValues) != 2:
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
                if (key == "Name"):
                    real_name = True
                elif (key == "Email"):
                    # at this point, I would ideally double check that it's a valid email using an external library, but this will do for now
                    if ("@" in value):
                        real_email = True
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
        table_row_string = table_row_string + "\t\t<th>" + key + "</th>\n"
    final_table_string = final_table_string + table_row_string + "\t\t<th>Delete Row</th>\n"
    final_table_string = final_table_string + "\t</tr>\n"

    # log_depth is the number of customer entries logged (since name is a required field, #names==#contacts)
    log_depth = len(contacts["Name"])
    # log_width is the number of columns/ input fields
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
        <h1 id="logheader">Prank List</h1>
        <div class="table">
            {final_table_string}
        </div>
    </body>
</html>"""

def server_GET(url: str) -> tuple[str | bytes, str, int]:
    """
    url is a *PARTIAL* URL. If the browser requests `http://localhost:4131/contact?name=joe`
    then the `url` parameter will have the value "/contact?name=joe". (so the schema and
    authority will not be included, but the full path, any query, and any anchor will be included)

    This function is called each time another program/computer makes a request to this website.
    The URL represents the requested file.

    This function should return three values (string or bytes, string, int) in a list or tuple. The first is the content to return
    The second is the content-type. The third is the HTTP Status Code for the response
    """
    # split url from resource->parameters->anchor into [resource, parameters->anchor]
    resource_rest = url.split("?", 1)
    # set resource string
    resource = resource_rest[0]
    # cleanse text to decode escape sequences into special characters in utf-8
    resource = urllib.parse.unquote(resource, encoding='utf-8', errors='replace')
    parameters = ""
    anchor = ""
    # if there are parameters in the URL
    if (len(resource_rest) > 1):
        # split resource_rest[1] from parameters->anchor into [parameters, anchor]
        parameters_anchor = resource_rest[1].split("#", 1)
        # set parameters string
        parameters = parameters_anchor[0]
        # cleanse text to decode escape sequences into special characters in utf-8
        parameters = urllib.parse.unquote(parameters, encoding='utf-8', errors='replace')
        # if there is an anchor in the URL
        if (len(parameters_anchor) > 1):
            # set anchor string
            anchor = parameters_anchor[1]
            # cleanse text to decode escape sequences into special characters in utf-8
            anchor = urllib.parse.unquote(anchor, encoding='utf-8', errors='replace')
    

    if resource == "/main" or resource == "/":
        return open("static/html/mainpage.html").read(), "text/html", 200

    elif resource == "/contact":
        return open("static/html/contactform.html").read(), "text/html", 200

    elif resource == "/testimonies":
        return open("static/html/testimonies.html").read(), "text/html", 200
    
    elif resource == "/admin/contactlog":
        return contactlogWriter(), "text/html", 200
    
    elif resource == "/main.css":
        return open("static/css/main.css").read(), "text/css", 200
    
    elif resource == "/main.dark.css":
        return open("static/css/main.dark.css").read(), "text/css", 200
    
    elif resource == "/main.js":
        return open("static/js/main.js").read(), "text/javascript", 200
    
    elif resource == "/contact.js":
        return open("static/js/contact.js").read(), "text/javascript", 200
    
    elif resource == "/table.js":
        return open("static/js/table.js").read(), "text/javascript", 200
    
    elif resource == "/images/main":
        return open("static/images/main.jpg", "rb").read(), "image/jpeg", 200

    else:
        return open("static/html/404.html").read(), "text/html", 404

def server_POST(url: str, body: str) -> tuple[str | bytes, str, int]:
    """
    url is a *PARTIAL* URL. If the browser requests `http://localhost:4131/contact?name=joe`
    then the `url` parameter will have the value "/contact?name=joe". (so the schema and
    authority will not be included, but the full path, any query, and any anchor will be included)

    This function is called each time another program/computer makes a POST request to this website.

    This function should return three values (string or bytes, string, int) in a list or tuple. The first is the content to return
    The second is the content-type. The third is the HTTP Status Code for the response
    """
    # split url from resource->parameters->anchor into [resource, parameters->anchor]
    resource_rest = url.split("?", 1)
    # set resource string
    resource = resource_rest[0]
    # cleanse text to decode escape sequences into special characters in utf-8
    resource = urllib.parse.unquote(resource, encoding='utf-8', errors='replace')
    
    if resource == "/contact":
        retval = False
        retval = parameterParser(body)
        if (retval == True):
            return open("static/html/confirm.html").read(), "text/html", 201
        else:
            return open("static/html/deny.html").read(), "text/html", 400
    else:
        return open("static/html/404.html").read(), "text/html", 404


class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Read the content-length header sent by the BROWSER
        content_length = int(self.headers.get('Content-Length',0))
        # read the data being uploaded by the BROWSER
        body = self.rfile.read(content_length)
        # we're making some assumptions here -- but decode to a string.
        body = str(body, encoding="utf-8")

        message, content_type, response_code = server_POST(self.path, body)

        # Convert the return value into a byte string for network transmission
        if type(message) == str:
            message = bytes(message, "utf8")

        # prepare the response object with minimal viable headers.
        self.protocol_version = "HTTP/1.1"
        # Send response code
        self.send_response(response_code)
        # Send headers
        # Note -- this would be binary length, not string length
        self.send_header("Content-Length", len(message))
        self.send_header("Content-Type", content_type)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()

        # Send the file.
        self.wfile.write(message)
        return

    def do_GET(self):
        # Call the server code.
        message, content_type, response_code = server_GET(self.path)

        # Convert the return value into a byte string for network transmission
        if type(message) == str:
            message = bytes(message, "utf8")

        # prepare the response object with minimal viable headers.
        self.protocol_version = "HTTP/1.1"
        # Send response code
        self.send_response(response_code)
        # Send headers
        # Note -- this would be binary length, not string length
        self.send_header("Content-Length", len(message))
        self.send_header("Content-Type", content_type)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()

        # Send the file.
        self.wfile.write(message)
        return


def run():
    PORT = 4131
    print(f"Starting server http://localhost:{PORT}/")
    server = ("", PORT)
    httpd = HTTPServer(server, RequestHandler)
    httpd.serve_forever()


run()

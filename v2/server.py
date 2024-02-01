from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib

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
    num_contacts = len(contacts["Name"])
    current_num = num_contacts + 1
    real_data = False
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
            # if key corresponds to a variable name, add it to the contacts list
            if key in keysList:
                contacts[key].append(value)
                real_data = True
    # if a value was added to contacts, "pad" the row where needed
    if (real_data):
        # add empty strings to keep customer data alignment
        for name in contacts.keys():
            # if the list at key has less values than it should, add an empty string
            if (len(contacts[name]) < current_num):
                # add an empty string to pad the space
                contacts[name].append("")

    return

def contactlogWriter():
    """
    helper function to dynamically write contactlog.html
    """
    final_table_string = "<table>\n\t<tr>\n"
    table_row_string = ""
    for key in contacts.keys():
        table_row_string = table_row_string + "\t\t<th>" + key + "</th>\n"
    final_table_string = final_table_string + table_row_string
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
        <link href="https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap" rel="stylesheet">
    </head>
    <body>
        <div class="top">
            <nav>
                <span><a href="/main">Home</a></span>
                <span><a href="/testimonies">Testimonies</a></span>
                <span><a href="/contact">Summon Us</a></span>
                <span><a href="/admin/contactlog">Contacts List</a></span>
            </nav>
        </div>
        <h1 id="logheader">Prank List</h1>
        <div class="table">
            {final_table_string}
        </div>
    </body>
</html>"""


def server(url):
    """
    url is a *PARTIAL* URL. If the browser requests `http://localhost:4131/contact?name=joe#test`
    then the `url` parameter will have the value "/contact?name=joe". So it has the PATH
    and any PARAMETERS from the url, but nothing else.

    This function is called each time another program/computer makes a request to this website.
    The URL represents the requested file.

    This function should return two strings in a list or tuple. The first is the content to return
    The second is the content-type.
    """

    # split decodedURL from resource->parameters->anchor into [resource, parameters->anchor]
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
        parameters_anchor = resource_rest[1].split("#")
        # set parameters string
        parameters = parameters_anchor[0]
        # if there is an anchor in the URL
        if (len(parameters_anchor) > 1):
            # set anchor string
            anchor = parameters_anchor[1]
            # cleanse text to decode escape sequences into special characters in utf-8
            anchor = urllib.parse.unquote(anchor, encoding='utf-8', errors='replace')

    if resource == "/main" or resource == "/":
        return open("static/html/mainpage.html").read(), "text/html"

    elif resource == "/contact":
        if (len(resource_rest) > 1):
            # parse the parameters string and add values into global contacts list 
            parameterParser(parameters)
        return open("static/html/contactform.html").read(), "text/html"

    elif resource == "/testimonies":
        return open("static/html/testimonies.html").read(), "text/html"
    
    elif resource == "/admin/contactlog":
        return contactlogWriter(), "text/html"
    
    elif resource == "/main.css":
        return open("static/css/main.css").read(), "text/css"
    
    elif resource == "/images/main":
        return open("static/images/main.jpg", "rb").read(), "image/jpeg"

    else:
        return open("static/html/404.html").read(), "text/html"
    

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Call the server code.
        message, content_type = server(self.path)

        # Convert the return value into a byte string for network transmission
        if type(message) == str:
            message = bytes(message, "utf8")

        # Prepare the response object with minimal viable headers.
        self.protocol_version = "HTTP/1.1"
        # Send response code
        self.send_response(200)
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
    server = ('', PORT)
    httpd = HTTPServer(server, RequestHandler)
    httpd.serve_forever()
run()


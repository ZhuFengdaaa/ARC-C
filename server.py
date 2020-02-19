from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from httplib import HTTPResponse
from os import curdir,sep
import json
import os

#Run: python server.py
#After run, try http://localhost:8080/

indexes = {}

def get_index(folder):
    if folder not in indexes:
        files = os.listdir(folder)
        if len(files) == 0:
            indexes[folder] = 0
        else:
            cnts = []
            for file in files:
                if file.endswith(".json"):
                    cnts.append(int(file.split(".json")[0]))
            indexes[folder] = max(cnts) + 1
    return indexes[folder]

def write_file(folder, filename, data):
    f = open(filename, "w")
    json.dump(data, f)
    f.close()

def sort_by_example_id(label):
    return int(label.split(".json")[0])

def read_labels(folder):
    if not os.path.exists(folder):
        os.mkdir(folder)
    labels = os.listdir(folder)
    filtered_labels = []
    for labelfile in labels:
        if labelfile.endswith(".json"):
            filtered_labels.append(labelfile)
    print(filtered_labels)

    filtered_labels.sort(key=sort_by_example_id)
    response = json.dumps({"success": True, "labels": filtered_labels})
    return response

def write_label(folder, data):
    if not os.path.exists(folder):
        os.mkdir(folder)
    print(data["overwrite"])
    if data["overwrite"] == 1:
        filename = data["filename"]
        print(data)
    else:
        current_index = get_index(folder)
        filename = os.path.join(folder, "%d.json" % current_index)
        indexes[folder] = current_index + 1

    write_file(folder, filename, data)
    response = json.dumps({"success": True})
    return response

class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        data = json.loads(self.data_string)
        folder = "label_" + data["username"]
        print(self.path)
        if self.path == '/':
            response = write_label(folder, data)
        elif self.path == '/list':
            response = read_labels(folder)
            print(response)

        self.send_response(200)
        self.send_header('Content-length',str(len(response)))
        self.end_headers()
        self.wfile.write(response)
        return

    def do_GET(self):
        if self.path == '/':
            self.path  = '/index.html'
        # elif self.path.startswith("/js") or self.path.startswith("/css"):
        try:
            sendReply = False
            if self.path.endswith(".html"):
                mimeType = 'text/html'
                sendReply = True
            elif self.path.endswith(".js"):
                mimeType = 'application/javascript'
                sendReply = True
            elif self.path.endswith(".css"):
                mimeType = 'text/css'
                sendReply = True
            elif self.path.endswith(".json"):
                mimeType = 'application/json; charset=utf-8'
                sendReply = True
            elif self.path.endswith(".ico"):
                mimeType = 'image/x-icon'
                sendReply = True
            else:
                print("mimetype not found")
                import pdb; pdb.set_trace()

            if sendReply == True:
                print(curdir + sep + self.path)
                f = open(curdir + sep + self.path)
                self.send_response(200)
                self.send_header('Content-type', mimeType)
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
            return
        except IOError:
            self.send_error(404,'File not found!')


def run():
    print('http server is starting...')
    #by default http server port is 80
    server_address = ('0.0.0.0', 8080)
    httpd = HTTPServer(server_address, RequestHandler)
    try:
        print('http server is running...')
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.socket.close()

if __name__ == '__main__':
    run()

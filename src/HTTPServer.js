import TcpSocket from 'react-native-tcp-socket';
import {NetworkInfo} from 'react-native-network-info';
import { getFile } from './FileHandler.js';
import {createMicListener, readMic, validMicID} from './Microphone.js'

/*
    HTTP 1.1 Server written from scratch using a tcp socket
*/

const server = TcpSocket.createServer(function(socket) {
    socket.setEncoding("utf-8");

    socket.on('data', (data) => {

        const request = parseHTTPRequest(data);
        const response = handleHTTPRequest(request);
        
        socket.write(response.toString());
    });
});

export async function startServer() {
    const ip = await NetworkInfo.getIPV4Address();
    server.listen({ port: 8080, host: ip });
    return ip;
}  

export function stopServer() {
    if(server) {
        server.close();
    }   
} 

/* 
    Will attempt to parse the headers and the body
    Returns an HTTP Response
*/
function parseHTTPRequest(data) {
    const request = new HTTPRequest();

    try {
        const temp = data.split('\n');

        const first_line = temp[0].split(" ");

        request.method = first_line[0].trim();
        request.path = first_line[1].trim();
        request.version = first_line[2].trim();

        let i = 1;
        //Gets all headers
        while(i < temp.length && temp[i].trim() !== "") {
            const colon_index = temp[i].indexOf(":");
            request.headers.set(temp[i].slice(0, colon_index).trim(), temp[i].slice(colon_index + 1).trim());
            i++;
        }

        i++;
        //Gets body
        while(i < temp.length - 1) {
            request.body += temp[i] + "\n";
            i++;
        }

        if(i < temp.length) {
            request.body += temp[i];
        }

    } catch(err) {
        request.error = true;
    }

    return request;
}

/*
    Handles all possible requests client can make
    Returns an HTTP Response
*/
function handleHTTPRequest(request) {
    const response = new HTTPResponse();
    if(request.error) {
        response.version = "HTTP/1.1";
        response.status_code = "400";
        response.reason_phrase = "Bad Request";
        response.headers.set("Content-Length","0");
        response.headers.set("Connection","close");
        return response;
    }
    
    if(request.method === "GET") {
        let [file_found , file_data, file_size, file_type] = getFile(request.path);

        //Used to provide index.html and main.js
        if(file_found) {
            response.version = "HTTP/1.1";
            response.status_code = "200";
            response.reason_phrase = "OK";
            response.headers.set("Content-Length", file_size);
            response.headers.set("Content-Type", file_type);
            response.body = file_data;
        }
        //Sends an audio chunk given they have an audio id
        else if(request.path === "/audio") {
            let id = request.headers.get("X-Audio-ID");
            if(id && validMicID(id)) {
                let buffer = readMic(id);
                response.version = "HTTP/1.1";
                response.status_code = "200";
                response.reason_phrase = "OK";
                response.headers.set("Content-Length", buffer.length);
                response.body = buffer;
            }
            else {
                response.version = "HTTP/1.1";
                response.status_code = "400";
                response.reason_phrase = "Bad Request";
                response.headers.set("Content-Length","0");
                response.headers.set("Connection","close");
            }
        } 
        else {
            response.version = "HTTP/1.1";
            response.status_code = "404";
            response.reason_phrase = "Not Found";
            response.headers.set("Content-Length", 0);
        }  
    }
    else if(request.method === "POST") {
        if(request.path === "/initialize_audio") {
            id = createMicListener();
            response.version = "HTTP/1.1";
            response.status_code = "201";
            response.reason_phrase = "Created"
            response.headers.set("X-Audio-ID", id);
            response.headers.set("Content-Length", 0);
        }
        else {
            response.version = "HTTP/1.1";
            response.status_code = "404";
            response.reason_phrase = "Not Found";
            response.headers.set("Content-Length", 0);
        }  
    }
    //Written under the requirements from the specification
    else if(request.method === "HEAD") {
        let [file_found ,file_data, file_size] = getFile(request.path);

        if(file_found) {
            response.version = "HTTP/1.1";
            response.status_code = "200";
            response.reason_phrase = "OK";
            response.headers.set("Content-Length", file_size);
        }
        else {
            response.version = "HTTP/1.1";
            response.status_code = "404";
            response.reason_phrase = "Not Found";
            response.headers.set("Content-Length", 0);
        } 
    }
    else {
        response.version = "HTTP/1.1";
        response.status_code = "501";
        response.reason_phrase = "Not Implemented";
        response.headers.set("Content-Length", "0");
        response.headers.set("Connection", "close");
    }
    
    return response;
}

class HTTPRequest {
    error = false;
    method = ""; //String GET, POST, PUT, ...
    headers = new Map(); //Map data structure
    body = ""; //data(optional and type unknown) 
    path = ""; //String request path 
    version = "";
};

class HTTPResponse {
    version = "";
    status_code = "";
    reason_phrase = "";
    headers = new Map();
    body = "";

    toString() {
        let response = `${this.version} ${this.status_code} ${this.reason_phrase}\r\n`;

        for(const key of this.headers.keys()) {
            response += `${key}: ${this.headers.get(key)}\r\n`;
        }

        response += `\r\n${this.body}`;

        return response;
    }
};



import TcpSocket from 'react-native-tcp-socket';
import {NetworkInfo} from 'react-native-network-info';
import { getFile } from './FileHandler';


const server = TcpSocket.createServer(function(socket) {
    socket.setEncoding("utf-8");

    socket.on('data', (data) => {
        console.log("Data:\n" + data);

        const request = parseHTTPRequest(data);
        const response = handleHTTPRequest(request);
        
        socket.write(response.toString());
    });

    socket.on('error', (error) => {
        console.log('An error ocurred with client socket ', error);
    });

    socket.on('close', (error) => {
        console.log('Closed connection with ', socket.address());
    });
});

server.on('error', (error) => {
    console.log('An error ocurred with the server', error);
});

server.on('close', () => {
    console.log('Server closed connection');
});

export async function startServer() {
    const ip = await NetworkInfo.getIPV4Address();
    server.listen({ port: 8080, host: ip });
    console.log(`Ip Address ${ip}:8080`);
    return ip;
}  

export function stopServer() {
    if(server) {
        server.close();
    }
    
} 

function parseHTTPRequest(data) {
    const request = new HTTPRequest();

    try {
        const temp = data.split('\n');

        const first_line = temp[0].split(" ");

        request.method = first_line[0].trim();
        request.path = first_line[1].trim();
        request.version = first_line[2].trim();

        let i = 1;

        while(i < temp.length && temp[i].trim() !== "") {
            const colon_index = temp[i].indexOf(":");
            request.headers.set(temp[i].slice(0, colon_index).trim(), temp[i].slice(colon_index + 1).trim());
            i++;
        }

        i++;

        while(i < temp.length - 1) {
            request.body += temp[i] + "\n";
            i++;
        }

        if(i < temp.length) {
            request.body += temp[i];
        }

    } catch(err) {
        console.log(err);
        request.error = true;
    }

    return request;
}

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
        let [file_found ,file_data, file_size] = getFile(request.path);

        if(file_found) {
            response.version = "HTTP/1.1";
            response.status_code = "200";
            response.reason_phrase = "OK";
            response.headers.set("Content-Length", file_size);
            response.body = file_data;
        }
        else {
            response.version = "HTTP/1.1";
            response.status_code = "404";
            response.reason_phrase = "Not Found";
            response.headers.set("Content-Length", 0);
        }  
    }
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
    

    console.log("Response:\n" + response.toString());
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



// The file system module
http = require('http');
const fs = require('fs');

function handleRequest(request, response) {
  // User file system module to read index.html file
  console.log("===================================");
  console.log(__dirname + request.url);
  
  fs.readFile(__dirname + request.url,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        response.writeHead(500);
        return response.end('Error loading index.html');
      }
      // Otherwise, send the data, the contents of the file
      response.writeHead(200);
      response.end(data);
      return response;
    }
  );
}

let server = http.createServer(handleRequest);
console.log("Starting server");
server.listen(8081);
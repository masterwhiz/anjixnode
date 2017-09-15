//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
var PORT=9000; 

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('Hi welcome to arnergy!' + request.url);
    console.log("request received from: " + request.connection.remoteAddress);
   
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
    
});
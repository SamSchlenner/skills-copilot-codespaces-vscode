// Create web server

var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

// Create server
var server = http.createServer(function(req, res) {
    // Get URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get method
    var method = req.method.toLowerCase();

    // Get query string as an object
    var queryStringObject = parsedUrl.query;

    // Get headers as an object
    var headers = req.headers;

    // Get payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        buffer += decoder.end();

        // Choose the handler this request should go to, if one is not found use the notFound handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // Use the status code called back by the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler or default to empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path
            console.log('Returning this response: ', statusCode, payloadString);
        });
    });
});

// Start server
server.listen(3000, function() {
    console.log('The server is listening on port 3000 now');
});

// Define handlers
var handlers = {};

// Hello handler
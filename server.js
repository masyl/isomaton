/**
 * This is a lightweight node.js server for static files.
 * Requires the 'node-static' package
 * Usage:  node server.js
 */
var port = 8099;
var sys = require('sys');
var http = require('http');
var static = require('node-static');
var httpProxy = require('http-proxy');

//
// Create a node-static server to serve the current directory
//
var file = new(static.Server)('.', { cache: 7200, headers: {'X-Hello':'World!'} });

var serverHandler = function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response, function (err, res) {
            if (err) { // An error as occured
                sys.error("> Error serving " + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end();
            } else { // The file was served successfully
                sys.puts("> " + request.url + " - " + res.message);
            }
        });
    });
};
http.createServer(serverHandler).listen(port);

sys.puts("> node-static is listening on port " + port);


/**
 * REVERSE PROXY
 */
httpProxy.createServer(function (req, res, proxy) {
	//
	// Put your custom server logic here
	//
	var fragments, url, proxyHost, proxyPort;
	fragments = req.url.split("__proxy__=");
	url = fragments[0];
	proxyHost = fragments[1];
	if (proxyHost) {
		fragments = proxyHost.split(":");
		proxyHost = fragments[0];
		proxyPort = fragments[1] || 80;
		req.url = url;
		proxy.proxyRequest(req, res, proxyPort, proxyHost);
	} else {
		proxy.proxyRequest(req, res, 8099, "localhost");
	}
}).listen(8100);

var http = require('http');

function encodeField(boundary, name, value) {
    var part = "--" + boundary + "\r\n";
    part += "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n";
    part += value + "\r\n";
    return part;
}

function log(message) {
	if(DocumentClusteringServer.debug)
		console.log("\033[33mnode-carrot2\033[m: " + message);
}

var DocumentClusteringServer = exports.DocumentClusteringServer = function(options) {
    if(!options) options = {};
    this.host = options.host || "localhost";
    this.port = options.port || 8080;
    this.algorithm = options.algorithm || "lingo";
    DocumentClusteringServer.debug = options.debug || false;

    return this;
}

DocumentClusteringServer.prototype.cluster = function cluster(search_result, algorithm, callback) {
	// check validity

	this.makeRequest(search_result, algorithm, callback);
};

DocumentClusteringServer.prototype.makeRequest = function makeRequest(search_result, algorithm, callback) {
	var boundary = Math.random();
	var data = '';

	data += encodeField(boundary, 'dcs.c2stream', search_result.toXML());
	data += encodeField(boundary, 'dcs.algorithm', algorithm);
	data += encodeField(boundary, 'dcs.output.format', 'JSON');
	data += "--" + boundary + "--";

	var options = {
		host: this.host,
		port: this.port,
		path: '/dcs/rest',
		method: 'POST',
		headers : {
			'Content-Type' : 'multipart/form-data; boundary=' + boundary,
			'Content-Length' : Buffer.byteLength(data)
		}
	};

	log("Request for " + search_result.query + " - algorithm: " + algorithm);

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		var body = "";

		res.on('data', function(chunk) {
			body += chunk;
		});

		res.on('end', function() {
			try {
				var output = JSON.parse(body);
			} catch(err) {
				throw err;
			}

			log("Request finished in " + output["processing-time-total"] + "ms");
			search_result.parseOutput(output);

			if(callback)
				callback(search_result);
		});
	});

	req.write(data);
	req.end();
};
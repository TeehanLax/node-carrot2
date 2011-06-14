var http = require('http'),
	SearchResult = require('./searchresult').SearchResult;

function encodeField(boundary, name, value) {
    var part = "--" + boundary + "\r\n";
    part += "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n";
    part += value + "\r\n";
    return part;
}

function validateAlgorithm(algorithm) {
	var result = algorithm || "lingo";
	result = result.toLowerCase();
	if(result!="lingo" || result!="stc" || result!="kmeans")
		result = "lingo";

	return result;
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
	algorithm = validateAlgorithm(algorithm);

	if(search_result.documents.length == 0) {
		if(callback)
			callback("No documents to cluster.", search_result)
	} else {
		var options = [
			{field:"dcs.c2stream", value:search_result.toXML()},
			{field:"dcs.algorithm", value:algorithm}
		];

		this.makeRequest(search_result, options, callback);
	}
};

DocumentClusteringServer.prototype.externalCall = function externalCall(query, results, algorithm, callback) {
	var search_result = new SearchResult( {query:query} );
	algorithm = validateAlgorithm(algorithm);

	var options = [
		{field:"dcs.source", value:"boss-web"},
		{field:"query", value:query},
		{field:"results", value:results},
		{field:"dcs.algorithm", value:algorithm}
	];

	this.makeRequest(search_result, options, callback);
};

DocumentClusteringServer.prototype.makeRequest = function makeRequest(search_result, options, callback) {
	var boundary = Math.random();
	var data = '';

	for(var i=0; i<options.length; i++) {
		data += encodeField(boundary, options[i].field, options[i].value);
	}

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

	log("Request for " + search_result.query + " sent");

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
				callback("Malformed JSON response.", search_result);
			}

			log("Request for " + search_result.query + " finished in " + output["processing-time-total"] + "ms");
			search_result.parseOutput(output);
			
			if(callback)
				callback(null, search_result);
		});
	});

	req.write(data);
	req.end();
};
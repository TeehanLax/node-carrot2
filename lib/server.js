var http = require('http'),
	SearchResult = require('./searchresult').SearchResult;

function encodeField(boundary, name, value) {
	var part = "--" + boundary + "\r\n";
	part += "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n";
	part += value + "\r\n";
	return part;
}

function validateAlgorithm(algorithm) {
	/*
	* lingo — Lingo Clustering(default)
	* stc — Suffix Tree Clustering
	* kmeans — Bisecting k-means
	* url — By URL Clustering
	* source — By Source Clustering
	*/

	algorithm = algorithm.toLowerCase();
	if(algorithm!="lingo" || algorithm!="stc" || algorithm!="kmeans")
		algorithm = "lingo";
	return algorithm;
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

DocumentClusteringServer.prototype.cluster = function cluster(search_result, params, attributes, callback) {
	if(!params) params = {};

	var algorithm = params.algorithm || "lingo";
	algorithm = validateAlgorithm(algorithm);

	var data_options = {};
	if(params.ids) data_options.ids = params.ids;
	if(params.max) data_options.max = params.max;
	var data = search_result.toXML(data_options);

	if(search_result.documents.length == 0) {
		if(callback)
			callback("No documents to cluster.", search_result)
	} else {
		var options = [
			{field:"dcs.c2stream", value:data},
			{field:"dcs.algorithm", value:algorithm}
		];

		this.makeRequest(search_result, options, attributes, callback);
	}
};

DocumentClusteringServer.prototype.externalCall = function externalCall(query, params, attributes, callback) {
	var search_result = new SearchResult( {query:query} );

	if(!params) params = {};

	/*
	* etools — eTools Metasearch Engine
	* bing-web — Bing Search
	* boss-web — Yahoo Web Search
	* wiki — Wikipedia Search (with Yahoo Boss)
	* boss-images — Yahoo Image Search
	* boss-news — Yahoo Boss News Search
	* pubmed — PubMed medical database
	* indeed — Jobs from indeed.com
	* xml — XML
	* google-desktop — Google Desktop search
	* solr — Solr Search Engine
	*/
	var source = params.source || "boss-web";
	var results = params.results || 100;

	var algorithm = params.algorithm || "lingo";
	algorithm = validateAlgorithm(algorithm);

	var options = [
		{field:"dcs.source", value:source},
		{field:"query", value:query},
		{field:"results", value:results},
		{field:"dcs.algorithm", value:algorithm}
	];

	if(attributes) {
		for(var i=0; i<attributes.length; i++) {
			options.push( {field:attributes[i].key, value:attributes[i].value} );
		}
	}

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

	var params = {
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

	var req = http.request(params, function(res) {
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
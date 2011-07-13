# node-carrot2 - Carrot2 DCS implementation for Node.js

This library requires the Carrot2 Document Clustering Server. Carrot2 is an open source clustering engine available at http://project.carrot2.org/index.html. Installation instructions and configuration can be found at http://project.carrot2.org/documentation.html.

Install the package:

	npm install carrot2

## General Use

This example is based on [examples/test.js](https://github.com/TeehanLax/node-carrot2/blob/master/examples/test.js). 

Include the package:

	var carrot2 = require('../lib/carrot2');

Create an instance of the server interface:

	var dcs = new carrot2.DocumentClusteringServer();

The server handles search result object's:

	var sr = new carrot2.SearchResult();
	sr.addDocument("Title", "http://www.site.com/", "This is a snippet.");

To cluster a search result, pass that object:

	dcs.cluster(sr, {algorithm:'lingo'}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:10},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0}
	], function(err, sr) {
	    if (err) console.log(err);
	    var cluster = sr.clusters;
	});

Alternatively, you can call roll:

	dcs.externalCall('my query', {algorithm:'stc'}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:10},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0}
	], function(err, sr) {
	    if (err) console.log(err);
		var cluster = sr.clusters;
	});

## Configuration

Talk about the configuration with

	code examples

## License

[See the file](https://github.com/TeehanLax/node-carrot2/blob/master/LICENSE)
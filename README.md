# node-carrot2 - Carrot2 DCS implementation for Node.js

This library requires the Carrot2 Document Clustering Server - an open source clustering engine available at http://project.carrot2.org/index.html. Installation instructions and configuration can be found at http://project.carrot2.org/documentation.html. Carrot2 was originally designed for clustering search results from web queries, and thus uses a "search result" metaphor (which we've upheld), but it can also be used for any small (a few thousand) collection of documents.

Install the package:

	npm install carrot2

## Basic Use

The basic use of node-carrot2 involves providing a set of documents to the cluster server and receiving a results object through a callback. For a complete example, refer to [examples/basic.js](https://github.com/TeehanLax/node-carrot2/blob/master/examples/basic.js). 

Include the package:

	var carrot2 = require('carrot2');

Create an instance of the DCS interface:

	var dcs = new carrot2.DocumentClusteringServer();

Create a search result object and populate it with documents (containing an ID, title, url, snippet, and optional custom parameters):

	var sr = new carrot2.SearchResult();
	sr.addDocument("ID", "Title", "http://www.site.com/", "This is a snippet.", {my_key1:my_value1, my_key2:my_value2});

To cluster a search result, call the `cluster` method:

	dcs.cluster(sr, {algorithm:'lingo'}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:10},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0}
	], function(err, sr) {
	    if (err) console.log(err);
	    var cluster = sr.clusters;
	});

For a complete list of customizable Carrot2 attributes, refer to the Component documentation: http://download.carrot2.org/head/manual/index.html#chapter.components. 

**NOTE:** Currently the DCS parameters object only supports `algorithm`. Possible algorithm's are:

* `lingo` — Lingo Clustering (default)
* `stc` — Suffix Tree Clustering
* `kmeans` — Bisecting k-means
* `url` — By URL Clustering
* `source` — By Source Clustering

## External Use

Alternatively, you can cluster an external search engine results with the `externalCall` method:

	dcs.externalCall('my query', {algorithm:'stc', source:"bing-web"}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:10},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0}
	], function(err, sr) {
	    if (err) console.log(err);
		var cluster = sr.clusters;
	});

The method structure is similar to `cluster`, however instead of a search result object you provide a string query. Also, the DCS parameters object supports a `source` key. Possible external sources include: 

* `etools` — eTools Metasearch Engine
* `bing-web` — Bing Search
* `boss-web` — Yahoo Web Search
* `wiki` — Wikipedia Search (with Yahoo Boss)
* `boss-images` — Yahoo Image Search
* `boss-news` — Yahoo Boss News Search
* `pubmed` — PubMed medical database
* `indeed` — Jobs from indeed.com
* `xml` — XML
* `google-desktop` — Google Desktop search
* `solr` — Solr Search Engine

## Results

Talk about the configuration with

	code examples

## License

[See the file](https://github.com/TeehanLax/node-carrot2/blob/master/LICENSE)
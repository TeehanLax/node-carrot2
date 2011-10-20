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

Create a `SearchResult` object and populate it with documents (containing an ID, title, url, snippet, and optional custom parameters):

	var sr = new carrot2.SearchResult();
	sr.addDocument("ID", "Title", "http://www.site.com/", "This is a snippet.", {my_key1:my_value1, my_key2:my_value2});

To cluster a `SearchResult`, call the `cluster` method:

	dcs.cluster(sr, {algorithm:'lingo'}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:10},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0}
	], function(err, sr) {
	    if (err) console.log(err);
	    var cluster = sr.clusters;
	});

For a complete list of customizable Carrot2 attributes, refer to the Component documentation: http://download.carrot2.org/head/manual/index.html#chapter.components. 

**NOTE:** Currently the DCS parameters object supports `algorithm`, `ids` (set of document id's to use - defaults to all), and `max` (maximum number of documents to supply). Possible algorithm's are:

* `lingo` — Lingo Clustering (default)
* `stc` — Suffix Tree Clustering
* `kmeans` — Bisecting k-means
* `url` — By URL Clustering
* `source` — By Source Clustering

## External Use

Alternatively, you can cluster an external search engine results by suppling a query `string` instead of a `SearchResult` to the `cluster` method. For a complete example, refer to [examples/external.js](https://github.com/TeehanLax/node-carrot2/blob/master/examples/external.js).

	dcs.cluster('my query', {algorithm:'stc', source:"bing-web"}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:10},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0}
	], function(err, sr) {
	    if (err) console.log(err);
		var cluster = sr.clusters;
	});

**NOTE:** The DCS parameters object supports `source` (search engine to use), and `results` (number of search results to grab from source). Possible external sources include: 

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

A `SearchResult` object returned in a cluster callback looks like:

	{ query: 'seattle',
	  cap: 100,
	  id_increment: 0,
	  documents: [ ... ],
	  documentHash: { ... },
	  idHash: {},
	  clusters: 
	   [ { id: '[\'Washington\']',
		  size: 13,
		  score: 39.551955526331575,
		  phrases: [ 'Washington' ],
		  documents: 
		   [ { id: 1 },
		     { id: 4 },
		     { id: 25 },
		     { id: 26 },
		     { id: 36 },
		     { id: 39 },
		     { id: 45 },
		     { id: 47 },
		     { id: 64 },
		     { id: 71 },
		     { id: 73 },
		     { id: 75 },
		     { id: 95 } ],
		  attributes: { score: 39.551955526331575 } }
		,

	...
		     
	  clusterHash: 
	   { '[\'Washington\']': 
	      { id: '[\'Washington\']',
		  size: 13,
		  score: 39.551955526331575,
		  phrases: [ 'Washington' ],
		  documents: 
		   [ { id: 1 },
		     { id: 4 },
		     { id: 25 },
		     { id: 26 },
		     { id: 36 },
		     { id: 39 },
		     { id: 45 },
		     { id: 47 },
		     { id: 64 },
		     { id: 71 },
		     { id: 73 },
		     { id: 75 },
		     { id: 95 } ],
		  attributes: { score: 39.551955526331575 } },
	     
	...
	     
	    } 
	}

For detailed documentation on Carrot2 JSON output reference http://download.carrot2.org/head/manual/index.html#section.architecture.output-json.

## License

[See the file](https://github.com/TeehanLax/node-carrot2/blob/master/LICENSE)
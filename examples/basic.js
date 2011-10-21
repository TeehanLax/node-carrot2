var fs = require('fs'),
	carrot2 = require('../lib/carrot2');

var fileContents = fs.readFileSync('./seattle.json','utf8'); 
var schema = JSON.parse(fileContents); 

var dcs = new carrot2.DocumentClusteringServer( {debug:true} );

var sr = new carrot2.SearchResult( {query:schema.searchresult.query, cap:200} );

for(var i=0; i<schema.searchresult.documents.length; i++) {
	var doc = schema.searchresult.documents[i];
	sr.addDocument(doc.title, doc.title, doc.url, doc.snippet, null);
}

dcs.cluster(sr, {algorithm:'lingo', max:200}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:20},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0},
            {key:"TermDocumentMatrixReducer.factorizationFactory", value:"org.carrot2.matrix.factorization.LocalNonnegativeMatrixFactorizationFactory"}
        ], function(err, sr) {
		
			if(err) console.error(err);
			console.log( sr.clusters );

		}
);
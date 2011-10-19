var fs = require('fs'),
	carrot2 = require('../lib/carrot2');

// Load JSON file with 200 entries related to Seattle
var fileContents = fs.readFileSync('./seattle.json','utf8'); 
var schema = JSON.parse(fileContents); 

// Create DCS server in debug mode
var dcs = new carrot2.DocumentClusteringServer( {debug:true} );

//
var sr = new carrot2.SearchResult( {query:schema.searchresult.query, cap:1000} );

//
for(var i=0; i<schema.searchresult.documents.length; i++) {
	var doc = schema.searchresult.documents[i];
	sr.addDocument(doc.title, doc.title, doc.url, doc.snippet, null);
}

//
/*
dcs.cluster(sr, {algorithm:'lingo', max:200}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:20},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0},
            {key:"TermDocumentMatrixReducer.factorizationFactory", value:"org.carrot2.matrix.factorization.LocalNonnegativeMatrixFactorizationFactory"}
        ], function(err, sr) {
		
			if(err) console.error(err);
			console.log( sr.clusters );

		}
);
*/

dcs.externalCall(
	"seattle", 
	null, 
	[ {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:20} ], 
	function(err, sr) {
		if(err) console.error(err);
		console.log(sr);
	}
);


/*

dcs.cluster(sr, {algorithm:'lingo', max:10}, [ 
            {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:5},
            {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0},
            {key:"TermDocumentMatrixReducer.factorizationFactory", value:"org.carrot2.matrix.factorization.LocalNonnegativeMatrixFactorizationFactory"}
        ], function(err, sr) {
	if(err) console.error(err);
	//console.log(sr.clusters);

	console.log( sr );
});

dcs.externalCall(
	"seattle", 
	null, 
	[ {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:20} ], 
	function(err, sr) {
		if(err) console.error(err);
		console.log(sr);
	}
);

=======
dcs.cluster(sr, {algorithm:'lingo'}, [ 
        {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:10},
        {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0}
], function(err, sr) {
    if (err) console.log(err);
    var cluster = sr.clusters;
});

dcs.externalCall('seattle', {algorithm:'stc'}, [ 
        {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:10},
        {key:"LingoClusteringAlgorithm.phraseLabelBoost", value:1.0}
], function(err, sr) {
    if (err) console.log(err);
	var cluster = sr.clusters;
});
>>>>>>> 1909e5f5a8095f0b82db882f282f7d1e3d13c539
*/

var carrot2 = require('../lib/carrot2');

// Create DCS server object in debug mode
var dcs = new carrot2.DocumentClusteringServer( {debug:true} );

//
dcs.cluster(
	"seattle", 
	{source:"bing-web"}, 
	[ {key:"LingoClusteringAlgorithm.desiredClusterCountBase", value:20} ], 
	function(err, sr) {
		if(err) console.error(err);
		console.log(sr.clusters[0]);
	}
);
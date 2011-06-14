var SearchResult = exports.SearchResult = function(options) {
	if(!options) options = {};
    this.query = options.query || null;
    this.cap = options.cap || 0;

    this.documents = [];
    this.documentHash = {};
    this.clusters = [];

    this.id_increment = 0;
    this.batching = false;
    this.tick = 0;

    return this;
}

SearchResult.XML_OPEN = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><searchresult>";
SearchResult.XML_QUERY_OPEN = "<query>";
SearchResult.XML_QUERY_CLOSE = "</query>";
SearchResult.XML_CLOSE = "</searchresult>";

SearchResult.prototype.addDocument = function addDocument(title, url, snippet) {
    var id = this.id_increment++;
    
    var doc = {
        id : id,
        title : title,
        url : url,
        snippet : snippet
    };

    this.documentHash[id] = doc;
    this.documents.push(doc);

    if(this.cap > 0) {
        if(this.documents.length == this.cap+1) {
            this.documents.shift();
        }
    }
};

SearchResult.prototype.getDocumentByID = function getDocumentByID(id) {
	return this.documentHash[id];
}

SearchResult.prototype.toXML = function toXML() {
    var result = SearchResult.XML_OPEN;

    if(this.query)
    	result += SearchResult.XML_QUERY_OPEN + this.query + SearchResult.XML_QUERY_CLOSE;

    for(var i=0; i<this.documents.length; i++) {
        result += "<document id=\"" +this.documents[i].id+ "\">";
        result += "<snippet>" +this.documents[i].snippet+ "</snippet>";
        result += "<url>" +this.documents[i].url+ "</url>";
        result += "<title>" +this.documents[i].title+ "</title>";
        result += "</document>";
    }

    result += SearchResult.XML_CLOSE;

    return result;
};

SearchResult.prototype.parseOutput = function parseOutput(data) {
    if(data.clusters) {
    	this.clusters = data.clusters;
    }
};

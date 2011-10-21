var SearchResult = exports.SearchResult = function(options) {
	if(!options) options = {};
    this.query = options.query || null;
    this.cap = options.cap || 0;

    // type is not set until a cluster is performed
    this.type = ""; 

    this.id_increment = 0;
    this.documents = [];
    this.documentHash = {};

    this.idHash = {};
    this.reset();

    return this;
};

SearchResult.prototype.addDocument = function addDocument(id, title, url, snippet, params) {

    if(!this.idHash[id]) {
        if(!params) params = {};

        var doc = {
            id : this.id_increment++,
            title : title,
            url : url,
            snippet : snippet,
            params : params
        };

        this.idHash[id] = doc.id;
        this.documentHash[doc.id] = doc;
        this.documents.push(doc);

        if(this.cap > 0) {
            if(this.documents.length == this.cap+1) {
                delete this.documentHash[this.documents.shift().id];
            }
        }
    } 
    
};

SearchResult.prototype.reset = function reset() {
    this.clusters = [];
    this.clusterHash = {};
};

SearchResult.prototype.getDocumentByID = function getDocumentByID(id) {
    return this.documentHash[id];
};

SearchResult.prototype.getIDsByComparison = function getIDsByComparison(param, operation, value) {
    var ids = [];
    var doc;

    for(var i=0; i<this.documents.length; i++) {
        doc = this.documents[i];

        if(doc.params[param]) {
            switch(operation) {
                case "<": if(doc.params[param] < value) ids.push(doc.id); break;
                case "<=": if(doc.params[param] <= value) ids.push(doc.id); break;
                case ">": if(doc.params[param] > value) ids.push(doc.id); break;
                case ">=": if(doc.params[param] >= value) ids.push(doc.id); break;
                case "!=": if(doc.params[param] != value) ids.push(doc.id); break;
                case "==": if(doc.params[param] == value) ids.push(doc.id); break;
                case "===": if(doc.params[param] === value) ids.push(doc.id); break;
            }
        }
    }

    return ids;
};

SearchResult.prototype.toXML = function toXML(options) {
    var ids, max, length, doc;
    if(!options) options = {};
    if(options.ids) ids = options.ids;
    if(options.max) max = options.max;

    if(max) {
        if(ids) 
            length = (max > ids.length) ? ids.length : max;
        else
            length = (max > this.documents.length) ? this.documents.length : max;
    }

    var result = SearchResult.XML_OPEN;

    if(this.query)
    	result += SearchResult.XML_QUERY_OPEN + this.query + SearchResult.XML_QUERY_CLOSE;


    for(var i=0; i<length; i++) {
        doc = (ids) ? this.documentHash[ids[i]] : this.documents[i];

        if(doc) {
            result += "<document id=\"" +doc.id+ "\">";
            result += "<snippet>" +doc.snippet+ "</snippet>";
            result += "<url>" +doc.url+ "</url>";
            result += "<title>" +doc.title+ "</title>";
            result += "</document>";
        }
    }

    result += SearchResult.XML_CLOSE;

    return result;
};

SearchResult.prototype.parseOutput = function parseOutput(data) {
    if(data && data.clusters) {

        for(var i=0; i<data.clusters.length; i++) {
            var incoming_cluster = data.clusters[i];

            for(var j=0; j<incoming_cluster.documents.length; j++) {
                if(incoming_cluster.score > 0){ 
                    // TODO: figure out most appropriate way to attach document array
                    //var doc = this.documentHash[incoming_cluster.documents[j]];
                    incoming_cluster.documents[j] = {id:incoming_cluster.documents[j]};
                } else {
                    delete data.clusters[i];
                }
            }

            incoming_cluster.id = serialize(incoming_cluster.phrases);
            var existing_cluster = this.clusterHash[incoming_cluster.id];

            if(existing_cluster) {
                existing_cluster.score = incoming_cluster.score;
                existing_cluster.documents = incoming_cluster.documents;
                existing_cluster.attributes = incoming_cluster.attributes;
                existing_cluster.size = incoming_cluster.size;
            } else {
                this.clusterHash[incoming_cluster.id] = incoming_cluster;
                this.clusters.push(incoming_cluster);
            }
        }

        this.clusters = data.clusters;

        if(this.type === SearchResult.TYPE_EXTERNAL) {
            this.documents = data.documents;
        }
    }
};

SearchResult.TYPE_BASIC = 0;
SearchResult.TYPE_EXTERNAL = 1;
SearchResult.XML_OPEN = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><searchresult>";
SearchResult.XML_QUERY_OPEN = "<query>";
SearchResult.XML_QUERY_CLOSE = "</query>";
SearchResult.XML_CLOSE = "</searchresult>";

function serialize(_obj)
{
   switch (typeof _obj)
   {
      case 'number':
      case 'boolean':
      case 'function':
         return _obj;
         break;

      case 'string':
         return '\'' + _obj + '\'';
         break;

      case 'object':
         var str;
         if (_obj.constructor === Array || typeof _obj.callee !== 'undefined')
         {
            str = '[';
            var i, len = _obj.length;
            for (i = 0; i < len-1; i++) { str += serialize(_obj[i]) + ','; }
            str += serialize(_obj[i]) + ']';
         }
         else
         {
            str = '{';
            var key;
            for (key in _obj) { str += key + ':' + serialize(_obj[key]) + ','; }
            str = str.replace(/\,$/, '') + '}';
         }
         return str;
         break;

      default:
         return 'UNKNOWN';
         break;
   }
};
var EventEmitter = require('events').EventEmitter;

var DocumentClusteringServer = exports.DocumentClusteringServer = function(host, port, options) {
    EventEmitter.call(this);

    var self = this;

    this.host = host || "localhost";
    this.port = port || 8080;

    if(!options) options = {};
    this.algorithm = options.algorithm || "lingo";
    this.debug = options.debug || false;

    return this;
}

DocumentClusteringServer.prototype = Object.create(EventEmitter.prototype);

DocumentClusteringServer.XML_OPEN = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><searchresult>";
DocumentClusteringServer.XML_QUERY_OPEN = "<query>";
DocumentClusteringServer.XML_QUERY_CLOSE = "</query>";
DocumentClusteringServer.XML_CLOSE = "</searchresult>";

DocumentClusteringServer.prototype.cluster = function cluster(search_result, options) {

};
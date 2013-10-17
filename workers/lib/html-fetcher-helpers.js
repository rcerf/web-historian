var fs = require('fs');
var http = require('http-get');

// Reads sites.txt and places each URL in that file into a callback
// In the spec, this callback places the URLs into an array.
// Our usage: readUrls is called from htmlfetcher with downloadUrls as the cb if the file has not yet been downloaded.
exports.readUrls = function(filePath, cb){
  var urls = [];

  var fileData = fs.readFileSync(filePath, {encoding:'utf8'});

  urls = fileData.split('\n');

  cb(urls);
};

// Given an array of URLs, grab the html at each one.
// Writing this html to disk at data/sites in the proper file (e.g. html for example2.com goes into data/sites/www.example2.com)
exports.downloadUrls = function(urls){

  if (urls) {
    for (var i = 0; i < urls.length; i++) {
      console.log("Downloading %s", urls[i]);
      http.get({url: urls[i]}, '../data/sites/' + urls[i]);
    }
  }
  return true;
};





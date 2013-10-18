var path = require('path'),
    fs   = require('fs'),
    url  = require('url');
module.exports.datadir = path.join(__dirname, "../data/sites.txt"); // tests will need to override this.

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "text/html"
};

var extend = function(obj, source) {
  for (var prop in source) {
    obj[prop] = source[prop];
  }
  return obj;
};


module.exports.sendResponse = sendResponse = function(response, data, status){
  status = status || 200;
  response.writeHead(status, headers);
  response.end(data);
};

module.exports.loadFile = loadFile = function(response, fileName, contentType){
  var newHeaders = {};
  extend(newHeaders, headers);
  newHeaders['Content-Type'] = contentType;
  response.writeHead(200, newHeaders);
  response.end(fs.readFileSync(fileName));
};

var collectData = function(request, callback) {
  var data = '';
  request.on('data', function(chunk){
    data += chunk;
  });
  request.on('end', function(){
    callback(data);
  });
};

module.exports.handleRequest = function (req, res) {

  var URLPath = url.parse(req.url).pathname;

  console.log(req.url);

  var routes = {
    '/'     : function() { loadFile(res, path.join(__dirname, 'public/index.html'), 'text/html'); }
  };

  switch ( req.method ) {
    case 'GET':
      if (URLPath !== '/') {
        routes[URLPath] = function(){ loadFile(res, path.join(__dirname, '../data/sites' + URLPath), 'text'); };
      }

      var sites = fs.readFileSync(path.join(__dirname, '../data/sites.txt')).toString();
      if (sites.indexOf(URLPath.slice(1)) > -1){
        routes[URLPath]();
      } else {
        sendResponse( res, null, 404 );
      }
      break;
    case 'POST':
      collectData(req, function(data){
        var fileContents = fs.readFileSync(module.exports.datadir, {encoding:'utf8'});
        var entry = data.slice(4);

        //check to see if the URL exists in sites.txt before writing it
        if(!fileContents.match(entry) && " "){
          var result = fileContents + entry + '\n';
          fs.writeFileSync(module.exports.datadir, result);
          sendResponse(res, "<h1>Please check back in a minute for your content</h1>", 302);
          console.log('It\'s saved!');
        }else if(fs.existsSync(path.join(__dirname, "../data/sites/" + entry))){
          loadFile(res, path.join(__dirname, "../data/sites/" + entry));
        }else{
          sendResponse(res, "<h1>Please check back in a minute for your content</h1>", 302);
        }

        //check to see if the file for the URL exists in '../data/sites/', if so load the HTML if not
        //send response to wait and minute and then try again while the cron job runs.
        sendResponse(res, undefined, 302);
      });
      break;
    case 'OPTIONS':
      break;
    default:
      // errors
      break;
  }
};

var path = require('path'),
    fs   = require('fs'),
    url  = require('url');
module.exports.datadir = path.join(__dirname, "../data/sites.txt"); // tests will need to override this.

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "application/json"
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
  response.end(JSON.stringify(data));
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

  var routes = {
    '/'     : function() { loadFile(res, path.join(__dirname, 'public/index.html'), 'text/html'); }
  };

  if (URLPath !== '/') {
    routes[URLPath] = function(){ loadFile(res, path.join(__dirname, '../data/sites' + URLPath), 'text'); };
  }

  var sites = fs.readFileSync(path.join(__dirname, '../data/sites.txt')).toString();
  if (sites.indexOf(URLPath.slice(1)) > -1){
    routes[URLPath]();
  } else {
    sendResponse( res, null, 404 );
  }

  switch ( req.method ) {
    case 'GET':
      break;
    case 'POST':
      collectData(req, function(data){
        var fileContents = fs.readFileSync(module.exports.datadir);
        var result = fileContents + data.slice(4) + '\n';
        fs.writeFileSync(module.exports.datadir, result);
        console.log('It\'s saved!');
        sendResponse(res, data, 302);
      });
      break;
    case 'OPTIONS':
      break;
    default:
      // errors
      break;
  }
};

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
  // var fileData = fs.readFileSync(fileName);
  // console.log(fileData);
  console.log(fileName);
  var newHeaders = {};
  extend(newHeaders, headers);
  newHeaders['Content-Type'] = contentType;
  response.writeHead(200, newHeaders);
  // response.write();
  response.end(fs.readFileSync(fileName));
};

module.exports.handleRequest = function (req, res) {

  var URLPath = url.parse(req.url).pathname;
  
  // console.log('route: ' + typeof URLPath);
  var routes = {
    '/'     : function() { loadFile(res, path.join(__dirname, 'public/index.html'), 'text/html'); }
  };

  if (URLPath !== '/') {
    routes[URLPath] = function(){ loadFile(res, path.join(__dirname, '../data/sites' + URLPath), 'text'); };
  }

  // console.log(Object.keys(routes));
  if (!path.join(__dirname, '../data/sites' + URLPath)) {
    sendResponse( res, null, 404 );
  }
  else {
    routes[URLPath]();
  }

  // // Route request methods here
  // switch ( req.method ) {
  //   case 'GET':
  //     break;
  //   case 'POST':
  //     break;
  //   case 'OPTIONS':
  //     break;
  //   default:
  //     // errors
  //     break;
  // }

  // res.writeHead( 200,  headers );
  // res.end('hello');

  // console.log(exports.datadir);
};

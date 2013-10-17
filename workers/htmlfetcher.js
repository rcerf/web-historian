var helpers = require('./html-fetcher-helpers.js');
var fs = require('fs');

// Every 1 minute, do the following with cron:
helpers.readUrls(path.join(__dirname, "../data/sites.txt"), helpers.downloadUrls);

// eventually, you'll have some code here that uses the tested helpers 
// to actually download the urls you want to download.


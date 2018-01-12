const Crawler = require('./Crawler.js').Crawler;

const argv = require('yargs').argv;

const serverNames = {
	mongoServerName : argv.mongo,
	rabbitServerName : argv.rabbit    
};


var crawler = new Crawler(serverNames);
crawler.start();

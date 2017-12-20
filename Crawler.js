const amqp = require('amqplib');
const winston = require('winston');
const wat_action = require('wat_action_nightmare');
const Nightmare = require('nightmare');

const crawling = require('./crawling.js');
const QUEUE_NAME = 'crawl_queue';
const TIME_OUT = 40000;

class Crawler{

	constructor(serverNames) {
		this.dbUrl = `mongodb://${serverNames.mongoServerName}:27018/wat_storage`;
		this.rmqUrl = `amqp://${serverNames.rabbitServerName}`;
		winston.info(`New Crawler (${this.dbUrl}) (${this.rmqUrl})`);
	}

	start() {
		winston.info('Crawler Started');
		amqp.connect(this.rmqUrl)
		.then(conn => {
			winston.info('connected');
			this.connection = conn;
			return conn.createConfirmChannel();
		})
		.then(ch => {
			winston.info('channel created');
			this.ch = ch;
			this.ch.assertQueue(QUEUE_NAME, { durable: true });
			winston.info('Queue Created');
			this.ch.prefetch(1);
			this.ch.consume(QUEUE_NAME, scenarioMsg => {
				if (scenarioMsg !== null) {
					playScenarioCrawler.call(this, scenarioMsg);
				}
			});
		})
		.catch(err => {
			winston.info(err);
			setTimeout(() => {
				this.start(); 
			}, 2000);
		});
	}

	stop() {
        this.isRunning = false;
    }

}

function playScenarioCrawler(scenarioMsg) {
	const scenarioContent = JSON.parse(scenarioMsg.content.toString());
	winston.info(`Crawler Begins To Play A Scenario : ${scenarioContent._id}`);
	// this.bid = scenarioContent.bid;
	
	scenarioContent.wait = 1000;

	const actions = createWATScenario(scenarioContent);
	const scenario = new wat_action.Scenario(actions);
	// this.abid = actions.length - 1;
	// console.log("abid is :"+this.abid);
	this.parameter = {"bid": scenarioContent.bid, "abid": actions.length - 1};

	var nightmare = new Nightmare({ show: true });
	scenario.attachTo(nightmare)
		.url()
		.end()
		.then((url) => {
			console.log(url);			
			crawling.crawlAndSave(this.dbUrl, url, this.parameter);
		})
		.catch((e) => {
			winston.info('crawl candidate encounter error!!! in gen_candi_actions method');
			winston.error(e);
		});	

}

function createWATScenario(scenario) {
	// var scenario = new wat_action.Scenario();
	// scenario.actions = scenarioActions;
	
	var wait = scenario.wait || 0;
	var cssSelector = scenario.cssselector || 'watId';
	var actions = [];
	winston.info(cssSelector);
	scenario.actions.forEach((action) => {
		var watAction = {
			type: action.type
		};
		watAction.url = action.url || undefined;
		watAction.text = action.text || undefined;
		if (action.selector) {
			watAction.selector = action.selector[cssSelector];
			if (actions.length
			&& action.type === 'TypeAction'
			&& actions[actions.length - 1].type === 'TypeAction'
			&& actions[actions.length - 1].selector === action.selector[cssSelector]) {
				actions.pop();
			}
		}
		actions.push(watAction);
	});

	if (wait > 0) {
		var actionsWithWait = [];
		for (let index = 0; index < actions.length ; index++) {
			actionsWithWait.push(actions[index]);
			actionsWithWait.push({
				type: 'WaitAction',
				ms: Number(wait)
			});
		}
		return actionsWithWait;
	} else {
		return actions;
	}
}

module.exports.Crawler = Crawler;
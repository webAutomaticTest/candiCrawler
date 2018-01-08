const winston = require('winston');
const amqp = require('amqplib');
const wat_action = require('wat_action_nightmare');
const QUEUE_NAME = 'crawl_queue';

module.exports.init = function(serverNames, webServer) {
	const rmqUrl = `amqp://${serverNames.rabbitServerName}`;
	
	webServer
	.post('/crawlNow/', (req, res) => {
		var firstPromise = req.body;
		var secondPromise = amqp.connect(rmqUrl)
		.then( conn => {
			return conn.createConfirmChannel();
		})
		.catch( e=> {
			return Promise.reject(e);
		});

		Promise.all([firstPromise,secondPromise])
		.then(promizesResults => {
			var msg = JSON.stringify(promizesResults[0]);
			winston.info(`msg is ${msg}`);

			var channel = promizesResults[1];
			channel.assertQueue(QUEUE_NAME, { durable: true })
			.then(ok => {
				if (ok) {
					return channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), {persistent: true});
				} else {
					return Promise.reject(ok);
				}
			})
			.then(() => {
				channel.close();
				res.status(200).send(`play request sent for scenario ${msg}`).end();
			})
			.catch ((err) =>{
				channel.close();
				winston.error(err);
				res.status(500).send(`play request cannot be sent : ${err}`);
			});

		})
		.catch(err => {
			console.log(err);
			res.status(500).send(err).end();
		});
	});

};
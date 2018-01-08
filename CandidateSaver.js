const MongoClient = require('mongodb').MongoClient;
const winston = require('winston');
const async = require('async');

class CandidateSaver{
	constructor(dbUrl, scenario, parameter) {
		this.dbUrl = dbUrl;
		this.scenario = scenario;
		this.parameter = parameter;
		this.actions = [];		
	}

	addAction(action) {
		this.actions.push(action);
	}

	async saveCandidateActions(){
		var promise = new Promise( async (resolve, reject) => {
			winston.info(`begin to save the crawled actions into: ${this.dbUrl}`);
			MongoClient.connect(this.dbUrl)
			.then(db => {
				db.collection('action', async (err, actionCollection) => {
					if (err) {
						winston.error(err);
						db.close();
						reject(err);
					} else {				
						var scenarioActions = await this.scenario.actions;    

						await scenarioActions.forEach( async (action, index, array) => {

							var actionItem = {};
							actionItem.action = action;						
							await actionCollection.findOneAndReplace({ 'action': actionItem.action }, actionItem, { upsert: true })
							.then(async (savedAction) => {
								if (savedAction.value !== null) {
									actionItem.aid = savedAction.value._id;
								} else {
									actionItem.aid = savedAction.lastErrorObject.upserted;
								}
								await this.addAction(actionItem);							

							}).catch(err => {
								winston.error(err);
								reject(err);
							});

							if (index === (array.length -1)){
								await db.close();
								await resolve(true);
							}

						});

					}
				});

			})
			.catch(err => {
				winston.info(err);
				reject(err);
			});
		});

		promise.then( async (actionsArray) => {
			if (actionsArray) {
				this.saveCandidates();
			} else {
				winston.info(`err, will not save candidate`);
			}
		});

	}

	async saveCandidates(){
		MongoClient.connect(this.dbUrl)
		.then(db => {
			db.collection('candidate', async (err, candidateCollection) => {
				if (err) {
					winston.info(`connect table candidate is error!!`);
					winston.error(err);
					db.close();
				} else {
					var promiseSaveEachCandidate = [];

					for (let i = 0; i < this.actions.length; i++) {

						var can_action = {};
						can_action.bid = await this.parameter.bid;
						can_action.abid = await this.parameter.abid;
						can_action.aid = await this.actions[i].aid;
						can_action.action = await this.actions[i].action;

						await promiseSaveEachCandidate.push(
							candidateCollection.findOneAndReplace(
							{ 
								'bid': can_action.bid,
								'abid': can_action.abid,
								'aid': can_action.aid,
								'action': can_action.action 
							},
							can_action,
							{ upsert: true }
							)
							);

					}

					Promise.all(promiseSaveEachCandidate).then(() => {
						console.log("Success to save all candidate actions");
						db.close();
						return Promise.resolve();
					});
				}
			});
		})
		.catch(err => {
			winston.info(err);
		});
	}	

}

module.exports.CandidateSaver = CandidateSaver;


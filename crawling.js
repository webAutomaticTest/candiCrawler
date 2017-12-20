
function crawlAndSave(dbUrl, url, parameter){

	const Nightmare = require('nightmare');
	const Promise = require('promise');
	const htmlAnalysis = require('./htmlAnalysis.js');
	const watlib = require('wat_action_nightmare');
	var nightmare = new Nightmare({ show: false });
	var saveCandidateActions = require('./saveCandidateActions.js');
	var scenario = new watlib.Scenario();
	this.parameter = parameter;

	nightmare.goto(url).screenshot()
	.then(() => {
		return nightmare.evaluate(htmlAnalysis).end();
	}).then(analysisResult => {

		analysisResult.inputText.forEach(inputText => {
			scenario.addAction(new watlib.TypeAction(inputText.selector,"inputText"));
		});

		analysisResult.inputPassword.forEach(inputPassword => {
			scenario.addAction(new watlib.TypeAction(inputPassword.selector,"inputPassword"));
		});

		analysisResult.textarea.forEach(textarea => {
			scenario.addAction(new watlib.TypeAction(textarea.selector,"textarea"));
		});

		analysisResult.selectorsA.forEach(selectorsA => {
			scenario.addAction(new watlib.ClickAction(selectorsA.selector));
		});

		analysisResult.inputToClick.forEach(inputToClick => {
			scenario.addAction(new watlib.ClickAction(inputToClick.selector));
		});

		// scenarioJson = JSON.stringify(JSON.parse(scenario.toJSON()),null,2);
		
		saveCandidateActions.saveCandidateActions(scenario, this.parameter);
		
		// return Promise.resolve(scenario);

		
	}).catch(err => {
		console.log("err in crawl_action ! crawl");
		console.log(err);
	});

}

exports.crawlAndSave = crawlAndSave;
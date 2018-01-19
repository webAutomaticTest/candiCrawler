
async function crawlAndSave(dbUrl, url, parameter){

	const Nightmare = require('nightmare');
	const htmlAnalysis = require('./htmlAnalysis.js');
	const watlib = require('wat_action_nightmare');
	var nightmare = new Nightmare({ show: false });
	// var saveCandidateActions = require('./saveCandidateActions.js');
	const CandidateSaver = require('./CandidateSaver.js').CandidateSaver;

	var scenario = new watlib.Scenario();
	this.parameter = parameter;

	await nightmare.goto(url).screenshot()
	.then(() => {
		return nightmare.evaluate(htmlAnalysis).end();
	})
	.then( async (analysisResult) => {

		await analysisResult.inputText.forEach(inputText => {
			scenario.addAction(new watlib.TypeAction(inputText.selector,"inputText"));
		});

		await analysisResult.inputPassword.forEach(inputPassword => {
			scenario.addAction(new watlib.TypeAction(inputPassword.selector,"inputPassword"));
		});

		await analysisResult.textarea.forEach(textarea => {
			scenario.addAction(new watlib.TypeAction(textarea.selector,"textarea"));
		});

		await analysisResult.selectorsA.forEach(selectorsA => {
			scenario.addAction(new watlib.ClickAction(selectorsA.selector));
		});

		await analysisResult.inputToClick.forEach(inputToClick => {
			scenario.addAction(new watlib.ClickAction(inputToClick.selector));
		});

		scenarioJson = await JSON.stringify(JSON.parse(scenario.toJSON()),null,2);
		await console.log("crawl actions result in scenarioJson format: ");
		// console.log(scenarioJson);
		
		
		var candidateSaver = new CandidateSaver(dbUrl, scenario, parameter);
		await candidateSaver.saveCandidateActions();
				
	})
	.catch(err => {
		console.log("err in crawl_action ! crawl");
		console.log(err);
	});

}

exports.crawlAndSave = crawlAndSave;
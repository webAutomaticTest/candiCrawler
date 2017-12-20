const Promise = require('promise');
const request_promise = require('request-promise');


function saveCandidateActions(scenario, parameter){//input scenario and save its actions elements => action table and candidate table
	var scenarioActions = scenario.actions;
	for (var i = 0; i <= scenarioActions.length - 1; i++) {
		var actionResult = postSaveActions(scenarioActions[i], parameter);		
	}
}


function postSaveActions(baseAction, parameter){
	request_promise({
		method: 'POST',
		uri: 'http://localhost:8086/action/',
		body: baseAction,
		json: true
	})
    .then(function (parsedBody) {// POST succeeded...
    	
    	if(parsedBody.value !== null){
    		this.aid = parsedBody.value._id;
    	} else {
    		this.aid = parsedBody.lastErrorObject.upserted;
    	}

    	postSaveCandidate(baseAction, parameter, this.aid);

    })
    .catch(function (err) {// POST failed...
    	console.log(err);
    });
}

function postSaveCandidate(candidateActionJson, parameter, aid){
	request_promise({
		method: 'POST',
		uri: 'http://localhost:8086/candidate/',
		body: { "candidateActionJson": candidateActionJson , "bid": parameter.bid, "abid": parameter.abid, "aid": aid},
		json: true
	})
    .then(function (parsedBody) {// POST succeeded...    	
    	return Promise.resolve(parsedBody);
    })
    .catch(function (err) {// POST failed...
    	console.log(err);
    	return Promise.reject(err);
    });
}

// function saveCandidateActions(scenario, parameter){//input candidates and save its elements
// 	var scenarioActions = scenario.actions;
// 	for (var i = 0; i <= scenarioActions.length - 1; i++) {
// 		postSaveCandidate(scenarioActions[i],parameter);
// 	}
// }

exports.saveCandidateActions = saveCandidateActions;


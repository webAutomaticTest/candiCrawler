const request_promise = require('request-promise');
const requestUrl = 'http://localhost';

async function saveCandidateActions(scenario, parameter){//input scenario and save its actions elements => action table and candidate table
	var scenarioActions = scenario.actions;    
	for (var i = 0; i <= scenarioActions.length - 1; i++) {
        console.log(scenarioActions[i]);
		var actionResult = await postSaveActions(scenarioActions[i], parameter);		
	}
}

function postSaveActions(baseAction, parameter){
	request_promise({
		method: 'POST',
		uri: requestUrl + ':8086/action/',
		body: baseAction,
		json: true
	})
    .then(async (parsedBody) =>{// POST succeeded...

        console.log(parsedBody);
    	
    	if(parsedBody.value !== null){
    		this.aid = await parsedBody.value._id;
    	} else {
    		this.aid = await parsedBody.lastErrorObject.upserted;
    	}

    	await postSaveCandidate(baseAction, parameter, this.aid);

    })
    .catch(function (err) {// POST failed...
    	console.log(err);
    });
}

function postSaveCandidate(candidateActionJson, parameter, aid){
	request_promise({
		method: 'POST',
		uri: requestUrl + ':8086/candidate/',
		body: { "candidateActionJson": candidateActionJson , "bid": parameter.bid, "abid": parameter.abid, "aid": aid},
		json: true
	})
    .then(function (parsedBody) {// POST succeeded...	
    	// return Promise.resolve(parsedBody);
    })
    .catch(function (err) {// POST failed...
    	console.log(err);
    	// return Promise.reject(err);
    });
}

exports.saveCandidateActions = saveCandidateActions;


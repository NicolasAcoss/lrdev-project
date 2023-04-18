// Following example uses public Countries GraphQL API 
load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36"
    };

    let countriesQuery = `{  
        countries {
                name
                code
        }
    }`;
	
	const webResponse1 = new load.WebRequest({
        id: 1,
        url: "https://countries.trevorblades.com/",
        method: "POST",
        headers: {
            "Origin": "https://countries.trevorblades.com",
            "Referer": "https://countries.trevorblades.com/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "accept": "*/*",
            "content-type": "application/json"
        },
        body: {
            "operationName":null,
            "variables":{},
            "query": countriesQuery
        },
		extractors: [
        	new load.JsonPathExtractor("countryCode", {"path":  "$.data.countries[*].code", "returnMultipleValues": true}),
 		],
    }).sendSync();

	    
    let index = Math.floor(Math.random() * webResponse1.extractors['countryCode'].length);
    let randomCountry = webResponse1.extractors['countryCode'][index];
    load.log("Selected country: "+randomCountry);
	
    let countryQuery = `{  
        country(code: "${randomCountry}") {
            name
            native
            capital
            emoji
            currency
            languages {
                    code
                    name
            }
        }
    }`;
     
    const webResponse2 = new load.WebRequest({
        id: 2,
        url: "https://countries.trevorblades.com/",
        method: "POST",
        headers: {
            "Origin": "https://countries.trevorblades.com",
            "Referer": "https://countries.trevorblades.com/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "accept": "*/*",
            "content-type": "application/json"
        },
        body: {
            "operationName":null,
            "variables":{},
            "query": countryQuery
        },
      	extractors: [
	       	new load.JsonPathExtractor("country", {"path":  "$.data.country"}),
 		],          
    }).sendSync();

	let country = webResponse2.extractors['country'];
	load.log("Country name: " + country.name);
	load.log("Country capital: " + country.capital);
	load.log("Country currency: " + country.currency);
});

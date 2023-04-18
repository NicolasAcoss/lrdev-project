load.initialize("Initialize", async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    };
    
    let Login = new load.Transaction("Login");
    let GetToken = new load.Transaction("GetToken");
    let GetAvailblePetsList = new load.Transaction("GetAvailblePetsList");
    let GetMyPet = new load.Transaction("GetMyPet");
    
	let d =  Date();
	let state = load.utils.base64Encode(d);
		
	Login.start();

    const authorize = new load.WebRequest({
        id: 1,
        url: "https://petstore.swagger.io/oauth/authorize",
        method: "GET",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Referer": "https://petstore.swagger.io/",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1"
        },
        queryString: {
            "response_type": "token",
            "client_id": "test",
            "redirect_uri": "https://petstore.swagger.io/oauth2-redirect.html",
            "scope": "read:pets write:pets",
            "state": `${state}` //"V2VkIEp1bCAwOCAyMDIwIDEwOjI4OjI4IEdNVCswMzAwIChJc3JhZWwgRGF5bGlnaHQgVGltZSk="
        },
    }).sendSync();

    const oauthLogin = new load.WebRequest({
        id: 2,
        url: "http://petstore.swagger.io/oauth/login",
        method: "POST",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate",
            "Cache-Control": "max-age=0",
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "http://petstore.swagger.io",
            "Proxy-Connection": "keep-alive",
            "Referer": "http://petstore.swagger.io/oauth/login.jsp",
            "Upgrade-Insecure-Requests": "1"
        },
        body: {
            "username": "test",
            "password": "abc123",
            "login": ""
        },
    }).sendSync();

	GetToken.start();
	
    const oauthToken = new load.WebRequest({
        id: 3,
        url: "http://petstore.swagger.io/oauth/authorize",
        method: "POST",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate",
            "Cache-Control": "max-age=0",
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "http://petstore.swagger.io",
            "Proxy-Connection": "keep-alive",
            "Referer": `http://petstore.swagger.io/oauth/authorize?response_type=token&client_id=test&redirect_uri=https%3A%2F%2Fpetstore.swagger.io%2Foauth2-redirect.html&scope=read%3Apets%20write%3Apets&state=${state}`,
            "Upgrade-Insecure-Requests": "1"
        },
        body: {
            "user_oauth_approval": "true",
            "scope.read:pets": "true",
            "scope.write:pets": "true",
            "authorize": "Authorize"
        },
        extractors: [
            // Source='Record scan' Original value="aa4c6f2c-8a80-4ffa-933b-1cd85b0a1484"
            new load.BoundaryExtractor("token", {
                leftBoundary: "#access_token=",
                rightBoundary: "&",
                scope: "headers"
            }), 
        ],
    }).sendSync();

	GetToken.stop();
	Login.stop();

	
	// Adding Bearer Authorization header for all subsequent requests
	load.WebRequest.defaults.headers['authorization'] = `Bearer ${oauthToken.extractors['token']}`;
    	
	// Performe findPetsByStatus call and extracte all available pets with id < 10000
	GetAvailblePetsList.start();
    const findPetsResponse = new load.WebRequest({
        id: 4,
        url: "https://petstore.swagger.io/v2/pet/findByStatus",
        method: "GET",
        headers: {
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Referer": "https://petstore.swagger.io/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "accept": "application/json"
        },
        queryString: {
            "status": "available"
        },
        extractors: [
          new load.JsonPathExtractor("id",'$.[?(@.id < 10000)].id',true),            
        ],
    }).sendSync();
	GetAvailblePetsList.stop();


	// Calculate random pet id from extracted list of findPetsByStatus call
    let index = Math.floor(Math.random() * findPetsResponse.extractors['id'].length);
    let myPet = findPetsResponse.extractors['id'][index];
	load.log(`Looking for pet with id: [${myPet}] (${index})`);
             
			 
	// Performe getPetById API call using previously calculated random pet id 
	GetMyPet.start();
    const randomPetResponse = new load.WebRequest({
        id: 5,
        url: `https://petstore.swagger.io/v2/pet/${myPet}`,
        method: "GET",
        returnBody: true,
        headers: {
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Referer": "https://petstore.swagger.io/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "accept": "application/json"
        },
		extractors: [
 			new load.JsonPathExtractor("petName",'$.name'),
			new load.TextCheckExtractor("petId", { text: `${myPet}`, failOn: false, scope: load.ExtractorScope.Body }),
 		],
    }).sendSync();
	GetMyPet.stop();

	load.log(`My pet name is: "${randomPetResponse.extractors['petName']}".`);
	
});

load.finalize("Finalize", async function () {
});

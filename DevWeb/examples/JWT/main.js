load.action("Action", async function () {
    // Example of generating JWT token
	
	let header = {
		"alg": "HS256", 
		"typ": "JWT" 
	};
	
	let payload = {
		"sub": "1234567890", 
		"name": "John Doe", 
		"iat": 1516239022 
	};
	
	let secretKey = load.unmask("EaRk2iUyhRPd0NYTzWLEZ4AGG4BAiL3kjpXUDug+SXf6cgj4aarCSnmVdew=");
	
	let headerBase64 = load.utils.base64Encode(JSON.stringify(header), { base64URL: true, noPadding: true });
	let payloadBase64 = load.utils.base64Encode(JSON.stringify(payload), { base64URL: true, noPadding: true });
	let stringToSign = headerBase64 + "." + payloadBase64;
	
	let jwtToken = load.utils.hmac(load.HashAlgorithm.sha256, secretKey, stringToSign, load.HashOutputEncoding.base64RawURL);
	load.log("Generated jwt token: " + jwtToken);
});
load.initialize('Initialize', async function() {

	load.WebRequest.defaults.returnBody = false;
	load.WebRequest.defaults.headers = {
        "User-Agent": "DevWeb vuser",
        "Connection": "Keep-Alive",
    };

	/*
		Example access keys.
		AWSAccessKeyId:		AKIAIOSFODNN7EXAMPLE
		AWSSecretAccessKey:	wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
	*/


	load.setUserCredentials(new load.AWSAuthentication(load.AWSProviderType.Static, {
		accessKeyID: "AKIAIOSFODNN7EXAMPLE",
		secretAccessKey: load.unmask("ThdWeKQtQFo+IxLUFCzbxyQK6bD4GXHkGWIMVEAoi67JWQ7VnyYDnZO5D/+MXo+G7zYhE+n3qj3FlU0PrkfXLh8wbew="),
	}));

	load.WebRequest.defaults.awsSigning = { region: "my-region", service: "s3" }; 	
  	                	
});


load.action("Main Action", async function () {
	
	let fileName = `${load.utils.uuid()}.txt`;
	let fileContent = load.utils.randomString(Math.floor(Math.random() * 4000) + 1000);	

    const putObject = new load.WebRequest({
        id: 1,
        url: `https://examplebucket.s3-my-region.amazonaws.com/${fileName}`,
        method: "PUT",
		headers: {
            "Content-Type": "text/plain",
			"x-amz-meta-author": "DevWeb vuser",
			"Expect": "100-continue"
        },			
		body: fileContent,
    }).sendSync();
	
	load.sleep(5);
		
	const getObject = new load.WebRequest({
        id: 2,
        url: `https://examplebucket.s3-my-region.amazonaws.com/${fileName}`,
        method: "GET",
    }).sendSync();

	load.sleep(15);

	const deleteObject = new load.WebRequest({
        id: 3,
        url: `https://examplebucket.s3-my-region.amazonaws.com/${fileName}`,
        method: "DELETE",
		headers: {
            "Content-Type": "text/plain",
        },			
    }).sendSync();

	load.sleep(5);
	
	const checkObject = new load.WebRequest({
        id: 4,
        url: `https://examplebucket.s3-my-region.amazonaws.com/${fileName}`,
        method: "GET",
		handleHTTPError: function (response) {
            if (response.status === 404) {
                return false; // Deleted object doesn't exist -  expected behavior
            }
        }		
    }).sendSync();

});

load.finalize('Finalize', async function() {
	
});
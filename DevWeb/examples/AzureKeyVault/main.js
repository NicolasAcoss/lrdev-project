// Azure keyvault integration
// Usage:
// 1. from terminal run the following command `DevWebUtils <ClientSecret>` and store the output and use it in the script.
// 2. azure function order:
// 		a. let clientSecret = load.unmask("<the_stored_output>")
// 		b. let token = load.azure.getToken(<vaultName>, <tokenID>, <clientID>, clientSecret);
// 		c. let value = load.azure.getSecret(<secretName>, token);
// i.e:

load.initialize('Action', async function() {
	let secret = load.unmask("TdwierP6vIfkd4qi+o8wtIWB2B97NqF/btki91k+O+aNQ2TsDbjyc=");
	load.global.token = load.azure.getToken("demoVault", "000-0000-43d3-5555-0001ba9ca000",
		"12345-24a7-48b3-123-1234", secret);
});

load.action('Action', async function() {
	let secretValue = load.azure.getSecret("demoSecret", load.global.token);
	load.log(`secret value ${secretValue}`);
});

load.finalize(async function () {
});

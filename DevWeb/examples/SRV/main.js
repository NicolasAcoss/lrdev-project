load.action('Action', async function() {
	// Add aditional functionality to our sdk that will perform SRV lookup.
	// Should look like:
	// load.net.lookupService(<service>,<protocol>,<domain>);
	// command: nslookup -type=SRV _myservice._tcp.example.com
	let hostname = load.net.lookupService('myservice', 'tcp', 'example.com');
	let request = new load.WebRequest({
	    id: 1,
	    url: `https://${hostname}`,
	    method: `GET`
	});
});

load.action('Action', async function() {

	let helloService = new load.GrpcClient({
        host: "grpcb.in:9000",
        isInsecure: true,
		defaults: {
			protoFile: "./proto/hello.proto", 			
			headers: {
				"User-Agent": "DevWeb vuser"
			}
		}
    });	

	let addService = new load.GrpcClient({
        host: "grpcb.in:9001",
        isInsecure: false,
        ignoreBadCertificate: true,
		defaults: {
			protoFile: "./proto/addsvc.proto", 			
			headers: {
				"User-Agent": "DevWeb vuser"
			}
		}
    });	
            
	let _sayHello = helloService.unaryRequest({
        id: 1,
		method: "hello.HelloService.SayHello",
		body: {
			"greeting": `DevWeb_${load.utils.randomString(64)}`	
		},
		extractors: [
		    new load.JsonPathExtractor("myReply", "$.reply")
		]	
	}).sendSync();	            	
            	
	load.log(`SayHello reply: [${load.extractors['myReply']}]`);   
	
	load.log(`Response status is: [${_sayHello.status}]`);
	load.log(`Response size is: [${_sayHello.size}] bytes`);
	load.log(`Response time is: [${_sayHello.duration}] ms`);
	
	let _lotsOfGreetings = helloService.clientStreamRequest({
        id: 2,
		method: "hello.HelloService.LotsOfGreetings",
		bodyArray: [
			{ "greeting" : `DevWeb_${load.utils.randomString(16)}` },
			{ "greeting" : `DevWeb_${load.utils.randomString(16)}` },
			{ "greeting" : `DevWeb_${load.utils.randomString(16)}` },
			{ "greeting" : `DevWeb_${load.utils.randomString(16)}` },
			{ "greeting" : `DevWeb_${load.utils.randomString(16)}` }
		],
		extractors: [
		    new load.JsonPathExtractor("myReplies", "$.reply"),
		]			
	}).sendSync();	            	

	load.log(`Server's reply: [${load.extractors['myReplies']}]`);

	load.log(`Response status is: [${_lotsOfGreetings.status}]`);
	load.log(`Response size is: [${_lotsOfGreetings.size}] bytes`);
	load.log(`Response time is: [${_lotsOfGreetings.duration}] ms`);


	         
	load.sleep(2.5);         
	         
	let number1 = Math.floor(Math.random() * 100) + 1;
	let number2 = Math.floor(Math.random() * 100) + 1;
	
	let _sum = addService.unaryRequest({
        id: 3,
		method: "addsvc.Add.Sum",
		body: {
			"a" : number1,
			"b" : number2			
		},
		extractors: [
		    new load.JsonPathExtractor("mySum", "$.v")
		]	
	}).sendSync();	            	
            	
	load.log(`${number1} + ${number2} = ${load.extractors['mySum']}`);	

	load.log(`Response status is: [${_sum.status}]`);
	load.log(`Response size is: [${_sum.size}] bytes`);
	load.log(`Response time is: [${_sum.duration}] ms`);

	         
	         
	let string1 = load.utils.randomString(6, { custom: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
	let string2 = load.utils.randomString(4, { custom: "abcdefghijklmnopqrstuvwxyz" });         
	         
	let _concat = addService.unaryRequest({
        id: 4,
		method: "addsvc.Add.Concat",
		body: {
			"a" : string1,
			"b" : string2			
		},
		extractors: [
		    new load.JsonPathExtractor("myString", "$.v")
		]	
	}).sendSync();	            	
            	
	load.log(`${string1}${string2} = ${load.extractors['myString']}`);	         
	         
	load.log(`Response status is: [${_concat.status}]`);
	load.log(`Response size is: [${_concat.size}] bytes`);
	load.log(`Response time is: [${_concat.duration}] ms`);
            	
            	
});

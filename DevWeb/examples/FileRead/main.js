load.initialize(async function () {
});

load.action("Action", async function () {
    let txtFileName = "abc.txt";
    let xmlFileName = "/buffer/big.xml";

    const myText = new load.File(txtFileName);
    const myXml = new load.File(xmlFileName);

    const txtReadResult = myText.read({forceRead: true, returnContent: true});

    const xmlReadResultPlus = myXml.read(
        {
            returnContent: false,
            extractors: [
                new load.XpathExtractor("email", "//items[56]/email") // marsha@mcmahon.vg
            ]
        }
    );

    load.log(`Data size for file loaded with option "returnContent" =  true :[${txtReadResult.content.length}]`);
    load.log(`Data size for file loaded with option "returnContent" =  false :[${xmlReadResultPlus.content.length}]`);
    load.log(`Extracted value is: [${xmlReadResultPlus.extractors.email}]`);
	
	const myImage = new load.File('dw.png');
    const imageReadResult = myImage.read(
		{
			forceRead: true,
			returnContent: true,
			isBinaryContent: true
		}
	);
  
	load.log(`Image size:[${imageReadResult.content.length}]`);
	
});

load.finalize(async function () {
});

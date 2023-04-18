load.initialize(async function () {
    load.WebRequest.defaults.headers = {
        "User-Agent": "LoadRunner DevWeb vuser",
        "Accept-Encoding": "gzip, deflate",
        "Pragma": "no-cache",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ru;q=0.8,he;q=0.7",
        "Cache-Control": "no-cache",
        "Upgrade-Insecure-Requests": "1"
    };
    load.WebRequest.defaults.returnBody = false;
});

load.action("Action", async function () {
    const company = `${load.params.COMPANY}`;
    const index = `${load.params.INDEX}`;
    let updatesAmount = 0;

    // Websocket incoming sample message format U,1,7,|14.9|16:46:29|-3.18|29500|14.9|14.96|31500|^4
    const messageFormatRegExp = new RegExp(`U,1,${index},[|]([0-9]*\\.?[0-9]*)[|]`, `i`);
    const relevantData = `U,1,${index},|`;

    let messageHandler = function (message) {
        const buffer = `${message.data}`;
        const isMyData = buffer.includes(relevantData);

        if (isMyData) {
            const number = Number(buffer.match(messageFormatRegExp)[1]);
            if (number > 0) {
                load.log('######: ' + number);
                load.utils.reportDataPoint(`${company} stock value`, number);
                updatesAmount++;
            }
        }
    };

    let openHandler = function (response) {
        const status = response.status;
        const accept = response.headers['Sec-Websocket-Accept'];
        load.log(`Connected. Status: [${status}]. Sec-Websocket-Accept: [${accept}] on ${socket.id}`, load.LogLevel.info);
    };

    let closeHandler = function (message) {
        load.log(`Got close message with code: ${message.code} on ${socket.id}`, load.LogLevel.info);
        load.log(`There were ${updatesAmount} updates of stock values for :[${company}][${index}]`);
    };

    let errorHandler = function (message) {
        const msg = JSON.stringify(message);
        load.log(`Error details:  ${msg}`, load.LogLevel.error);
    };

    const homepage = new load.WebRequest({
        id: 1,
        url: "https://demos.lightstreamer.com/StockListDemo_Basic/",
        method: "GET",
        resources: [
            "https://demos.lightstreamer.com/StockListDemo_Basic/css/table.css",
            "https://demos.lightstreamer.com/commons/require.js",
            "https://demos.lightstreamer.com/commons/extra.js"
        ]
    });

    await homepage.send();

    
//  when LS_cid value is not found, look into the server response for string 'LS_cid="+q.' and update left boundary with the new value that appeares after it...
    
    const lightstreamer_js = new load.WebRequest({
        id: 2,
        url: "https://demos.lightstreamer.com/commons/lightstreamer.min.js",
        method: "GET",
        headers: {
            "Referer": "https://demos.lightstreamer.com/StockListDemo_Basic/"
        },
        returnBody: true,
        extractors: [
            new load.BoundaryExtractor("LB_value", {
                leftBoundary: "LS_cid=\"+q.",
                rightBoundary: "+\"&\"",
                scope: "body"
            }), 

        ],

    });

    let myData = await lightstreamer_js.send();
    load.log(myData.body.length);
    
    let LS_cid = load.utils.getByBoundary(myData.body,`${myData.extractors['LB_value']}:"`,`",`); 
    load.log(`LS-cid: [${LS_cid}]`);

    const session = new load.WebRequest({
        id: 3,
        url: "https://push.lightstreamer.com/lightstreamer/create_session.txt",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://demos.lightstreamer.com/StockListDemo_Basic/",
            "Origin": "https://demos.lightstreamer.com"
        },
        body: {
            "LS_phase": "8701",
            "LS_domain": "lightstreamer.com",
            "LS_cause": "new.api",
            "LS_polling": "true",
            "LS_polling_millis": "0",
            "LS_idle_millis": "0",
            "LS_cid": `${LS_cid}`,//`${myData.extractors.LS_cid}`,
            "LS_adapter_set": "DEMO"
        },
        queryString: {
            "LS_protocol": "TLCP-2.1.0"
        },
        extractors: [
            //  CONOK,S535f0f373c4a91feMdd9T3851865,50000,0,*
            new load.BoundaryExtractor('LS_session', "CONOK,", ",")
        ]
    });

    let mySession = await session.send();
    
    load.log(`LS_session: [${mySession.extractors.LS_session}]`);

    const socket = new load.WebSocket({
        url: "wss://push.lightstreamer.com/lightstreamer",
        headers: {
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Host": "push.lightstreamer.com",
            "Origin": "https://demos.lightstreamer.com",
            "Pragma": "no-cache",
            "Sec-WebSocket-Protocol": "TLCP-2.1.0.lightstreamer.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
        },
        onMessage: messageHandler,
        onOpen: openHandler,
        onClose: closeHandler,
        onError: errorHandler
    });

    socket.open();
    socket.send(`bind_session\r\nLS_session=${mySession.extractors.LS_session}&LS_phase=8703&LS_domain=lightstreamer.com&LS_cause=loop1&`, false);
    socket.send(`control\r\nLS_mode=MERGE&LS_group=item1%20item2%20item3%20item4%20item5%20item6%20item7%20item8%20item9%20item10&LS_schema=stock_name%20last_price%20time%20pct_change%20bid_quantity%20bid%20ask%20ask_quantity%20min%20max%20ref_price%20open_price&LS_data_adapter=QUOTE_ADAPTER&LS_snapshot=true&LS_subId=1&LS_op=add&LS_reqId=1&LS_session=${mySession.extractors.LS_session}&`, false);

    load.log(`Stock values for :[${company}][${index}]`);

    // Listen for stock updatesAmount from server
    await socket.waitForData(60000);

    socket.close(1001, "bye");

    await socket.waitForClose();
});

load.finalize(async function () {
});

load.initialize(async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Connection": "Keep-Alive",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept": "*/*"
    };

    const request = new load.WebRequest({
        id: 1,
        url: "http://httpbin.org/post",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        bodyPath: "test.json",
        returnBody: true
    });

    const response = request.sendSync();
    if (response.status === 200 && response.textCheck('Sword of Honour')) {
        load.log("Test passed.", load.LogLevel.info);
    }

});

load.finalize(async function () {
});

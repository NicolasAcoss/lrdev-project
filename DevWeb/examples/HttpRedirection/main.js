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
        url: "http://httpbin.org/redirect/3",
        method: "GET"
    });

    const response = request.sendSync();

    // Redirection is handled automatically, response.redirectUrls contains a list of all the URLs that passed through while redirecting to this response	
    load.log(response.status, load.LogLevel.info);
    load.log(response.redirectUrls, load.LogLevel.info);

});

load.finalize(async function () {
});

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

    load.WebRequest.defaults.extractors = [
        new load.TextCheckExtractor("Web Page Blocked", {
            text: "The page you have requested has been blocked",
            failOn: true,
            scope: load.ExtractorScope.Body
        }),
    ];


    const response1 = new load.WebRequest({
        id: 1,
        url: "http://httpbin.org/post",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: {
            "data": "free text",
        },
    }).sendSync();

    const response2 = new load.WebRequest({
        id: 2,
        url: "http://httpbin.org/post",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: {
            "data": "The page you have requested has been blocked",
        },
    }).sendSync();

});

load.finalize(async function () {
});

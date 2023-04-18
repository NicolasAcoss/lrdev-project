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

    // Cookie could be provided as load.Cookie object
    const cookieObj = new load.Cookie({
        name: "myCookieObj",
        value: "Cookie object",
        domain: "httpbin.org"
    });

    // Cookie could also be provided in the "Set-Cookie" string format
    const cookieStr = new load.Cookie("myCookieStr=Cookie object with Max-Age(10); domain=.httpbin.org; path=/; max-age=10");

    // Add cookies
    load.addCookies(cookieObj);
    load.addCookies(cookieStr);

    const request = new load.WebRequest({
        id: 1,
        url: "http://httpbin.org/cookies",
        method: "GET",
        returnBody: true
    });

    const response1 = request.sendSync();

    // Response body include cookies in json format
    load.log(response1.jsonBody.cookies, load.LogLevel.info);


    // Clear all cookies
    load.clearCookies();

    const response2 = request.sendSync();

    // Response body include cookies in json format
    load.log(response2.jsonBody.cookies, load.LogLevel.info);

});

load.finalize(async function () {
});

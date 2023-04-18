load.initialize(async function () {
});

load.action("Action", async function () {

    load.WebRequest.defaults.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Connection": "Keep-Alive",
        "Accept-Language": "en-US,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept": "*/*"
    };

    load.WebRequest.defaults.handleHTTPError = function (webResponse) {
        if (webResponse.status === 404) {
            load.log('Continue with no error on receiving "Page not found"');
            return false; //We can continue, its fine
        }
    };

    const webResponse1 = new load.WebRequest({
        id: 1,
        method: "GET",
        url: "http://httpbin.org/wrongPage.html",
    }).sendSync();

    const webResponse2 = new load.WebRequest({
        id: 2,
        method: "GET",
        url: "http://httpbin.org/anotherWrongPage.html",
    }).sendSync();

    const webResponse3 = new load.WebRequest({
        id: 3,
        method: "GET",
        url: "http://httpbin.org/status/403",
        handleHTTPError: function (webResponse) {
            if (webResponse.status === 403) {
                load.log('Continue with no error on receiving "Forbidden"');
                return false; //We can continue, its fine
            }
        }
    }).sendSync();

    const webResponse4 = new load.WebRequest({
        id: 4,
        method: "GET",
        url: "http://httpbin.org/status/500", //No error handling for status code 500, the request will fail
    }).sendSync();

    const webResponse5 = new load.WebRequest({
        id: 5,
        method: "GET",
        url: "http://httpbin.org/uuid",
    }).sendSync();

});

load.finalize(async function () {
});

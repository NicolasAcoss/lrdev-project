load.initialize(async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept": "*/*"
    };

    load.setUserCredentials({
        username: "user",
        password: "passwd",
        host: "*"
    });

    const request = new load.WebRequest({
        id: 1,
        url: "https://httpbin.org/digest-auth/auth/user/passwd",
        method: "GET"
    });

    const response = request.sendSync();
    if (response.status == 200) {
        load.log("Authentication passed.", load.LogLevel.info);
    }

});

load.finalize(async function () {
});

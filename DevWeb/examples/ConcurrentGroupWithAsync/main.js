// This script was generated and reflects raw data. It is recommended to change this code to your required logic
load.initialize(async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36"
    };

    const mainPageResponse = new load.WebRequest({
        id: 1,
        url: "https://httpbin.org/",
        method: "GET",
        headers: {
            "Cache-Control": "no-cache",
            "Upgrade-Insecure-Requests": "1",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
            "Connection": "keep-alive",
            "Pragma": "no-cache",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
        },
    }).sendSync();

    const swaggerCssPromise = new load.WebRequest({
        id: 2,
        url: "https://httpbin.org/flasgger_static/swagger-ui.css",
        method: "GET",
        headers: {
            "Pragma": "no-cache",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
            "Accept": "text/css,*/*;q=0.1",
            "Referer": "https://httpbin.org/"
        },
    }).send(); //send and not sendSync

    const swaggerUiPromise = new load.WebRequest({
        id: 3,
        url: "https://httpbin.org/flasgger_static/swagger-ui-bundle.js",
        method: "GET",
        headers: {
            "Referer": "https://httpbin.org/",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Pragma": "no-cache",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
            "Accept": "*/*"
        },
    }).send(); //send and not sendSync

    const swaggerPresetPromise = new load.WebRequest({
        id: 4,
        url: "https://httpbin.org/flasgger_static/swagger-ui-standalone-preset.js",
        method: "GET",
        headers: {
            "Connection": "keep-alive",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
            "Referer": "https://httpbin.org/",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Accept-Encoding": "gzip, deflate, br"
        },
    }).send(); //send and not sendSync


    //This is standard JavaScript syntax - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
    const swaggerResponses = await Promise.all([ //Will run all 3 requests simultaneously and wait for the responses
        swaggerCssPromise,
        swaggerUiPromise,
        swaggerPresetPromise
    ]);

    const webResponse14 = new load.WebRequest({
        id: 5,
        url: "https://httpbin.org/spec.json",
        method: "GET",
        headers: {
            "Pragma": "no-cache",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
            "Referer": "https://httpbin.org/",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache"
        },
    }).sendSync();
});

load.finalize(async function () {
});

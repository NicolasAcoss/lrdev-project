load.initialize(async function () {

});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = true;
    load.WebRequest.defaults.headers = {
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36"
    };

    let T01 = new load.Transaction("LoadLibrary");
    let T02 = new load.Transaction("CallFunction");

    T01.start();
    const Chance = require("chance");
    T01.stop();

    // Instantiate Chance so it can be used
    const chance = new Chance();

    // Use Chance here.
    // var buffer = chance.string();
    // var buffer = chance.sentence();
    // var buffer = chance.android_id();
    // var buffer = chance.guid();

    T02.start();
    const buffer = chance.hash({casing: "upper"}) + ":" + chance.guid();
    T02.stop();

    const print_request = new load.WebRequest({
        id: 1,
        url: "http://httpbin.org/get?test=" + buffer,
        method: "GET",
        headers: {
            "accept-encoding": "gzip, deflate, br",
            "upgrade-insecure-requests": "1"
        }
    });

    const results = print_request.sendSync();

    load.thinkTime(2);

    if (results.body.includes(buffer)) {
        load.log("[Status:[PASSED]", load.LogLevel.info);
    } else {
        load.log("[Status:[FAILED]", load.LogLevel.error);
    }
});

load.finalize(async function () {
});

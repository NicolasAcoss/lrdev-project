load.initialize(async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Connection": "Keep-Alive",
        "Accept-Language": "en-US,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept": "application/json"
    };

    let T00 = new load.Transaction("Search");
    let transactionStatus;
    let transactionTime;

    for (let i = 0; i < 20; i++) {
        transactionStatus = (Math.floor(Math.random() * 30) + 1) > 29 ? load.TransactionStatus.Failed : load.TransactionStatus.Passed;
        transactionTime = Math.floor(Math.random() * 4) + 1;   // returns a random number between 1-5.

        T00.start();
        const webResponse = new load.WebRequest({
            id: 1,
            url: `http://httpbin.org/delay/${transactionTime}`,
            method: "GET"
        }).sendSync();
        T00.stop(transactionStatus);

        load.sleep(2);
    }
});

load.finalize(async function () {
});

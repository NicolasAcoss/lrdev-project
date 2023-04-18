load.initialize(async function () {
});

load.action("Action", async function () {
    load.utils.reportDataPoint("First", 1.35);
    const request = new load.WebRequest("http://advantageonlineshopping.com/");
    const response = request.sendSync();
    load.thinkTime(2.5);
    load.utils.reportDataPoint("Second", 2.222323);
});

load.finalize(async function () {
});

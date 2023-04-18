load.initialize(async function () {
});

load.action("Action", async function () {
    const storeJson = require("./store.json"); // loading store.json file from script directory
    load.log(storeJson.store.bicycle);
});

load.finalize(async function () {
});

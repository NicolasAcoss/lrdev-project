load.initialize(async function () {
});

load.action("Action", async function () {
    load.log(`${load.config.user.userId}: ${load.params.myParam1} - ${load.params.myParam2}`);
    load.log(`${load.config.user.userId}: ${load.params.myParam2}`);
    load.log(`${load.config.user.userId}: ${load.params.uniqueParam}`);
});

load.finalize(async function () {
});
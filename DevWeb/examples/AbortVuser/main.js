load.initialize(async function () {
});

load.action("Action", async function () {
    load.log("This line will be in the log because it is before the exit");

    load.exit(load.ExitType.stop, "aborting...");

    load.log("This line is not in the log because it is after the exit");
});

load.finalize(async function () {
});


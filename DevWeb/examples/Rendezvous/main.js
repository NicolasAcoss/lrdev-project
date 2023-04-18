load.initialize("Initialize", async function () {
});

load.action("Action", async function () {
    load.log("Hello DevWeb");
    load.rendezvous("Rendezvous_Name");
    load.log("Bye DevWeb");
});

load.finalize("Finalize", async function () {
});

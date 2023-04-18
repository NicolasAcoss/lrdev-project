load.initialize("set defaults", async function () {
    load.log("initialize:set defaults");
});

load.initialize("login", async function () {
    load.log("initialize:login");
});

load.initialize("login2", async function () {
    load.log("initialize:login2");
});

load.initialize(async function () {
    load.log("initialize:no name");
});

load.action("Action1", async function () {
    load.log("action:Action1");
});

load.action("Action2", async function () {
    load.log("action:Action2");
});

load.finalize("logout", async function () {
    load.log("finalize:logout")
});

load.finalize(async function () {
    load.log("finalize:no name");
});

load.finalize("clear cookies", async function () {
    load.log("finalize:clear cookies");
});

load.finalize("clear cookies 3", async function () {
    load.log("finalize:clear cookies 3");
});

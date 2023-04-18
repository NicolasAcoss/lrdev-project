load.initialize(async function () {
    load.log("Initial Action");
});

require("./extraActions");

load.action("Main Action", async function () {
    load.log("Main Action");
    const attributes = require("./attributes.js");
    const {loginUser, logoutUser} = require("./userUtils.js");

    if (attributes.doLogin) {
        const username = "John";
        loginUser(username);
		load.log(`${username} is doing stuff...`);
        logoutUser(username);
    } else {
        load.log("Nothing to do :(");
    }

    load.sleep(2);
});

require("./lastAction");

load.finalize(async function () {
    load.log("Final Action");
});

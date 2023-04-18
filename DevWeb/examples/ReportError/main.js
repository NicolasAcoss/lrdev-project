load.action("Action", () => {
    load.log("This is printed before the error");
    throw new Error("Something bad happened!");
    load.log("This is not printed");
});

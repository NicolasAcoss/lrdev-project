load.initialize(async function () {
});

load.action("Action", async function () {
    let counter = 0;
    let timer = new load.Timer(() => {
        load.log(counter + ": timer [" + timer._id + "] called", load.LogLevel.info);
        if (counter === 4) {
            load.log("timer expired", load.LogLevel.info);
            timer.stop();
        }
        counter++;
    }, 1000);
    timer.startInterval();
    load.log("timer id: " + JSON.stringify(timer._id), load.LogLevel.info);
    await timer.wait();
});

load.finalize(async function () {
});
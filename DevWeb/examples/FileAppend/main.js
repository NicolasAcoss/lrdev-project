load.action("Action", async function () {
    const txtFileName = "/abc" + Date.now() + ".txt";
    const buffer = load.utils.randomString(2048);

    const myFile = new load.File(txtFileName);
    myFile.append(buffer);

    const checkContent = myFile.read(
        {
            "returnContent": false,
            extractors: [
                new load.TextCheckExtractor("checkAppend", buffer)
            ]
        }
    );
});

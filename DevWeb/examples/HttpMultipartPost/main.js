load.initialize(async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept": "*/*"
    };

    new load.WebRequest({
        id: 1,
        url: "http://someHostName",
        method: "POST",
        headers: {
            "Accept-Encoding": "gzip, deflate, sdch",
        },
        body: new load.MultipartBody([
                new load.MultipartBody.StringEntry("entry", "some text"),
                new load.MultipartBody.FileEntry("name_of_files",
                    "test.json",
                    "text/plain", // Content-Type property, optional, default is 'text/plain'
                    "newFile.json" // filename property, optional, default is the file name
                )
            ],
            "---myBoundary---") // Boundary property, optional, randomly generated if not supplied
    }).sendSync();

});

load.finalize(async function () {
});

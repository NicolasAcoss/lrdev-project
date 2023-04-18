load.initialize(async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Connection": "Keep-Alive",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept": "*/*"
    };

    const jsonString = `{
  "store": {
    "book": [
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ]
  }
}`;

    const request = new load.WebRequest({
        id: 1,
        url: "https://httpbin.org/post",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonString,
        returnBody: true
    });

    const response = request.sendSync();

    // response.jsonBody contains the body of the response as json object
    load.log(response.jsonBody.data, load.LogLevel.info);

});

load.finalize(async function () {
});

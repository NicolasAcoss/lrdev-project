load.initialize(async function () {
});

load.action("Action", async function () {
    const response = new load.WebRequest({
        url: "http://advantageonlineshopping.com/",
        returnBody: false,
        extractors: [
            new load.RegexpExtractor("titleRegExp", "<title>(.*?)</title>"),
            new load.BoundaryExtractor("titleBoundary", "<title>", "</title>")
        ]
    }).sendSync();

    load.log(`Title by RegExp is ${response.extractors.titleRegExp} and by boundary is ${response.extractors.titleBoundary}`);

    const responseJSonPath = new load.WebRequest({
        url: "http://advantageonlineshopping.com/app/tempFiles/popularProducts.json",
        returnBody: false,
        extractors: [
            new load.JsonPathExtractor("secondProductName", "$[1].productName"),
            new load.JsonPathExtractor("secondProductPrice", "$[?(@.productName==\"HP EliteBook Folio\")].price")
        ]
    }).sendSync();

    load.log(`${responseJSonPath.extractors.secondProductName} costs ${responseJSonPath.extractors.secondProductPrice}`)
});

load.finalize(async function () {
});

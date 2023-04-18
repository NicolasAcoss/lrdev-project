load.initialize("Initialize", async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36"
    };

    let T01 = new load.Transaction("AOS_landing_page");
    let T02 = new load.Transaction("AOS_login");
    let T03 = new load.Transaction("AOS_logout");

    load.log(`Using: [${load.params.userID} : ${load.params.userPWD}]`);

    T01.start();

    new load.WebRequest({
        id: 1,
        url: "https://www.advantageonlineshopping.com/",
        method: "GET",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Upgrade-Insecure-Requests": "1"
        },
        resources: [
            "http://www.advantageonlineshopping.com/css/main.min.css",
            "http://www.advantageonlineshopping.com/css/images/Down_arrow.svg",
            "http://www.advantageonlineshopping.com/vendor/requirejs/require.js",
            "http://www.advantageonlineshopping.com/main.min.js",
            "http://www.advantageonlineshopping.com/services.properties",
            "http://www.advantageonlineshopping.com/catalog/api/v1/categories/all_data",
            "http://www.advantageonlineshopping.com/catalog/api/v1/DemoAppConfig/parameters/by_tool/ALL",
            "http://www.advantageonlineshopping.com/css/images/logo.png",
            "http://www.advantageonlineshopping.com/css/images/closeDark.png",
            "http://www.advantageonlineshopping.com/catalog/api/v1/categories",
            "http://www.advantageonlineshopping.com/catalog/api/v1/deals/search?dealOfTheDay=true",
            "http://www.advantageonlineshopping.com/css/images/arrow_right.png",
            "http://www.advantageonlineshopping.com/css/images/GoUp.png",
            "http://www.advantageonlineshopping.com/css/images/Special-offer.jpg",
            "http://www.advantageonlineshopping.com/css/images/chat_logo.png",
            "http://www.advantageonlineshopping.com/css/images/facebook.png",
            "http://www.advantageonlineshopping.com/css/images/twitter.png",
            "http://www.advantageonlineshopping.com/css/images/linkedin.png",
            "http://www.advantageonlineshopping.com/css/images/Banner1.jpg",
            "http://www.advantageonlineshopping.com/css/images/Banner2.jpg",
            "http://www.advantageonlineshopping.com/css/images/Banner3.jpg",
            "http://www.advantageonlineshopping.com/css/images/Popular-item3.jpg",
            "http://www.advantageonlineshopping.com/css/images/Popular-item2.jpg",
            "http://www.advantageonlineshopping.com/css/images/Popular-item1.jpg",
        ],
        handleHTTPError: (webResponse) => {
            if (webResponse.status === 404) {
                return false;
            }
        }
    }).sendSync();

    new load.WebRequest({
        id: 2,
        url: "https://www.advantageonlineshopping.com/accountservice/ws/GetAccountConfigurationRequest",
        method: "POST",
        headers: {
            "Accept": "application/xml, text/xml, */*; q=0.01",
            "Referer": "http://www.advantageonlineshopping.com/",
            "Origin": "http://www.advantageonlineshopping.com",
            "X-Requested-With": "XMLHttpRequest",
            "SOAPAction": "com.advantage.online.store.accountserviceGetAccountConfigurationRequest",
            "Content-Type": "text/xml; charset=UTF-8"
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <soap:Body>
        <GetAccountConfigurationRequest
                xmlns="com.advantage.online.store.accountservice"></GetAccountConfigurationRequest>
    </soap:Body>
</soap:Envelope>`,
    }).sendSync();

    const webResponse3 = new load.WebRequest({
        id: 3,
        url: "https://www.advantageonlineshopping.com/app/tempFiles/popularProducts.json",
        method: "GET",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Referer": "http://www.advantageonlineshopping.com/"
        },
    }).sendSync();

    const webResponse4 = new load.WebRequest({
        id: 4,
        url: "http://www.advantageonlineshopping.com/app/views/home-page.html",
        method: "GET",
        headers: {
            "Accept": "text/html",
            "Referer": "http://www.advantageonlineshopping.com/"
        },
    }).sendSync();

    T01.stop();

    load.thinkTime(2.5 + Math.random());

    T02.start();

    const loginResponse = new load.WebRequest({
        id: 5,
        url: "https://www.advantageonlineshopping.com/accountservice/ws/AccountLoginRequest",
        method: "POST",
        headers: {
            "Accept": "application/xml, text/xml, */*; q=0.01",
            "Referer": "http://www.advantageonlineshopping.com/",
            "Origin": "http://www.advantageonlineshopping.com",
            "X-Requested-With": "XMLHttpRequest",
            "SOAPAction": "com.advantage.online.store.accountserviceAccountLoginRequest",
            "Content-Type": "text/xml; charset=UTF-8"
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <soap:Body>
        <AccountLoginRequest xmlns="com.advantage.online.store.accountservice">
            <email></email>
            <loginPassword>${load.params.userPWD}</loginPassword>
            <loginUser>${load.params.userID}</loginUser>
                </AccountLoginRequest>
            </soap:Body>
        </soap:Envelope>`,
        returnBody: true,
        extractors: [
            new load.BoundaryExtractor('userId', '<ns2:userId>', '</ns2:userId>'),
            new load.BoundaryExtractor('authKey', '<ns2:t_authorization>', '</ns2:t_authorization>'),
            new load.TextCheckExtractor("isLoginSuccess", {
                text: "Login Successful",
                scope: load.ExtractorScope.All,
                failOn: false
            })
        ]
    }).sendSync();


    //Checking login status
    if (loginResponse.extractors.isLoginSuccess) {
        new load.WebRequest({
            id: 6,
            url: `http://www.advantageonlineshopping.com/order/api/v1/carts/${loginResponse.extractors.userId}`,
            method: "GET",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": `Basic ${loginResponse.extractors.authKey}`,
                "Referer": "http://www.advantageonlineshopping.com/"
            },
        }).sendSync();

        load.log(`Login passed for: [${load.params.userID} : ${load.params.userPWD}]`);
        T02.stop(load.TransactionStatus.Passed);
    } else {
        load.log(`Login failed for: [${load.params.userID} : ${load.params.userPWD}]`);
        T02.stop(load.TransactionStatus.Failed);
        return false;
    }

    load.thinkTime(2.5 + Math.random());

    T03.start();

    const logoutResponse = new load.WebRequest({
        id: 7,
        url: "https://www.advantageonlineshopping.com/accountservice/ws/AccountLogoutRequest",
        method: "POST",
        headers: {
            "Referer": "http://www.advantageonlineshopping.com/",
            "Origin": "http://www.advantageonlineshopping.com",
            "X-Requested-With": "XMLHttpRequest",
            "SOAPAction": "com.advantage.online.store.accountserviceAccountLogoutRequest",
            "Content-Type": "text/xml; charset=UTF-8",
            "Accept": "application/xml, text/xml, */*; q=0.01"
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <soap:Body>
        <AccountLogoutRequest xmlns="com.advantage.online.store.accountservice">
            <loginUser>${loginResponse.extractors.userId}</loginUser>
            <base64Token>Basic ${loginResponse.extractors.authKey}</base64Token>
        </AccountLogoutRequest>
    </soap:Body>
</soap:Envelope>`,

        extractors: [
            new load.TextCheckExtractor("isLogoutSuccess", "Logout Successful")
        ]
    }).sendSync();

    //Checking logout status
    if (logoutResponse.extractors.isLogoutSuccess) {
        T03.stop(load.TransactionStatus.Passed);
    } else {
        T03.stop(load.TransactionStatus.Failed);
        return false;
    }

});

load.finalize("Finalize", async function () {
});

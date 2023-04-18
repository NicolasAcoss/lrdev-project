// This script was generated and reflects raw data. It is recommended to change this code to your required logic

const swaggerApi = require('./swaggerApi.js')();


load.initialize("Initialize", async function () {
});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = false;
    load.WebRequest.defaults.headers = {
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"
    };

    load.log("====================================================");
    load.log("===API Testing Example: Advantage Online Shopping===");
    load.log("====================================================");
    load.log(`Using: [${load.params.userName} : ${load.params.password}]`);

    let T01 = new load.Transaction("AOS_landing_page");
    let T02 = new load.Transaction("AOS_login");
    let T03 = new load.Transaction("AOS_get_user_cart");
    let T04 = new load.Transaction("AOS_add_to_cart");
    let T05 = new load.Transaction("AOS_remove_from_cart");
    let T06 = new load.Transaction("AOS_logout");

    T01.start();

    const webResponse1 = new load.WebRequest({
        id: 1,
        url: "https://www.advantageonlineshopping.com/",
        method: "GET",
        headers: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        },
        resources: [
            "https://www.advantageonlineshopping.com/css/main.min.css",
            "https://www.advantageonlineshopping.com/css/images/Down_arrow.svg",
            "https://www.advantageonlineshopping.com/vendor/requirejs/require.js",
            "https://www.advantageonlineshopping.com/main.min.js",
            "https://www.advantageonlineshopping.com/css/images/logo.png",
            "https://www.advantageonlineshopping.com/css/images/closeDark.png",
            "https://www.advantageonlineshopping.com/css/fonts/roboto_regular_macroman/Roboto-Regular-webfont.woff",
            "https://www.advantageonlineshopping.com/css/fonts/roboto_medium_macroman/Roboto-Medium-webfont.woff",
            "https://www.advantageonlineshopping.com/css/fonts/roboto_light_macroman/Roboto-Light-webfont.woff",
            "https://www.advantageonlineshopping.com/css/images/arrow_right.png",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=1237",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=1236",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=1235",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=1238",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=1234",
            "https://www.advantageonlineshopping.com/css/images/Special-offer.jpg",
            "https://www.advantageonlineshopping.com/css/images/chat_logo.png",
            "https://www.advantageonlineshopping.com/css/images/GoUp.png",
            "https://www.advantageonlineshopping.com/css/images/facebook.png",
            "https://www.advantageonlineshopping.com/css/images/twitter.png",
            "https://www.advantageonlineshopping.com/css/images/linkedin.png",
            "https://www.advantageonlineshopping.com/css/images/Banner1.jpg",
            "https://www.advantageonlineshopping.com/css/images/Banner2.jpg",
            "https://www.advantageonlineshopping.com/css/images/Banner3.jpg",
            "https://www.advantageonlineshopping.com/css/images/Popular-item3.jpg",
            "https://www.advantageonlineshopping.com/css/images/Popular-item2.jpg",
            "https://www.advantageonlineshopping.com/css/images/Popular-item1.jpg",
            "https://www.advantageonlineshopping.com/css/fonts/roboto_bold_macroman/Roboto-Bold-webfont.woff",
            "https://www.advantageonlineshopping.com/css/fonts/roboto_thin_macroman/Roboto-Thin-webfont.woff",
            "https://www.advantageonlineshopping.com/css/images/FacebookLogo.png",
            "https://www.advantageonlineshopping.com/css/images/category_banner_3.png",
            "https://www.advantageonlineshopping.com/css/images/Filter.png",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=3100",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=3200",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=3300",
            "https://www.advantageonlineshopping.com/css/images/review_right.png",
            "https://www.advantageonlineshopping.com/css/images/reviewUser.png",
            "https://www.advantageonlineshopping.com/css/images/review_Left_disabled.png",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=3303",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=3302",
            "https://www.advantageonlineshopping.com/catalog/fetchImage?image_id=3301",
        ],
    }).sendSync();

    const webResponse2 = new load.WebRequest({
        id: 2,
        url: "https://www.advantageonlineshopping.com/accountservice/ws/GetAccountConfigurationRequest",
        method: "POST",
        headers: {
            "accept": "application/xml, text/xml, */*; q=0.01",
            "content-type": "text/xml; charset=UTF-8",
            "origin": "https://www.advantageonlineshopping.com",
            "referer": "https://www.advantageonlineshopping.com/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "soapaction": "com.advantage.online.store.accountserviceGetAccountConfigurationRequest",
            "x-requested-with": "XMLHttpRequest"
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
            <soap:Body>
                <GetAccountConfigurationRequest xmlns="com.advantage.online.store.accountservice"></GetAccountConfigurationRequest>
            </soap:Body>
        </soap:Envelope>`,
    }).sendSync();

    const webResponse3 = new load.WebRequest({
        id: 3,
        url: "https://www.advantageonlineshopping.com/app/tempFiles/popularProducts.json",
        method: "GET",
        headers: {
            "accept": "application/json, text/plain, */*",
            "referer": "https://www.advantageonlineshopping.com/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
    }).sendSync();

    const webResponse4 = new load.WebRequest({
        id: 4,
        url: "https://www.advantageonlineshopping.com/app/views/home-page.html",
        method: "GET",
        headers: {
            "accept": "text/html",
            "referer": "https://www.advantageonlineshopping.com/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
    }).sendSync();

    T01.stop();

    load.thinkTime(2.5 + Math.random());

    T02.start();

    const aosLoginResponse = new load.WebRequest({
        id: 5,
        url: "https://www.advantageonlineshopping.com/accountservice/ws/AccountLoginRequest",
        method: "POST",
        headers: {
            "accept": "application/xml, text/xml, */*; q=0.01",
            "content-type": "text/xml; charset=UTF-8",
            "origin": "https://www.advantageonlineshopping.com",
            "referer": "https://www.advantageonlineshopping.com/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "soapaction": "com.advantage.online.store.accountserviceAccountLoginRequest",
            "x-requested-with": "XMLHttpRequest"
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
            <soap:Body>
                <AccountLoginRequest xmlns="com.advantage.online.store.accountservice">
                    <email></email>
                    <loginPassword>${load.params.userName}</loginPassword>
                    <loginUser>${load.params.password}</loginUser>
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

    if (aosLoginResponse.extractors.isLoginSuccess){
        load.log(`Login passed for: [${load.params.userName} : ${load.params.password}]`);
        T02.stop(load.TransactionStatus.Passed);
    }else{
        load.log(`Login failed for: [${load.params.userName} : ${load.params.password}]`, load.LogLevel.error);
        T02.stop(load.TransactionStatus.Failed);
        return false;
    }

    load.thinkTime(2.5 + Math.random());

    //--------------------API Testing: Get the user's shopping cart--------------------------------------
    let authorization = `Basic ${aosLoginResponse.extractors.authKey}`;
    let cartSize = 0;
    let sessionExtractor = new load.JsonPathExtractor("sessionId",".sessionId");
    let cartJsonExtractor = new load.JsonPathExtractor("EntireCart", "$");
    let getCartRequest = swaggerApi.getUserCartUsingGET(authorization, `${aosLoginResponse.extractors.userId}`);
    getCartRequest.extractors = [sessionExtractor, cartJsonExtractor];

    T03.start();
    const getCartResponse = await getCartRequest.send();
    if (getCartResponse.status === 200){
        T03.stop(load.TransactionStatus.Passed);
        cartSize = getCartResponse.extractors.EntireCart.productsInCart.length;
        load.log(`\nSuccessfully obtained the user's cart:\n${JSON.stringify(getCartResponse.extractors.EntireCart.productsInCart)}`);
        load.log(`Cart size is: ${cartSize}`);
    }else{
        T03.stop(load.TransactionStatus.Failed);
        load.log(`Could not obtain the user's cart`);
    }
    //----------------------------------------------------------------------------------------------------------
    const webResponse5 = new load.WebRequest({
        id: 5,
        url: "https://www.advantageonlineshopping.com/app/views/category-page.html",
        method: "GET",
        headers: {
            "accept": "text/html",
            "referer": "https://www.advantageonlineshopping.com/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
    }).sendSync();

    const webResponse6 = new load.WebRequest({
        id: 6,
        url: "https://www.advantageonlineshopping.com/app/views/product-page.html",
        method: "GET",
        headers: {
            "accept": "text/html",
            "referer": "https://www.advantageonlineshopping.com/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
    }).sendSync();

    //--------------------API Testing: add an item to the cart and remove it--------------------------------------
    let wasAddedToCart = false;
    let productExtractor = new load.JsonPathExtractor("productExtractor", "$.productsInCart[?(@.productId==18)]");
    let addToCartRequest = swaggerApi.addProductToCartUsingPOST(authorization, "414141",
        undefined, "18", `2`, aosLoginResponse.extractors.userId);
    addToCartRequest.body["sessionId"] = `${getCartResponse.extractors.sessionId}`;
    addToCartRequest.extractors = [productExtractor];

    T04.start();
    const addToCartResponse = await addToCartRequest.send();
    if (addToCartResponse.status === 200 || addToCartResponse.status === 201){
        T04.stop(load.TransactionStatus.Passed);
        cartSize++;
        load.log(`${addToCartResponse.extractors.productExtractor.productName} was added to cart, you have ${cartSize} items in the cart`);
        wasAddedToCart = true;
    }else{
        load.log('Could not add to cart', load.LogLevel.error);
        T04.stop(load.TransactionStatus.Failed);
    }

    if (wasAddedToCart) {
        let removeFromCartRequest = swaggerApi.removeProductFromUserCartUsingDELETE(authorization, "414141",
            "18", aosLoginResponse.extractors.userId);
        removeFromCartRequest.body["sessionId"] = `${getCartResponse.extractors.sessionId}`;
        removeFromCartRequest.returnBody = true;

        T05.start();
        const removeFromCartResponse = await removeFromCartRequest.send();
        if (removeFromCartResponse.status === 200 && removeFromCartResponse.jsonBody.productsInCart.length === cartSize-1){
            T05.stop(load.TransactionStatus.Passed);
            load.log(`successfully removed ${addToCartResponse.extractors.productExtractor.productName}, you have ${removeFromCartResponse.jsonBody.productsInCart.length} items in the cart`);
        }else{
            T05.stop(load.TransactionStatus.Failed);
            load.log('Could not remove from cart', load.LogLevel.error);
        }
    }
    //------------------------------------------------------------------------------------------------------------------------
    T06.start();
    const logoutResponse = new load.WebRequest({
        id: 7,
        url: "https://www.advantageonlineshopping.com/accountservice/ws/AccountLogoutRequest",
        method: "POST",
        headers: {
            "accept": "application/xml, text/xml, */*; q=0.01",
            "content-type": "text/xml; charset=UTF-8",
            "origin": "https://www.advantageonlineshopping.com",
            "referer": "https://www.advantageonlineshopping.com/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "soapaction": "com.advantage.online.store.accountserviceAccountLogoutRequest",
            "x-requested-with": "XMLHttpRequest"
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
            <soap:Body>
                <AccountLogoutRequest xmlns="com.advantage.online.store.accountservice">
                    <loginUser>${aosLoginResponse.extractors.userId}</loginUser>
                    <base64Token>${authorization}</base64Token>
                </AccountLogoutRequest>
            </soap:Body>
        </soap:Envelope>`,
        extractors: [
            new load.TextCheckExtractor("isLogoutSuccess", "Logout Successful")
        ]
    }).sendSync();

    //Checking logout status
    if (logoutResponse.extractors.isLogoutSuccess) {
        T06.stop(load.TransactionStatus.Passed);
    } else {
        T06.stop(load.TransactionStatus.Failed);
        return false;
    }
});

load.finalize("Finalize", async function () {
});

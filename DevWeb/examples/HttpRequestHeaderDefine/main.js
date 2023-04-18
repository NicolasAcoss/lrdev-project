'use strict';
load.initialize("Initialize", async function () {});

load.action("Action", async function () {
    load.WebRequest.defaults.returnBody = true;
    load.WebRequest.defaults.headers = {
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": "\"Google Chrome\";v=\"95\", \"Chromium\";v=\"95\", \";Not A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
    };

    const checkHeaders1 = new load.WebRequest({
        id: 1,
        url: "https://httpbin.org/headers",
        method: "GET",
        headers: {
            "accept": "application/json",
            "referer": "https://httpbin.org/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
    }).sendSync();

    load.WebRequest.defaults.headers = {
        "Host": "Phoenix"
    };

    const checkHeaders2 = new load.WebRequest({
        id: 2,
        url: "https://httpbin.org/headers",
        method: "GET",
        headers: {
            "accept": "application/json",
            "referer": "https://httpbin.org/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
    }).sendSync();

    const checkHeaders3 = new load.WebRequest({
        id: 3,
        url: "https://httpbin.org/headers",
        method: "GET",
        headers: {
            "accept": "application/json",
            "referer": "https://httpbin.org/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "Host": "www.devwebdemo.org",
        },
    }).sendSync();
});

load.finalize('Finalize', async function () {});

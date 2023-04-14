const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");

const app = express();

const PORT = 5000;

let accessT = "";
let aT = "";
let tokenType = "";

const updatedTrains = [];

app.get("/", (req, res) => {
    res.send("Calling from Post");

    const options = {
        hostname: "localhost",
        port: 3000,
        path: "/register",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    };

    const data = {
        companyName: "Example 1"
    };

    const request = http.request(options, (response) => {
        const rData = [];
        response.on("data", (chunk) => {
            rData.push(chunk);
        });
        response.on("end", () => {
            const dataFromRes = Buffer.concat(rData);

            const secondOptions = {
                hostname: "localhost",
                port: 3000,
                path: "/auth",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            };

            const secondData = JSON.parse(dataFromRes);

            const secondRequest = http.request(secondOptions, (secondRes) => {
                const secondResponseData = [];
                secondRes.on("data", (secondChunk) => {
                    secondResponseData.push(secondChunk);
                });
                secondRes.on("end", () => {
                    const secondDataFromResponse = Buffer.concat(secondResponseData);
                    accessT = JSON.parse(secondDataFromResponse).access_token;
                    aT = JSON.parse(secondDataFromResponse).token_type;
                    tokenType = aT + " " + accessT;

                    const options = {
                        hostname: "localhost",
                        port: 3000,
                        path: "/trains",
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": tokenType,
                        }
                    };

                    const request = http.request(options, (response) => {
                        const trainsArray = [];
                        response.on("data", function (data) {
                            trainsArray.push(data);
                        });
                        response.on("end", function () {
                            const data = Buffer.concat(trainsArray);
                            let gotTrain = JSON.parse(data);


                            function sortTrains(trains) {
                                const currentTime = new Date();

                                const filteredTrains = trains.filter(train => {
                                    const departureTime = new Date();
                                    departureTime.setHours(train.departureTime.Hours);
                                    departureTime.setMinutes(train.departureTime.Minutes);
                                    departureTime.setSeconds(train.departureTime.Seconds);
                                    departureTime.setSeconds(departureTime.getSeconds() + train.delayedBy);
                                    return departureTime - currentTime > 30 * 60 * 1000;
                                });

                                filteredTrains.sort((a, b) => a.price.sleeper - b.price.sleeper);

                                filteredTrains.sort((a, b) => {
                                    if (a.price.sleeper === b.price.sleeper) {
                                        return b.price.AC - a.price.AC;
                                    }
                                    return 0;
                                });

                                filteredTrains.sort((a, b) => {
                                    if (a.price.sleeper === b.price.sleeper && a.price.AC === b.price.AC &&
                                        a.sAvail.sleeper === b.sAvail.sleeper && a.sAvail.AC === b.sAvail.AC) {
                                        const dtime = new Date();
                                        dtime.setHours(a.departureTime.Hours);
                                        dtime.setMinutes(a.departureTime.Minutes);
                                        dtime.setSeconds(a.departureTime.Seconds);
                                        dtime.setSeconds(dtime.getSeconds() + a.delayedBy);

                                        const dtimeB = new Date();
                                        dtimeB.setHours(b.departureTime.Hours);
                                        dtimeB.setMinutes(b.departureTime.Minutes);
                                        dtimeB.setSeconds(b.departureTime.Seconds);
                                        dtimeB.setSeconds(dtimeB.getSeconds() + b.delayedBy);

                                        return dtimeB - dtime;
                                    }
                                    return 0;
                                });

                                return filteredTrains;
                            }

                            const sortedTrains = sortTrains(gotTrain);
                            updatedTrains = sortedTrains;
                            console.log(sortedTrains);

                        });
                    });

                    request.end();
                });
            });

            secondRequest.write(JSON.stringify(secondData));
            secondRequest.end();
        });
    });

    request.write(JSON.stringify(data));
    request.end();
});

app.get("/updatedtrains", (req, res) => {
    console.log("called");
    res.json(updatedTrains);
})

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("App called at port 5000");
    }
});

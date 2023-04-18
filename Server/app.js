const express = require("express");
const http = require("http");

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const PORT = 5000;

let acceptToken = "";
let acceptType = "";
let tokenName = "";
let updateTrains;


app.get("/", (req, res) => {

    res.send("Calling from Post By Swarup");

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
        companyName: "Swarup Company"
    };

    const request = http.request(options, (response) => {
        const responseTrainData = [];
        response.on("data", (chunk) => {
            responseTrainData.push(chunk);
        });
        response.on("end", () => {
            const trainDataFromResponse = Buffer.concat(responseTrainData);

            const secondOptions = {
                hostname: "localhost",
                port: 3000,
                path: "/auth",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            };

            const secondData = JSON.parse(trainDataFromResponse);

            const secondRequest = http.request(secondOptions, (secondTrainResponse) => {
                const secondTrainResponseData = [];
                secondTrainResponse.on("data", (secondChunk) => {
                    secondTrainResponseData.push(secondChunk);
                });
                secondTrainResponse.on("end", () => {
                    const secondTrainDataFromResponse = Buffer.concat(secondTrainResponseData);
                    acceptToken = JSON.parse(secondTrainDataFromResponse).access_token;
                    acceptType = JSON.parse(secondTrainDataFromResponse).token_type;
                    tokenName = acceptType + " " + acceptToken;

                    const options = {
                        hostname: "localhost",
                        port: 3000,
                        path: "/trains",
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": tokenName,
                        }
                    };

                    const request = http.request(options, (response) => {
                        const trainsArray = [];
                        response.on("data", function (data) {
                            trainsArray.push(data);
                        });
                        response.on("end", function () {
                            const data = Buffer.concat(trainsArray);
                            updateTrains = JSON.parse(data);
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

const sortTrains = (trains) => {
    const currentTime = new Date();
    const reqTrains = trains.length ? trains.filter(train => {
        const departureTime = new Date();
        departureTime.setHours(train.departureTime.Hours);
        departureTime.setMinutes(train.departureTime.Minutes);
        departureTime.setSeconds(train.departureTime.Seconds);
        const delayInMilliseconds = train.delayedBy * 60 * 1000;
        departureTime.setTime(departureTime.getTime() + delayInMilliseconds);
        return departureTime - currentTime > 30 * 60 * 1000;
    }) : trains;

    //Bubble Sort

    for (let i = 0; i < reqTrains.length; i++) {
        for (let j = i + 1; j < reqTrains.length; j++) {
            if (reqTrains[i].price.sleeper > reqTrains[j].price.sleeper) {
                [reqTrains[i], reqTrains[j]] = [reqTrains[j], reqTrains[i]];
            } else if (reqTrains[i].price.sleeper === reqTrains[j].price.sleeper) {
                if (reqTrains[i].price.AC > reqTrains[j].price.AC) {
                    [reqTrains[i], reqTrains[j]] = [reqTrains[j], reqTrains[i]];
                } else if (reqTrains[i].price.AC === reqTrains[j].price.AC) {
                    if (reqTrains[j].seatsAvailable.sleeper > reqTrains[i].seatsAvailable.sleeper) {
                        [reqTrains[i], reqTrains[j]] = [reqTrains[j], reqTrains[i]];
                    } else if (reqTrains[i].seatsAvailable.sleeper === reqTrains[j].seatsAvailable.sleeper && reqTrains[i].seatsAvailable.AC === reqTrains[j].seatsAvailable.AC) {
                        const departureTimeA = new Date();
                        departureTimeA.setHours(reqTrains[i].departureTime.Hours);
                        departureTimeA.setMinutes(reqTrains[i].departureTime.Minutes);
                        departureTimeA.setSeconds(reqTrains[i].departureTime.Seconds);
                        const delayInMillisecondsA = reqTrains[i].delayedBy * 60 * 1000;
                        departureTimeA.setTime(departureTimeA.getTime() + delayInMillisecondsA);

                        const departureTimeB = new Date();
                        departureTimeB.setHours(reqTrains[j].departureTime.Hours);
                        departureTimeB.setMinutes(reqTrains[j].departureTime.Minutes);
                        departureTimeB.setSeconds(reqTrains[j].departureTime.Seconds);
                        const delayInMillisecondsB = reqTrains[j].delayedBy * 60 * 1000;
                        departureTimeB.setTime(departureTimeB.getTime() + delayInMillisecondsB);

                        if (departureTimeB > departureTimeA) {
                            [reqTrains[i], reqTrains[j]] = [reqTrains[j], reqTrains[i]];
                        }
                    }
                }
            }
        }
    }

    return reqTrains;
};




app.get('/api/updatedtrains', (req, res) => {
    const sortedTrains = sortTrains(updateTrains);
    res.json(sortedTrains);
});




app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("App called at port " + PORT);
    }
});
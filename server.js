const express = require("express");
const scraper = require("./scraper.js");
const path = require("path");

const app = express();
app.set("port", (process.env.PORT || 5000));

const errorHandler = function(error, httpResponse) {
    console.log(error.stack);
    console.log("Error: " + error);
    httpResponse.sendStatus(500);
}


/* ENDPOINT: GET /schoolCalendar
--------------------------
A scraper for the general school calendar.
Responds with the parsed calendar data as a JSON array of calendar event objects
sorted from earliest to latest.  Fetches the next two months of calendar data.
Each object has the format:

{
    "eventName": "US Leadership Workshop",
    "startDateTime": "2016-11-28T14:45:00.000Z",
    "endDateTime": "2016-11-28T16:05:00.000Z",
    "location": "Theatre,Theatre Lobby"
}

Each event is guaranteed to have the following fields:

    - startDateTime: start date/time string of event (JS date string)
    - eventName: name of the event

Additionally, an event may have the following fields:
    
    - endDateTime: end date/time string of event (JS date string)
    - location: the name of the event's location

Assumes events span at most one full day.  Events with no explicit start TIME
(hours, minutes) have a specified start time of midnight.
--------------------------
*/
app.get("/schoolCalendar", function(req, res) {
    "use strict";
    scraper.scrapeSchoolCalendars(new Date()).then(function(calendarData) {
        res.json(calendarData);
    }, function(error) {
        errorHandler(error, res);
    });
});


/* ENDPOINT: GET /athleticsCalendar
--------------------------
A scraper for the athletics calendar, including practices and games.
Responds with an object with the following format:

{
    "games": [
        ...
    ],
    "practices": [
        ...
    ]
}

Each array contains athletics event objects in chronological order for athletics
games and practices scraped from the school website.  The information scraped
for games and practices is slightly different, however.  The games events have
the following format:

{
    "month": "Sep",
    "date": 28,
    "year": 2016,
    "team": "Boys' Varsity Soccer",
    "opponent": "Other School"
    "time": "2016-11-28T15:45:00-05:00",
    "location": "Back Field",
    "isHome": true,
    "result": null,
    "status": "CANCELLED"
}

Every game event object is guaranteed to have the following fields:

    - month: an abbreviated name for the event month
    - date: the numeric date
    - year: the numeric year
    - team: the school team competing
    - isHome: boolean whether or not this is a home game

Additionally, a game event object may have the following fields:

    - opponent: the opposing team name
    - time: a datetime string
    - location: the name of the game's location (NOT necessarily address)
    - result: "Win" or "Loss" or another string indicator of game result
    - status: "CANCELLED" or another string indicator of game status

The practices events have the following format (a subset of the game object):

{
    "month": "Sep",
    "date": 28,
    "year": 2016,
    "team": "Boys' Varsity Soccer",
    "time": "2016-11-28T15:45:00-05:00",
    "location": "Back Field",
    "status": "CANCELLED"
}

All fields in a practice object are the same as their corresponding fields in a
game object.
--------------------------
*/
app.get("/athleticsCalendar", function(req, res) {
    "use strict";
    scraper.scrapeAthleticsCalendars().then(function(calendarData) {
        res.json(calendarData);   
    }, function(error) {
        errorHandler(error, res);
    });
});


/* ENDPOINT: GET /athleticsTeams
-----------------------------------------
A scraper for athletics teams information.  Responds with a collection of three
arrays, one for each season, of athletics team names (as strings):

{
    "Fall": [
        "Cross Country",
        "Girls' Varsity Tennis",
        ...
    ],
    "Winter": [
        ...
    ],
    "Spring": [
        ...
    ]
}
-----------------------------------------
*/
app.get("/athleticsTeams", function(req, res) {
    "use strict";
    scraper.scrapeAthleticsTeams().then(function(teams) {
        res.json(teams);
    }, function(error) {
        errorHandler(error, res);
    });
});


/* ENDPOINT:
----------------
A catch-all endpoint that sends back a link to the GitHub repo.
----------------
*/
app.get("*", function(req, res) {
    res.send("<html><h1>Maret Calendar Scraper</h1>See " +
        "<a href='https://github.com/Nickster28/Maret-Calendar-Scraper'>" +
        "our GitHub repo</a> for this project's code.</html>");
});


/* Start the server */
app.listen(app.get("port"), function() {
    console.log("Node app is running on port", app.get("port"));
});



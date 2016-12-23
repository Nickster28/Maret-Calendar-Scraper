# MyMaret-Calendar-Scraper
A scraper for the Maret School Calendar and athletics calendar/teams sites.
To run the server, just run

```javascript
npm start
```

The main file, server.js, will run.  There are multiple endpoints:
    
### GET /schoolCalendars

This sends back a JSON response containing information about the events in
all the main school calendars for the next two months.  With the given util.js
setting for URL, the format is an array of event objects, in chronological order
from earliest to latest:

```javascript
[
    {
        "month": "September",
        "date": 9,
        "day": "Wednesday",
        "year": 2016,
        "eventName": "US Leadership Workshop",
        "startTime": "6:00 PM",
        "endTime": "7:30 PM",
        "location": "Theatre,Theatre Lobby"
    },
    ...
]
```

Every event object has the following fields:

month - abbreviated month name
date - the numeric date
day - abbreviated day name
year - numeric year
eventName - name of the event

Additionally, an event may have the following fields:

    startTime - a datetime string
    endTime - a datetime string
    location - the name of the event's location


### GET /athleticsTeams

This sends back an array of athletics teams for each season - Fall,
then Winter, then Spring.  The response is a dictionary of keys that are season
names (e.g. "Fall", "Winter",...) and the values are arrays of team names:

```javascript
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
```

Note that the seasons returned are whatever are included at the URL in util.js;
there may be more or less seasons than are given here.
# Maret-Calendar-Scraper
A scraper for the Maret School calendar and athletics calendar/teams sites.
To run the server, just run

```javascript
npm start
```

The main file, server.js, will run.  There are multiple endpoints:
    
## GET /schoolCalendar

This sends back a JSON list of event objects in chronological order for the next
two months of the school calendar, scraped from
https://www.maret.org/fs/elements/6221:

```javascript
[
    {
        "eventName": "US Leadership Workshop",
        "startDateTime": "2016-11-28T14:45:00.000Z",
        "endDateTime": "2016-11-28T16:05:00.000Z",
        "location": "Theatre,Theatre Lobby"
    },
    ...
]
```

Every event object is guaranteed to have the following fields:

* **eventName** - name of the event
* **startDateTime** - start date/time string of event (JS date string)

Additionally, an event may have the following fields:

* **endDateTime** - end date/time string of event (JS date string)
* **location** - the name of the event's location

Events with no explicit start TIME (hours, minutes) have a specified start time
of midnight and no end time.


## GET /athleticsCalendar

This sends back a JSON object containing information about all athletics games
and practices for this school year.  With data scraped from the
[athletics games website](http://www.maret.org/fs/elements/5634) and
[athletics practices website](http://www.maret.org/fs/elements/5637),
the format is an object with a "games" key and "practices" key, each mapping to
an array:

```javascript
{
    "games": [
        ...
    ],
    "practices": [
        ...
    ]
}
```

Each array contains athletics event objects in chronological order for athletics
games and practices scraped from the school website.  The information scraped
for games and practices is slightly different, however.  The games events have
the following format:

```json
{
    "team": "Boys' Varsity Soccer",
    "opponent": "Other School"
    "startDateTime": "2016-11-28T20:45:00.000Z",
    "location": "Back Field",
    "isHome": true,
    "result": null,
    "status": "CANCELLED"
}
```

Each game event is guaranteed to have the following fields:

    * **team**: the school team competing
    * **startDateTime**: start date/time string of event (JS date string)
    * **isHome**: boolean whether or not this is a home game

Additionally, each game event may have the following fields:

    * **opponent**: the opposing team name
    * **location**: the name of the game's location (NOT necessarily address)
    * **result**: "Win" or "Loss" or another string indicator of game result
    * **status**: "CANCELLED" or another string indicator of game status

The practices events have the following format (a subset of the game object):

```json
{
    "team": "Boys' Varsity Soccer",
    "startDateTime": "2016-11-28T20:45:00.000Z",
    "location": "Back Field",
    "status": "CANCELLED"
}
```

All fields in a practice object are the same as their corresponding fields in a
game object.


## GET /athleticsTeams

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

Note that the seasons returned are whatever are included at the scraped page,
https://www.maret.org/fs/elements/6188; there may be more or fewer seasons
than are given here.


## Testing

All parts of the scraper have corresponding [Mocha](https://mochajs.org) tests.
To execute all 57 tests, just run

```javascript
npm test
```
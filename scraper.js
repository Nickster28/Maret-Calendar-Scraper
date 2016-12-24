const cheerio = require("cheerio");
const Promise = require("promise");
const util = require("./util.js");


/* EXPORTED FUNCTION: scrapeSchoolCalendars
--------------------------------------------
Parameters:
	date - the start date to fetch the calendars for.

Returns: a list of event objects in chronological order for the next two months
of the school calendar after 'date'.  Each event is guaranteed to have the
following fields:

	- month: abbreviated month name
	- date: the numeric date
	- day: abbreviated day name
	- year: numeric year
	- eventName: name of the event

Additionally, an event may have the following fields:

	- startTime: a datetime string
	- endTime: a datetime string
	- location: the name of the event's location
--------------------------------------------
*/
module.exports.scrapeSchoolCalendars = function(date) {
	const calendarURLs = schoolCalendarURLsForStartingDate(date, 2);
	const urlFetchPromises = calendarURLs.map(function(url) {
		return util.getURL(url);
	});

	return Promise.all(urlFetchPromises).then(function(fetchedHTML) {
		const scraperPromises = fetchedHTML.map(function(html) {
			return scrapeSchoolCalendar(cheerio.load(html));
		});
		return Promise.all(scraperPromises);
	}).then(function(calendars) {
		return mergeCalendars(calendars);
	});
}


/* FUNCTION: schoolCalendarURLsForStartingDate
-----------------------------------------------
Parameters:
	startingDate - the starting date for which to generate school calendar URLs.
				URLs will be created for the month of date and the month after.
	numMonths - The number of total months to generate calendar URLs for.

Returns: an array of school calendar URLs that should be scraped to get school
calendar data for the next numMonths months.
-----------------------------------------------
*/
const schoolCalendarURLsForStartingDate = function(startingDate, numMonths) {
	var year = startingDate.getFullYear();
	var monthNum = startingDate.getMonth() + 1;
	const date = startingDate.getDate();

	// Get URLs for the pages for the next months of school calendar data
	const calendarURLs = [util.constants.SCHOOL_CALENDAR_URL];
	for (var i = 0; i < numMonths - 1; i++) {
	    monthNum += 1;
	    if (monthNum == 13) {
	        monthNum = 1;
	        year += 1;
	    }

	    /* No cal_date param means current month, but we can specify cal_date, 
	    e.g. cal_date=2016-12-1, to get a specific calendar */
	    const url = util.constants.SCHOOL_CALENDAR_URL + "?cal_date=" + year +
	        "-" + monthNum + "-" + date;
	    calendarURLs.push(url);
	}

	return calendarURLs;
}


/* FUNCTION: mergeCalendars
----------------------------
Parameters:
	calendars - an array of chronological calendar event arrays to merge.  Each
				calendar array should be sorted from earliest to latest, and
				the calendar arrays themselves should be sorted from earliest to
				latest within calendars.  Assumes calendars have no "partial
				days" (aka a calendar array must include all events for a
				given day, so we don't have to merge events within a day).

Returns: a single array of all of the events in calendars merged
chronologically.
----------------------------
*/
const mergeCalendars = function(calendars) {
	// Start with the first calendar, and merge in the rest
	const mergedCalendar = [];
	for (var i = 0; i < calendars[0].length; i++) {
		mergedCalendar.push(calendars[0][i]);
	}

	/* Loop over the other calendars, and add events once we're not overlapping
	(since we know the calendar arrays are sorted chronologically and later
	calendar arrays come after earlier ones). */
	for (var i = 1; i < calendars.length; i++) {
		var isOverlapping = true;
		for (var j = 0; j < calendars[i].length; j++) {
			if (mergedCalendar.length == 0 || 
				!containsEvent(mergedCalendar, calendars[i][j])) { 
				isOverlapping = false;
			}
			
			if (!isOverlapping) {
				mergedCalendar.push(calendars[i][j]);
			}
		}
	}
	return mergedCalendar;
}


/* FUNCTION: containsEvent
---------------------------
Parameters:
	calendar - the event array to check
	event - the event you want to know is/isn't in calendar

Returns: whether or not calendar contains the given event.  Assumes the calendar
has no partial days, so if the calendar has events on the same day as event,
we assume that calendar contains event as well. 
---------------------------
*/
const containsEvent = function(calendar, event) {
	for (var i = 0; i < calendar.length; i++) {
		const currEvent = calendar[i];
		if (currEvent.month == event.month && currEvent.date == event.date &&
			currEvent.day == event.day && currEvent.year == event.year) {
			return true;
		}
	}

	return false;
}


/* FUNCTION: scrapeSchoolCalendar
-------------------------------------------
Parameters:
	$ - the Cheerio DOM parser object for the main calendar page to scrape.

Returns: a list of event objects in chronological order scraped from the given
DOM.  Each event is guaranteed to have the following fields:

	- month: abbreviated month name
	- date: the numeric date
	- day: abbreviated day name
	- year: numeric year
	- eventName: name of the event

Additionally, each event may have the following fields:

	- startTime: a datetime string
	- endTime: a datetime string
	- location: the name of the event's location
-------------------------------------------
*/
const scrapeSchoolCalendar = function($) {

	return $(".fsCalendarInfo").map(function(i, elem) {

		// Get date info from the top sibling (elem before all event rows)
		const dateElem = $(elem).siblings().first();
		const date = parseInt(dateElem.attr("data-day"));
		const year = parseInt(dateElem.attr("data-year"));

		// Get the name of the day and month
		var dayName = $(dateElem).find(".fsCalendarDay").text().trim();
		dayName = dayName.substring(0, dayName.length - 1);
		const monthName = $(dateElem).find(".fsCalendarMonth").text().trim();

		const eventName = $(elem).find(".fsCalendarEventTitle").text().trim();

		const event = {
			month: monthName,
			date: date,
			day: dayName,
			year: year,
			eventName: eventName
		};

		// Add the location if there is one
		const location = $(elem).find(".fsLocation");
		if (location.length > 0) {
			event.location = location.text().trim();
		}

		// Add the start time if there is one
		const startTime = $(elem).find(".fsStartTime");
		if (startTime.length > 0) {
			event.startTime = startTime.attr("datetime").trim();
		}

		// Add the end time if there is one
		const endTime = $(elem).find(".fsEndTime");
		if (endTime.length > 0) {
			event.endTime = endTime.attr("datetime").trim();
		}

		return event;
	}).get();
}


/* EXPORTED FUNCTION: scrapeAthleticsCalendars
-----------------------------------------------
Parameters: NA
Returns: an object with the following format:

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

Each game event is guaranteed to have the following fields:

	- month: an abbreviated name for the event month
	- date: the numeric date
	- year: the numeric year
	- team: the school team competing
	- isHome: boolean whether or not this is a home game

Additionally, each game event may have the following fields:

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
-----------------------------------------------
*/
module.exports.scrapeAthleticsCalendars = function() {
	const urlFetchPromises = [
		util.getURL(util.constants.ATHLETICS_GAMES_URL), 
		util.getURL(util.constants.ATHLETICS_PRACTICES_URL)
	];

	return Promise.all(urlFetchPromises).then(function(fetchedHTML) {
		return Promise.all([
			scrapeAthleticsGames(cheerio.load(fetchedHTML[0])),
			scrapeAthleticsPractices(cheerio.load(fetchedHTML[1]))
		]);
	}).then(function(calendars) {
		return {
			games: calendars[0],
			practices: calendars[1]
		};
	});
}


/* FUNCTION: scrapeAthleticsGames
--------------------------------------
Parameters:
	$ - the Cheerio DOM parser object for the athletics games page to scrape

Returns: An array of games event objects, sorted chronologically from
earliest to latest.  The event objects have the following format:

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

Additionally, every game event object may have the following fields:

	- opponent: the opposing team name
	- time: a datetime string
	- location: the name of the game's location (NOT necessarily address)
	- result: "Win" or "Loss" or another string indicator of game result
	- status: "CANCELLED" or another string indicator of game status
--------------------------------------
*/
const scrapeAthleticsGames = function($) {
	return $("tbody tr").map(function(i, elem) {
		const event = {
			month: $(elem).find("td.fsAthleticsDate .fsMonth").text().trim(),
			date: parseInt($(elem).find("td.fsAthleticsDate .fsDay").text()),
			year: parseInt($(elem).find("td.fsAthleticsDate .fsYear").text()),
			team: $(elem).find("td.fsTitle").text().trim()
		};

		// Check if it's a home game (if no label, default to away)
		event.isHome =
			$(elem).find("td.fsAthleticsAdvantage").text().trim() == "Home";

		// Add the opponent if there is one
		const opponentElem = $(elem)
			.find("td.fsAthleticsOpponents .fsAthleticsOpponentNames");
		if (opponentElem.length > 0 && opponentElem.text().trim().length > 0) {
			event.opponent = opponentElem.text().trim();
		}

		// Add the time if there is one
		const timeElem = $(elem).find("td.fsAthleticsTime time");
		if (timeElem.length > 0
			&& timeElem.attr("datetime").trim().length > 0) {

			event.time = timeElem.attr("datetime").trim();
		}

		// Add the location if there is one
		const locationElem = $(elem).find("td.fsAthleticsLocations");
		if (locationElem.length > 0 && locationElem.text().trim().length > 0) {
			event.location = locationElem.text().trim();
		}

		// Add the game result if there is one
		const resultElem = $(elem).find("td.fsAthleticsResult");
		if (resultElem.length > 0 && resultElem.text().trim().length > 0) {
			event.result = resultElem.text().trim();
		}

		// Add the status if there is one
		const statusElem = $(elem).find("td.fsAthleticsStatus");
		if (statusElem.length > 0 && statusElem.text().trim().length > 0) {
			event.status = statusElem.text().trim();
		}

		return event;
	}).get();
}


/* FUNCTION: scrapeAthleticsPractices
--------------------------------------
Parameters:
	$ - the Cheerio DOM parser object for the athletics practices page to scrape

Returns: An array of practice event objects, sorted chronologically from
earliest to latest.  The objects have the following format:

{
    "month": "Sep",
    "date": 28,
    "year": 2016,
    "team": "Boys' Varsity Soccer",
    "time": "2016-11-28T15:45:00-05:00",
    "location": "Back Field",
    "status": "CANCELLED"
}

Every practice event is guaranteed to have the following fields:

	- month: an abbreviated name for the event month
	- date: the numeric date
	- year: the numeric year
	- team: the school team practicing

Additionally, every practice event object may have the following fields:

	- time: a datetime string
	- location: the name of the practice's location (NOT necessarily address)
	- status: "CANCELLED" or another string indicator of practice status
--------------------------------------
*/
const scrapeAthleticsPractices = function($) {
	return $("tbody tr").map(function(i, elem) {
		const event = {
			month: $(elem).find("td.fsAthleticsDate .fsMonth").text().trim(),
			date: parseInt($(elem).find("td.fsAthleticsDate .fsDay").text()),
			year: parseInt($(elem).find("td.fsAthleticsDate .fsYear").text()),
			team: $(elem).find("td.fsTitle").text().trim()
		};

		// Add the time if there is one
		const timeElem = $(elem).find("td.fsAthleticsTime time");
		if (timeElem.length > 0
			&& timeElem.attr("datetime").trim().length > 0) {

			event.time = timeElem.attr("datetime").trim();
		}

		// Add the location if there is one
		const locationElem = $(elem).find("td.fsAthleticsLocations");
		if (locationElem.length > 0 && locationElem.text().trim().length > 0) {
			event.location = locationElem.text().trim();
		}

		// Add the status if there is one
		const statusElem = $(elem).find("td.fsAthleticsStatus");
		if (statusElem.length > 0 && statusElem.text().trim().length > 0) {
			event.status = statusElem.text().trim();
		}

		return event;
	}).get();
}


/* EXPORTED FUNCTION: scrapeAthleticsTeams
----------------------------------
Parameters: NA

Returns: A dictionary from season names ("Fall") to a list of team names in that
season.  This data is scraped from the school athletics page.
----------------------------------
*/
module.exports.scrapeAthleticsTeams = function() {
	return util.getURL(util.constants.ATHLETICS_TEAMS_URL).then(function(html) {
		return scrapeAthleticsTeamsFromDOM(cheerio.load(html));
	});
}


/* FUNCTION: scrapeAthleticsTeamsFromDOM
----------------------------------
Parameters:
	$ - the Cheerio DOM parser object for the athletics teams page to scrape.

Returns: A dictionary from season name ("Fall") to a list of team names in that
season.  This data is scraped from the given Cheerio DOM object.
----------------------------------
*/
const scrapeAthleticsTeamsFromDOM = function($) {

	// A dictionary from season names ("Fall") to a list of team names
	const teamsDict = {};

	// There's one section element per season
	$("section").each(function(i, elem) {
		const season = $(elem).find("header h2").text().trim();
		const teamNameSelector = "span.fsAthleticsTeamName";

		// Get a list of all team names within this section
		const teams = $(elem).find(teamNameSelector).map(function(i, elem) {
			return $(elem).text().trim();
		}).get();

		teamsDict[season] = teams;
	});

	return teamsDict;
}
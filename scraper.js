const cheerio = require("cheerio");
const Promise = require("promise");
const util = require("./util.js");


/* EXPORTED FUNCTION: scrapeSchoolCalendars
--------------------------------------------
Parameters: NA

Returns: a list of event objects in chronological order for the next two
months of the school calendar.  Each event is guaranteed to have at
least the following fields:

	month - abbreviated month name
	date - the numeric date
	day - abbreviated day name
	year - numeric year
	eventName - name of the event

Additionally, an event may have the following fields:

	startTime - a datetime string
	endTime - a datetime string
	location - the name of the event's location

If any of the above fields are absent, their value is null.
--------------------------------------------
*/
module.exports.scrapeSchoolCalendars = () => {
	const calendarURLs = schoolCalendarURLsForStartingDate(new Date());
	const urlFetchPromises = calendarURLs.map(url => util.getURL(url));
	return Promise.all(urlFetchPromises).then(fetchedHTML => {
		const scraperPromises = fetchedHTML.map(html => {
			return scrapeSchoolCalendar(cheerio.load(html));
		});
		return Promise.all(scraperPromises);
	}).then(calendars => {
		return mergeCalendars(calendars);
	});
}


/* FUNCTION: schoolCalendarURLsForStartingDate
-----------------------------------------------
Parameters:
	startingDate - the starting date for which to generate school calendar URLs.
				URLs will be created for the month of date and the month after.
	numMonths (optional) - defaults to 2.  The number of total months to
							generate calendar URLs for.

Returns: an array of school calendar URLs that should be scraped to get school
calendar data for the next numMonths months.
-----------------------------------------------
*/
const schoolCalendarURLsForStartingDate = (startingDate, numMonths=2) => {
	let year = startingDate.getFullYear();
	let monthNum = startingDate.getMonth() + 1;
	const date = startingDate.getDate();

	// Get URLs for the pages for the next months of school calendar data
	const calendarURLs = [util.constants.SCHOOL_CALENDAR_URL];
	for (let i = 0; i < numMonths - 1; i++) {
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
const mergeCalendars = calendars => {
	// Start with the first calendar, and merge in the rest
	const mergedCalendar = [];
	for (let i = 0; i < calendars[0].length; i++) {
		mergedCalendar.push(calendars[0][i]);
	}

	/* Loop over the other calendars, and add events once we're not overlapping
	(since we know the calendar arrays are sorted chronologically and later
	calendar arrays come after earlier ones). */
	for (let i = 1; i < calendars.length; i++) {
		let isOverlapping = true;
		for (let j = 0; j < calendars[i].length; j++) {
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
const containsEvent = (calendar, event) => {
	for (let i = 0; i < calendar.length; i++) {
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
DOM.  Each event is guaranteed to have at least the following fields:

	month - abbreviated month name
	date - the numeric date
	day - abbreviated day name
	year - numeric year
	eventName - name of the event

Additionally, an event may have the following fields:

	startTime - a datetime string
	endTime - a datetime string
	location - the name of the event's location

If any of the above fields are absent, their value is null.
-------------------------------------------
*/
const scrapeSchoolCalendar = $ => {

	return $(".fsCalendarInfo").map((i, elem) => {

		// Get date info from the top sibling (elem before all event rows)
		const dateElem = $(elem).siblings().first();
		const date = parseInt(dateElem.attr("data-day"));
		const year = parseInt(dateElem.attr("data-year"));

		// Get the name of the day and month
		let dayName = $(dateElem).find(".fsCalendarDay").text().trim();
		dayName = dayName.substring(0, dayName.length - 1);
		const monthName = $(dateElem).find(".fsCalendarMonth").text().trim();

		const eventName = $(elem).find(".fsCalendarEventTitle").text().trim();

		const event = {
			month: monthName,
			date: date,
			day: dayName,
			year: year,
			eventName: eventName,
			startTime: null,
			endTime: null,
			location: null
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


module.exports.scrapeAthleticsCalendar = () => {

}


/* EXPORTED FUNCTION: scrapeAthleticsTeams
----------------------------------
Parameters:
	$ - the Cheerio DOM parser object for the athletics teams page to scrape.

Returns: A dictionary from season names ("Fall") to a list of team names in that
season.  This data is scraped from the school athletics page.
----------------------------------
*/
module.exports.scrapeAthleticsTeams = $ => {

	// A dictionary from season names ("Fall") to a list of team names
	const teamsDict = {};

	// There's one section element per season
	$("section").each((i, elem) => {
		const season = $(elem).find("header h2").text().trim();
		const teamNameSelector = "span.fsAthleticsTeamName";

		// Get a list of all team names within this section
		const teams = $(elem).find(teamNameSelector).map((i, elem) => {
			return $(elem).text().trim();
		}).get();

		teamsDict[season] = teams;
	});

	return teamsDict;
}
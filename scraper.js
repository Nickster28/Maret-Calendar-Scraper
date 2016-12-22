const Promise = require("promise");


/* EXPORTED FUNCTION: scrapeSchoolCalendar
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
module.exports.scrapeSchoolCalendar = $ => {
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
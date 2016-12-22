const cheerio = require("cheerio");
const Promise = require("promise");
const util = require("./util.js");

module.exports.scrapeSchoolCalendar = () => {

}

module.exports.scrapeAthleticsCalendar = () => {

}

/* FUNCTION: scrapeAthleticsTeams
----------------------------------
Parameters: NA
Returns: A dictionary from season names ("Fall") to a list of team names in that
season.  This data is scraped from the school athletics page.
----------------------------------
*/
module.exports.scrapeAthleticsTeams = () => {
	return util.getURL(util.constants.ATHLETICS_TEAMS_URL).then(html => {
		const $ = cheerio.load(html);

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
	});
}
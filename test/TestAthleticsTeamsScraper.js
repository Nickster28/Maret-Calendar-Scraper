const testUtil = require('./testUtil.js');
const scraper = require('../scraper.js');

/*
 * A list of test objects, each representing one test to run.  Each object
 * contains a name for the test, as well as the HTML file to use to test the
 * scraping, and the expected JSON output.
 */
const TESTS = [
	{
		name: "1 Season 1 Team no <a>",
		html: "athleticsTeams/oneonesimple.html",
		json: "athleticsTeams/oneonesimple.json"
	},
	{
		name: "1 Season 1 Team <a>",
		html: "athleticsTeams/oneoneatag.html",
		json: "athleticsTeams/oneoneatag.json"
	},
	{
		name: "1 Season 1 Team Escaped Chars",
		html: "athleticsTeams/oneoneescaped.html",
		json: "athleticsTeams/oneoneescaped.json"
	},
	{
		name: "1 Season Multiple Teams",
		html: "athleticsTeams/onemultiple.html",
		json: "athleticsTeams/onemultiple.json"
	},
	{
		name: "Multiple Seasons Multiple Teams",
		html: "athleticsTeams/multiplemultiple.html",
		json: "athleticsTeams/multiplemultiple.json"
	}
]


/* FUNCTION: run
--------------------
Parameters: NA
Returns: NA

Runs all tests for the athletics teams scraper, which includes tests to scrape
different numbers of seasons, teams, and team name tag formats.
--------------------
*/
module.exports.run = () => {
	testUtil.testScraper("scrapeAthleticsTeams", scraper.scrapeAthleticsTeams,
		TESTS);
}


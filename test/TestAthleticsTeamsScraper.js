const testUtil = require('./testUtil.js');
const scraper = require('../scraper.js');

/*
 * A list of test objects, each representing one test to run.  Each object
 * contains a name for the test, as well as the HTML and JSON file to use to
 test the scraping (named identically, but with different file types).
 */
const TESTS = [
	{
		name: "1 Season 1 Team no <a>",
		file: "athleticsTeams/oneonesimple"
	},
	{
		name: "1 Season 1 Team <a>",
		file: "athleticsTeams/oneoneatag"
	},
	{
		name: "1 Season 1 Team Escaped Chars",
		file: "athleticsTeams/oneoneescaped"
	},
	{
		name: "1 Season Multiple Teams",
		file: "athleticsTeams/onemultiple"
	},
	{
		name: "1 Season Multiple Sports",
		file: "athleticsTeams/onemultiplesports"
	},
	{
		name: "Multiple Seasons Multiple Teams",
		file: "athleticsTeams/multiplemultiple"
	},
	{
		name: "Full",
		file: "athleticsTeams/full"
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
	describe("Athletics Teams Scraper Tests", function() {
		testUtil.testScraper("scrapeAthleticsTeams",
			scraper.scrapeAthleticsTeams, TESTS);
	});
}


const assert = require("assert");
const fs = require("fs");
const mock = require("mock-require");
const rewire = require("rewire");
var scraper = rewire("../scraper.js");
const testUtil = require("./testUtil.js");
const util = require("../util.js");

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
different numbers of seasons, teams, and team name tag formats, and URL fetches.
--------------------
*/
module.exports.run = function() {
	describe("Athletics Teams Scraper Tests", function() {

		// This isn't an exported function, so use rewire (see top)
		const scrapeAthleticsTeamsFromDOM =
			scraper.__get__("scrapeAthleticsTeamsFromDOM");
		testUtil.testScraper("scrapeAthleticsTeamsFromDOM",
			scrapeAthleticsTeamsFromDOM, TESTS);

		// This full test uses the same "full.html/json" as above tests
		describe("scrapeAthleticsTeams", function() {
			// Before all tests are run, mock out getURL to return static HTML
			before(function() {

			    // We want to return the athletics team page to scrape
			    mock('../util.js', {
			        constants: util.constants,
			        getURL: function(url) {
			        	assert.equal(url, util.constants.ATHLETICS_TEAMS_URL,
			        		"Athletics Teams URL should be from util");

			        	var filename = "athleticsTeams/full.html";
			            filename = testUtil.getAbsolutePath(filename);
			            const file = fs.readFileSync(filename, 'utf8');
			            return Promise.resolve(file);
			        }
			    });

			    scraper = mock.reRequire('../scraper.js');
			});

			after(function() {
			    mock.stop('../util.js');
			});

			// Test the whole scraping pipeline to ensure correct output
			it("Full", function() {
			    return scraper.scrapeAthleticsTeams().then(function(teams) {
			        // Get the correct JSON output
			        var jsonFilename = "athleticsTeams/full.json";
			        jsonFilename = testUtil.getAbsolutePath(jsonFilename);
			        const jsonFile = fs.readFileSync(jsonFilename, 'utf8');
			        assert.deepStrictEqual(teams, JSON.parse(jsonFile));
			    });
			});
		});
	});
}


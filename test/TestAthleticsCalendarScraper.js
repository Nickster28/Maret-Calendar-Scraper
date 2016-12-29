const assert = require("assert");
const fs = require("fs");
const mock = require("mock-require");
const rewire = require("rewire");
var scraper = rewire("../scraper.js");
const testUtil = require("./testUtil.js");
const util = require("../util.js");


/* FUNCTION: run
-------------------
Parameters: NA
Returns: NA

Runs all tests for the athletics calendar scraper, including tests for scraping
games and practices, and different optional fields.
-------------------
*/
module.exports.run = function() {
    describe("Athletics Calendar Scraper Tests", function() {
        testScrapeAthleticsGames();
        testScrapeAthleticsPractices();
        testScrapeAthleticsCalendars();  
    });
}


const GAMES_TESTS = [
	{
		name: "Base Game (No Home/Away Label)",
		file: "athleticsCalendarGame/base"
	},
	{
		name: "Away Game",
		file: "athleticsCalendarGame/away"
	},
	{
		name: "Home Game",
		file: "athleticsCalendarGame/home"
	},
	{
		name: "Opponent",
		file: "athleticsCalendarGame/opponent"
	},
	{
		name: "Time",
		file: "athleticsCalendarGame/time"
	},
	{
		name: "Location",
		file: "athleticsCalendarGame/location"
	},
	{
		name: "Game Result",
		file: "athleticsCalendarGame/result"
	},
	{
		name: "Game Status",
		file: "athleticsCalendarGame/status"
	},
	{
		name: "Complete Event",
		file: "athleticsCalendarGame/complete"
	},
	{
		name: "Ignore Table Header",
		file: "athleticsCalendarGame/tableHeader"
	},
	{
		name: "Full",
		file: "athleticsCalendarGame/full"
	}
];


/* FUNCTION: testScrapeAthleticsGames
--------------------------------------
Parameters: NA
Returns: NA

Runs all tests in GAMES_TESTS to test different types of scraped athletics
games, including testing different optional fields, home vs. away, etc.
--------------------------------------
*/
const testScrapeAthleticsGames = function() {
	// This isn't an exported function, so use rewire (see top)
	const scrapeAthleticsGames = scraper.__get__("scrapeAthleticsGames");
	testUtil.testScraper("scrapeAthleticsGames", scrapeAthleticsGames,
		GAMES_TESTS);
}

const PRACTICES_TESTS = [
	{
		name: "Base Practice",
		file: "athleticsCalendarPractice/base"
	},
	{
		name: "Time",
		file: "athleticsCalendarPractice/time"
	},
	{
		name: "Location",
		file: "athleticsCalendarPractice/location"
	},
	{
		name: "Game Status",
		file: "athleticsCalendarPractice/status"
	},
	{
		name: "Complete Event",
		file: "athleticsCalendarPractice/completePractice"
	},
	{
		name: "Ignore Table Header",
		file: "athleticsCalendarPractice/tableHeader"
	},
	{
		name: "Full",
		file: "athleticsCalendarPractice/full"
	}
];


/* FUNCTION: testScrapeAthleticsPractices
--------------------------------------
Parameters: NA
Returns: NA

Runs all tests in PRACTICES_TESTS to test different types of scraped athletics
practices, including testing different optional fields.
--------------------------------------
*/
const testScrapeAthleticsPractices = function() {
	// This isn't an exported function, so use rewire (see top)
	const scrapeAthleticsPractices =
		scraper.__get__("scrapeAthleticsPractices");
	testUtil.testScraper("scrapeAthleticsPractices", scrapeAthleticsPractices,
		PRACTICES_TESTS);
}


/* FUNCTION: testScrapeAthleticsCalendars
------------------------------------------
Parameters: NA
Returns: NA

Runs a test on the whole athletics calendar scraping pipeline, which includes
fetching and scraping athletics games and practices.
------------------------------------------
*/
const testScrapeAthleticsCalendars = function() {
    describe("scrapeAthleticsCalendars", function() {
        
        // Before all tests are run, mock out getURL to return static HTML files
        var oldGetURL = null;
        before(function() {
            var callNumber = 0;

           	/* We want to return two calendar HTML files to scrape.  Make sure
           	this function is called with the right parameters and right number
           	of times. */
           	oldGetURL = util.getURL;
           	util.getURL = function(url) {
           	    var filename = "";
           	    if (callNumber > 1) {
           	    	assert(false, "Error: too many calls: " + callNumber);
           	    } else if (url == util.constants.ATHLETICS_GAMES_URL) {
           	        filename = "athleticsCalendar/fullGames.html";
           	    } else if (url == util.constants.ATHLETICS_PRACTICES_URL) {
           	        filename = "athleticsCalendar/fullPractices.html";
           	    } else {
           	    	assert(false, "Error: invalid url " + url);
           	    }

           	    filename = testUtil.getAbsolutePath(filename);
           	    const file = fs.readFileSync(filename, "utf8");
           	    callNumber += 1;
           	    return Promise.resolve(file);
           	};

            mock("../util.js", util);
            scraper = mock.reRequire("../scraper.js");
        });

        after(function() {
            mock.stop("../util.js");
            util.getURL = oldGetURL;
        });

        // Test the whole scraping pipeline to ensure correct output
        it("Full", function() {
            return scraper.scrapeAthleticsCalendars().then(function(data) {
                // Get the correct JSON output
                var jsonFilename = "athleticsCalendar/full.json";
                jsonFilename = testUtil.getAbsolutePath(jsonFilename);
                const jsonFile = fs.readFileSync(jsonFilename, "utf8");
                const correctOutput = JSON.parse(jsonFile);
                assert.deepStrictEqual(data, correctOutput);
            });
        });
    });
}




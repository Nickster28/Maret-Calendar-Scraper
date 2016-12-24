const assert = require("assert");
const fs = require("fs");
const mock = require("mock-require");
const rewire = require("rewire");
let scraper = rewire("../scraper.js");
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
		file: "athleticsCalendar/base"
	},
	{
		name: "Away Game",
		file: "athleticsCalendar/away"
	},
	{
		name: "Home Game",
		file: "athleticsCalendar/home"
	},
	{
		name: "Opponent",
		file: "athleticsCalendar/opponent"
	},
	{
		name: "Time",
		file: "athleticsCalendar/time"
	},
	{
		name: "Location",
		file: "athleticsCalendar/location"
	},
	{
		name: "Game Result",
		file: "athleticsCalendar/gameResult"
	},
	{
		name: "Game Status",
		file: "athleticsCalendar/gameStatus"
	},
	{
		name: "Complete Event",
		file: "athleticsCalendar/completeEvent"
	},
	{
		name: "Ignore Table Header",
		file: "athleticsCalendar/tableHeader"
	},
	{
		name: "Full",
		file: "athleticsCalendar/fullGames"
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
const testScrapeAthleticsGames = () => {
	// This isn't an exported function, so use rewire (see top)
	const scrapeAthleticsGames = scraper.__get__("scrapeAthleticsGames");
	testUtil.testScraper("scrapeAthleticsGames", scrapeAthleticsGames,
		GAMES_TESTS);
}

const PRACTICES_TESTS = [];


const testScrapeAthleticsPractices = () => {
	// This isn't an exported function, so use rewire (see top)
	const scrapeAthleticsPractices =
		scraper.__get__("scrapeAthleticsPractices");
	testUtil.testScraper("scrapeAthleticsPractices", scrapeAthleticsPractices,
		PRACTICES_TESTS);
}


const testScrapeAthleticsCalendars = () => {
    
}
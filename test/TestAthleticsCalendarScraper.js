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
        testScrapeAthleticsCalendar();
        testScrapeAthleticsCalendars();  
    });
}


const testScrapeAthleticsCalendar = () => {

}


const testScrapeAthleticsCalendars = () => {
    
}
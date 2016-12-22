const assert = require('assert');
const cheerio = require("cheerio");
const fs = require('fs');

const TEST_FILES_DIRECTORY = "files";


/*
 * EXPORTED FUNCTION: testScraper
 * -------------------------------
 * Parameters:
 *      testName - the name of the bundle of tests being run.  Displayed by
 *                  mocha when running all the tests.
 *      scraperFn - the scraper function to test.  Should take a Cheerio DOM
 *                  parser object for the DOM to scrape.
 *      tests - an array of test objects, each corresponding to one test to run.
 *              Each test object should contain a name, html, and json field.
 *              The name field is displayed as the test's name.  The html and
 *              json fields are the names of the files within the test files
 *              directory for the test HTML file to scrape, and the correct JSON
 *              output of that scraping, respectively.
 *
 * Returns: NA
 *
 * Runs mocha tests for each test object contained within tests on the given
 * scraper function.
 * -------------------------------
 */
module.exports.testScraper = (testName, scraperFn, tests) => {
    "use strict";
    describe(testName, function() {
        tests.forEach(test => {
            it(test["name"], function() {

                // Get the HTML file to scrape for this test and scrape it
                let htmlFilename = getAbsolutePath(test["html"]);
                const $ = cheerio.load(fs.readFileSync(htmlFilename, "utf8"));
                const output = scraperFn($);

                // Get the correct JSON output
                let jsonFilename = getAbsolutePath(test["json"]);
                const jsonFile = fs.readFileSync(jsonFilename, 'utf8');
                const correctOutput = JSON.parse(jsonFile);

                assert.deepStrictEqual(output, correctOutput,
                    "JSON output should match.");
            });
        });
    });
}


/*
 * FUNCTION: getAbsolutePath
 * --------------------------
 * Parameters:
 *     filename - the name of a file in the TEST_FILES_DIRECTORY folder
 * 
 * Returns: the absolute path for the given filename.  Prepends the current test
 *          directory plus TEST_FILES_DIRECTORY.
 * --------------------------
 */
function getAbsolutePath(filename) {
    return __dirname + "/" + TEST_FILES_DIRECTORY + "/" + filename;
}
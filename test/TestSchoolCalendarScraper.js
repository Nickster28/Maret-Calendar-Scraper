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

Runs all tests for the school calendar scraper, including tests for scraping
individual events, single calendars, and merged calendars.
-------------------
*/
module.exports.run = function() {
    describe("School Calendar Scraper Tests", function() {
        testSchoolCalendarURLsForStartingDate();
        testMergeCalendars();
        testContainsEvent();
        testScrapeSchoolCalendar();
        testScrapeSchoolCalendars();  
    });
}


/* FUNCTION: testSchoolCalendarURLsForStartingDate
---------------------------------------------------
Parameters: NA
Returns: NA

Runs tests for generating school calendar URLs to scrape given a starting date.
Tests generating URLs within the same year, and also overflowing across 2 years.
---------------------------------------------------
*/
const testSchoolCalendarURLsForStartingDate = function() {
    "use strict";
    describe("schoolCalendarURLsForStartingDate Tests", function() {
        
        for (var i = 1; i <= 6; i++) {
            testSameYearURLs(i);
        }

        for (var i = 0; i < 6; i++) {
            testOverflowYearURLs(i);
        }
    });
}


/* FUNCTION: testSameYearURLs
------------------------------
Parameters:
    numURLs - the number of URLs to test generating

Returns: NA

Tests that generating numURLs urls for the same year for scraping the school
calendar works correctly.
------------------------------
*/
const testSameYearURLs = function(numURLs) {
    if (numURLs > 12) assert(false, "Error: can't have > 12 same-year URLs");

    it("Same Year (" + numURLs + " URLs)", function() {
        const SCHOOL_CALENDAR_URL = util.constants.SCHOOL_CALENDAR_URL;

        // This isn't an exported function, so use rewire to get it (see top)
        const schoolCalendarURLsForStartingDate =
            scraper.__get__("schoolCalendarURLsForStartingDate")

        const testDate = new Date(2016, 0, 25, 0, 0, 0, 0);
        const urls = schoolCalendarURLsForStartingDate(testDate, numURLs);
        assert.equal(urls.length, numURLs, "Should have " + numURLs + " URLs");
        assert.equal(urls[0], SCHOOL_CALENDAR_URL,
            "First URL should be base school calendar URL");

        // Each subsequent URL should have a cal_date query param for month + 1
        for (var i = 1; i < urls.length; i++) {
            const queryParam = "?cal_date=" + testDate.getFullYear() + "-" +
                (testDate.getMonth() + 1 + i) + "-" + testDate.getDate();
            assert.equal(urls[i], SCHOOL_CALENDAR_URL + queryParam,
               "URL " + (i+1) + " should have correct cal_date query param"); 
        }
    });
}


/* FUNCTION: testOverflowYearURLs
------------------------------
Parameters:
    numURLs - number of URLs to test generating, IN ADDITION to 2 for overflow

Returns: NA

Tests that generating numURLs urls across 2 years for scraping the school
calendar works correctly (aka month and year wrapping work properly).
------------------------------
*/
const testOverflowYearURLs = function(numURLs) {
    numURLs += 2;
    it("Year Overflow (" + numURLs + " URLs)", function() {
        const SCHOOL_CALENDAR_URL = util.constants.SCHOOL_CALENDAR_URL;

        // This isn't an exported function, so use rewire to get it (see top)
        const schoolCalendarURLsForStartingDate =
            scraper.__get__("schoolCalendarURLsForStartingDate");

        const testDate = new Date(2016, 11, 25, 0, 0, 0, 0);
        const urls = schoolCalendarURLsForStartingDate(testDate, numURLs);
        assert.equal(urls.length, numURLs, "Should have " + numURLs + " URLs");
        assert.equal(urls[0], SCHOOL_CALENDAR_URL,
            "First URL should be base school calendar URL");

        /* Each subsequent URL should have a cal_date query param for month + 1
        with wrapping to the next year. */
        var month = testDate.getMonth() + 1;
        var year = testDate.getFullYear();

        for (var i = 1; i < urls.length; i++) {
            const date = testDate.getDate();
            month += 1;
            if (month == 13) {
                month = 1;
                year += 1;
            }
            const queryParam = "?cal_date=" + year + "-" + month + "-" + date;
            assert.equal(urls[i], SCHOOL_CALENDAR_URL + queryParam,
               "URL " + (i+1) + " should have correct cal_date query param"); 
        }
    });
}


/* FUNCTION: testMergeCalendars
------------------------------
Parameters: NA
Returns: NA

Tests that merging multiple calendars together works properly.
------------------------------
*/
const testMergeCalendars = function() {
    "use strict";
    describe("mergeCalendars Tests", function() {

        // This isn't an exported function, so use rewire to get it (see top)
        const mergeCalendars = scraper.__get__("mergeCalendars");

        // calendar1 and calendar2 are disjoint, one event each
        const calendar1 = [
            {
                eventName: "Test Event",
                startDateTime: "2016-11-02T05:00:00.000Z"
            }
        ];

        const calendar2 = [
            {
                eventName: "Test Event 2",
                startDateTime: "2016-11-03T05:00:00.000Z"
            }
        ];

        /* overlapCalendar1 = calendar1 + calendar2, shares last event with
        overlapCalendar2. */
        const overlapCalendar1 = [
            ...calendar1,
            ...calendar2
        ];

        const overlapCalendar2 = [
            overlapCalendar1[overlapCalendar1.length - 1],
            {
                eventName: "Test Event 3",
                startDateTime: "2016-11-04T05:00:00.000Z"
            }
        ];

        /* multiOverlapCalendar1 = overlapCalendar1 + overlapCalendar2.  Shares
        last 2 events with multiOverlapCalendar2. */
        const multiOverlapCalendar1 = [
            ...overlapCalendar1,
            overlapCalendar2[overlapCalendar2.length - 1]
        ];

        const multiOverlapCalendar2 = [
            multiOverlapCalendar1[multiOverlapCalendar1.length - 2],
            multiOverlapCalendar1[multiOverlapCalendar1.length - 1],
            {
                eventName: "Test Event 4",
                startDateTime: "2016-11-05T05:00:00.000Z"
            }
        ];
        
        it("Disjoint", function() {
            const merged = mergeCalendars([calendar1, calendar2]);
            assert.deepStrictEqual(merged, [...calendar1, ...calendar2],
                "merged should be concatenation");
        });

        it("Same Calendars", function() {
            const merged = mergeCalendars([calendar1, calendar1]);
            assert.deepStrictEqual(merged, calendar1,
                "merged should be one calendar since they're duplicates");
        });

        it("Single Event Overlap", function() {
            const merged = mergeCalendars([overlapCalendar1, overlapCalendar2]);
            assert.deepStrictEqual(merged,
                [...overlapCalendar1, 
                    overlapCalendar2[overlapCalendar2.length - 1]],
                "Nov 3 event should only be included once");
        });

        it("Multiple Event Overlap", function() {
            const merged = mergeCalendars([multiOverlapCalendar1, 
                multiOverlapCalendar2]);
            assert.deepStrictEqual(merged,
                [...multiOverlapCalendar1, 
                    multiOverlapCalendar2[multiOverlapCalendar2.length - 1]],
                "Should be 2 overlapped events");
        });

        it("Single Calendar", function() {
            const merged = mergeCalendars([calendar1]);
            assert.deepStrictEqual(merged, calendar1, "merged should be same");
        });

        it("Empty Calendars", function() {
            for (var i = 0; i < 3; i++) {

                // Make 2 of 3 calendars empty, except for calendars[i]
                const calendars = [];
                for (var j = 0; j < 3; j++) {
                    if (j == i) calendars.push(calendar1);
                    else calendars.push([]);
                }

                const merged = mergeCalendars(calendars);
                assert.deepStrictEqual(merged, calendar1,
                    "empty calendars should be ignored in any order");
            }
        });

        it("Multiple Calendars Overlap", function() {
            const merged = mergeCalendars([calendar1, overlapCalendar1,
                overlapCalendar2, multiOverlapCalendar2]);
            assert.deepStrictEqual(merged, [...multiOverlapCalendar1,
                multiOverlapCalendar2[multiOverlapCalendar2.length - 1]]);
        });
    });
}


/* FUNCTION: testContainsEvent
------------------------------
Parameters: NA
Returns: NA

Tests that containsEvent properly detects whether an event is in a calendar.
Note that it assumes that calendars have no "incomplete days", i.e. if a
calendar contains entries for a given day, then it must contain *all* entries
for a given day.
------------------------------
*/
const testContainsEvent = function() {
    "use strict";
    describe("containsEvent Tests", function() {

        // This isn't an exported function, so use rewire to get it (see top)
        const containsEvent = scraper.__get__("containsEvent");

        const calendar = [
            {
                eventName: "Test Event",
                "startDateTime": "2016-11-02T05:00:00.000Z"
            },
            {
                eventName: "Test Event 2",
                startDateTime: "2016-11-03T05:00:00.000Z"
            }
        ];
        
        it("Doesn't Contain Event", function() {
            assert(!containsEvent(calendar, {
                eventName: "Test Event 3",
                startDateTime: "2016-11-04T05:00:00.000Z"
            }), "event not in original calendar");
        });

        it("Contains Event", function() {
            assert(containsEvent(calendar, {
                eventName: "Test Event 2",
                startDateTime: "2016-11-03T05:00:00.000Z"
            }), "event in original calendar");
        });
    });
}

/*
 * A list of test objects, each representing one test to run.  Each object
 * contains a name for the test, as well as the HTML and JSON file to use to
 test the scraping (named identically, but with different file types).
 */
const TESTS = [
    {
        name: "Event Name Only",
        file: "schoolCalendar/eventNameOnly"
    },
    {
        name: "Event Start Time",
        file: "schoolCalendar/eventStartTime"
    },
    {
        name: "Event Start + End Time",
        file: "schoolCalendar/eventStartEndTime"
    },
    {
        name: "Event Location",
        file: "schoolCalendar/eventLocation"
    },
    {
        name: "Complete Event",
        file: "schoolCalendar/completeEvent"
    },
    {
        name: "Single Day",
        file: "schoolCalendar/singleDay"
    },
    {
        name: "Multiple Days",
        file: "schoolCalendar/multipleDays"
    },
    {
        name: "Full",
        file: "schoolCalendar/full"
    }
]

/* FUNCTION: testScrapeSchoolCalendar
--------------------
Parameters: NA
Returns: NA

Runs all tests for the SINGLE school calendar scraper, which includes tests to
scrape different variations of possible events, single days, and multiple days.
--------------------
*/
const testScrapeSchoolCalendar = function() {
    // This isn't an exported function, so use rewire to get it (see top)
    const scrapeSchoolCalendar = scraper.__get__("scrapeSchoolCalendar");
    testUtil.testScraper("scrapeSchoolCalendar", scrapeSchoolCalendar, 
        TESTS);
}


/* FUNCTION: testScrapeSchoolCalendars
--------------------
Parameters: NA
Returns: NA

Runs a test on the whole school calendar scraping pipeline, which includes
everything tested above such as calendar URL generation, page scraping, and
calendar event merging.
--------------------
*/
const testScrapeSchoolCalendars = function() {
    describe("scrapeSchoolCalendars", function() {
        
        // Before all tests are run, mock out getURL to return static HTML files
        before(function() {
            var callNumber = 0;

            // We want to return two calendar HTML files to scrape
            mock("../util.js", {
                constants: util.constants,
                getURL: function(url) {
                    var filename = "";
                    if (callNumber == 0) {
                        assert.equal(url, util.constants.SCHOOL_CALENDAR_URL,
                            "First school calendar URL should be the constant");

                        filename = "schoolCalendar/full.html";
                    } else if (callNumber == 1) {
                        var correctURL = util.constants.SCHOOL_CALENDAR_URL +
                            "?cal_date=2017-1-23";
                        assert.equal(url, correctURL, "Second school " +
                            "URL should have query param");

                        filename = "schoolCalendar/full2.html";
                    } else {
                        assert(false, "Error: call number " + callNumber);
                    }

                    filename = testUtil.getAbsolutePath(filename);
                    const file = fs.readFileSync(filename, "utf8");
                    callNumber += 1;
                    return Promise.resolve(file);
                }
            });

            scraper = mock.reRequire("../scraper.js");
        });

        after(function() {
            mock.stop("../util.js");
        });

        // Test the whole scraping pipeline to ensure correct output
        it("Full", function() {
            const date = new Date(2016, 11, 23, 0, 0, 0, 0);
            return scraper.scrapeSchoolCalendars(date).then(function(data) {
                // Get the correct JSON output
                var jsonFilename = "schoolCalendar/calendarsFull.json";
                jsonFilename = testUtil.getAbsolutePath(jsonFilename);
                const jsonFile = fs.readFileSync(jsonFilename, "utf8");
                const correctOutput = JSON.parse(jsonFile);
                assert.deepStrictEqual(data, correctOutput);
            });
        });
    });
}
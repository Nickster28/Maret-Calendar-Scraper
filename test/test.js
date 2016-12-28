/* MAIN TEST FILE
------------------
Tests for:
	- school calendar scraper
	- athletics calendar scraper
	- athletics teams scraper

All tests are imported and run from their respective files.  Each file
must export a run() method that takes no arguments and runs all of its tests.
------------------
*/

require("./TestSchoolCalendarScraper.js").run();
require("./TestAthleticsCalendarScraper.js").run();
require("./TestAthleticsTeamsScraper.js").run();
const Promise = require('promise');
const request = require('request');


/* FUNCTION: getURL
--------------------------
Parameters:
    url - the url to GET

Returns: a promise containing the GET response from the given url

Uses 'request' within a promise.  If there's an error, the
error will be passed back in a promise.  Otherwise, the response
is passed back.
--------------------------
*/
module.exports.getURL = url => {
    "use strict";
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if(error) reject(error);
            else resolve(body);
        });
    });
}


/* 
 * Export constants for the URLs of the calendars read by the parser. 
 */
var SCHOOL_URL_BASE = "https://www.maret.org"
module.exports.constants = {
	//ATHLETICS_GAMES_URL: SCHOOL_URL_BASE + "/fs/elements/5634",
    //SCHOOL_CALENDAR_URL: SCHOOL_URL_BASE + "/fs/elements/6221",
    //ATHLETICS_PRACTICES_URL: SCHOOL_URL_BASE + "/fs/elements/5637",
    //ATHLETICS_TEAMS_URL: SCHOOL_URL_BASE + "/fs/elements/6188"
    ATHLETICS_GAMES_URL: "localhost:8000/5634.html",
    ATHLETICS_PRACTICES_URL: "localhost:8000/5637.html",
    ATHLETICS_TEAMS_URL: "localhost:8000/6188.html",
    SCHOOL_CALENDAR_URL: "localhost:8000/6221.html"
};


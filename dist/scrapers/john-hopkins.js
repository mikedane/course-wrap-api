'use strict';

let getJohnHopkinsSubjects = (() => {
    var _ref = _asyncToGenerator(function* (callback) {
        var finishedCount = 0;
        var results = { subjects: [] };
        var subjectsQuery = {
            url: johnHopkinsRootUrl + 'index.cfm/go/find.browse#topics',
            type: 'html',
            selector: 'td.col2 div#Topics li',
            extract: ['id', 'text']
        };

        var rawSubjectResults = yield noodle.query(subjectsQuery);

        var subjects = rawSubjectResults.results[0].results;
        subjects.forEach((() => {
            var _ref2 = _asyncToGenerator(function* (subject, index) {
                finishedCount++;
                results.subjects.push({ name: subject.text, url: johnHopkinsRootUrl + "topics/" + subject.id.split("_").pop(), image: "" });
                if (finishedCount == subjects.length) {
                    results.subjects.sort(function (a, b) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    });
                    callback(results);
                }
            });

            return function (_x2, _x3) {
                return _ref2.apply(this, arguments);
            };
        })());
    });

    return function getJohnHopkinsSubjects(_x) {
        return _ref.apply(this, arguments);
    };
})();

let getJohnHopkinsCoursesForSubject = (() => {
    var _ref3 = _asyncToGenerator(function* (subject, callback) {
        var subjectsQuery = {
            url: johnHopkinsRootUrl + 'index.cfm/go/find.coursesByTopic?topicId=' + subject,
            type: 'html',
            selector: "ul li a",
            extract: "href"
        };

        var rawSubjectResults = yield noodle.query(subjectsQuery);
        var courseUrls = rawSubjectResults.results[0].results;
        let finishedCount = 0;
        let results = { courses: [] };
        courseUrls.forEach((() => {
            var _ref4 = _asyncToGenerator(function* (courseUrl) {
                var courseQuery = {
                    url: johnHopkinsRootUrl + courseUrl,
                    type: 'html',
                    map: {
                        images: {
                            selector: "div#courseImage img",
                            extract: "src"
                        },
                        titles: {
                            selector: "div.col2 h1",
                            extract: "text"
                        },
                        descriptions: {
                            selector: "div#courseImageAndInfoBox br+h2+p",
                            extract: "text"
                        },
                        instructors: {
                            selector: "div#courseInfoBox h2+p",
                            extract: "text"
                        }
                    }
                };

                var rawCourseResults = yield noodle.query(courseQuery);
                let course = rawCourseResults.results[0].results;

                let description = "";
                if (course.descriptions.length > 0) {
                    course.descriptions.forEach(function (part) {
                        description += part + "\n";
                    });
                }
                results.courses.push({ name: course.titles[0], image: course.images[0] ? johnHopkinsRootUrl + course.images[0] : "", description: description, url: johnHopkinsRootUrl + courseUrl, instructors: course.instructors[0] });
                finishedCount++;
                if (finishedCount == courseUrls.length) {
                    callback(results);
                }
            });

            return function (_x6) {
                return _ref4.apply(this, arguments);
            };
        })());
    });

    return function getJohnHopkinsCoursesForSubject(_x4, _x5) {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const noodle = require('noodlejs');

const johnHopkinsRootUrl = 'http://ocw.jhsph.edu';
const johnHopkinsId = 'http://ocw.jhsph.edu/';

module.exports.getJohnHopkinsSubjects = getJohnHopkinsSubjects;
module.exports.getJohnHopkinsCoursesForSubject = getJohnHopkinsCoursesForSubject;
module.exports.johnHopkinsId = johnHopkinsId;
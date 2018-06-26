'use strict';

let getMichiganSubjects = (() => {
    var _ref = _asyncToGenerator(function* (callback) {
        var finishedCount = 0;
        var results = { subjects: [] };
        var subjectsQuery = {
            url: michiganRootUrl + 'find/find-open-educational-resources/',
            type: 'html',
            selector: 'aside.sidebars section.sidebar ul.menu li.menu__item ul.menu li.menu__item a',
            extract: ['text', 'href']
        };
        var rawSubjectResults = yield noodle.query(subjectsQuery);

        var subjects = rawSubjectResults.results[0].results;
        subjects.forEach((() => {
            var _ref2 = _asyncToGenerator(function* (subject) {
                finishedCount++;
                results.subjects.push({ name: subject.text, url: michiganRootUrl + subject.href, image: "" });
                if (finishedCount == subjects.length) {
                    results.subjects.sort(function (a, b) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    });
                    callback(results);
                }
            });

            return function (_x2) {
                return _ref2.apply(this, arguments);
            };
        })());
    });

    return function getMichiganSubjects(_x) {
        return _ref.apply(this, arguments);
    };
})();

let getMichiganCoursesForSubject = (() => {
    var _ref3 = _asyncToGenerator(function* (subject, callback) {
        var subjectsQuery = {
            url: michiganRootUrl + 'find/open-educational-resources/' + subject,
            type: 'html',
            selector: "aside.sidebars section.sidebar ul.menu li.active ul.menu li.menu__item a",
            extract: "href"
        };

        var rawSubjectResults = yield noodle.query(subjectsQuery);
        var courseUrls = rawSubjectResults.results[0].results;
        let finishedCount = 0;
        let results = { courses: [] };
        courseUrls.forEach((() => {
            var _ref4 = _asyncToGenerator(function* (courseUrl) {
                var courseQuery = {
                    url: michiganRootUrl + courseUrl,
                    type: 'html',
                    map: {
                        images: {
                            selector: "div.course-image-wrapper img ",
                            extract: "src"
                        },
                        titles: {
                            selector: "h1.title",
                            extract: "text"
                        },
                        descriptions: {
                            selector: "div.course-content-wrapper div.field-name-field-description p",
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
                results.courses.push({ name: course.titles[0], image: course.images[0], description: description, url: michiganRootUrl + courseUrl });
                finishedCount++;
                if (finishedCount == courseUrls.length) {
                    callback(results);
                }
            });

            return function (_x5) {
                return _ref4.apply(this, arguments);
            };
        })());
    });

    return function getMichiganCoursesForSubject(_x3, _x4) {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const noodle = require('noodlejs');

const michiganRootUrl = 'https://open.umich.edu';
const michiganId = 'https://open.umich.edu/';

module.exports.getMichiganSubjects = getMichiganSubjects;
module.exports.getMichiganCoursesForSubject = getMichiganCoursesForSubject;
module.exports.michiganId = michiganId;
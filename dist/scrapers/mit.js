'use strict';

let getMITSubjects = (() => {
    var _ref = _asyncToGenerator(function* (callback) {
        var finishedCount = 0;
        var results = { subjects: [] };

        var subjectsQuery = {
            url: mitRootUrl + '/courses/',
            type: 'html',
            selector: 'h3.deptTitle a',
            extract: ['text', 'href']
        };

        var rawSubjectResults = yield noodle.query(subjectsQuery);
        var subjects = rawSubjectResults.results[0].results;
        subjects.forEach((() => {
            var _ref2 = _asyncToGenerator(function* (subject) {
                var imageQuery = {
                    url: mitRootUrl + subject.href,
                    type: 'html',
                    selector: 'main img',
                    extract: 'src'
                };
                var rawSubjectImageResults = yield noodle.query(imageQuery);
                var subjectImage = rawSubjectImageResults.results[0].results[0];
                finishedCount++;
                results.subjects.push({ name: subject.text, url: mitRootUrl + subject.href, image: mitRootUrl + subjectImage });
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

    return function getMITSubjects(_x) {
        return _ref.apply(this, arguments);
    };
})();

let getMITCoursesForSubject = (() => {
    var _ref3 = _asyncToGenerator(function* (subjectUrl, callback) {
        var results = { courses: [] };
        var index = 0;
        axios.get(mitRootUrl + '/courses/' + subjectUrl + '/index.json').then(function (subjectResponse) {
            subjectResponse.data.forEach((() => {
                var _ref4 = _asyncToGenerator(function* (course) {
                    yield axios.get(mitRootUrl + course.href + '/index.json').then(function (courseResponse) {
                        var courseJson = courseResponse.data;
                        index++;
                        results.courses.push({ name: course.title, semester: course.sem, level: course.level, description: courseJson.description,
                            image: mitRootUrl + "/" + courseJson.thumb, instructors: courseJson.instructors, features: courseJson.features,
                            url: mitRootUrl + course.href });
                        if (index == subjectResponse.data.length) {
                            results.courses.sort(function (a, b) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;
                                return 0;
                            });
                            callback(results);
                        }
                    }).catch(function (error) {
                        // console.log("Tried for: " + mitRootUrl + course.href + '/index.json' + " but got Error: " + error.address);

                    });
                });

                return function (_x5) {
                    return _ref4.apply(this, arguments);
                };
            })());
        }).catch(function (error) {
            if (error.response) {
                // console.log("error");
            }
            callback(results);
        });
    });

    return function getMITCoursesForSubject(_x3, _x4) {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const noodle = require('noodlejs');

const mitRootUrl = 'https://ocw.mit.edu';
const mitId = 'https://ocw.mit.edu/';

module.exports.getMITSubjects = getMITSubjects;
module.exports.getMITCoursesForSubject = getMITCoursesForSubject;
module.exports.mitId = mitId;
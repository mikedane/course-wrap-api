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
                            image: courseJson.thumb, instructors: courseJson.instructors, features: courseJson.features });
                        if (index == subjectResponse.data.length) {
                            results.courses.sort(function (a, b) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;
                                return 0;
                            });
                            callback(results);
                        }
                    }).catch(function (error) {
                        return callback(results);
                    });
                });

                return function (_x5) {
                    return _ref4.apply(this, arguments);
                };
            })());
        }).catch(function (error) {
            return callback(results);
        });
    });

    return function getMITCoursesForSubject(_x3, _x4) {
        return _ref3.apply(this, arguments);
    };
})();

let getYaleSubjects = (() => {
    var _ref5 = _asyncToGenerator(function* (callback) {

        var finishedCount = 0;
        var results = { subjects: [] };

        var subjectsQuery = {
            url: yaleRootUrl + '/courses/',
            type: 'html',
            selector: 'div.view-content table.views-table tbody tr td.views-field-title a',
            extract: ['text', 'href']
        };

        var rawSubjectResults = yield noodle.query(subjectsQuery);

        var unique = {};
        rawSubjectResults.results[0].results.forEach(function (subject) {
            unique[subject.text] = subject;
        });

        var subjects = Object.keys(unique).map(function (k) {
            return unique[k];
        });

        // var subjects = rawSubjectResults.results[0].results.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
        // console.log(subjects);

        subjects.forEach((() => {
            var _ref6 = _asyncToGenerator(function* (subject) {
                var imageQuery = {
                    url: yaleRootUrl + subject.href,
                    type: 'html',
                    selector: 'div.view-content table.views-table tbody tr.views-row-first td.views-field-field-department-image img',
                    extract: 'src'
                };
                var rawSubjectImageResults = yield noodle.query(imageQuery);
                var subjectImage = rawSubjectImageResults.results[0].results[0];
                finishedCount++;
                results.subjects.push({ name: subject.text, url: yaleRootUrl + subject.href, image: subjectImage });
                if (finishedCount == subjects.length) {
                    results.subjects.sort(function (a, b) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    });
                    callback(results);
                }
            });

            return function (_x7) {
                return _ref6.apply(this, arguments);
            };
        })());
    });

    return function getYaleSubjects(_x6) {
        return _ref5.apply(this, arguments);
    };
})();

let getYaleCoursesForSubject = (() => {
    var _ref7 = _asyncToGenerator(function* (subject, callback) {

        var results = { courses: [] };
        var subjectsQuery = {
            url: yaleRootUrl + '/' + subject,
            type: 'html',
            map: {
                names: {
                    selector: "div.view-content table tbody tr td.views-field-body a:first-of-type",
                    extract: "text"
                },
                instructors: {
                    selector: "div.view-content table tbody tr td.views-field-body a.professor-name",
                    extract: "text"
                },
                images: {
                    selector: "div.view-content table tbody tr td.views-field-field-department-image img",
                    extract: "src"
                }
            }
        };

        var rawSubjectResults = yield noodle.query(subjectsQuery);
        var courses = rawSubjectResults.results[0].results;
        for (var i = 0; i < courses.names.length; i++) {
            results.courses.push({ name: courses.names[i], instructors: courses.instructors[i].replace('with ', ''), image: courses.images[i] });
        }
        callback(results);
    });

    return function getYaleCoursesForSubject(_x8, _x9) {
        return _ref7.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const noodle = require('noodlejs');
const axios = require('axios');

const mitRootUrl = 'https://ocw.mit.edu';

const yaleRootUrl = 'https://oyc.yale.edu';

module.exports.getMITSubjects = getMITSubjects;
module.exports.getMITCoursesForSubject = getMITCoursesForSubject;
module.exports.getYaleSubjects = getYaleSubjects;
module.exports.getYaleCoursesForSubject = getYaleCoursesForSubject;
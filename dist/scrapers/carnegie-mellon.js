'use strict';

let getCMCoursesForSubject = (() => {
    var _ref = _asyncToGenerator(function* (subject, callback) {
        var subjectsQuery = {
            url: cmRootUrl + '/' + subject,
            type: 'html',
            selector: "div.accordion-group div.accordion-body a.addInfo",
            extract: "href"
        };

        var rawSubjectResults = yield noodle.query(subjectsQuery);
        var courseUrls = rawSubjectResults.results[0].results;
        let finishedCount = 0;
        let results = { courses: [] };
        courseUrls.forEach((() => {
            var _ref2 = _asyncToGenerator(function* (courseUrl) {
                var courseQuery = {
                    url: courseUrl,
                    type: 'html',
                    map: {
                        images: {
                            selector: "div.overview img ",
                            extract: "src"
                        },
                        titles: {
                            selector: "h1",
                            extract: "text"
                        },
                        descriptions: {
                            selector: "div.overview p",
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
                results.courses.push({ name: course.titles[0], image: course.images[0] ? course.images[0].charAt(0) == '/' ? cmImageRootUrl + course.images[0] : course.images[0] : "", description: description, url: courseUrl });
                finishedCount++;
                if (finishedCount == courseUrls.length) {
                    callback(results);
                }
            });

            return function (_x3) {
                return _ref2.apply(this, arguments);
            };
        })());
    });

    return function getCMCoursesForSubject(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const noodle = require('noodlejs');
const cmRootUrl = 'http://oli.cmu.edu/learn-with-oli/';
const cmId = 'http://oli.cmu.edu/';
const cmImageRootUrl = 'http://oli.cmu.edu/';

function getCMSubjects(callback) {
    let results = { subjects: [] };
    results.subjects = [{ name: "All Carnegie Mellon Courses", url: cmRootUrl + 'see-all-oli-courses', image: 'http://oli.cmu.edu/wp-content/uploads/2012/07/bio_thumb.png' }];
    callback(results);
}

module.exports.getCMSubjects = getCMSubjects;
module.exports.getCMCoursesForSubject = getCMCoursesForSubject;
module.exports.cmId = cmId;
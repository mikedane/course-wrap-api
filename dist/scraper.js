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

// ------------------ Yale ---------------------


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
                },
                descriptions: {
                    selector: "div.view-content table tbody tr td.views-field-body p:first-of-type",
                    extract: "text"
                },
                urls: {
                    selector: "div.view-content table tbody tr td.views-field-body a:first-of-type",
                    extract: "href"
                }
            }
        };

        var rawSubjectResults = yield noodle.query(subjectsQuery);
        var courses = rawSubjectResults.results[0].results;
        for (var i = 0; i < courses.names.length; i++) {
            results.courses.push({ name: courses.names[i], instructors: courses.instructors[i].replace('with ', ''),
                image: courses.images[i], description: courses.descriptions[i], url: yaleRootUrl + courses.urls[i] });
        }
        callback(results);
    });

    return function getYaleCoursesForSubject(_x8, _x9) {
        return _ref7.apply(this, arguments);
    };
})();

// -------------- Carnegie Mellon ---------------


let getCMCoursesForSubject = (() => {
    var _ref8 = _asyncToGenerator(function* (subject, callback) {
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
            var _ref9 = _asyncToGenerator(function* (courseUrl) {
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

            return function (_x12) {
                return _ref9.apply(this, arguments);
            };
        })());
    });

    return function getCMCoursesForSubject(_x10, _x11) {
        return _ref8.apply(this, arguments);
    };
})();

// -------------- Michigan ---------------


let getMichiganSubjects = (() => {
    var _ref10 = _asyncToGenerator(function* (callback) {
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
            var _ref11 = _asyncToGenerator(function* (subject) {
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

            return function (_x14) {
                return _ref11.apply(this, arguments);
            };
        })());
    });

    return function getMichiganSubjects(_x13) {
        return _ref10.apply(this, arguments);
    };
})();

let getMichiganCoursesForSubject = (() => {
    var _ref12 = _asyncToGenerator(function* (subject, callback) {
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
            var _ref13 = _asyncToGenerator(function* (courseUrl) {
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

            return function (_x17) {
                return _ref13.apply(this, arguments);
            };
        })());
    });

    return function getMichiganCoursesForSubject(_x15, _x16) {
        return _ref12.apply(this, arguments);
    };
})();

// -------------- John Hopkins ---------------


let getJohnHopkinsSubjects = (() => {
    var _ref14 = _asyncToGenerator(function* (callback) {
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
            var _ref15 = _asyncToGenerator(function* (subject, index) {
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

            return function (_x19, _x20) {
                return _ref15.apply(this, arguments);
            };
        })());
    });

    return function getJohnHopkinsSubjects(_x18) {
        return _ref14.apply(this, arguments);
    };
})();

let getJohnHopkinsCoursesForSubject = (() => {
    var _ref16 = _asyncToGenerator(function* (subject, callback) {
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
            var _ref17 = _asyncToGenerator(function* (courseUrl) {
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

            return function (_x23) {
                return _ref17.apply(this, arguments);
            };
        })());
    });

    return function getJohnHopkinsCoursesForSubject(_x21, _x22) {
        return _ref16.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const noodle = require('noodlejs');
const axios = require('axios');

const mitId = 'https://ocw.mit.edu/';
const yaleId = 'https://oyc.yale.edu/';
const cmId = 'http://oli.cmu.edu/';
const michiganId = 'https://open.umich.edu/';
const johnHopkinsId = 'http://ocw.jhsph.edu/';

function getSubjects(schoolId, callback) {
    switch (schoolId) {
        case mitId:
            getMITSubjects(callback);
            break;
        case yaleId:
            getYaleSubjects(callback);
            break;
        case cmId:
            getCMSubjects(callback);
            break;
        case michiganId:
            getMichiganSubjects(callback);
            break;
        case johnHopkinsId:
            getJohnHopkinsSubjects(callback);
            break;
        default:
            callback({ subjects: [] });
    }
}

function getCourses(schoolId, subjectId, callback) {
    if (subjectId) {
        switch (schoolId) {
            case mitId:
                getMITCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case yaleId:
                getYaleCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case cmId:
                getCMCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case michiganId:
                getMichiganCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case johnHopkinsId:
                getJohnHopkinsCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            default:
                callback({ courses: [] });
        }
    }
}

// ------------------ MIT ----------------------
const mitRootUrl = 'https://ocw.mit.edu';
const yaleRootUrl = 'https://oyc.yale.edu';
const cmRootUrl = 'http://oli.cmu.edu/learn-with-oli/';
const cmImageRootUrl = 'http://oli.cmu.edu/';
function getCMSubjects(callback) {
    let results = { subjects: [] };
    results.subjects = [{ name: "All Carnegie Mellon Courses", url: cmRootUrl + 'see-all-oli-courses', image: 'http://oli.cmu.edu/wp-content/uploads/2012/07/bio_thumb.png' }];
    callback(results);
}

const michiganRootUrl = 'https://open.umich.edu/';

const johnHopkinsRootUrl = 'http://ocw.jhsph.edu/';

function getSubjectUrlFromId(subjectId) {
    return subjectId.split("/").pop();
}

module.exports.getSubjects = getSubjects;
module.exports.getCourses = getCourses;
'use strict';

let getEdXSubjects = (() => {
    var _ref = _asyncToGenerator(function* (callback) {
        axios.get(edXApiRootUrl + 'catalog/subjects/').then(function (subjectResponse) {
            let results = { subjects: [] };
            subjectResponse.data.results.forEach(function (subject) {
                results.subjects.push({ name: subject.name, url: 'https://www.edx.org/subject/' + subject.uuid, image: subject.card_image_url });
            });
            results.subjects.sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
            callback(results);
        });
    });

    return function getEdXSubjects(_x) {
        return _ref.apply(this, arguments);
    };
})();

let getEdXCoursesForSubject = (() => {
    var _ref2 = _asyncToGenerator(function* (subject, callback) {

        axios.get(edXApiRootUrl + 'catalog/search?subject_uuids=' + subject + '&do_not_retrieve_all=true&page_size=1000').then(function (courseResponse) {
            let results = { courses: [] };
            courseResponse.data.objects.results.forEach(function (course) {
                results.courses.push({ name: course.title, url: course.marketing_url, image: course.image_url, description: course.full_description, instructors: course.org });
            });
            results.courses.sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
            callback(results);
        });
    });

    return function getEdXCoursesForSubject(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const noodle = require('noodlejs');

const edXApiRootUrl = 'https://www.edx.org/api/v1/';
const edXRootUrl = "https://www.edx.org";
const edXId = 'https://www.edx.org/';

module.exports.getEdXSubjects = getEdXSubjects;
module.exports.getEdXCoursesForSubject = getEdXCoursesForSubject;
module.exports.exXId = edXId;
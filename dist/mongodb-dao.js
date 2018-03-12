'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const scrapers = require('./scraper.js');
const axios = require('axios');

const username = "gcloud";
const password = "dogdogdog";
const dbName = 'course-wrap';
const url = 'mongodb://' + username + ':' + password + '@ds251588.mlab.com:51588/' + dbName;
const millisecondsInDay = 86400000;

function getSubjects(schoolId, callback) {
    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        let db = client.db(dbName);
        db.collection('subjects').find(schoolId == "" ? {} : { schoolId: schoolId }).toArray(function (err, result) {
            assert.equal(null, err);
            client.close();
            callback({ subjects: result });
        });
    });
}

function getCoursesInSubject(schoolId, subjectId, callback) {
    MongoClient.connect(url, (() => {
        var _ref = _asyncToGenerator(function* (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            db.collection('courses').find({ schoolId: schoolId, subjectId: subjectId }).toArray(function (err, result) {
                assert.equal(null, err);
                client.close();

                console.log({ schoolId: schoolId, subjectId: subjectId });
                callback({ courses: result });
            });
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })());
}

function searchForCourse(queryString, limit, callback) {
    MongoClient.connect(url, (() => {
        var _ref2 = _asyncToGenerator(function* (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            db.collection("courses").find({ $text: { $search: queryString } }).project({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).limit(parseInt(limit) != null ? parseInt(limit) : 0).toArray(function (err, result) {
                assert.equal(null, err);
                client.close();
                callback({ results: result });
            });
        });

        return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
        };
    })());
}

function shouldFetchFreshData(schoolId, callback) {
    MongoClient.connect(url, (() => {
        var _ref3 = _asyncToGenerator(function* (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            db.collection('schools').find({ _id: schoolId }).toArray(function (err, result) {
                assert.equal(null, err);
                client.close();
                if (new Date(result[0].lastUpdated).getTime() + millisecondsInDay < new Date(Date.now()).getTime()) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        });

        return function (_x5, _x6) {
            return _ref3.apply(this, arguments);
        };
    })());
}

function updateMitSubjects() {
    let lastUpdatedDate = Date.now();
    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/scraper/mit').then(response => {
        MongoClient.connect(url, function (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            db.collection('schools').save({ _id: 'https://ocw.mit.edu/', name: 'MIT', lastUpdated: new Date(lastUpdatedDate) });
            for (let subject of response.data.subjects) {
                subject._id = subject.url;
                subject.schoolId = 'https://ocw.mit.edu/';
                subject.lastUpdated = new Date(lastUpdatedDate);
                db.collection('subjects').save(subject);
                updateMitCoursesForSubject(subject.url.split("/").pop());
            }
            db.collection('subjects').remove({ schoolId: 'https://ocw.mit.edu/', lastUpdated: { "$lt": lastUpdatedDate } });
        });
    }).catch(error => {
        console.log(error);return;
    });
}

function updateMitCoursesForSubject(subjectId) {
    let lastUpdatedDate = Date.now();
    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/scraper/mit/' + subjectId).then(response => {
        MongoClient.connect(url, function (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            for (let course of response.data.courses) {
                course._id = course.url;
                course.schoolId = 'https://ocw.mit.edu/';
                course.subjectId = 'https://ocw.mit.edu/courses/' + subjectId;
                course.lastUpdated = new Date(lastUpdatedDate);
                db.collection('courses').save(course);
            }
            db.collection('courses').remove({ subjectId: 'https://ocw.mit.edu/' + subjectId, lastUpdated: { "$lt": lastUpdatedDate } });
        });
    }).catch(error => {
        console.log(error);return;
    });
}

function updateYaleSubjects() {
    let lastUpdatedDate = Date.now();
    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/scraper/yale').then(response => {
        MongoClient.connect(url, function (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            db.collection('schools').save({ _id: 'https://oyc.yale.edu/', name: 'Yale', lastUpdated: new Date(lastUpdatedDate) });

            for (let subject of response.data.subjects) {
                subject._id = subject.url;
                subject.schoolId = 'https://oyc.yale.edu/';
                subject.lastUpdated = new Date(lastUpdatedDate);
                db.collection('subjects').save(subject);
                updateYaleCoursesForSubject(subject.url.split("/").pop());
            }
            db.collection('subjects').remove({ schoolId: 'https://oyc.yale.edu/', lastUpdated: { "$lt": new Date(lastUpdatedDate) } });
        });
    }).catch(error => {
        console.log(error);return;
    });
}

function updateYaleCoursesForSubject(subjectId) {
    let lastUpdatedDate = Date.now();
    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/scraper/yale/' + subjectId).then(response => {
        MongoClient.connect(url, function (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            for (let course of response.data.courses) {
                course._id = course.url;
                course.schoolId = 'https://oyc.yale.edu/';
                course.subjectId = 'https://oyc.yale.edu/' + subjectId;
                course.lastUpdated = new Date(lastUpdatedDate);
                db.collection('courses').save(course);
            }
            db.collection('courses').remove({ subjectId: 'https://oyc.yale.edu/' + subjectId, lastUpdated: { "$lt": new Date(lastUpdatedDate) } });
        });
    }).catch(error => {
        console.log(error);return;
    });
}

module.exports.getSubjects = getSubjects;
module.exports.getCoursesInSubject = getCoursesInSubject;
module.exports.searchForCourse = searchForCourse;
module.exports.shouldFetchFreshData = shouldFetchFreshData;

module.exports.updateMitSubjects = updateMitSubjects;
module.exports.updateMitCoursesForSubject = updateMitCoursesForSubject;
module.exports.updateYaleSubjects = updateYaleSubjects;
module.exports.updateYaleCoursesForSubject = updateYaleCoursesForSubject;
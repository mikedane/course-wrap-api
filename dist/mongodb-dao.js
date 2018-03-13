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

function getSubjects(schoolUrl, callback) {
    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        let db = client.db(dbName);

        db.collection("subjects").aggregate([{ $match: { schoolId: schoolUrl } }, {
            $lookup: {
                from: "schools",
                localField: "schoolId",
                foreignField: "_id",
                as: "school"
            }
        }]).toArray(function (err, result) {
            assert.equal(null, err);
            client.close();
            callback({ subjects: result });
        });
    });
}

function getCoursesInSubject(schoolUrl, subjectUrl, callback) {
    MongoClient.connect(url, (() => {
        var _ref = _asyncToGenerator(function* (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);

            db.collection("courses").aggregate([{ $match: { schoolId: schoolUrl, subjectId: schoolUrl + subjectUrl } }, {
                $lookup: {
                    from: "schools",
                    localField: "schoolId",
                    foreignField: "_id",
                    as: "school"
                }
            }, {
                $lookup: {
                    from: "subjects",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subject"
                }
            }]).toArray(function (err, result) {
                assert.equal(null, err);
                client.close();
                callback({ subjects: result });
            });

            // db.collection('courses').find({schoolId: schoolUrl, subjectId: schoolUrl + subjectUrl}).toArray(function(err, result) {
            //     assert.equal(null, err);
            //     client.close();
            //     callback({courses: result})
            // });
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

function updateSubjects(schoolName, schoolUrl) {
    let lastUpdatedDate = new Date(Date.now());
    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/scraper/' + schoolName).then(response => {
        MongoClient.connect(url, function (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            db.collection('schools').save({ _id: schoolUrl, name: schoolName, lastUpdated: new Date(lastUpdatedDate) });
            for (let subject of response.data.subjects) {
                subject._id = schoolUrl + subject.url;
                subject.schoolId = schoolUrl;
                subject.lastUpdated = lastUpdatedDate;
                db.collection('subjects').save(subject);
                updateCoursesForSubject(schoolName, schoolUrl, subject.url.split("/").pop(), subject.url);
            }
            db.collection("subjects").find({ schoolId: schoolUrl, lastUpdated: { "$lt": lastUpdatedDate } }).toArray(function (err, result) {
                assert.equal(null, err);
                console.log(lastUpdatedDate);
                console.log(result);
                result.forEach(subject => {
                    db.collection("courses").remove({ subjectId: subject._id, lastUpdated: { "$lt": lastUpdatedDate } });
                });
            });
            db.collection('subjects').remove({ schoolId: schoolUrl, lastUpdated: { "$lt": lastUpdatedDate } });
        });
    }).catch(error => {
        console.log(error);return;
    });
}

function updateCoursesForSubject(schoolName, schoolUrl, subjectName, subjectUrl) {
    const lastUpdatedDate = new Date(Date.now());
    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/scraper/' + schoolName + '/' + subjectName).then(response => {
        MongoClient.connect(url, function (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            for (let course of response.data.courses) {
                course._id = schoolUrl + subjectUrl + course.url;
                course.schoolId = schoolUrl;
                course.subjectId = schoolUrl + subjectUrl;
                course.lastUpdated = lastUpdatedDate;
                db.collection('courses').save(course);
            }
            db.collection('courses').remove({ subjectId: schoolUrl + subjectUrl, lastUpdated: { "$lt": lastUpdatedDate } });
        });
    }).catch(error => {
        console.log(error);return;
    });
}

module.exports.getSubjects = getSubjects;
module.exports.getCoursesInSubject = getCoursesInSubject;
module.exports.searchForCourse = searchForCourse;
module.exports.shouldFetchFreshData = shouldFetchFreshData;

module.exports.updateSubjects = updateSubjects;
module.exports.updateCoursesForSubject = updateCoursesForSubject;

// db.collection("subjects").aggregate([
//     { $match: { schoolId: schoolId } },
//     {
//       $lookup:
//         {
//           from: "schools",
//           localField: "schoolId",
//           foreignField: "_id",
//           as: "school"
//         }
//    },
//    {
//     $lookup:
//       {
//         from: "subjects",
//         localField: "subjectId",
//         foreignField: "_id",
//         as: "subject"
//       }
//  }
//  ])
'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const username = "gcloud";
const password = "dogdogdog";
const dbName = 'course-wrap';
const url = 'mongodb://' + username + ':' + password + '@ds251588.mlab.com:51588/' + dbName;

function getSubjects(schoolId, callback) {
    MongoClient.connect(url, (() => {
        var _ref = _asyncToGenerator(function* (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            let result = yield db.collection('schools').findOne({ _id: schoolId }, { fields: { "subjects.courses": 0 } });
            client.close();
            callback(result);
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })());
}

function getCoursesInSubject(schoolId, subjectId, callback) {
    MongoClient.connect(url, (() => {
        var _ref2 = _asyncToGenerator(function* (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            let result = yield db.collection('schools').aggregate([{ $match: { _id: schoolId } }, { $project: {
                    subjects: { $filter: {
                            input: '$subjects',
                            as: 'subject',
                            cond: { $eq: ['$$subject._id', subjectId] }
                        } }
                } }], function (err, cursor) {
                assert.equal(err, null);
                cursor.toArray(function (err, documents) {
                    assert.equal(err, null);
                    let result = { courses: [] };
                    try {
                        result = { courses: documents[0].subjects[0].courses };
                    } catch (error) {}
                    callback(result);
                });
                client.close();
            });
        });

        return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
        };
    })());
}

module.exports.getSubjects = getSubjects;
module.exports.getCoursesInSubject = getCoursesInSubject;
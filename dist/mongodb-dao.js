'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const scrapers = require('./scraper.js');
const axios = require('axios');
const millisecondsInDay = 86400000;

function getSchools(id, getSubjects, callback) {
    const collectionName = "schools";
    const schoolsQuery = [{ $match: id ? { _id: id } : {} }, {
        $lookup: {
            from: "subjects",
            localField: "_id",
            foreignField: "schoolId",
            as: "subject"
        }
    }, {
        $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "schoolId",
            as: "course"
        }
    }, {
        $addFields: {
            subjectCount: { $size: "$subject" },
            courseCount: { $size: "$course" }
        }
    }, {
        $project: {
            course: 0,
            subject: 0
        }
    }];
    const schoolsQuerySubjects = [{ $match: id ? { _id: id } : {} }, {
        $lookup: {
            from: "subjects",
            localField: "_id",
            foreignField: "schoolId",
            as: "subject"
        }
    }, {
        $unwind: "$subject"
    }, {
        $lookup: {
            from: "courses",
            localField: "subject._id",
            foreignField: "subjectId",
            as: "course"
        }
    }, {
        $addFields: {
            courses: { $size: "$course" }
        }
    }, {
        $group: {
            _id: "$_id",
            name: { $first: "$name" },
            lastUpdated: { $first: "$lastUpdated" },
            courseCount: { $sum: "$courses" },
            rawSubjects: { $push: { subject: "$subject", courseCount: "$courses" } }
        }
    }, {
        $addFields: {
            subjectCount: { $size: "$rawSubjects" }
        }
    }];
    mongoAggregate(collectionName, getSubjects ? schoolsQuerySubjects : schoolsQuery, result => {
        if (getSubjects) {
            result.forEach(school => {
                school.subjects = [];
                school.rawSubjects.forEach(subjectItem => {
                    let newSubject = subjectItem.subject;
                    newSubject.courseCount = subjectItem.courseCount;
                    school.subjects.push(newSubject);
                });
                delete school.rawSubjects;
            });
        }
        callback({ schools: result });

        // ---- Updates information dynamically ----
        // result.forEach((school) => {
        //     shouldFetchFreshData(school._id, result => {
        //         if(result){
        //             accessApi('update/subjects?schoolId=' + school._id);
        //         }
        //     });
        // });
    });
}

function getSubjects(id, schoolId, getCourses, callback) {
    const collectionName = "subjects";
    let matches = {};
    if (id) matches["_id"] = id;
    if (schoolId) matches["schoolId"] = schoolId;

    const subjectsQuery = [{ $match: matches }, {
        $lookup: {
            from: "schools",
            localField: "schoolId",
            foreignField: "_id",
            as: "school"
        }
    }, {
        $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "subjectId",
            as: "courses"
        }
    }, {
        $addFields: {
            courseCount: { $size: "$courses" }
        }
    }, {
        $project: {
            courses: 0
        }

    }];
    const subjectsQueryCourses = [{ $match: matches }, {
        $lookup: {
            from: "schools",
            localField: "schoolId",
            foreignField: "_id",
            as: "school"
        }
    }, {
        $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "subjectId",
            as: "courses"
        }
    }, {
        $addFields: {
            courseCount: { $size: "$courses" }
        }
    }];

    mongoAggregate(collectionName, getCourses ? subjectsQueryCourses : subjectsQuery, result => {
        result.forEach(subject => {
            subject.school = subject.school[0];
        });
        callback({ subjects: result });
    });
}

function getCourses(id, subjectId, schoolId, callback) {
    const collectionName = "courses";
    let matches = {};
    if (id) matches["_id"] = id;
    if (subjectId) matches["subjectId"] = subjectId;
    if (schoolId) matches["schoolId"] = schoolId;
    const aggregateParams = [{ $match: matches }, {
        $lookup: {
            from: "schools",
            localField: "schoolId",
            foreignField: "_id",
            as: "raw_school"
        }
    }, {
        $lookup: {
            from: "subjects",
            localField: "subjectId",
            foreignField: "_id",
            as: "raw_subject"
        }
    }];
    mongoAggregate(collectionName, aggregateParams, result => {
        result.forEach(course => {
            course.school = course.raw_school[0];
            delete course.raw_school;

            course.subject = course.raw_subject[0];
            delete course.raw_subject;
        });
        callback({ courses: result });
    });
}

function getCourseFromQuery(query, limit, callback) {
    const collectionName = "courses";
    const aggregateParams = [{ $match: { $text: { $search: query } } }, { $sort: { score: { $meta: "textScore" } } }];
    if (limit) aggregateParams.push({ $limit: limit });
    aggregateParams.push({
        $lookup: {
            from: "subjects",
            localField: "subjectId",
            foreignField: "_id",
            as: "raw_subject"
        }
    });
    aggregateParams.push({
        $lookup: {
            from: "schools",
            localField: "schoolId",
            foreignField: "_id",
            as: "raw_school"
        }
    });
    mongoAggregate(collectionName, aggregateParams, result => {
        result.forEach(course => {
            course.school = course.raw_school[0];
            delete course.raw_school;

            course.subject = course.raw_subject[0];
            delete course.raw_subject;
        });
        callback({ courses: result });
    });
}

function updateSubjects(schoolId) {
    let lastUpdatedDate = new Date(Date.now());
    accessApi("scrape/subjects?schoolId=" + schoolId, results => {
        connectToMongo((client, db) => {
            db.collection('schools').update({ _id: schoolId }, { $set: { lastUpdated: new Date(lastUpdatedDate) } });
            for (let subject of results.subjects) {
                subject._id = schoolId + subject.url;
                subject.schoolId = schoolId;
                subject.lastUpdated = lastUpdatedDate;
                db.collection('subjects').save(subject);
                accessApi("/update/courses?schoolId=" + schoolId + "&subjectId=" + subject._id, result => {});
            }
            db.collection("subjects").find({ schoolId: schoolId, lastUpdated: { "$lt": lastUpdatedDate } }).toArray(function (err, result) {
                assert.equal(null, err);
                result.forEach(subject => {
                    db.collection("courses").remove({ subjectId: subject._id, lastUpdated: { "$lt": lastUpdatedDate } });
                });
            });
            db.collection('subjects').remove({ schoolId: schoolId, lastUpdated: { "$lt": lastUpdatedDate } });
            client.close();
        });
    });
}

function updateCoursesForSubject(schoolId, subjectId) {
    const lastUpdatedDate = new Date(Date.now());
    accessApi("/scrape/courses?schoolId=" + schoolId + "&subjectId=" + subjectId, results => {
        connectToMongo((client, db) => {
            for (let course of results.courses) {
                course._id = subjectId + course.url;
                course.schoolId = schoolId;
                course.subjectId = subjectId;
                course.lastUpdated = lastUpdatedDate;
                db.collection('courses').save(course);
            }
            db.collection('courses').remove({ subjectId: subjectId, lastUpdated: { "$lt": lastUpdatedDate } });
        });
    });
}

function mongoAggregate(collectionName, aggregateParams, callback) {
    connectToMongo((client, db) => {
        db.collection(collectionName).aggregate(aggregateParams).toArray(function (err, result) {
            assert.equal(null, err);
            client.close();
            callback(result);
        });
    });
}

function mongoSave(collectionName, saveParams) {
    connectToMongo((client, db) => {
        db.collection(collectionName).save(saveParams);
    });
}

function mongoFind(collectionName, findParams, callback) {
    connectToMongo((client, db) => {
        db.collection(collectionName).find(findParams).toArray(function (err, result) {
            assert.equal(null, err);
            client.close();
            callback(result);
        });
    });
}

function connectToMongo(callback) {
    const username = "gcloud";
    const password = "dogdogdog";
    const dbName = 'course-wrap';
    const url = 'mongodb://' + username + ':' + password + '@ds251588.mlab.com:51588/' + dbName;

    MongoClient.connect(url, (() => {
        var _ref = _asyncToGenerator(function* (err, client) {
            assert.equal(null, err);
            let db = client.db(dbName);
            callback(client, db);
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })());
}

function accessApi(endPoint, callback) {
    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/' + endPoint).then(response => {
        callback(response.data);
    }).catch(error => {
        console.log(error);callback({});
    });
}

function shouldFetchFreshData(schoolId, callback) {
    connectToMongo((client, db) => {
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
}

module.exports.getSchools = getSchools;
module.exports.getSubjects = getSubjects;
module.exports.getCourses = getCourses;
module.exports.getCourseFromQuery = getCourseFromQuery;
module.exports.updateSubjects = updateSubjects;
module.exports.updateCoursesForSubject = updateCoursesForSubject;
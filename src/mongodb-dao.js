const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const username = "gcloud";
const password = "dogdogdog";
const dbName = 'course-wrap';
const url = 'mongodb://' + username + ':' + password + '@ds251588.mlab.com:51588/' + dbName;



function getSubjects(schoolId, callback){
    MongoClient.connect(url, async function(err, client) {
        assert.equal(null, err);
        let db = client.db(dbName);
        let result = await db.collection('schools').findOne({_id: schoolId}, {fields: {"subjects.courses": 0}});
        client.close();
        callback(result);
    });
}

function getCoursesInSubject(schoolId, subjectId, callback){
    MongoClient.connect(url, async function(err, client) {
        assert.equal(null, err);
        let db = client.db(dbName);
        let result = await db.collection('schools').aggregate(
            [
                {$match: {_id: schoolId}},
                {$project: {
                    subjects: {$filter: {
                        input: '$subjects',
                        as: 'subject',
                        cond: {$eq: ['$$subject._id', subjectId]}
                    }}
                }}
            ],
            function(err, cursor) {
                assert.equal(err, null);
                cursor.toArray(function(err, documents) {
                    assert.equal(err, null);
                    let result = {courses: []};
                    try {
                        result = {courses: documents[0].subjects[0].courses};
                    } catch (error) {
                    }
                    callback(result);
                });
                client.close();
              }
        );        
    });
}

module.exports.getSubjects = getSubjects;
module.exports.getCoursesInSubject = getCoursesInSubject;








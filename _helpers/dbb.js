const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


const username = "gcloud";
const password = "dogdogdog";
const dbName = 'course-wrap';
const url = 'mongodb://' + username + ':' + password + '@ds251588.mlab.com:51588/' + dbName;

connectToMongo();
function connectToMongo(){
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
      
        const db = client.db(dbName);

        db.collection('school_old').findOne({_id: "https://ocw.mit.edu/"}, (err, results) => {
            assert.equal(null, err);

            results.subjects.forEach((subject) => {
                subject.courses.forEach((course) => {
                    course.subjectId = subject._id;
                    course.schoolId = results._id;
                    db.collection("courses").insertOne(course);
                });
                subject.schoolId = results._id;
                delete subject.courses;
                db.collection("subjects").insertOne(subject);
            });
            delete results.subjects;
            db.collection("schools").insertOne(results);
        });
        console.log("Done");
      });
}


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const axios = require('axios');
const scraper = require('./scraper.js');

const username = "gcloud";
const password = "dogdogdog";
const dbName = 'course-wrap';
const url = 'mongodb://' + username + ':' + password + '@ds251588.mlab.com:51588/' + dbName;

connectToMongo();
async function connectToMongo(){
    MongoClient.connect(url, async function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
      
        const db = client.db(dbName);
        let result = await getAllYaleData();
        db.collection("schools").insertOne(result);
    
    
    
        client.close();
        console.log("Done");
      });
}

async function getAllMitData(){
    let result = {name: "MIT", _id: 'https://ocw.mit.edu/', subjects: []};
    let response = await axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/mit')
        .catch((error) => {console.log(error); return});
    for(let subject of response.data.subjects){
        subject._id = subject.url;
        subject.courses = [];
        let response2 = await axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/mit/' + subject.url.split("/").pop())
            .catch((error) => {console.log("Poop"); return});
        response2.data.courses.forEach((course) => {
            course._id = course.url;
            subject.courses.push(course);
        });
        result.subjects.push(subject);
    }
    return result    
}

async function getAllYaleData(){
    let result = {name: "Yale", _id: 'https://oyc.yale.edu/', subjects: []};
    let response = await axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/yale')
        .catch((error) => {console.log(error); return});
    for(let subject of response.data.subjects){
        subject._id = subject.url;
        subject.courses = [];
        let response2 = await axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/yale/' + subject.url.split("/").pop())
            .catch((error) => {console.log("Poop"); return});
        response2.data.courses.forEach((course) => {
            course._id = course.url;
            subject.courses.push(course);
        });
        result.subjects.push(subject);
    }
    return result    
}
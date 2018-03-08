const noodle = require('noodlejs');
const axios = require('axios');

const mitRootUrl = 'https://ocw.mit.edu';

async function getMITSubjects(callback){

    var finishedCount = 0;
    var results = {subjects : []};
    
    var subjectsQuery = {
        url: mitRootUrl + '/courses/',
        type: 'html',
        selector: 'h3.deptTitle a',
        extract: ['text', 'href']
    }

    var rawSubjectResults = await noodle.query(subjectsQuery);
    var subjects = rawSubjectResults.results[0].results;
    subjects.forEach(async (subject) => {
        var imageQuery = {
                        url: mitRootUrl + subject.href,
                        type: 'html',
                        selector: 'main img',
                        extract: 'src'
                    }
        var rawSubjectImageResults = await noodle.query(imageQuery);
        var subjectImage = rawSubjectImageResults.results[0].results[0];
        finishedCount++;
        results.subjects.push({name: subject.text, url: mitRootUrl + subject.href, image: mitRootUrl + subjectImage});
        if(finishedCount == subjects.length){
            results.subjects.sort((a, b)=>{
                if (a.name < b.name)
                return -1;
                if (a.name > b.name)
                    return 1;
                return 0;
            });
            callback(results);
        }
    });
}

async function getMITCoursesForSubject(subjectUrl, callback){
    var results = {courses : []};
    var index = 0;
    axios.get(mitRootUrl + '/courses/' + subjectUrl + '/index.json')
        .then((subjectResponse) => {
            subjectResponse.data.forEach(async (course) => {
                await axios.get(mitRootUrl + course.href + '/index.json')
                    .then((courseResponse) => {
                        var courseJson = courseResponse.data;
                        index++;
                        results.courses.push({name: course.title, semester: course.sem, level: course.level, description: courseJson.description, 
                        image: mitRootUrl + "/" + courseJson.thumb, instructors: courseJson.instructors, features: courseJson.features,
                    url: mitRootUrl + course.href});
                        if(index == subjectResponse.data.length){
                            results.courses.sort((a, b)=>{
                                if (a.name < b.name)
                                return -1;
                                if (a.name > b.name)
                                    return 1;
                                return 0;
                            });
                            callback(results);
                        }
                    })
                    .catch(error => callback(results));
            });
        })
        .catch(error => callback(results));
    
}

const yaleRootUrl = 'https://oyc.yale.edu';

async function getYaleSubjects(callback){

    var finishedCount = 0;
    var results = {subjects : []};
    
    var subjectsQuery = {
        url: yaleRootUrl + '/courses/',
        type: 'html',
        selector: 'div.view-content table.views-table tbody tr td.views-field-title a',
        extract: ['text', 'href']
    }

    var rawSubjectResults = await noodle.query(subjectsQuery);

    var unique = {};
    rawSubjectResults.results[0].results.forEach((subject)=>{
        unique[subject.text] = subject;
    });

    var subjects = Object.keys(unique).map((k) => unique[k])


    // var subjects = rawSubjectResults.results[0].results.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
    // console.log(subjects);

    subjects.forEach(async (subject) => {
        var imageQuery = {
                        url: yaleRootUrl + subject.href,
                        type: 'html',
                        selector: 'div.view-content table.views-table tbody tr.views-row-first td.views-field-field-department-image img',
                        extract: 'src'
                    }
        var rawSubjectImageResults = await noodle.query(imageQuery);
        var subjectImage = rawSubjectImageResults.results[0].results[0];
        finishedCount++;
        results.subjects.push({name: subject.text, url: yaleRootUrl + subject.href, image: subjectImage});
        if(finishedCount == subjects.length){
            results.subjects.sort((a, b)=>{
                if (a.name < b.name)
                return -1;
                if (a.name > b.name)
                    return 1;
                return 0;
            });
            callback(results);
        }
    });
}

async function getYaleCoursesForSubject(subject, callback){

    var results = {courses: []};
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
    }

    

    var rawSubjectResults = await noodle.query(subjectsQuery);
    var courses = rawSubjectResults.results[0].results;
    for(var i = 0; i < courses.names.length; i++){
        results.courses.push({name: courses.names[i], instructors: courses.instructors[i].replace('with ', ''),
         image: courses.images[i], description: courses.descriptions[i], url: yaleRootUrl + courses.urls[i]});
    }
    callback(results);

}

module.exports.getMITSubjects = getMITSubjects;
module.exports.getMITCoursesForSubject = getMITCoursesForSubject;
module.exports.getYaleSubjects = getYaleSubjects;
module.exports.getYaleCoursesForSubject = getYaleCoursesForSubject;
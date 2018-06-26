const noodle = require('noodlejs');

const johnHopkinsRootUrl = 'http://ocw.jhsph.edu';
const johnHopkinsId = 'http://ocw.jhsph.edu/';

async function getJohnHopkinsSubjects(callback){
    var finishedCount = 0;
    var results = {subjects : []};
    var subjectsQuery = {
        url: johnHopkinsRootUrl + 'index.cfm/go/find.browse#topics',
        type: 'html',
        selector: 'td.col2 div#Topics li',
        extract: ['id', 'text']
    }
    
    var rawSubjectResults = await noodle.query(subjectsQuery);

    var subjects = rawSubjectResults.results[0].results
    subjects.forEach(async (subject, index) => {
        finishedCount++;
        results.subjects.push({name: subject.text, url: johnHopkinsRootUrl + "topics/" + subject.id.split("_").pop(), image: ""});
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

async function getJohnHopkinsCoursesForSubject(subject, callback){
    var subjectsQuery = {
        url: johnHopkinsRootUrl + 'index.cfm/go/find.coursesByTopic?topicId=' + subject,
        type: 'html',
        selector: "ul li a",
        extract: "href"
    }

    var rawSubjectResults = await noodle.query(subjectsQuery);
    var courseUrls = rawSubjectResults.results[0].results;
    let finishedCount = 0;
    let results = {courses: []};
    courseUrls.forEach(async courseUrl => {
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
        }

        var rawCourseResults = await noodle.query(courseQuery);
        let course = rawCourseResults.results[0].results; 
        
        let description = "";
        if(course.descriptions.length > 0){
            course.descriptions.forEach(part => {
                description += part + "\n";
            });
        }
        results.courses.push({name: course.titles[0], image: course.images[0] ? johnHopkinsRootUrl + course.images[0] : "", description: description, url: johnHopkinsRootUrl + courseUrl, instructors: course.instructors[0]});
        finishedCount++;
        if(finishedCount == courseUrls.length){
            callback(results);
        }
    });
}

module.exports.getJohnHopkinsSubjects = getJohnHopkinsSubjects;
module.exports.getJohnHopkinsCoursesForSubject = getJohnHopkinsCoursesForSubject;
module.exports.johnHopkinsId = johnHopkinsId;
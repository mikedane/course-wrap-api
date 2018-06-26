const noodle = require('noodlejs');

const mitRootUrl = 'https://ocw.mit.edu';
const mitId = 'https://ocw.mit.edu/'

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
                    .catch(error => {
                        // console.log("Tried for: " + mitRootUrl + course.href + '/index.json' + " but got Error: " + error.address);
                              
                    });
            });
        })
        .catch(error => {
            if (error.response) {
                // console.log("error");
              }
            callback(results);
        });
    
}

module.exports.getMITSubjects = getMITSubjects;
module.exports.getMITCoursesForSubject = getMITCoursesForSubject;
module.exports.mitId = mitId;
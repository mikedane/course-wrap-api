const noodle = require('noodlejs');

const michiganRootUrl = 'https://open.umich.edu';
const michiganId = 'https://open.umich.edu/'

async function getMichiganSubjects(callback){
    var finishedCount = 0;
    var results = {subjects : []};
    var subjectsQuery = {
        url: michiganRootUrl + 'find/find-open-educational-resources/',
        type: 'html',
        selector: 'aside.sidebars section.sidebar ul.menu li.menu__item ul.menu li.menu__item a',
        extract: ['text', 'href']
    }
    var rawSubjectResults = await noodle.query(subjectsQuery);

    var subjects = rawSubjectResults.results[0].results
    subjects.forEach(async (subject) => {
        finishedCount++;
        results.subjects.push({name: subject.text, url: michiganRootUrl + subject.href, image: ""});
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

async function getMichiganCoursesForSubject(subject, callback){
    var subjectsQuery = {
        url: michiganRootUrl + 'find/open-educational-resources/' + subject,
        type: 'html',
        selector: "aside.sidebars section.sidebar ul.menu li.active ul.menu li.menu__item a",
        extract: "href"
    }

    var rawSubjectResults = await noodle.query(subjectsQuery);
    var courseUrls = rawSubjectResults.results[0].results;
    let finishedCount = 0;
    let results = {courses: []};
    courseUrls.forEach(async courseUrl => {
        var courseQuery = {
            url: michiganRootUrl + courseUrl,
            type: 'html',
            map: {
                images: {
                    selector: "div.course-image-wrapper img ",
                    extract: "src"
                },
                titles: {
                    selector: "h1.title",
                    extract: "text"
                },
                descriptions: {
                    selector: "div.course-content-wrapper div.field-name-field-description p",
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
        results.courses.push({name: course.titles[0], image: course.images[0], description: description, url: michiganRootUrl + courseUrl});
        finishedCount++;
        if(finishedCount == courseUrls.length){
            callback(results);
        }
    });
}

module.exports.getMichiganSubjects = getMichiganSubjects;
module.exports.getMichiganCoursesForSubject = getMichiganCoursesForSubject;
module.exports.michiganId = michiganId;
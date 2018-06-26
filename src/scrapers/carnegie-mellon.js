const noodle = require('noodlejs');
const cmRootUrl = 'http://oli.cmu.edu/learn-with-oli/';
const cmId = 'http://oli.cmu.edu/';
const cmImageRootUrl = 'http://oli.cmu.edu/';

function getCMSubjects(callback){
    let results = {subjects: []};
    results.subjects = [{name: "All Carnegie Mellon Courses", url: cmRootUrl + 'see-all-oli-courses', image: 'http://oli.cmu.edu/wp-content/uploads/2012/07/bio_thumb.png'}];
    callback(results);
}

async function getCMCoursesForSubject(subject, callback){
    var subjectsQuery = {
        url: cmRootUrl + '/' + subject,
        type: 'html',
        selector: "div.accordion-group div.accordion-body a.addInfo",
        extract: "href"
    }

    var rawSubjectResults = await noodle.query(subjectsQuery);
    var courseUrls = rawSubjectResults.results[0].results;
    let finishedCount = 0;
    let results = {courses: []};
    courseUrls.forEach(async courseUrl => {
        var courseQuery = {
            url: courseUrl,
            type: 'html',
            map: {
                images: {
                    selector: "div.overview img ",
                    extract: "src"
                },
                titles: {
                    selector: "h1",
                    extract: "text"
                },
                descriptions: {
                    selector: "div.overview p",
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
        results.courses.push({name: course.titles[0], image: course.images[0] ? (course.images[0].charAt(0) == '/' ? cmImageRootUrl + course.images[0] : course.images[0])  : "", description: description, url: courseUrl});
        finishedCount++;
        if(finishedCount == courseUrls.length){
            callback(results);
        }
    });
}

module.exports.getCMSubjects = getCMSubjects;
module.exports.getCMCoursesForSubject = getCMCoursesForSubject;
module.exports.cmId = cmId;
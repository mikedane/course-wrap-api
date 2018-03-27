const noodle = require('noodlejs');
const axios = require('axios');

const mitId = 'https://ocw.mit.edu/';
const yaleId = 'https://oyc.yale.edu/';
const cmId = 'http://oli.cmu.edu/';
const michiganId = 'https://open.umich.edu/';
const johnHopkinsId = 'http://ocw.jhsph.edu/';
const edXId = 'https://www.edx.org/';

function getSubjects(schoolId, callback){
    switch(schoolId){
        case mitId:
            getMITSubjects(callback);
            break;
        case yaleId:
            getYaleSubjects(callback);
            break;
        case cmId:
            getCMSubjects(callback);
            break;
        case michiganId:
            getMichiganSubjects(callback);
            break;
        case johnHopkinsId:
            getJohnHopkinsSubjects(callback);
            break;
        case edXId:
            getEdXSubjects(callback);
            break;
        default:
            callback({subjects: []});
    }
}

function getCourses(schoolId, subjectId, callback){
    if(subjectId){
        switch(schoolId){
            case mitId:
                getMITCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case yaleId:
                getYaleCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case cmId:
                getCMCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case michiganId:
                getMichiganCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case johnHopkinsId:
                getJohnHopkinsCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case edXId:
                getEdXCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            default:
                callback({courses: []});
        }
        
    }
}

// ------------------ MIT ----------------------
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

// ------------------ Yale ---------------------
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

// -------------- Carnegie Mellon ---------------
const cmRootUrl = 'http://oli.cmu.edu/learn-with-oli/';
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

// -------------- Michigan ---------------
const michiganRootUrl = 'https://open.umich.edu/';


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


// -------------- John Hopkins ---------------
const johnHopkinsRootUrl = 'http://ocw.jhsph.edu/';

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

// ------------------- edX --------------------
const edXApiRootUrl = 'https://www.edx.org/api/v1/';

async function getEdXSubjects(callback){
    axios.get(edXApiRootUrl + 'catalog/subjects/')
    .then((subjectResponse) => {
        let results = {subjects: []};
        subjectResponse.data.results.forEach((subject) => {
            results.subjects.push({name: subject.name, url: 'https://www.edx.org/subject/' + subject.uuid, image: subject.card_image_url});
        });
        results.subjects.sort((a, b)=>{
            if (a.name < b.name)
            return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        callback(results);
    });
}

async function getEdXCoursesForSubject(subject, callback){

    axios.get(edXApiRootUrl + 'catalog/search?subject_uuids=' + subject + '&do_not_retrieve_all=true&page_size=1000')
    .then((courseResponse) => {
        let results = {courses: []};
        courseResponse.data.objects.results.forEach((course) => {
            results.courses.push({name: course.title, url: course.marketing_url, image: course.image_url, description: course.full_description, instructors: course.org});
        });
        results.courses.sort((a, b)=>{
            if (a.name < b.name)
            return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        callback(results);
    });
}




function getSubjectUrlFromId(subjectId){
    return subjectId.split("/").pop();
}





module.exports.getSubjects = getSubjects;
module.exports.getCourses = getCourses;
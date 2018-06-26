const noodle = require('noodlejs');

const edXApiRootUrl = 'https://www.edx.org/api/v1/';
const edXRootUrl = "https://www.edx.org";
const edXId = 'https://www.edx.org/'

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

module.exports.getEdXSubjects = getEdXSubjects;
module.exports.getEdXCoursesForSubject = getEdXCoursesForSubject;
module.exports.exXId = edXId;
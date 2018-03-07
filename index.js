const app = require('express')();
const scrapers = require('./scraper.js');

app.get('/', (req, res) => {

});

app.get('/subjects/:school', (req, res) => {
    switch(req.params.school) {
        case 'mit':
            scrapers.getMITSubjects((subjects)=>{
                res.send(subjects);
            });
            break;
        case 'yale':
            scrapers.getYaleSubjects((subjects)=>{
                res.send(subjects);
            });
            break;
        default:
            res.send('Invalid school name')
    }
});

app.get('/subjects/:school/:subjectUrl', (req, res) => {
    switch(req.params.school) {
        case 'mit':
            scrapers.getMITCoursesForSubject(req.params.subjectUrl, (courses)=>{
                res.send(courses);
            });
            break;
        case 'yale':
            scrapers.getYaleCoursesForSubject(req.params.subjectUrl, (courses)=>{
                res.send(courses);
            });
            break;
        default:
            res.send('Invalid school name')
    }
});

app.listen(3000, () => console.log('Server listening on port 3000!'))
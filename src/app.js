const app = require('express')();
const cors = require('cors')({origin: true});
const scrapers = require('./scraper.js');

app.use(cors);
app.get('/', (req, res) => {
    res.send("Welcome to Open CourseWare Scraper!");
});

app.get('/:school', (req, res) => {
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

app.get('/:school/:subjectUrl', (req, res) => {
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

// app.listen(3000, () => console.log('Server listening on port 3000!'))

exports.ocwScraper = app;
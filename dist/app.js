'use strict';

const app = require('express')();
const cors = require('cors')({ origin: true });
const scrapers = require('./scraper.js');
const mongodbDao = require('./mongodb-dao.js');

app.use(cors);
app.get('/', (req, res) => {
    res.send("Welcome to Open CourseWare Scraper!");
});

app.get('/:school', (req, res) => {
    switch (req.params.school) {
        case 'mit':
            mongodbDao.getSubjects('https://ocw.mit.edu/', subjects => {
                res.send(subjects);
            });
            // scrapers.getMITSubjects((subjects)=>{
            //     res.send(subjects);
            // });
            break;
        case 'yale':
            mongodbDao.getSubjects('https://oyc.yale.edu/', subjects => {
                res.send(subjects);
            });
            // scrapers.getYaleSubjects((subjects)=>{
            //     res.send(subjects);
            // });
            break;
        default:
            res.send('Invalid school name');
    }
});

app.get('/:school/:subjectUrl', (req, res) => {
    switch (req.params.school) {
        case 'mit':
            mongodbDao.getCoursesInSubject('https://ocw.mit.edu/', 'https://ocw.mit.edu/courses/' + req.params.subjectUrl, courses => {
                res.send(courses);
            });
            // scrapers.getMITCoursesForSubject(req.params.subjectUrl, (courses)=>{
            //     res.send(courses);
            // });
            break;
        case 'yale':
            mongodbDao.getCoursesInSubject('https://oyc.yale.edu/', 'https://oyc.yale.edu/' + req.params.subjectUrl, courses => {
                res.send(courses);
            });
            // scrapers.getYaleCoursesForSubject(req.params.subjectUrl, (courses)=>{
            //     res.send(courses);
            // });
            break;
        default:
            res.send('Invalid school name');
    }
});

app.listen(3000, () => console.log('Server listening on port 3000!'));

exports.ocwScraper = app;
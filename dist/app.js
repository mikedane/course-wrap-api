'use strict';

const app = require('express')();
const cors = require('cors')({ origin: true });
const scrapers = require('./scraper.js');
const mongodbDao = require('./mongodb-dao.js');
const axios = require('axios');

app.use(cors);
app.get('/', (req, res) => {
    res.send("Welcome to Open CourseWare Scraper!");
});

app.get('/data/:school', (req, res) => {
    switch (req.params.school) {
        case 'mit':
            mongodbDao.getSubjects('https://ocw.mit.edu/', subjects => {
                res.send(subjects);
            });
            mongodbDao.shouldFetchFreshData('https://ocw.mit.edu/', value => {
                if (value) {
                    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/update/mit');
                }
            });
            // mongodbDao.fetchFreshData('https://ocw.mit.edu/');
            break;
        case 'yale':
            mongodbDao.getSubjects('https://oyc.yale.edu/', subjects => {
                res.send(subjects);
            });
            mongodbDao.shouldFetchFreshData('https://oyc.yale.edu/', value => {
                if (value) {
                    axios.get('https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/update/yale');
                }
            });
            break;
        default:
            res.send('Invalid school name');
    }
});

app.get('/data/:school/:subjectUrl', (req, res) => {
    switch (req.params.school) {
        case 'mit':
            mongodbDao.getCoursesInSubject('https://ocw.mit.edu/', 'https://ocw.mit.edu/courses/' + req.params.subjectUrl, courses => {
                res.send(courses);
            });
            break;
        case 'yale':
            mongodbDao.getCoursesInSubject('https://oyc.yale.edu/', 'https://oyc.yale.edu/' + req.params.subjectUrl, courses => {
                res.send(courses);
            });
            break;
        default:
            res.send('Invalid school name');
    }
});

app.get('/search', (req, res) => {
    if (req.query.searchQuery != null) {
        mongodbDao.searchForCourse(req.query.searchQuery.split("+").join(" "), req.query.limit == null ? 0 : req.query.limit, courses => {
            res.send(courses);
        });
    } else {
        res.send({ results: [] });
    }
});

app.get('/scraper/:school', (req, res) => {
    switch (req.params.school) {
        case 'mit':
            scrapers.getMITSubjects(subjects => {
                res.send(subjects);
            });
            break;
        case 'yale':
            scrapers.getYaleSubjects(subjects => {
                res.send(subjects);
            });
            break;
        default:
            res.send('Invalid school name');
    }
});

app.get('/scraper/:school/:subjectUrl', (req, res) => {
    switch (req.params.school) {
        case 'mit':
            scrapers.getMITCoursesForSubject(req.params.subjectUrl, courses => {
                res.send(courses);
            });
            break;
        case 'yale':
            scrapers.getYaleCoursesForSubject(req.params.subjectUrl, courses => {
                res.send(courses);
            });
            break;
        default:
            res.send('Invalid school name');
    }
});

app.get('/update/:school', (req, res) => {
    switch (req.params.school) {
        case 'mit':
            mongodbDao.updateSubjects("mit", "https://ocw.mit.edu/");
            break;
        case 'yale':
            mongodbDao.updateSubjects("yale", "https://oyc.yale.edu/");
            break;
        default:
            res.send('Invalid school name');
    }
    res.send("Started updating " + req.params.school);
});

app.get('/update/:school/:subjectUrl', (req, res) => {
    switch (req.params.school) {
        case 'mit':
            mongodbDao.updateCoursesForSubject("mit", "https://ocw.mit.edu/", req.params.subjectUrl, "https://ocw.mit.edu/courses/" + req.params.subjectUrl);
            break;
        case 'yale':
            mongodbDao.updateCoursesForSubject("yale", "https://oyc.yale.edu/", req.params.subjectUrl, "https://oyc.yale.edu/" + req.params.subjectUrl);
            break;
        default:
            res.send('Invalid school name');
    }
    res.send("Started updating " + req.params.school + " | " + req.params.subjectUrl);
});

app.listen(3000, () => console.log('Server listening on port 3000!'));

exports.ocwScraper = app;
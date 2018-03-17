const app = require('express')();
const cors = require('cors')({origin: true});
const scrapers = require('./scraper.js');
const mongodbDao = require('./mongodb-dao.js');
const axios = require('axios');

app.use(cors);

app.get('/', (req, res) => {
    res.send("Welcome to CourseWrap Api!");
});

app.get('/schools/', (req, res) => {
    const {id} = req.query;
    mongodbDao.getSchools(id, true, results =>  res.send(results));
});

app.get('/subjects/', (req, res) => {
    const {id, schoolId} = req.query;
    mongodbDao.getSubjects(id, schoolId, id ? true : false, results =>  res.send(results));
});

app.get('/courses/', (req, res) => {
    const {id, subjectId, schoolId} = req.query;
    mongodbDao.getCourses(id, subjectId, schoolId, results =>  res.send(results));
});

app.get('/search', (req, res) => {
    const {query, limit} = req.query;
    mongodbDao.getCourseFromQuery(query.split('+').join(' '), parseInt(limit) ? parseInt(limit) : 1000000, results =>  res.send(results));
});

app.get('/update/subjects', (req, res) => {
    const {schoolId} = req.query;
    mongodbDao.updateSubjects(schoolId);
});

app.get('/update/courses', (req, res) => {
    const {schoolId, subjectId} = req.query;
    mongodbDao.updateCoursesForSubject(schoolId, subjectId);
});

app.get('/scrape/subjects', (req, res) => {
    const {schoolId} = req.query;
    scrapers.getSubjects(schoolId, results => {
        res.send(results);
    });
});

app.get('/scrape/courses', (req, res) => {
    const {schoolId, subjectId} = req.query;
    scrapers.getCourses(schoolId, subjectId, results => {
        res.send(results);
    });
});

app.listen(3000, () => console.log('Server listening on port 3000!'));

exports.ocwScraper = app;
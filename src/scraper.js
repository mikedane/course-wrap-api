const mit = require('./scrapers/mit.js');
const yale = require('./scrapers/yale.js');
const cm = require('./scrapers/carnegie-mellon.js');
const johnHopkins = require('./scrapers/john-hopkins.js');
const michigan = require('./scrapers/michigan.js');
const edX = require('./scrapers/edx.js');

function getSubjects(schoolId, callback){
    console.log("Rhino")
    switch(schoolId){
        case mit.mitId:
            mit.getMITSubjects(callback);
            break;
        case yale.yaleId:
            yale.getYaleSubjects(callback);
            break;
        case cm.cmId:
            cm.getCMSubjects(callback);
            break;
        case michigan.michiganId:
            michigan.getMichiganSubjects(callback);
            break;
        case johnHopkins.johnHopkinsId:
            johnHopkins.getJohnHopkinsSubjects(callback);
            break;
        case edX.edXId:
            edX.getEdXSubjects(callback);
            break;
        default:
            callback({subjects: []});
    }
}

function getCourses(schoolId, subjectId, callback){
    if(subjectId){
        switch(schoolId){
            case mit.mitId:
                mit.getMITCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case yale.yaleId:
                yale.getYaleCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case cm.cmId:
                cm.getCMCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case michigan.michiganId:
                michigan.getMichiganCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case johnHopkins.johnHopkinsId:
                johnHopkins.getJohnHopkinsCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            case edX.edXId:
                edX.getEdXCoursesForSubject(getSubjectUrlFromId(subjectId), callback);
                break;
            default:
                callback({courses: []});
        }
        
    }
}

function getSubjectUrlFromId(subjectId){
    return subjectId.split("/").pop();
}

module.exports.getSubjects = getSubjects;
module.exports.getCourses = getCourses;
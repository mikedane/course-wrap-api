# Open CourseWare Scraper

A Google Cloud Functions based api which acts as a backend for the CourseWrap website. Api end points scrape data from popular open courseware websites, organize it and ship it out. 

The Api is currently located at 
https://us-central1-test-api-197100.cloudfunctions.net/ocwScraper/

Valid endpoints are:
- /{school name}
- /{school name}/{subject name}

Schools currently supported:
- [MIT OCW](https://ocw.mit.edu/index.htm)
- [Yale OCW](https://oyc.yale.edu/)

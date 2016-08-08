from __future__ import print_function

from flask import Flask, request, render_template, Response
import scrape, database
import sys, json

TERM = 1165
MONTHS = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'}

app = Flask(__name__)

def update():
	print('Initializing database...')
	database.initialize()

	print('Getting available terms...')
	terms = scrape.getTerms()

	print('Terms retrieved. Updating table...')
	database.insert('terms', terms)

	print('Getting faculty information and dates for available terms...')
	termsInfo = {
		'faculties' : [],
		'dates' : []
	}
	for term in terms:
		termInfo = scrape.getFacultiesAndDates(term['id'])
		termsInfo['faculties'].extend(termInfo['faculties'])
		termsInfo['dates'].extend(termInfo['dates'])

	print('Faculties and dates retrieved. Updating tables...')
	database.insert('faculties', termsInfo['faculties'])
	database.insert('dates', termsInfo['dates'])

	print('Checking the database for new stats to retrieve...')
	missingStats = database.getMissingEmploymentStats()
	count = len(missingStats)

	print('{count} records to retrieve. Starting retrieval...'.format(count=count))
	employment = []
	termsMap = database.getTermsMap()
	facultiesMap = database.getFacultiesMap()
	current = 1
	for entry in missingStats:
		delay = random.random()*.5
		time.sleep(delay)
		print('({percent:5.2f}%):{current}/{count} - Fetching info on {faculty} from {date} in {term}...'.format(percent=float(current)/count * 100, current=current, count=count, faculty=facultiesMap[entry[2]], date=str(entry[1]), term=termsMap[entry[0]]))
		employment.extend(scrape.getEmploymentStats(*entry))
		if current % 25 == 0:
			print('Saving new entries...')
			database.insert('employment', employment)
			employment = []
		current+=1
	database.insert('employment', employment)
	
	print('Update complete.')

def _parseDate(dateCode):
	return '{date} {month} {year}'.format(date=int(dateCode[6:8]), month=MONTHS[int(dateCode[4:6])], year=dateCode[0:4])

def generateDateOptions(term):
	dateCodes = database.getDates(term)
	dates= []
	for dateCode in dateCodes:
		dates.append({'code':dateCode, 'label':_parseDate(dateCode)})
	return dates

def generateProgramOptions(term):
	return [{'code':'VPA SE', 'label':'VPA SE'},{'code':'MATH CS', 'label':'MATH CS'}]
	# todo pull program list from DB using faculty + program as label, numeric id as code

@app.route('/')
def index():
	return Response(render_template('index.html', dates=generateDateOptions(TERM), programs=generateProgramOptions(TERM)), mimetype='text/html')

@app.route('/byDate', methods=['GET'])
def getName():
	result = database.getEmploymentStatsByDate(1165, request.args.get('date'))
	return Response(json.dumps(result), mimetype='application/json')

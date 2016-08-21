from __future__ import print_function

from flask import Flask, request, render_template, Response
import scrape, database
import sys, json


TERM = 1165
MONTHS = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'}
excluded_faculties = ['ALL', 'UAE', 'TEACH']
excluded_programs = ['ND']
replacement_faculties = {'CA':'MATH', 'ARCH':'ENG'}
program_specific_replacement_faculties = {'SE': 'ENG', 'CFM': 'MATH'}

def _parseDate(dateCode):
	return '{date} {month} {year}'.format(date=int(dateCode[6:8]), month=MONTHS[int(dateCode[4:6])], year=dateCode[0:4])


app = Flask(__name__)
### Updating ### For scraping new data

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
	termsMap = processTerms(database.getTerms())
	facultiesMap = {}
	for termKey in termsMap:
		facultiesMap[termKey] = processFaculties(database.getFaculties(termKey))
	current = 1
	for entry in missingStats:
		delay = random.random()*.5
		time.sleep(delay)
		print('({percent:5.2f}%):{current}/{count} - Fetching info on {faculty} from {date} in {term}...'.format(percent=float(current)/count * 100, current=current, count=count, faculty=facultiesMap[entry[0]][entry[2]], date=str(entry[1]), term=termsMap[entry[0]]))
		employment.extend(scrape.getEmploymentStats(*entry))
		if current % 25 == 0:
			print('Saving new entries...')
			database.insert('employment', employment)
			employment = []
		current+=1
	database.insert('employment', employment)
	
	print('Update complete.')


### Processing ### Translate database results into usable values

def processTerms(terms):
	results = {}
	for term in terms:
		results[term[0]] = str(term[1])
	return results

def processFaculties(faculties):
	results = {}
	for faculty in faculties:
		if not (str(faculty[1]) in excluded_faculties or str(faculty[2]) in excluded_programs):
			results[faculty[0]] = str(faculty[1] + ' ' + faculty[2])
	return results

def processDates(dates):
	results = []
	for date in dates:
		results.append(str(date[0]))
	return results

def processEmploymentStats(employment):
	results = {}
	for dbResult in employment:
		facultyName = str(dbResult[0])
		program = str(dbResult[1])
		employed = dbResult[2]
		unemployed = dbResult[3]
		programId = str(dbResult[4])

		# custom override
		faculty = facultyName
		if facultyName in replacement_faculties:
			faculty = replacement_faculties[facultyName]
		if program in program_specific_replacement_faculties:
			faculty = program_specific_replacement_faculties[program]

		if faculty not in excluded_faculties and program not in excluded_programs:
			if faculty not in results:
				results[faculty] = {
					'name': faculty,
					'programs': [],
					'employed': 0,
					'unemployed': 0
				}
			results[faculty]['employed'] += employed
			results[faculty]['unemployed'] += unemployed
			results[faculty]['programs'].append({
				'name': facultyName + ' ' + program,
				'employed': employed,
				'unemployed': unemployed,
				'id': programId
				})
	return results

def processEmploymentOverTime(employment):
	results = {}
	for dbResult in employment:
		facultyName = str(dbResult[0])
		program = str(dbResult[1])
		employed = dbResult[2]
		unemployed = dbResult[3]
		programId = str(dbResult[4])
		date = str(dbResult[5])

		# custom override
		faculty = facultyName
		if facultyName in replacement_faculties:
			faculty = replacement_faculties[facultyName]
		if program in program_specific_replacement_faculties:
			faculty = program_specific_replacement_faculties[program]

		if faculty not in excluded_faculties and program not in excluded_programs:
			if faculty not in results:
				results[faculty] = {}
			facultyDates = results[faculty]
			if date not in facultyDates:
				facultyDates[date] = {
					'name': faculty,
					'programs': [],
					'employed': 0,
					'unemployed': 0
				}
			facultyDates[date]['employed'] += employed
			facultyDates[date]['unemployed'] += unemployed
			facultyDates[date]['programs'].append({
				'name': facultyName + ' ' + program,
				'employed': employed,
				'unemployed': unemployed,
				'id': programId
				})
	return results

### Generation ### Create objects and lists directly used for templates and charting

def generateDateOptions(term):
	dateCodes = processDates(database.getDates(term))
	dates = []
	for dateCode in dateCodes:
		dates.append({'code':dateCode, 'label':_parseDate(dateCode)})
	return dates

def generateProgramOptions(term):
	facultiesMap = processFaculties(database.getFaculties(term))
	options = []
	for code in facultiesMap:
		options.append({'code':code, 'label':facultiesMap[code]})
	return options
	

### Routing ###

@app.route('/')
def index():
	return Response(render_template('index.html', dates=generateDateOptions(TERM), programs=generateProgramOptions(TERM)), mimetype='text/html')

@app.route('/byDate', methods=['GET'])
def getDataByDate():
	dbResult = database.getEmploymentStatsByDate(1165, request.args.get('date'))
	result = processEmploymentStats(dbResult)

	return Response(json.dumps(result), mimetype='application/json')

@app.route('/overTime', methods=['GET'])
def getDataOverTime():
	dbResult = database.getEmploymentStatsOverTime(1165)
	result = processEmploymentOverTime(dbResult)

	return Response(json.dumps(result), mimetype='application/json')
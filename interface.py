import scrape, database
import random, time


def update():
	print 'Initializing database...'
	database.initialize()

	print 'Getting available terms...'
	terms = scrape.getTerms()

	print 'Terms retrieved. Updating table...'
	database.insert('terms', terms)

	print 'Getting faculty information and dates for available terms...'
	termsInfo = {
		'faculties' : [],
		'dates' : []
	}
	for term in terms:
		termInfo = scrape.getFacultiesAndDates(term['id'])
		termsInfo['faculties'].extend(termInfo['faculties'])
		termsInfo['dates'].extend(termInfo['dates'])

	print 'Faculties and dates retrieved. Updating tables...'
	database.insert('faculties', termsInfo['faculties'])
	database.insert('dates', termsInfo['dates'])

	print 'Checking the database for new stats to retrieve...'
	missingStats = database.getMissingEmploymentStats()
	count = len(missingStats)

	print '{count} records to retrieve. Starting retrieval...'.format(count=count)
	employment = []
	termsMap = database.getTermsMap()
	facultiesMap = database.getFacultiesMap()
	current = 1
	for entry in missingStats:
		delay = random.random()*.5
		time.sleep(delay)
		print '({percent:5.2f}%):{current}/{count} - Fetching info on {faculty} from {date} in {term}...'.format(percent=float(current)/count * 100, current=current, count=count, faculty=facultiesMap[entry[2]], date=str(entry[1]), term=termsMap[entry[0]])
		employment.extend(scrape.getEmploymentStats(*entry))
		if current % 25 == 0:
			print 'Saving new entries...'
			database.insert('employment', employment)
			employment = []
		current+=1
	database.insert('employment', employment)
	
	print 'Update complete.'
import scrape, database
import random, time


def update():
	print 'Initializing database...'
	database.initialize()
	print 'Getting available terms and faculties...'
	baseInfo = scrape.getTermsAndFaculties()
	print 'Terms and faculties retrieved. Updating tables...'
	database.insert('terms', baseInfo['terms'])
	database.insert('faculties', baseInfo['faculties'])

	print 'Getting dates for available terms...'
	dates = []
	for term in baseInfo['terms']:
		dates.extend(scrape.getDates(term['id']))
	print 'Dates retrieved. Updating table...'
	database.insert('dates', dates)

	print 'Checking the database for new stats to retrieve...'
	missingStats = database.getMissingEmploymentStats()
	count = len(missingStats)
	print '{count} records to retrieve. Starting retrieval...'.format(count=count)
	employment = []
	'''
	for entry in missingStats:
		delay = random.random()
		time.sleep(delay)
		employment.extend(scrape.getEmploymentStats(*entry))
	database.insert('employment', employment)
	'''
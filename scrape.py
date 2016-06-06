import requests, re, database

### URLs and Regex Strings

index_url = 'https://info.uwaterloo.ca/infocecs/students/statistics/index.php'
selection_type_regex = '<select name="{0}".*>([\s\S]*?)<\/select>'
selection_options_regex = '<option value="(\d+).*>(.*)<\/option>'
dates_regex = '&Date=([0-9]{8})'
stats_url = 'https://info.uwaterloo.ca/infocecs/students/statistics/graph.php?Term={0}&Faculty={1}&Level={2}&Date={3}'
stats_regex = '<p>.+Employed Students = (\d+)[\S\s]+?Unemployed Students = (\d+)[\S\s]+?width="25px">(.+)<'


### Authentication

def getUser():
	with open('auth') as auth:
		return auth.read().splitlines()[0]

def getPassword():
	with open('auth') as auth:
		return auth.read().splitlines()[1]


### Scraping and Parsing

# Returns a dictionary containing a list of term objects and a list of faculty objects
def getTermsAndFaculties(username=getUser(), password=getPassword()):
	request = requests.get(index_url, auth=(username, password))
	requestText = request.text
	termSelection = re.findall(selection_type_regex.format('Term'), requestText)[0]
	facultySelection = re.findall(selection_type_regex.format('Faculty'), requestText)[0]

	terms = []
	for termMatch in re.findall(selection_options_regex, termSelection):
		terms.append({
			'id': int(termMatch[0]),
			'term': str(termMatch[1])
		})

	faculties = []
	for facultyMatch in re.findall(selection_options_regex, facultySelection):
		nameSplit = facultyMatch[1].split(' ')
		if len(nameSplit) == 2:
			faculties.append({
				'id': int(facultyMatch[0]),
				'faculty': str(nameSplit[0]),
				'name': str(nameSplit[1])
			})

	return {
		'terms': terms,
		'faculties': faculties
	}

# Returns a list of date objects available for a given term
def getDates(term=1165, username=getUser(), password=getPassword()):
	request = requests.post(index_url, data = {'Term':term,'Faculty':'80','Level':'-1'}, auth=(username, password))
	results = []
	for date in re.findall(dates_regex, request.text):
		results.append({
			'term': term,
			'date' : int(date)
		})
	return results

# Returns a list of employment objects for a given term, date, and faculty
def getEmploymentStats(term=1165, date=20160519, faculty=80, username=getUser(), password=getPassword()):
	request = requests.get(stats_url.format(term, faculty, -1, date), auth=(username, password))
	results = []
	for result in re.findall(stats_regex, request.text):
		nameSplit = result[2].split(' ')
		results.append({
			'term': term,
			'date': date,
			'faculty': faculty,
			'level': str(nameSplit[2]),
			'employed': int(result[0]),
			'unemployed': int(result[1])
		})
	return results


### Database Operations
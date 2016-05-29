import requests
import re

dates_url = 'https://info.uwaterloo.ca/infocecs/students/statistics/index.php'
dates_regex = '&Date=([0-9]{8})'
stats_url = 'https://info.uwaterloo.ca/infocecs/students/statistics/graph.php?Term={0}&Faculty={1}&Level={2}&Date={3}'
stats_regex = '<p>.+Employed Students = (\d+)[\S\s]+?Unemployed Students = (\d+)[\S\s]+?width="25px">(.+)<'

def get_user():
	with open('auth') as auth:
		return auth.read().splitlines()[0]

def get_password():
	with open('auth') as auth:
		return auth.read().splitlines()[1]

# may end up removing
def get_auth():
	with open('auth') as auth:
		return auth.read().splitlines()

def parse(result): 
	return {
	'employed' : str(result[0]),
	'unemployed' : str(result[1]),
	'faculty' : str(result[2])
	}

def getStats(faculty=80, date=20160519, level=-1, term=1165, username=get_user(), password=get_password()):
	request = requests.get(stats_url.format(term, faculty, level, date), auth=(username, password))
	results = re.findall(stats_regex, request.text)
	return map(parse, results)

def getDatesByTerm(term=1165, username=get_user(), password=get_password()):
	request = requests.post(dates_url, data = {'Term':term,'Faculty':'80','Level':'-1'}, auth=(username, password))
	results = re.findall(dates_regex, request.text)
	return map(str, results)

def getFacultyStats(faculty=80, term=1165):
	stats = []
	dates = getDatesByTerm(term);
	for date in dates:
		statsByDate = {date : getStats(faculty, date, -1, term)}
		stats.append(statsByDate)
	return stats

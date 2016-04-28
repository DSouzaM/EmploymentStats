import requests
import re

index_url = 'https://info.uwaterloo.ca/infocecs/students/statistics/index.php'
parameterized_url = 'https://info.uwaterloo.ca/infocecs/students/statistics/graph.php?Term={0}&Faculty={1}&Level={2}&Date={3}'
regex_string = '<p>.+Employed Students = (\d+)[\S\s]+?Unemployed Students = (\d+)[\S\s]+?width="25px">(.+)<'



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

def parse(results): 
	parsed = []
	for entry in results:
		obj = {}
		obj['employed'] = str(entry[0])
		obj['unemployed'] = str(entry[1])
		obj['faculty'] = str(entry[2])
		parsed.append(obj)
	return parsed	

def query(faculty=80, date=20160421, level=-1, term=1165, username=get_user(), password=get_password()):
	request = requests.get(parameterized_url.format(term, faculty, level, date), auth=(username, password))
	results = re.findall(regex_string, request.text)
	return parse(results)



def full_lookup(faculty=80):
	stats = {}
	with open('dates') as dates:
		for date in dates.read().splitlines():
			stats[date] = query(80,date)
			sleep(0.1)
	return stats

# tentative regex '<p>.+Employed Students = (\d+)[\S\s]+?Unemployed Students = (\d+)[\S\s]+?width="25px">(.+)<'

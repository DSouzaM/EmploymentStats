import sqlite3

### Paths

database_path = 'employment.sqlite'
init_path = 'dbinit.sql'
diff_path = 'diff.sql'


### Constants

excluded_faculties = ['ALL', 'UAE', 'TEACH']
replacement_faculties = {'CA':'MATH', 'ARCH':'ENG'}
program_specific_replacement_faculties = {'SE': 'ENG', 'CFM': 'MATH'}

### Private Functions

# Executes multi-line script from .sql file, handles creation and closing of connection
def __runScript(path):
	with sqlite3.connect(database_path) as connection, open(path) as script_file:
			cursor = connection.cursor()
			script = script_file.read()
			cursor.executescript(script)
			connection.commit()

# Executes single-line query from .sql file, handles creation and closing of connection
def __runQuery(path):
	with sqlite3.connect(database_path) as connection, open(path) as query_file:
				cursor = connection.cursor()
				query = query_file.read()
				cursor.execute(query)				
				connection.commit()
				return cursor.fetchall()

# Returns a list of the columns in a data set
def __getColumns(data):
	if len(data) <= 0:
		return ''
	return __bracketToParen(str(data[0].keys()))

# Returns the fields for a given row in a data set
def __getRow(data, i):
	return __bracketToParen(str(data[i].values()))

# Replaces square brackets in a string with parentheses
def __bracketToParen(str):
	return str.replace('[','(').replace(']',')')

### Database Functions

# Executes script to initialize SQLite database
def initialize():
	__runScript(init_path)

 
# Inserts data into table, mapping json key-values to columns
def insert(table, data):
	if len(data) <= 0:
		return
	with sqlite3.connect(database_path) as connection:
		cursor = connection.cursor();
		columnsString = __getColumns(data)
		for row in range(len(data)):
			cursor.execute('INSERT OR REPLACE INTO {table} {columns} VALUES {row};'.format(table=table, columns=columnsString, row=__getRow(data,row)))

		connection.commit()

def getMissingEmploymentStats():
	return __runQuery(diff_path)

def getTermsMap():
	with sqlite3.connect(database_path) as connection:
		cursor = connection.cursor()
		cursor.execute('SELECT id,term FROM terms')
		results = {}
		for result in cursor.fetchall():
			results[result[0]] = str(result[1])
		return results

def getFacultiesMap(term=1165, removeExcluded=False):
	with sqlite3.connect(database_path) as connection:
		cursor = connection.cursor()
		cursor.execute('SELECT id,faculty,name FROM faculties WHERE term=?', (term,))
		results = {}
		for result in cursor.fetchall():
			if not (removeExcluded and str(result[1]) in excluded_faculties):
				results[result[0]] = str(result[1] + ' ' + result[2])
		return results

def getDates(term=1165):
	with sqlite3.connect(database_path) as connection:
		cursor = connection.cursor()
		cursor.execute('SELECT date FROM dates WHERE term=? ORDER BY date DESC', (term,))
		results = []
		for result in cursor.fetchall():
			results.append(str(result[0]))
		return results

def getEmploymentStatsByDate(term, date):
	with sqlite3.connect(database_path) as connection:
		cursor = connection.cursor()
		cursor.execute('SELECT f.faculty, f.name, SUM(e.employed), SUM(e.unemployed), f.id FROM employment AS e INNER JOIN faculties AS f ON e.faculty=f.id AND e.term=f.term WHERE e.term=? AND e.date=? GROUP BY e.faculty', (term, date))
		results = {}
		for result in cursor.fetchall():
			facultyName = str(result[0])
			program = str(result[1])
			employed = result[2]
			unemployed = result[3]
			programId = str(result[4])

			# custom override
			faculty = facultyName
			if facultyName in replacement_faculties:
				faculty = replacement_faculties[facultyName]
			if program in program_specific_replacement_faculties:
				faculty = program_specific_replacement_faculties[program]


			if faculty not in excluded_faculties:
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


def dropTable(table):
	with sqlite3.connect(database_path) as connection:
		cursor = connection.cursor()
		cursor.execute('DROP TABLE IF EXISTS {table}'.format(table=table));
		connection.commit()

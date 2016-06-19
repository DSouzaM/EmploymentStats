import sqlite3

### Paths

database_path = 'employment.sqlite'
init_path = 'dbinit.sql'
diff_path = 'diff.sql'


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

	connection = sqlite3.connect(database_path)
	cursor = connection.cursor();

	columnsString = __getColumns(data)
	for row in range(len(data)):
		cursor.execute('INSERT OR REPLACE INTO {table} {columns} VALUES {row};'.format(table=table, columns=columnsString, row=__getRow(data,row)))

	connection.commit()
	connection.close()

def getMissingEmploymentStats():
	return __runQuery(diff_path)
import sqlite3

### Paths

database_path = 'employment.sqlite'
init_path = 'dbinit.sql'


### Private Functions

# Executes script from .sql file
def __runSQL(path):
	connection = sqlite3.connect(database_path)
	cursor = connection.cursor();
	with open(path) as script_file:
		script = script_file.read()
		cursor.executescript(script)
	connection.commit()
	connection.close()

def __getColumns(data):
	if len(data) <= 0:
		return ''
	return __bracketToParen(str(data[0].keys()))

def __getRow(data, i):
	return __bracketToParen(str(data[i].values()))

def __bracketToParen(str):
	return str.replace('[','(').replace(']',')')

### Database Functions

# Executes script to initialize SQLite database
def initialize():
	__runSQL(init_path)

# Inserts data into table, mapping json key-values to columns
def insert(table, data):
	connection = sqlite3.connect(database_path)
	cursor = connection.cursor();
	if len(data) <= 0:
		return
	columnsString = __getColumns(data)

	for row in range(len(data)):
		cursor.execute('INSERT INTO {table} {columns} VALUES {rows}'.format(table=table, columns=columnsString, rows=__getRow(data,row)))

	connection.commit()
	connection.close()

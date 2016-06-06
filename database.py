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


### Database Functions

# Executes script to initialize SQLite database
def initialize():
	__runSQL(init_path)

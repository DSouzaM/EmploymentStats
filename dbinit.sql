CREATE TABLE IF NOT EXISTS terms (
	id INTEGER PRIMARY KEY,
	term STRING
);

CREATE TABLE IF NOT EXISTS dates (
	id INTEGER PRIMARY KEY,
	term INTEGER,
	date INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS date_index ON dates (term, date);

CREATE TABLE IF NOT EXISTS faculties (
	id INTEGER PRIMARY KEY,
	faculty STRING,
	name STRING
);

CREATE TABLE IF NOT EXISTS employment (
	id INTEGER PRIMARY KEY,
	term_id INTEGER,
	date INTEGER,
	faculty_id INTEGER,
	level STRING,
	employed INTEGER,
	unemployed INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS employment_index ON employment (term_id, date, faculty_id, level);
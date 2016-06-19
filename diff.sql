SELECT d.term,d.date,f.id FROM dates d 
CROSS JOIN faculties f 
LEFT OUTER JOIN employment e ON d.term=e.term AND d.date=e.date AND f.id=e.faculty 
WHERE e.id IS NULL
ORDER BY f.id, d.date;
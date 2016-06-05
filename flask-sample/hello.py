from __future__ import print_function
from flask import Flask, request, render_template

app = Flask(__name__)
name = 'Matt'

@app.route('/')
def index():
    return render_template('index.html', name=name)

@app.route('/name', methods=['GET'])
def getName():
	return name

@app.route('/name', methods=['POST'])
def setName():
	global name
	name = request.form.get('name').encode('utf8')
	return name
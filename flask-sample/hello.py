from flask import Flask, request, render_template
from flask_sockets import Sockets

app = Flask(__name__)
sockets = Sockets(app)
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

@sockets.route('/socket')
def handleSocket(ws):
	for i in range(0, 10):
		ws.send(str(i))


if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()
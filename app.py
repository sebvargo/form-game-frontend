from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route("/welcome")
def index():
    return render_template('index.html')


@app.route("/")
@app.route("/game")
def game():
    return render_template('game.html')



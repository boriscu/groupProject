from unicodedata import category
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import datetime
from flask_marshmallow import Marshmallow
from sqlalchemy import ForeignKey

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:nsstars@localhost/flask"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)

# Definisanje polja tabele
class Excercises(db.Model):
    __tablename__ = "excercises"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    category = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.datetime.now)
    uidate = db.Column(db.Date)

    def __init__(self, title, category, uidate):
        self.title = title
        self.category = category
        self.uidate = uidate

# Serijalizacija, konvertuje kompleksne tipove podataka(json) u i iz pajtonovih objekata
# load - deserijalizacije, dump - serijalizacija
class ExcerciseSchema(ma.Schema):
    class Meta:
        fields = ("id", "title", "category", "date", "uidate")


excercise_schema = ExcerciseSchema()
excercises_schema = ExcerciseSchema(many=True)


class WorkingSets(db.Model):
    __tablename__ = "workingsets"
    id = db.Column(db.Integer, primary_key=True)
    weight = db.Column(db.Integer, default = 0)
    reps = db.Column(db.Integer, default = 0)
    comment = db.Column(db.Text, default = "")
    excercise_name_id = db.Column(db.Integer, ForeignKey("excercises.id"))

    excercise_name = db.relationship("Excercises", foreign_keys = [excercise_name_id])

    def __init__(self, weight, reps, comment):
        self.weight = weight
        self.reps = reps
        self.comment = comment

class WorkingSetSchema(ma.Schema):
    class Meta:
        fields = ("id", "weight", "reps", "comment", "excercise_name_id")

workingset_schema = WorkingSetSchema()
workingsets_schema = WorkingSetSchema(many=True)


###############################################
# Rute/Komande za bazu


@app.route("/get/excercises", methods=["GET"])
def get_excercises():
    all_excercises = Excercises.query.all()
    results = excercises_schema.dump(all_excercises)  # serijalizacija
    return jsonify(results)  # Konvertuje json output u objekat

@app.route("/get/workingsets", methods = ["GET"])
def get_workingsets():
    all_workingsets = WorkingSets.query.all()
    results = workingsets_schema.dump(all_workingsets)
    return jsonify(results)


@app.route("/get/excercises/<id>/", methods=["GET"])
def post_details(id):
    excercise = Excercises.query.get(
        id
    )  # Getuje artikl uz que-a artikala sa odgovarajucim id-ijem
    return excercise_schema.jsonify(excercise)  # Ispise nam rezultat operacije u postmanu

@app.route("/get_by_date/excercises/<uidate>/", methods=["GET"])
def get_by_date_excercises(uidate):
    excercises = Excercises.query.filter_by(uidate=uidate)
    results = excercises_schema.dump(excercises)
    return jsonify(results)

@app.route("/add/excercises", methods=["POST"])
def add_excercises():
    title = request.json["title"]
    category = request.json["category"]
    uidate = request.json["uidate"]

    excercises = Excercises(title, category, uidate)  # Kreira artikl sa json title-om i category-em
    db.session.add(excercises)
    db.session.commit()
    return excercise_schema.jsonify(excercises)

@app.route("/add/workingsets", methods = ["POST"])
def add_workingsets():
    weight = request.json["weight"]
    reps = request.json["reps"]
    comment = request.json["comment"]

    workingsets = WorkingSets(weight,reps,comment)
    db.session.add(workingsets)
    db.session.commit()
    return workingset_schema.jsonify(workingsets)


@app.route("/update/excercises/<id>/", methods=["PUT"])
def update_excercises(id):
    excercise = Excercises.query.get(id)

    title = request.json["title"]  # Uzima title i category koji smo mu mi otkucali
    category = request.json["category"]
    uidate = request.json["uidate"]

    excercise.title = title
    excercise.category = category
    excercise.uidate = uidate

    db.session.commit()
    return excercise_schema.jsonify(excercise)




@app.route("/delete/excercises/<id>/", methods=["DELETE"])
def delete_excercise(id):
    Excercises.query.filter_by(id = id).delete()
    db.session.commit()

    return excercise_schema.jsonify(Excercises.query.filter_by(id=id))


###############################################
if __name__ == "__main__":
    app.run(host="192.168.56.1", port=3000, debug=True)
# db.create_all()
# db.session.commit()
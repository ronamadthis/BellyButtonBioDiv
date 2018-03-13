# import necessary libraries
import json
from flask import (Flask, render_template, jsonify, request)
import pandas as pd
import numpy as np
import sqlalchemy 
from sqlalchemy.ext.automap import automap_base 
from sqlalchemy.orm import Session 
from sqlalchemy import create_engine, desc 

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

# Create a list to hold our data
engine= create_engine("sqlite:///belly_button_biodiversity.sqlite")
Base = automap_base()
Base.prepare(engine, reflect = True )

Samples = Base.classes.samples
Otu = Base.classes.otu
samples_Metadata = Base.classes.samples_metadata

session = Session(engine)

@app.route("/")
def homepage():
	return render_template("index.html")

@app.route('/names')

def names():
	results = session.query(Samples).statement
	df = pd.read_sql_query(results, session.bind)
	df.set_index("otu_id", inplace = True)

	return jsonify(list(df.columns))

@app.route("/otu")
def id():
	results = session.query(Otu.lowest_taxonomic_unit_found).all()
	taxonomy = list(np.ravel(results))
	return jsonify(taxonomy)

@app.route('/metadata/<sample>')
# def metadata(sample):

# 	# Get integer part from sampleId.
# 	sample_id = int(sample.split("_")[1])

# 	 # Query all samples
# 	results = session.query(samples_Metadata).all()

# 	# Create an empty dictionary for data
# 	samplemetadata = {}

# 	# Create a dictionary from the row data of samples
# 	for result in results:

# 		if (sample_id == result.SAMPLEID):

# 			samplemetadata["AGE"] = result.AGE

# 			samplemetadata["BBTYPE"] = result.BBTYPE

# 			samplemetadata["ETHNICITY"] = result.ETHNICITY

# 			samplemetadata["GENDER"] = result.GENDER

# 			samplemetadata["LOCATION"] = result.LOCATION

# 			samplemetadata["SAMPLEID"] = result.SAMPLEID

# 	return jsonify(samplemetadata)



@app.route('/metadata/<sample>')
def metadata(sample):

	array = [samples_Metadata.AGE,samples_Metadata.BBTYPE,samples_Metadata.ETHNICITY,samples_Metadata.GENDER,samples_Metadata.LOCATION,samples_Metadata.SAMPLEID]

	results = session.query(*array).filter(samples_Metadata.SAMPLEID == sample[3:]).all()
	samplemetadata = {}
	
	for result in results:
		samplemetadata["AGE"] = result[0]
		samplemetadata["BBTYPE"] = result[1]
		samplemetadata["ETHNICITY"] = result[2]
		samplemetadata["GENDER"] = result[3]
		samplemetadata["LOCATION"] = result[4]
		samplemetadata["SAMPLEID"] = result[5]
	return jsonify(samplemetadata)
	
@app.route('/wfreq/<sample>')
def wfreq(sample):

	# Get integer part from sampleId.
	sample_id = int(sample.split("_")[1])

	 # Query all samples
	results = session.query(samples_Metadata).all()	

	for result in results:

		if (sample_id == result.SAMPLEID):

			wfreq = result.WFREQ

	return jsonify(wfreq)        

@app.route('/samples/<sample>')
def samples(sample):
	# Create empty dictionary & lists

	sample_dict = {}

	otu_ids = []

	sample_values = []

	sample_query = "Samples." + sample

	# Query otu_ids and sample values
	results = session.query(Samples.otu_id, sample_query).order_by(desc(sample_query))

	for result in results:

		otu_ids.append(result[0])

		sample_values.append(result[1])
	# Fill the empty dictionary
	sample_dict = {

		"otu_ids": otu_ids,

		"sample_values": sample_values

	}

	return jsonify(sample_dict)

if __name__ == "__main__":
	app.run(debug=True)

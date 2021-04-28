# -*- coding: utf-8 -*-

from flask import flash, redirect, url_for, render_template, request,jsonify
import demjson
from application import app
import os
from scipy import interpolate
import numpy as np
import json

@app.route('/', methods=['GET', 'POST'])
def index():
    cmd = 'python ./application/alert_api.py board'
    pipeline = os.popen(cmd)
    json_content=pipeline.read()
    print(json_content)
    messages =demjson.decode(json_content)
    messages.sort(key = lambda x:x["Record"]["issueDateTime"], reverse =True)
    for i in range(len(messages)):
        print(messages[i]["Record"]["currentState"])
        if messages[i]["Record"]["type"] == 'R0 alert':
            messages[i]["Record"]["type"] = "R0 alert"
            messages[i]["Record"]["Value2"] = "Room: 001       Indoor CO2 concentration: "+str(messages[i]["Record"]["Value2"])+" PPM"
        if messages[i]["Record"]["type"] == 'Probability alert':
            messages[i]["Record"]["type"] = "P alert"
            messages[i]["Record"]["Value2"] = "Room: "+messages[i]["Record"]["issuer"]
        messages[i]["Record"]["alertNumber"]=str(int(messages[i]["Record"]["alertNumber"])+1)

    return render_template('index.html', messages=messages)

@app.route('/co2', methods=['POST'])
def issue_alert():
    co2 = request.form['co2']
    print(co2)
    recognize_info = {'info': 'received'}

    print("R0 computing")
    # for influenza
    # x = [409, 427.8, 446.2, 465.2, 485.9, 505.4, 525.3, 544.3, 564.3, 583.9, 603.5, 623.5, 642.3, 661.9, 681.1, 700.7, 719.5, 739.1, 758.7, 780.8, 797.9, 817.1, 836.3, 856.3, 875.9, 895.1, 914.7, 934.7, 954.3, 973.5, 992.6]
    # = [0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.2, 1.3, 1.4, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2, 2.2, 2.2, 2.4, 2.5, 2.6, 2.6, 2.7, 2.8, 2.8, 2.9, 3]
    # for sara
    x = [409,427.8,446.2,465.2,485.9,505.4,525.3,544.3,564.3,583.9,603.5,623.5,642.3,661.9,681.1,700.7,719.5,739.1,758.7,780.8,797.9,817.1,836.3,856.3,875.9,895.1,914.7,934.7,954.3,973.5,992.6]
    y = [0,0.1,0.1,0.1,0.2,0.2,0.3,0.3,0.3,0.4,0.4,0.4,0.5,0.5,0.5,0.6,0.6,0.6,0.7,0.7,0.7,0.8,0.8,0.8,0.9,0.9,0.9,0.9,1,1,1]
    x_max = max(x)
    x_min = min(x)
    y_max = max(y)
    y_min = min(y)
    f = interpolate.interp1d(x, y, kind='cubic')
    x_i = float(co2)
    if x_i >= x_max:
        r0 = y_max
    elif x_i <= x_min:
        r0 = y_min
    else:
        r0 = np.round(f(x_i), 2)
    if r0 >=0.5:
        print("Ready to send alert")
        cmd = 'node ~/fabric-samples/alert/organization/division/application/issueR0.js ' + str(r0) + ' ' + str(x_i)
        print(cmd)
        pipeline = os.popen(cmd)
        result = pipeline.read()
        print(result)
    return jsonify(recognize_info), 201



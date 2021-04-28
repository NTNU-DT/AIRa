import streamlit as st
import altair as alt
import pandas as pd
import numpy as np
import os, urllib, cv2
import matplotlib.pyplot as plt
import demjson
from PIL import Image
import math
import sys
from scipy import interpolate

def main():
    st.sidebar.title("POTENTIAL INFECTION ALERT")
    app_mode = st.sidebar.selectbox("Choose the function",
        [ "System introduction","P alert assessment","R0 alert assessment"])
    if app_mode == "P alert assessment":
        run_p_alert_app()
    elif app_mode == "System introduction":
        st.markdown(open('instructions.md').read())
    elif app_mode == 'R0 alert assessment':
        run_r0_alert_app()



def run_p_alert_app():
    Ventilation_rate = st.sidebar.slider(label='Room ventilation rate (m3 h-1)', min_value=0, max_value=500, value=250, format="%d",step=1)
    Quanta_generation_rate = st.sidebar.slider(label='Quanta generation rate (m3 h-1)', min_value=0, max_value=300, value=135,
                                             format="%d")
    Exposure_time = st.sidebar.slider(label='Exposure time (h)', min_value=0.0, max_value=1.0,value=float(0.25), format="%f",step=0.01)

    # mask = st.sidebar.selectbox('Mask wearing',('no mask wearing', 'everyone except for infected person', 'everyone wears a mask'))
    Rate_of_breathing = st.sidebar.slider(label='Rate of breathing (m3 h-1)', min_value=0.0, max_value=5.0, value=float(3.0), format="%f",step=0.01)
    room = st.sidebar.selectbox('Room Number',('Room 001', 'Room 002', 'Room 003', 'Room 004', 'Room 005'))
    Q = Ventilation_rate
    q = Quanta_generation_rate
    p = Rate_of_breathing
    t = np.linspace(0, 1, 100)
    R = 1
#    if mask == "no mask wearing":
#        R = 1
#    elif mask == "everyone except for infected person":
#        R = 0.5
#    elif mask == 'everyone wears a mask':
#        R = 0.2

    P = 1 - np.exp(-R * q * p * t / Q)
    if P[int(Exposure_time*100)] >= 0.5:
        st.markdown("The probability of infection after "+str(Exposure_time)+" hours is greater than 50%!")
        if st.button('Click this to send an alert'):
            print("Ready to send alert...")
            cmd = 'node issueWR.js ' + str(P[int(Exposure_time*100)]) +' '+room
            pipeline = os.popen(cmd)
            result = pipeline.read()
            print(result)
            st.success('A P alert was sent successfully!')
    else:
        st.markdown("The probability of infection after "+str(Exposure_time)+" hours is "+str(round(P[int(Exposure_time*100)]*100,2))+"%")
    fig, axes = plt.subplots(1, 1)
    axes.plot(t, P*100, linestyle='-', color='g', marker='None', linewidth=1.5,label="Probability of infection")
    axes.grid(which='minor', c='lightgrey')
    axes.plot(t,[50]*100,linestyle='--',color='r', label='Alert threshold')
    axes.set_ylabel("Probability of infection (%)")
    axes.set_xlabel("Exposure time (h)")
    plt.legend(bbox_to_anchor=(0., 1.02, 1., .102), loc=0,
                           ncol=3, mode="expand", borderaxespad=0.)
    st.pyplot(fig)

def run_r0_alert_app():
    steps = st.sidebar.slider(label='Number of CO2 real-time data items', min_value=1, max_value=30, value=15, format="%d",step=1)

    x = [407.1, 427.9, 448.9, 467.9, 486.2, 505.4, 526.3, 544.8, 563.8, 583.5, 603.7, 623.4, 641.9, 661, 681.9, 700.3, 719.4, 739.6, 758.7, 777.8, 796.9, 817.1, 836.7, 855.2, 874.3, 895.1, 913.6, 933.6, 951.8, 972.6, 991.7]
    y = [0.2, 0.3, 0.4, 0.5, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8, 0.9, 1, 1.2, 1.2, 1.3, 1.4, 1.5, 1.5, 1.6, 1.6, 1.7, 1.7, 1.8, 1.8, 1.9, 2, 2, 2.1, 2.1, 2.2, 2.2]
    x_max = max(x)
    x_min = min(x)
    y_max = max(y)
    y_min = min(y)
    f = interpolate.interp1d(x, y, kind='cubic')
    print(f)
    x_i=pd.read_csv('~/fabric-samples/alert/co2.csv').tail(steps).iloc[:, 2]
    time_i=np.array(pd.read_csv('~/fabric-samples/alert/co2.csv').tail(steps).iloc[:, 1])
    r0=np.zeros_like(x_i)
    for i in range(steps):
        if x_i.iloc[i] >= x_max:
            r0[i] = y_max
        elif x_i.iloc[i] <= x_min:
            r0[i] = y_min
        else:
            r0[i] = f(x_i.iloc[i])
    r0_index=r0>=0.5


    fig, axes = plt.subplots(1, 1)
    axes.plot(time_i, x_i, linestyle='-', color='g', linewidth=1.5, label="Real-time CO2 Concentration Level")

    for i in range(steps):
        if r0_index[i] == True:

            plt.scatter(x=time_i[i], y=x_i.iloc[i], color='r', marker='*')
        else:
            print(time_i[i], x_i.iloc[i])
            plt.scatter(x=time_i[i], y=x_i.iloc[i], color='g', marker='*')


    axes.grid(which='minor', c='lightgrey')
    axes.set_ylabel("CO2 Concentration Level (PPM)")
    plt.grid(True)
    plt.title("Real-time CO2 Concentration Level")
    plt.xticks(rotation=45, size=8)
    st.pyplot(fig)




    image = Image.open('r0.png')
    st.image(image)
    st.markdown(open('link.md').read())



if __name__ == "__main__":
    main()

import math
import sys
import numpy as np
from scipy import interpolate
import os
argv = sys.argv
if argv[1] == "probability":
    print("Probability computing")
    q= int(argv[2])/3600.0
    N = 150 # number of people
    Q = 0.58
    Q_f = 1.76
    V = 120
    p = 0.5*1e-3
    p_f = 0
    t = 60*60
    R = 1
    P = 1 - math.exp(-R*q*p*t/Q)
    if P >=0.01:
        print("Ready to send alert...")
        cmd = 'node issueWR.js ' +str(P)
        pipeline = os.popen(cmd)
        result = pipeline.read()
        print(result)

elif argv[1] == "R0":
    print("R0 computing")
    #for influenza
    #x = [409, 427.8, 446.2, 465.2, 485.9, 505.4, 525.3, 544.3, 564.3, 583.9, 603.5, 623.5, 642.3, 661.9, 681.1, 700.7, 719.5, 739.1, 758.7, 780.8, 797.9, 817.1, 836.3, 856.3, 875.9, 895.1, 914.7, 934.7, 954.3, 973.5, 992.6]
    # = [0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.2, 1.3, 1.4, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2, 2.2, 2.2, 2.4, 2.5, 2.6, 2.6, 2.7, 2.8, 2.8, 2.9, 3]
    #for sara
    x = [407.1, 427.9, 448.9, 467.9, 486.2, 505.4, 526.3, 544.8, 563.8, 583.5, 603.7, 623.4, 641.9, 661, 681.9, 700.3, 719.4, 739.6, 758.7, 777.8, 796.9, 817.1, 836.7, 855.2, 874.3, 895.1, 913.6, 933.6, 951.8, 972.6, 991.7]
    y = [0.2, 0.3, 0.4, 0.5, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8, 0.9, 1, 1.2, 1.2, 1.3, 1.4, 1.5, 1.5, 1.6, 1.6, 1.7, 1.7, 1.8, 1.8, 1.9, 2, 2, 2.1, 2.1, 2.2, 2.2]
    x_max = max(x)
    x_min = min(x)
    y_max = max(y)
    y_min = min(y)
    f = interpolate.interp1d(x, y, kind='cubic')
    x_i = float(argv[2])
    if x_i >= x_max:
        r0 = y_max
    elif x_i <= x_min:
        r0 = y_min
    else:
        r0 = np.round(f(x_i),2)
    if r0 >= 1:
        print("Ready to send alert")
        cmd = 'node ./application/issueR0.js '+ str(r0)+' '+str(x_i)
        print(cmd)
        pipeline = os.popen(cmd)
        result = pipeline.read()
        print(result)

elif argv[1] == "board":
    cmd = 'node ./application/queryBoard.js'
    pipeline = os.popen(cmd)
    result = pipeline.read()
    print(result)


else:
    print("Error Alert Request! ...")


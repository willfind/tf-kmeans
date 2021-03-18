import pandas as pd
import matplotlib.pyplot as plot
from numpy import *

def count(item, arr):
    return len(list(filter(lambda v: v == item, arr)))

data = pd.read_csv("results.csv")

errors = data["learnedKsNaive"] - data["actualKs"]
x = list(sorted(set(errors)))
y = list(count(e, errors) / len(errors) for e in x)
plot.bar(array(x)-0.15, y, width=0.3, label="naive")

errors = data["learnedKsPlusPlus"] - data["actualKs"]
x = list(sorted(set(errors)))
y = list(count(e, errors) / len(errors) for e in x)
plot.bar(array(x)+0.15, y, width=0.3, label="++")

plot.legend()
plot.show()

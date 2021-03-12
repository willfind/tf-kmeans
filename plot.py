import pandas as pd
import matplotlib.pyplot as plot

def count(item, arr):
  return len(list(filter(lambda v: v == item, arr)))

data = pd.read_csv("results.csv")
errors = data["learnedKs"] - data["actualKs"]
x = list(sorted(set(errors)))
y = list(count(e, errors) for e in x)
plot.bar(x, y)
plot.show()

import os
import json


root1 = "evaluation"
root2 = "training"

data = {}
data["evaluation"] = []
data["training"] = []

for filename in os.listdir(root1):
    data["evaluation"].append(filename)
for filename in os.listdir(root2):
    data["training"].append(filename)

f = open("file_list.json", "w")
json.dump(data, f, indent=4, sort_keys=True)

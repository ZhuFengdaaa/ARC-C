import json



with open("evaluation.json") as f:
    evaluation_data = json.load(f)

with open("list.txt") as f:
    sub_eval = f.readlines()

cnt = 0
data_list = []
for data in evaluation_data:
    for item in sub_eval:
        item = item.strip("\n")
        if item == data["name"]:
            cnt+=1
            data_list.append(data)
print(cnt)

with open("sub_evaluation.json", "w") as f:
    json.dump(data_list, f)


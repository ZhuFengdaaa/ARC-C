import os


folder = "label_guest"

files = os.listdir(folder)
for i in range(len(files)):
    files[i] = int(files[i].split(".json")[0])
print(max(files))

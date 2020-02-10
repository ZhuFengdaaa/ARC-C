# The Abstraction and Reasoning Corpus (Multi Choice) (ARC-C) 标注说明

- 下载数据集

```
git clone git@github.com:ZhuFengdaaa/ARC-C.git
```

- 运行网页服务器


```
python2 server.py
```

- 访问标注网站

打开浏览器，访问 http://127.0.0.1:8080

- 登录

输入用户名 (以自己名字命名)。服务器将会在 clone 下来的 ARC-C 主目录下生成名为 "label_<用户名>" 的文件夹。所有标注结果将保存在该文件夹下。

- 标注

系统将会从题库里随机抽取一道题。每道题有三个样例。每个样例 i 由一对图片(Q<sub>i</sub>, A<sub>i</sub>)组成。请找到适用于这三个样例的 (Q<sub>i</sub>,A<sub>i</sub>) 对应关系。题目的要求是对一张图片Q，给出相应的答案A。

请认真思考并提交你的答案，如果错误，答案将会被保存成为干扰项。如果正确，那么请标注一个你觉得最难的干扰项。

- 提交

完成后将主目录下的"label_<用户名>" 的文件夹打包并收集汇总

tar -cf label_example label_example.tar


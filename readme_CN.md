# 用Obsidian打造一个强大的写作辅助系统


Github：
https://github.com/zazaji/obsidian-SenGener/
## 用法

在写作的过程中，当文思枯竭的时候，按下快捷键（可以定义自己的快捷键），然后AI自动根据之前写的内容，自动给出提示。同时，在右侧边栏还能根据上句话，在文档库中进行全文检索，找到相应的内容。  
作为一个熬夜码字的朋友，是不是觉得有种心动的感觉？

## 原料

我最近用obsidian来作为管理笔记和写作的工具，所以我基于obsidian开发了这个插件。不过插件只是一方面，更重要的是后台有一个较大的全文检索服务加上一个人工智能训练后的模型。  
要完全实现需要obsidian + 定制的插件 + AI大数据服务。

## 实现具体过程

-   从部分网站抓取了一些工作报告、百科、党建、新闻等数据。
-   使用深度学习（我是用的是GPT2），训练了几个专业的模型，不同的模型，如写报告类、新闻类，效果和应用场景不同。当然，写诗填词也不在话下。
-   同时将这些数据做成全文检索，并将检索和模型做成数据服务。
-   使用obsidian的时候，通过快捷键调用数据服务，实现推荐列表和参考关联文档功能。
-  目前我搭建了一个示例网站，基本做到开箱即用。

## 使用方法
- 下载安装obsidian。
- 创建一个文库，并指定路径。
- 进入该文库，并启用第三方插件模式。
- 进入到文库所在路径，将main.js放入`.obsidian/plugins/obsidian-SenGener`文件夹。
- 在第三方插件中启用该插件。并配置快捷键。默认快捷键是`ctrl + 引号`。也可以选择不同的创作模型，调整其他参数。
- 创建一个文件，开始写作。

## 参数介绍
- API address: 服务地址，默认https://fwzd.myfawu.com/，是我提供的一个示例服务。里面包含了英文模型、对话模型、工作报告模型、腾讯welm模型。

- Type: 可以选择不同的创作模型。

- token: 用于登录腾讯welm的token。

- enable searching: 是否启用全文检索。目前为report模型提供全文检索。

- Number of choices: 多少个候选项。不要选太多，影响速度。

- max length: 一次产生的文字（英语是词）的数量。不要选太多，影响速度。

### 示例：
- 英文写作: 本来GPT2就是基于英文设计的，用在这里效率不是一般的高。分分钟一片文章。

![](./obsidian-sengener/demo.gif)
![](./obsidian-sengener/_new_demo_en.gif)
![](./obsidian-sengener/_english_demo.gif)


- 工作总结胸有成竹

![](https://blog.ouyanghome.com/wp-content/uploads/2022/09/gif.gif)


- 新闻稿件下笔有神，

![](./obsidian-sengener/11.gif)

- 吟诗作赋一挥而就

![](./obsidian-sengener/48c10a17095bc84a8939d4a7ac2326e.jpg)
![](./obsidian-sengener/b3df27009a29d0d01a8234967235832.jpg)

- 八股时文信手拈来

![](./obsidian-sengener/demo_cn.gif)

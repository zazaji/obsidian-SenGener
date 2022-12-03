# SenGenerPlugin for obsidian    [中文](readme_CN.md)

This plugin is used to generate a serial of Sentenses for writting. 

![](./obsidian-sengener/demo.gif)

![](./obsidian-sengener/_new_demo_en.gif)

![](./obsidian-sengener/_english_demo.gif)

![](./obsidian-sengener/demo_cn.gif)

![](./obsidian-sengener/new_demo_cn.gif)

![](./obsidian-sengener/new_demo_en.gif)

## Thanks
Sengener based on obsidian-completr. I copied lots of code from it.
https://github.com/tth05/obsidian-completr

## How to use this plugin

1. download and install obsidian. Create a vault and specify the path. 

2. goto the vault folder. download from releases , and extract them to the plugin folder,
   the path like:   VAULT/.obsidian/plugins/obsidian-sengener.
   
3. Open setting, enable community plugins, then set you options, enable SenSener and configure hot-keys. The default shortcut key is ctrl+`quotation`.

4. You can also select different authoring models and adjust other parameters.

7. Create a document and start writing. Enjoy it. And contact me: zazaji@sina.com.


## build your data service

- I build the API service with GPT2. You can also use GPT2 to generate Sentenses directly , or Another one.
- You can build your API service for generating Sentenses. Or you can use the sample service, just for test.
- The example provides english model and chinese model, and  Full-text search . If you want use Another language , you can train your language generation service.
- Data service contain text-generator and full-text-search.


1. You can build a API service like : 
- Post Json: 

```Json
{
	"context": "Yes, We ",
	"token": "Your_token",
	"article_type": "english",
	"max_length": 10,
	"number": 3,
	"is_index": true
}
```

- Response Json: 
```Json

{
	"ref": [{
		"content": "...",
		"title": "Nothing"
	}],
	"sentenses": [{
		"value": ", the people of the United States, stand together"
	}, {
		"value": " to say, this is the best deal we've"
	}, {
		"value": " can't say anything, but it's not our"
	}]
}
```

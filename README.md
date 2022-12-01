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

1. You need to build your API service for generating Sentenses. 
I build the API service with GPT2. You can also use GPT2 to generate Sentenses directly , or Another one.
Or You can use my sample service ,just for test.

2. You can build a API service like : 
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

3. The example provides english model and chinese model. If you want use Another language , you can build your language generation service.

4. Add Full-text supported. And you add search function to the service .

5. Download Obsidian, create a vault , and goto the vault folder. and put This folder to the plugin folder,
   the path like:   VAULT/.obsidian/plugins/obsidian-sengener

6. Open setting, enable community plugins, then set you options, and enable SenSener. 

7. Enjoy it. And contact me: zazaji@sina.com.

8. The easiest way : You can download test.zip and extact to a folder as a obsidian vault, enable community plugin . 

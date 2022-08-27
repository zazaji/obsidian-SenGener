# SenGenerPlugin for obsidian
This plugin is used to generate a serial of Sentenses for writting.

![](./obsidian-sengener/demo.gif)

## Thanks
I got some code from obsidian-completr .  
https://github.com/tth05/obsidian-completr

## How to use this plugin

1. You need to build your API service for generating Sentenses.
I build the API service with GPT2. You can also use GPT2 to generate Sentenses directly , or Another one.
The default address is supported by huggingface, I didn't get a authorization. 

2. You can build a API service like : 
   
```Json
    #Post Json: 
    {"context": "You  win the game.",  "number": 3 }
    #response Json: 
    {"sentenses":[{ "value": "You are so smart"},{ "value": "That's great"},{ "value": "The Next game is waitting for you."},]}
```

3. If you want use Another language , you can build your language service.

4. Download Obsidian, create a vault , and goto the vault folder. and put This folder to the plugin folder,
   the path like:   VAULT/.obsidian/plugins/obsidian-sengener

5. Open setting, enable community plugins, then set you options, and enable SenSener. 

6. enjoy it.


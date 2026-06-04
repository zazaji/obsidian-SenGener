/*
# SenGenerPlugin for obsidian
This plugin is used to generate a serial of Sentenses for writting.
First , You need to build your API service for generating Sentenses.
I build the API service with GPT2. You can also use GPT2 to generate Sentenses directly , or Another one.

Author：https://github.com/zazaji
Thanks: https://github.com/tth05/obsidian-completr
*/
var __show = false;
var __provider;
var __end;
var __apiUrl;
// var __apiUrl2;
var __activeView;
var __article_types;
var __max_length = 100;
var __token;
var __isIndex;
var __cn_note;
var __time = new Date().getTime() - 2000;
var __article_type;
const QUOTE_VIEW_TYPE = "QUOTE";
var BARCONTAINER;
var statusBarItem;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
        if (__hasOwnProp.call(b, prop))
            __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
        for (var prop of __getOwnPropSymbols(b)) {
            if (__propIsEnum.call(b, prop))
                __defNormalProp(a, prop, b[prop]);
        }
    return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
    for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
        var fulfilled = (value) => {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        };
        var rejected = (value) => {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        };
        var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
        step((generator = generator.apply(__this, __arguments)).next());
    });
};

// src/main.ts
var main_exports = {};
__export(main_exports, {
    default: () => SenGenerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian5 = require("obsidian");

// Provider classes
var GPT2Provider = class {
    constructor(settings) {
        this.apiUrl = settings.apiUrl;
        this.token = settings.token;
        this.articleType = settings.className;
        this.articleTypes = {};
    }
    async getModels() {
        try {
            let res = await fetch(this.apiUrl + 'func');
            let data = await res.json();
            if (data != '') {
                this.articleTypes = data;
                return data;
            }
            return {};
        } catch (e) {
            console.log(e);
            return {};
        }
    }
    async generate(context, number, maxLength, isIndex) {
        let idata = {
            "context": context,
            "token": this.token,
            "model_size": "distilgpt2/small",
            "article_type": this.articleType,
            "top_p": 0.9,
            "temperature": 1,
            "max_time": 1.2,
            "max_length": maxLength,
            "is_index": isIndex,
            "number": number
        };
        try {
            let res = await fetch(this.apiUrl + 'generate', {
                method: "post",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(idata)
            });
            let data = await res.json();
            if (data != '') {
                let sentences = data['sentences'].map(function(item) { return item['value'] });
                let result = { sentences: sentences };
                if (isIndex) {
                    result.keywords = data['keywords'];
                    result.ref = data['ref'];
                    result.page = data['page'];
                }
                return result;
            }
            return { sentences: [] };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    async search(context, page) {
        let idata = {
            "context": context,
            "page": page,
            "token": this.token,
            "article_type": this.articleType,
        };
        try {
            let res = await fetch(this.apiUrl + 'refer', {
                method: "post",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(idata)
            });
            let data = await res.json();
            if (data != '') {
                return { ref: data['ref'], page: data['page'] };
            }
            return { ref: [], page: 1 };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
};

var OpenAIProvider = class {
    constructor(settings) {
        this.apiUrl = settings.apiUrl ? settings.apiUrl.replace(/\/+$/, '') : 'https://api.openai.com';
        this.apiKey = settings.apiKey;
        this.model = settings.openaiModel;
        this.systemPrompt = settings.systemPrompt;
        this.temperature = settings.temperature;
    }
    async getModels() {
        return {};
    }
    async generate(context, number, maxLength, isIndex) {
        let messages = [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: "Continue the following text naturally. Provide " + number + " different continuations, each numbered on a separate line:\n\n" + context }
        ];
        try {
            let res = await fetch(this.apiUrl + '/v1/chat/completions', {
                method: "post",
                headers: {
                    "content-type": "application/json",
                    "Authorization": "Bearer " + this.apiKey
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: maxLength,
                    temperature: this.temperature,
                    n: 1
                })
            });
            if (!res.ok) {
                console.log("OpenAI API error:", res.status, res.statusText);
                return { sentences: [] };
            }
            let data = await res.json();
            if (data.choices && data.choices.length > 0) {
                let content = data.choices[0].message.content;
                let lines = content.split('\n')
                    .map(function(l) { return l.replace(/^\d+[\.\)]\s*/, '').trim(); })
                    .filter(function(l) { return l.length > 0; });
                return { sentences: lines.slice(0, number) };
            }
            return { sentences: [] };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    async search(context, page) {
        return { ref: [], page: 1 };
    }
};

function createProvider(settings) {
    if (settings.apiProvider === 'openai') {
        return new OpenAIProvider(settings);
    }
    return new GPT2Provider(settings);
}

// src/snippet_manager.ts
var SnippetManager = class {
    constructor() {
        this.currentPlaceholderReferences = [];
    }
    onunload() {
        this.clearAllPlaceholders();
    }
    clearAllPlaceholders() {
        if (this.currentPlaceholderReferences.length === 0)
            return;
        const firstRef = this.currentPlaceholderReferences[0];
        const view = editorToCodeMirrorView(firstRef.editor);
        view.dispatch({
            effects: clearMarks.of(null)
        });
        this.currentPlaceholderReferences = [];
    }
};

// src/provider/provider.ts
function getSuggestionDisplayName(suggestion, lowerCase = false) {
    const res = typeof suggestion === "string" ? suggestion : suggestion.displayName;
    return lowerCase ? res.toLowerCase() : res;
}

function content_text(text) {
    BARCONTAINER.children[5].empty();
    BARCONTAINER.children[5].createDiv('sengener_ssmall markdown-preview-view', (el) => {
        obsidian.MarkdownRenderer.renderMarkdown(text, el, '', this);
    });
}

//根据总页数和当前页分页
function pagebar(n, m) {
    BARCONTAINER.children[4].empty();
    start = ((n > 5) && (m - 2 > 1)) ? m - 2 : 1;
    start = ((n <= 5) || (start + 4 < n)) ? start : n - 4;
    end = start + 4 > n ? ((m + 2 <= n) && ((n > 5)) ? m + 2 : n) : start + 4;
    if (1 < start) {
        BARCONTAINER.children[4].createEl("a", { text: "<<" }, (el) => {
            el.onClickEvent(() => {
                searchTerm(start - 3, __article_type);
            })
        })
    }
    for (let i = start; i <= end; i++) {
        if (m != i) {
            BARCONTAINER.children[4].createEl("a", { text: i }, (el) => {
                el.onClickEvent(() => {
                    searchTerm(i, __article_type);
                })
            })
        } else {
            BARCONTAINER.children[4].createEl("a", { text: i, cls: "active" });
        }
    }

    if (n > end) {
        BARCONTAINER.children[4].createEl("a", { text: ">>" }, (el) => {
            el.onClickEvent(() => {
                searchTerm(end + 3, __article_type);
            })
        })
    }
}

function getSuggestionReplacement(suggestion) {
    return typeof suggestion === "string" ? suggestion : suggestion.replacement;
}
//状态栏信息提示
function bar_text(text, timeout = 10000) {
    statusBarItem.empty();
    let cls = 'sengener-status-text';
    let showSpinner = false;
    if (text.includes("Done") || text.includes("ok")) {
        cls += ' sengener-status-ok';
    } else if (text.includes("Failed") || text.includes("fail") || text.includes("Error")) {
        cls += ' sengener-status-error';
    } else if (text.includes("Search") || text.includes("Generat") || text.includes("Model")) {
        cls += ' sengener-status-loading';
        showSpinner = true;
    }
    if (showSpinner) {
        statusBarItem.createSpan({ cls: 'sengener-spinner' });
    }
    statusBarItem.createEl("span", { text: text, cls: cls });
    if (timeout > 0) {
        setTimeout(() => { statusBarItem.empty(); }, timeout);
    }
    return '';
}
// 
// src/settings.ts
var DEFAULT_SETTINGS = {
    apiProvider: "gpt2",
    apiUrl: "",
    token: "",
    apiKey: "",
    openaiModel: "gpt-3.5-turbo",
    systemPrompt: "You are a writing assistant. Provide natural, fluent continuations of the given text.",
    temperature: 0.9,
    chioceNumber: 3,
    maxLength: 20,
    className: "poem",
    isIndex: false
}


//全文检索函数 
async function searchTerm(page, article_type) {
    if (!__provider) return bar_text("Provider not initialized.");
    bar_text("Searching...");
    try {
        let result = await __provider.search(BARCONTAINER.children[2].value, page);
        if (result.ref && result.ref.length > 0) {
            let text = result.ref.map(function(item) { return '<span class="sengener_title"> <b>-' + item['title'] + '</b> </span><br>' + item['content']; }).join('<br>');
            bar_text("Done.");
            pagebar(result.page, page);
            content_text(text);
        } else {
            content_text('');
            bar_text("No results.");
        }
    } catch (e) {
        console.log(e);
        return bar_text("Search failed.");
    }
}

//获取功能列表
async function get_article_type() {
    if (!__provider) return;
    try {
        let data = await __provider.getModels();
        if (data != '') {
            __article_types = data;
            if (__article_types.hasOwnProperty(__article_type) == false) {
                __article_type = Object.keys(__article_types)[0];
            }
            bar_text("Model: " + __article_type);
        }
    } catch (e) {
        console.log(e);
        return bar_text("Failed to load models.");
    }
}

//生成句子函数 
async function senGenerate(url, text, atype, number, max_length, isindex = false) {
    console.log(new Date().getTime() - __time);
    if (new Date().getTime() - __time < 1.5 * 1000) {
        return bar_text("Request too fast. Please wait.");
    }
    __time = new Date().getTime();
    if (!__provider) return bar_text("Provider not initialized.");
    try {
        let result = await __provider.generate(text, number, max_length, isindex);
        if (isindex && result.keywords) {
            BARCONTAINER.children[2].value = result.keywords;
            let textHtml = result.ref.map(function(item) { return '<h5>' + item['title'] + '</h5>' + item['content']; }).join('<br>');
            pagebar(result.page, 1);
            content_text(textHtml);
        }
        console.log(result.sentences);
        return result.sentences;
    } catch (e) {
        console.log(e);
        return bar_text("Generation failed.");
    }
}
//🥔🍡🍧🐬🍫🌒🥓🦑🦃🍋🐌🦂🥛🍔🐔🍘💐🌔🍺🍙🐡🦞🐋🦚🦀🌱🍐🥥🎂🐠🍕💚💞🥕🍨🍇🆖
//💟🍭🍢🥀🥑🍋🌺🍤🐤🍟🍁🐝🥬🛶🌳🌖🍝🌼🧂🥤🍱🍿🍩🦜⏬🆘🥠💛🐦🍗🌰🌭🧁🫒🐙🦆🃏❗
//🥜🌶💓🐥🥣⏰🍵💗🍸🧆🌚🍄🌝🍣🍹🌐🦠🎾🍈🫐🦩🦉⛔🍖🥡🌌🕷🐟🆓🍮🐓💕️🦴🍼🍛🐳🦗⛅
//💙❤🍓🏕🌞🌗🪴🦢🌓🧅🌮🌁🍒🍊🐚🌏🌛🍏🦋⏳🍚🍠🌸🌋🦐🧄🐜🌕🍻🥝🐧🍯⚘🍪🥫🍾❣🥮🌴💔
//🍂🐛🌵🌍🧀🥨🐾🥂🍆🌽🌯🦪🥩🥧🌠🍀🥙🥘🍃🍍🥒⏫🍅🥞🍦🍰🥟🦅🍷💜❓🍲🥪.🍀🍉💘🌉
//🧃💮🦟🧇🥚🍥🍳🍶🥗🎍🦈🍴🥯🍽🕸🌿➰🆑🥭🌘🌜🍜💖🌲🐣🐞🍑☕🍬🌎🥖🍞🆘💝🥐🧈
var obsidian = require('obsidian');
//    添加右侧栏
var import_obsidian3 = require("obsidian");
//    初始化右侧栏
class QUOTEListView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.lastRerender = 0;
        this.groupedItems = [];
        this.itemsByFile = new Map();
        this.initialLoad = true;
        this.searchTerm = "";
    }
    getViewType() {
        return QUOTE_VIEW_TYPE;
    }
    getDisplayText() {
        return "QUOTE List";
    }
    getIcon() {
        return 'list';
    }
    async onload() {
            setTimeout(() => {
                __article_type = this.plugin.settings.className;
                __apiUrl = this.plugin.settings.apiUrl;
                __token = this.plugin.settings.token;
                __isIndex = this.plugin.settings.isIndex;
                __cn_note = this.plugin.settings.cnNote;
                __max_length = this.plugin.settings.maxLength;
                __provider = createProvider(this.plugin.settings);
                get_article_type();
            }, 3000);
            statusBarItem = this.plugin.addStatusBarItem();

        }
        //    右侧栏
    async onOpen() {
        BARCONTAINER = this.containerEl.children[1];
        BARCONTAINER.empty();
        BARCONTAINER.addClass("sengener-sidebar");
        BARCONTAINER.createEl("h4", { text: "Writing Assistant", cls: 'sengener-title' });
        BARCONTAINER.createEl("button", { text: "Auto", type: 'button', cls: 'sengener-btn-primary' }, (el) => {
            el.onClickEvent(() => {
                bar_text("Generating...");
                auto_write(7, 7);
            });
        });
        BARCONTAINER.createEl("br");
        BARCONTAINER.createEl("input", { value: "", type: 'text', cls: 'sengener-col-6', placeholder: 'Search keywords...' });
        BARCONTAINER.createEl("button", { text: "Search", type: 'button', cls: 'sengener-btn-primary sengener-col-2' }, (el) => {
            el.onClickEvent(() => {
                __apiUrl = this.plugin.settings.apiUrl;
                searchTerm(1, __article_type);
            })
        });
        BARCONTAINER.createDiv("pagination");
        BARCONTAINER.createDiv("content", (el) => {
            obsidian.MarkdownRenderer.renderMarkdown('', el, '', this);
        });
    }

    async onClose() {
        // Nothing to clean up.
    }
}


//生成多个句子函数 
function auto_write(j, n) {
    if (__activeView) {
        let line = __activeView.editor.lastLine();
        let cursor = __activeView.editor.getLine(line).length;
        __end.ch = cursor;
        __end.line = line;
        let words = ''
        for (var i = line - 3; i < line; i++) {
            if (i >= 0) {
                words += __activeView.editor.getLine(i) + '\n';
            }
        }
        let last_word = __activeView.editor.getLine(line).slice(0, cursor);
        words += last_word;

        data = __async(this, null, function*() {

            let data = yield senGenerate(__apiUrl + 'generate', words, __article_type, 1, 10, false);
            if (data.length > 0) {
                words += data[0];
                const replacement = getSuggestionReplacement(data[0]);
                const endPos = __end;
                __activeView.editor.replaceRange(replacement, endPos, __spreadProps(__spreadValues({}, endPos), {
                    ch: __end.ch
                }));
                __activeView.editor.setCursor(__spreadProps(__spreadValues({}, endPos), { ch: endPos.ch + replacement.length }));

                if (j > 0) {
                    setTimeout(function(j, n) {
                        auto_write(j - 1, n);
                    }, Math.max(1400, 3000 - new Date().getTime() - __time), j, n);

                } else {
                    bar_text("Done! 🍀");
                }
            }
        });

    } else {
        bar_text('Please input some words and press hot-keys to generate first .🆘');
    }
}

//生成候选项
var SuggestionPopup = class extends import_obsidian3.EditorSuggest {
    constructor(app, settings, snippetManager) {
        var _a;
        super(app);
        this.disableSnippets = (_a = app.vault.config) == null ? void 0 : _a.legacyEditor;
        this.settings = settings;
        this.snippetManager = snippetManager;
        this.word = '';
    }
    getSuggestions() {

        __activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
        let words= __activeView.editor.getSelection();
        console.log(words)
        if (words.length == 0) {
            __end = this.context.end;
            let line = this.context.end.line;
            let cursor = this.context.editor.getLine(line).length;
            for (var i = line - 3; i < line; i++) {
                if (i >= 0) {
                    words += this.context.editor.getLine(i) + '\n';
                }
            }
            let last_word = this.context.editor.getLine(line).slice(0, cursor);
            words += last_word;
        }

        this.word = words;
        __apiUrl = this.settings.apiUrl;
        bar_text("Loading...🍋")
        return __async(this, null, function*() {
            return yield senGenerate(__apiUrl + 'generate', this.word, __article_type, this.settings.chioceNumber, this.settings.maxLength, __isIndex);
        });
    }
    onTrigger(cursor, editor, file) {
        console.log('onTrigger',this.justClosed);
        if (this.justClosed) {
            
            this.justClosed = false;
            return null;
        }
        if (__show == true) {
            let query = '';
            __show = false;
            return {
                start: __spreadProps(__spreadValues({}, cursor), {
                    ch: cursor.ch - query.length
                }),
                end: cursor,
                query
            };

        }
    }
    renderSuggestion(value, el) {
        el.addClass("sengener-suggestion-item");
        bar_text("Done! 🍀");
        el.setText(getSuggestionDisplayName(value));
    }

    selectSuggestion(value, evt) {
        console.log('asdasd')

        const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);

        const replacement = getSuggestionReplacement(value);

        const endPos = __end;
        activeView.editor.replaceRange(replacement, endPos, __spreadProps(__spreadValues({}, endPos), {
            ch: Math.min(endPos.ch, activeView.editor.getLine(endPos.line).length)
        }));
        if (replacement.contains("#") || replacement.contains("~")) {
            if (!this.disableSnippets) {
                this.snippetManager.handleSnippet(replacement, endPos, activeView.editor);
            } else {
                console.log("SenGener: Please enable Live Preview mode to use snippets");
            }
        } else {
            activeView.editor.setCursor(__spreadProps(__spreadValues({}, endPos), { ch: endPos.ch + replacement.length }));
        }
        this.close();
        this.justClosed = true;
    }
    selectNextItem(dir) {
        const self = this;
        self.suggestions.setSelectedItem(self.suggestions.selectedItem + dir, true);
    }
    getSelectedItem() {
        console.log('asdzzzdasd')

        const self = this;
        return self.suggestions.values[self.suggestions.selectedItem];
    }
    applySelectedItem() {
        const self = this;
        self.suggestions.useSelectedItem();
    }
    isVisible() {
        return this.isOpen;
    }
    preventNextTrigger() {
        console.log('rktyfdf')

        this.justClosed = true;
    }
};

// 设置内容，apiUrl：API服务地址，chioceNumber：选项数量
var import_obsidian4 = require("obsidian");
var SenGenerSettingsTab = class extends import_obsidian4.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Settings for Writing Assistant." });
        containerEl.createDiv("content", (el) => {
            obsidian.MarkdownRenderer.renderMarkdown(__cn_note, el, '', this);
        });

        // --- Provider Selection ---
        containerEl.createEl("h3", { text: "Provider" });
        new import_obsidian4.Setting(containerEl).setName("API Provider")
            .setDesc("Select the backend API provider")
            .addDropdown((dropdown) => dropdown
                .addOption("gpt2", "GPT2 (Legacy)")
                .addOption("openai", "OpenAI Compatible")
                .setValue(this.plugin.settings.apiProvider)
                .onChange((value) => __async(this, null, function*() {
                    this.plugin.settings.apiProvider = value;
                    yield this.plugin.saveSettings();
                    this.display();
                }))
            );

        // --- GPT2 Section ---
        if (this.plugin.settings.apiProvider === "gpt2") {
            containerEl.createEl("h3", { text: "GPT2 Configuration" });
            new import_obsidian4.Setting(containerEl).setName("API URL")
                .setDesc("The service address for generating sentences")
                .addText((text) => text.setValue(this.plugin.settings.apiUrl)
                    .onChange((val) => __async(this, null, function*() {
                        this.plugin.settings.apiUrl = val;
                        yield this.plugin.saveSettings();
                    })));
            new import_obsidian4.Setting(containerEl).setName("Token")
                .setDesc("Your API token")
                .addText((text) => text.setValue(this.plugin.settings.token)
                    .onChange((val) => __async(this, null, function*() {
                        this.plugin.settings.token = val;
                        __token = val;
                        yield this.plugin.saveSettings();
                    })));
            new import_obsidian4.Setting(containerEl).setName("Model Type")
                .setDesc("Type of what you are writing")
                .addDropdown((dropdown) => dropdown.addOptions(__article_types)
                    .setValue(this.plugin.settings.className)
                    .onChange((value) => __async(this, null, function*() {
                        __article_type = value;
                        this.plugin.settings.className = value;
                        yield this.plugin.saveSettings();
                    }))
                );
        }

        // --- OpenAI Section ---
        if (this.plugin.settings.apiProvider === "openai") {
            containerEl.createEl("h3", { text: "OpenAI Configuration" });
            new import_obsidian4.Setting(containerEl).setName("API URL")
                .setDesc("OpenAI-compatible API endpoint (default: https://api.openai.com)")
                .addText((text) => text.setValue(this.plugin.settings.apiUrl)
                    .onChange((val) => __async(this, null, function*() {
                        this.plugin.settings.apiUrl = val;
                        yield this.plugin.saveSettings();
                    })));
            new import_obsidian4.Setting(containerEl).setName("API Key")
                .setDesc("Your API key")
                .addText((text) => {
                    text.inputEl.type = "password";
                    text.setValue(this.plugin.settings.apiKey)
                        .onChange((val) => __async(this, null, function*() {
                            this.plugin.settings.apiKey = val;
                            yield this.plugin.saveSettings();
                        }));
                });
            new import_obsidian4.Setting(containerEl).setName("Model")
                .setDesc("Model name (e.g., gpt-3.5-turbo, gpt-4, deepseek-chat)")
                .addText((text) => text.setValue(this.plugin.settings.openaiModel)
                    .onChange((val) => __async(this, null, function*() {
                        this.plugin.settings.openaiModel = val;
                        yield this.plugin.saveSettings();
                    })));
            new import_obsidian4.Setting(containerEl).setName("System Prompt")
                .setDesc("System prompt for the model")
                .addTextArea((text) => text.setValue(this.plugin.settings.systemPrompt)
                    .onChange((val) => __async(this, null, function*() {
                        this.plugin.settings.systemPrompt = val;
                        yield this.plugin.saveSettings();
                    })));
        }

        // --- Generation Settings ---
        containerEl.createEl("h3", { text: "Generation" });
        new import_obsidian4.Setting(containerEl).setName("Number of choices")
            .setDesc("Number of generated sentences (1-9)")
            .addText((text) => {
                text.inputEl.type = "number";
                text.setValue(this.plugin.settings.chioceNumber + "")
                    .onChange((val) => __async(this, null, function*() {
                        if (!val || val < 1 || val > 9) return;
                        this.plugin.settings.chioceNumber = parseInt(val);
                        yield this.plugin.saveSettings();
                    }));
            });
        new import_obsidian4.Setting(containerEl).setName("Max tokens")
            .setDesc("Max tokens per generated sentence (5-200)")
            .addText((text) => {
                text.inputEl.type = "number";
                text.setValue(this.plugin.settings.maxLength + "")
                    .onChange((val) => __async(this, null, function*() {
                        if (!val || val < 5 || val > 200) return;
                        this.plugin.settings.maxLength = parseInt(val);
                        yield this.plugin.saveSettings();
                    }));
            });
        if (this.plugin.settings.apiProvider === "openai") {
            new import_obsidian4.Setting(containerEl).setName("Temperature")
                .setDesc("Creativity of output (0.0 - 2.0, default: 0.9)")
                .addSlider((slider) => slider
                    .setLimits(0, 200, 10)
                    .setValue(Math.round(this.plugin.settings.temperature * 100))
                    .setDynamicTooltip()
                    .onChange((val) => __async(this, null, function*() {
                        this.plugin.settings.temperature = val / 100;
                        yield this.plugin.saveSettings();
                    }))
                );
        }

        // --- Search Section ---
        if (this.plugin.settings.apiProvider === "gpt2") {
            containerEl.createEl("h3", { text: "Search" });
            new import_obsidian4.Setting(containerEl).setName("Enable searching")
                .setDesc("Enable full-text search service")
                .addToggle((toggle) => {
                    toggle.setValue(this.plugin.settings.isIndex);
                    toggle.onChange((value) => __async(this, null, function*() {
                        __isIndex = value;
                        this.plugin.settings.isIndex = value;
                        yield this.plugin.saveSettings();
                    }));
                });
        }
    }

    createEnabledSetting(propertyName, desc, container) {
        new import_obsidian4.Setting(container).setName("Enabled").setDesc(desc).addToggle((toggle) => toggle.setValue(this.plugin.settings[propertyName])
            .onChange((val) => __async(this, null, function*() {
                this.plugin.settings[propertyName] = val;
                yield this.plugin.saveSettings();
            })));
    }
};

// 设置操作快捷键
var SenGenerPlugin = class extends import_obsidian5.Plugin {
    constructor() {
        super(...arguments);

    }

    async activateView() {
        if (this.app.workspace.getLeavesOfType(QUOTE_VIEW_TYPE).length)
            return;
        this.app.workspace.getRightLeaf(false).setViewState({
            type: QUOTE_VIEW_TYPE,
            active: true,
        });
    }
    onload() {
        this.registerView(QUOTE_VIEW_TYPE, (leaf) => {
            const newView = new QUOTEListView(leaf, this);
            return newView;
        });

        setTimeout(() => { this.activateView(); }, 2000);
        return __async(this, null, function*() {

            var _a;
            yield this.loadSettings();
            __provider = createProvider(this.settings);
            this.snippetManager = new SnippetManager();
            this._suggestionPopup = new SuggestionPopup(this.app, this.settings, this.snippetManager);
            this.registerEditorSuggest(this._suggestionPopup);
            this.addSettingTab(new SenGenerSettingsTab(this.app, this));
            this.setupCommands();

        });
    }
    setupCommands() {
        const app = this.app;
        app.scope.keys = [];
        const isHotkeyMatch = (hotkey, context, id) => {
            const modifiers = hotkey.modifiers,
                key = hotkey.key;
            if (modifiers !== null && (id.contains("sengener-bypass") ? !context.modifiers.contains(modifiers) : modifiers !== context.modifiers))
                return false;
            return !key || (key === context.vkey || !(!context.key || key.toLowerCase() !== context.key.toLowerCase()));
        };
        this.app.scope.register(null, null, (e, t) => {
            const hotkeyManager = app.hotkeyManager;
            hotkeyManager.bake();

            for (let bakedHotkeys = hotkeyManager.bakedHotkeys, bakedIds = hotkeyManager.bakedIds, r = 0; r < bakedHotkeys.length; r++) {
                const hotkey = bakedHotkeys[r];
                const id = bakedIds[r];
                if (isHotkeyMatch(hotkey, t, id)) {
                    const command = app.commands.findCommand(id);
                    if (!command || e.repeat && !command.repeatable) {
                        return false;
                    } else if (id.contains("sengener-bypass")) {
                        this._suggestionPopup.close();
                        const validMods = t.modifiers.replace(new RegExp(`${hotkey.modifiers},*`), "").split(",");
                        let event = new KeyboardEvent("keydown", {
                            key: hotkeyManager.defaultKeys[id][0].key,
                            ctrlKey: validMods.contains("Ctrl"),
                            shiftKey: validMods.contains("Shift"),
                            altKey: validMods.contains("Alt"),
                            metaKey: validMods.contains("Meta")
                        });
                        e.target.dispatchEvent(event);
                        console.log("Hotkey " + id + " entered")
                        return false;
                    }
                    if (app.commands.executeCommandById(id))
                        return false;
                } else {
                    this.justClosed = true;
                }
            }
        });
        //快捷键1-escape
        this.addCommand({
            id: "escape-popup",
            name: "escape-popup",
            hotkeys: [{
                key: "Escape",
                modifiers: []
            }],
            editorCallback: () => {},
            isVisible: () => this._suggestionPopup.isVisible()
        });
        //快捷键2-suggestion
        this.addCommand({
            id: "key-to-suggestion",
            name: "key-to-suggestion",
            hotkeys: [{
                key: "'",
                modifiers: ["Ctrl"]
            }],
            editorCallback: (editor) => {
                __show = true;
                this._suggestionPopup.trigger(editor, '', true);
            },
            isVisible: () => this._suggestionPopup.isVisible()
        });
        //快捷键3-switch-model
        this.addCommand({
            id: "key-to-switch-model",
            name: "key-to-switch-model",
            hotkeys: [{
                key: "]",
                modifiers: ["Alt"]
            }],
            editorCallback: (editor) => {
                if (__article_types == null) {
                    get_article_type();
                    setTimeout(() => {
                        try {
                            __article_type = Object.keys(__article_types)[0];
                            bar_text("switch to " + __article_type + "🍀", 0);
                        } catch (e) {
                            __article_type = 'Null';
                            bar_text("No model found, 💔", 0);
                        }
                    }, 1000);

                } else {
                    if (__article_types.hasOwnProperty(__article_type) == false) {
                        __article_type = Object.keys(__article_types)[0];
                    } else if (Object.keys(__article_types).indexOf(__article_type) + 1 >= Object.keys(__article_types).length) {
                        __article_type = Object.keys(__article_types)[0];
                    } else {
                        __article_type = Object.keys(__article_types)[Object.keys(__article_types).indexOf(__article_type) + 1];
                    }
                    bar_text("switch to " + __article_type + "🍀", 0);
                }
            },
            isVisible: () => this._suggestionPopup.isVisible()
        });
    }


    onunload() {
        return __async(this, null, function*() {
            // this.snippetManager.onunload();
            // newview.onunload();
        });
    }
    loadSettings() {
        return __async(this, null, function*() {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());

        });
    }
    get suggestionPopup() {
        return this._suggestionPopup;
    }
    saveSettings() {
        return __async(this, null, function*() {
            yield this.saveData(this.settings);
            __provider = createProvider(this.settings);
        });
    }
};

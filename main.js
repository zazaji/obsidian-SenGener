/*
# SenGenerPlugin for obsidian
This plugin is used to generate a serial of Sentenses for writting.
First , You need to build your API service for generating Sentenses.
I build the API service with GPT2. You can also use GPT2 to generate Sentenses directly , or Another one.

Author：https://github.com/zazaji
Thanks: https://github.com/tth05/obsidian-completr
*/
var __show = false;
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
    BARCONTAINER.children[5].createDiv('ssmall markdown-preview-view', (el) => {
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
    statusBarItem.createEl("span", { text: text });
    if (timeout > 0) {
        setTimeout(() => { statusBarItem.empty(); }, timeout);
    }
    return '';
}
// 
// src/settings.ts
var DEFAULT_SETTINGS = {
    // apiUrl: "https://transformer.huggingface.co/autocomplete/",
    apiUrl: "https://fwzd.myfawu.com/",
    // apiUrl2: "https://fwzd.myfawu.com/refer/",
    chioceNumber: 3,
    maxLength: 20,
    className: "poem",
    isIndex: false
}


//全文检索函数 
async function searchTerm(page, article_type) {
    let idata = {
        "context": BARCONTAINER.children[2].value,
        'page': page,
        'token': __token,
        'article_type': article_type,
    };
    bar_text("Loading...🍋");
    try {
        let res = await fetch(__apiUrl + 'refer', {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(idata)
        });
        let data = await res.json();
        if (data != '') {

            let text = data['ref'].map(function(item) { return '<span class="title"> <b>-' + item['title'] + '</b> </span><br>' + item['content'] + '' }).join('<br>');
            bar_text("Done! 🍀");
            pagebar(data['page'], page);
            content_text(text);
        }
    } catch (e) {
        console.log(e);
        return bar_text("Failed. 🆘");
    }

}

//获取功能列表
async function get_article_type() {
    try {
        let res = await fetch(__apiUrl + 'func');
        let data = await res.json();
        if (data != '') {
            __article_types = data;
            if (__article_types.hasOwnProperty(__article_type) == false) {
                __article_type = Object.keys(__article_types)[0];
            }
            bar_text("Loading " + __article_type + "🍀");
        }
    } catch (e) {
        console.log(e);
        return bar_text("Failed. 🆘");
    }
}

//生成句子函数 
async function senGenerate(url, text, atype, number, max_length, isindex = false) {
    console.log(new Date().getTime() - __time);
    if (new Date().getTime() - __time < 1.5 * 1000) {
        return bar_text("Request slowly. 🆘");
    }
    __time = new Date().getTime();
    let idata = {
        "context": text,
        'token': __token,
        "model_size": "distilgpt2/small",
        "article_type": atype,
        "top_p": 0.9,
        "temperature": 1,
        "max_time": 1.2,
        "max_length": max_length,
        "is_index": isindex,
        "number": number
    };
    try {
        let res = await fetch(url, {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(idata)
        });
        let data = await res.json();
        if (data != '') {
            if (isindex) {
                BARCONTAINER.children[2].value = data['keywords'];
                let text = data['ref'].map(function(item) { return '<h5>' + item['title'] + '</h5>' + item['content'] + '' }).join('<br>');
                pagebar(data['page'], 1);
                content_text(text);
            }
            console.log(data['sentences']);
            return data['sentences'].map(function(item) { return item['value'] })
        } else {
            return [];
        }
    } catch (e) {
        console.log(e);
        return bar_text("Failed. 🆘");
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
                __max_length = this.plugin.settings.max_length;
                get_article_type();
            }, 3000);
            statusBarItem = this.plugin.addStatusBarItem();

        }
        //    右侧栏
    async onOpen() {
        BARCONTAINER = this.containerEl.children[1];
        // BARCONTAINER = container;
        BARCONTAINER.empty();
        BARCONTAINER.createEl("h4", { text: "Writting Assistant", cls: 'col-12' });
        BARCONTAINER.createEl("button", { text: "Auto", type: 'button', cls: 'col-2' }, (el) => {
            el.onClickEvent(() => {
                bar_text("Loading...🍋 ");
                auto_write(7, 7);
            });
        });

        BARCONTAINER.createEl("input", { value: "", type: 'text', cls: 'col-6', placeholder: 'Please input keywords' });
        BARCONTAINER.createEl("button", { text: "🍳", type: 'button', cls: 'col-2' }, (el) => {
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


//生成句子函数 
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
        __end = this.context.end;

        let line = this.context.end.line;
        let cursor = this.context.editor.getLine(line).length;
        let words = ''
        for (var i = line - 3; i < line; i++) {
            if (i >= 0) {
                words += this.context.editor.getLine(i) + '\n';
            }
        }
        let last_word = this.context.editor.getLine(line).slice(0, cursor);
        words += last_word;
        this.word = words;
        __apiUrl = this.settings.apiUrl;
        bar_text("Loading...🍋")
        return __async(this, null, function*() {
            return yield senGenerate(__apiUrl + 'generate', this.word, __article_type, this.settings.chioceNumber, this.settings.maxLength, __isIndex);
        });
    }
    onTrigger(cursor, editor, file) {
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
        containerEl.createEl("h2", { text: "Settings for Writting Assistant." });

        containerEl.createDiv("content", (el) => {
            obsidian.MarkdownRenderer.renderMarkdown(__cn_note, el, '', this);
        });

        new import_obsidian4.Setting(containerEl).setName("API Address").setDesc("The service address for generating sentenses.\r\n\
         The default address is https://fwzd.myfawu.com/").addText((text) => text.setValue(this.plugin.settings.apiUrl)
            .onChange(
                (val) => __async(this, null, function*() {
                    try {
                        text.inputEl.removeClass("SenGener-settings-error");
                        this.plugin.settings.apiUrl = val;
                        yield this.plugin.saveSettings();
                    } catch (e) {
                        text.inputEl.addClass("SenGener-settings-error");
                    }
                })));

        new import_obsidian4.Setting(containerEl).setName("token").setDesc("You can apply for your personal token for better experience, visit https://fwzd.myfawu.com/my/")
            .addText((text) => text.setValue(this.plugin.settings.token)
                .onChange(
                    (val) => __async(this, null, function*() {
                        try {
                            text.inputEl.removeClass("SenGener-settings-error");
                            this.plugin.settings.token = val;
                            __token = val;
                            yield this.plugin.saveSettings();
                        } catch (e) {
                            text.inputEl.addClass("SenGener-settings-error");
                        }
                    })));

        new import_obsidian4.Setting(containerEl).setName("Enable searching?").setDesc("Enable Text searching service").addToggle((toggle) => {
            toggle.setValue(this.plugin.settings.isIndex);
            toggle.onChange((value) => __async(this, null, function*() {
                __isIndex = value;
                this.plugin.settings.isIndex = value;
                yield this.plugin.saveSettings();
            }));
        });

        new import_obsidian4.Setting(containerEl).setName("Number of choices").setDesc(" Number of generated sentences(1-9)")
            .addText((text) => {
                text.inputEl.type = "number";
                text.setValue(this.plugin.settings.chioceNumber + "").onChange((val) => __async(this, null, function*() {
                    if (!val || val < 1 || val > 9)
                        return;
                    this.plugin.settings.chioceNumber = parseInt(val);
                    yield this.plugin.saveSettings();
                }));
            });

        new import_obsidian4.Setting(containerEl).setName("max length").setDesc(" Max words of generated sentences(5-50)")
            .addText((text) => {
                text.inputEl.type = "number";
                text.setValue(this.plugin.settings.maxLength + "").onChange((val) => __async(this, null, function*() {
                    if (!val || val < 5 || val > 50)
                        return;
                    this.plugin.settings.maxLength = parseInt(val);
                    yield this.plugin.saveSettings();
                }));
            });

        new import_obsidian4.Setting(containerEl).setName("Type").setDesc("Type of what you are writting")
            .addDropdown((dropdown) => dropdown.addOptions(__article_types)
                .setValue(this.plugin.settings.className).onChange((value) => __async(this, null, function*() {
                    __article_type = value;
                    this.plugin.settings.className = value;
                    yield this.plugin.saveSettings();
                }))
            );
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
        //快捷键1
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
        //快捷键2
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
        //快捷键3
        this.addCommand({
            id: "key-to-switch-model",
            name: "key-to-switch-model",
            hotkeys: [{
                key: "]",
                modifiers: ["Alt"]
            }],
            editorCallback: (editor) => {
                if (__article_types == null) {
                    __article_type = 'Null';
                    bar_text("No model found, 💔", 0);
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
        });
    }
};
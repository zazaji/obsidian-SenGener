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
};

// src/provider/provider.ts
function getSuggestionDisplayName(suggestion, lowerCase = false) {
    const res = typeof suggestion === "string" ? suggestion : suggestion.displayName;
    return lowerCase ? res.toLowerCase() : res;
}

function getSuggestionReplacement(suggestion) {
    return typeof suggestion === "string" ? suggestion : suggestion.replacement;
}

// src/settings.ts
var DEFAULT_SETTINGS = {
    apiUrl: "https://transformer.huggingface.co/autocomplete/",
    chioceNumber: 3,
}


// src/popup.ts
var import_obsidian3 = require("obsidian");





// listen(import_obsidian3, "click", function() {
//     console.log('hahah');
// })

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
        __end = this.context.end;
        let line = this.context.end.line;
        let cursor = this.context.editor.getLine(line).length;
        // console.log(line, cursor);
        let words = ''
        for (var i = line - 3; i < line; i++) {
            if (i >= 0) {
                words += this.context.editor.getLine(i) + '\n';
            }
        }
        let last_word = this.context.editor.getLine(line).slice(0, cursor);
        words += last_word;
        this.word = words;
        console.log(this.word);
        return __async(this, null, function*() {
            let url = this.settings.apiUrl;
            let idata = {
                "context": this.word,
                "model_size": "distilgpt2/small",
                "top_p": 0.9,
                "temperature": 1,
                "max_time": 1.2,
                "number": this.settings.chioceNumber
            };
            let data = yield fetch(url, {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(idata)
            }).then((res) => res.json())
            return data['sentences'].map(function(item) { return item['value'] })
        })

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
        el.setText(getSuggestionDisplayName(value));
    }

    selectSuggestion(value, evt) {
        const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
        // console.log(activeView.editor);
        // console.log(this.context.editor);
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
        new import_obsidian4.Setting(containerEl).setName("API Address").setDesc("The service address for generating sentenses.\r\n The default address is supported by huggingface\
        ").addText((text) => text.setValue(this.plugin.settings.apiUrl).onChange((val) => __async(this, null, function*() {
            try {
                text.inputEl.removeClass("SenGener-settings-error");
                this.plugin.settings.apiUrl = val;
                yield this.plugin.saveSettings();
            } catch (e) {
                text.inputEl.addClass("SenGener-settings-error");
            }
        })));
        new import_obsidian4.Setting(containerEl).setName("Number of choices").setDesc("List Number.").addText((text) => {
            text.inputEl.type = "number";
            text.setValue(this.plugin.settings.chioceNumber + "").onChange((val) => __async(this, null, function*() {
                if (!val || val.length < 1 || val.length > 9)
                    return;
                this.plugin.settings.chioceNumber = parseInt(val);
                yield this.plugin.saveSettings();
            }));
        });
    }
    createEnabledSetting(propertyName, desc, container) {
        new import_obsidian4.Setting(container).setName("Enabled").setDesc(desc).addToggle((toggle) => toggle.setValue(this.plugin.settings[propertyName]).onChange((val) => __async(this, null, function*() {
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
    onload() {
        return __async(this, null, function*() {
            var _a;
            yield this.loadSettings();
            this.snippetManager = new SnippetManager();
            this._suggestionPopup = new SuggestionPopup(this.app, this.settings, this.snippetManager);
            this.registerEditorSuggest(this._suggestionPopup);
            this.addSettingTab(new SenGenerSettingsTab(this.app, this));
            this.setupCommands();
            if ((_a = this.app.vault.config) == null ? void 0 : _a.legacyEditor) {
                console.log("SenGener: Without Live Preview enabled, some features of SenGener will not work properly!");
            }
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
                this._suggestionPopup.trigger(editor, this.app.workspace.getActiveFile(), true);
            },
            isVisible: () => this._suggestionPopup.isVisible()
        });

    }


    onunload() {
        return __async(this, null, function*() {
            this.snippetManager.onunload();
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

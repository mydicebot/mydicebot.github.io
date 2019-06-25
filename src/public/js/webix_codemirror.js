webix.protoUI({
	name:"codemirror-editor",
	defaults:{
		mode:"javascript",
		lineNumbers:true,
		matchBrackets:true,
		fullsceen:true,
		theme:"default"
	},
	$init:function(config){
		this.$view.innerHTML = "<textarea style='width:100%;height:100%;'></textarea>";
		this._waitEditor = webix.promise.defer();
		this.$ready.push(this._render_cm_editor);
	},
	_render_cm_editor:function(){


		var sources = [];
		sources.push("/js/code/codemirror.js");
		sources.push("/js/code/javascript.js");
		sources.push("/js/code/lua.js");
		sources.push("/js/code/matchbrackets.js");
        //fullscreen
		sources.push("/js/code/codemirror_addon_fullscreen.js");
        //lint
		sources.push("/js/code/lint.js");
		sources.push("/js/code/javascript-lint.js");
		sources.push("/js/code/jshint.js");
        //match-hightlighter
		sources.push("/js/code/annotatescrollbar.js");
		sources.push("/js/code/matchesonscrollbar.js");
		sources.push("/js/code/match-highlighter.js");
		sources.push("/js/code/searchcursor.js");
        //fold
		sources.push("/js/code/foldcode.js");
		sources.push("/js/code/foldgutter.js");
		sources.push("/js/code/comment-fold.js");
		sources.push("/js/code/brace-fold.js");
        //lua
		//sources.push("/js/code/parselua.js");
        //python
		sources.push("/js/code/python.js");
        //active-line
		sources.push("/js/code/active-line.js");
        //change
		sources.push("/js/code/change.js");

		sources.push("/css/code/codemirror.css");
		sources.push("/css/code/night.css");
		sources.push("/css/code/codemirror_addon_fullscreen.css");
		sources.push("/css/code/lint.css");
		sources.push("/css/code/highlight.css");
		sources.push("/css/code/foldgutter.css");
		//sources.push("/css/code/luacolors.css");

		webix.require(sources)
		.then( webix.bind(this._render_when_ready, this) )
		.catch(function(e){
			console.log(e);
		});		
	},
	_render_when_ready:function(){
		this._editor = CodeMirror.fromTextArea(this.$view.firstChild, {
			mode: this.config.mode,
			lineNumbers: this.config.lineNumbers,
			matchBrackets: this.config.matchBrackets,
			theme: this.config.theme,
            highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true},
            lint: true,
            mydicebot: true,
            lineWrapping: true,
            foldGutter: true,
            styleActiveLine: true,
            styleActiveSelected: true,
            gutters: ["CodeMirror-change-markers","CodeMirror-lint-markers","CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: {
                "F11": function(cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
                "Ctrl-S": function(cm) {
                    saveScript($$("script_bet_strategy_list").getValue());
                }
            }
		});

		this._waitEditor.resolve(this._editor);

		this.setValue(this.config.value);
		if (this._focus_await)
			this.focus();
        this._editor.on("blur", function(){
            onblurFunction();
        });
        this._editor.on("focus", function(){
            focusFunction();
        }); 
	},
	_set_inner_size:function(){
		if (!this._editor || !this.$width) return;

		this._updateScrollSize();
		this._editor.scrollTo(0,0); //force repaint, mandatory for IE
	},
	_updateScrollSize:function(){
		var box = this._editor.getWrapperElement();
		var height = (this.$height || 0) + "px";

		box.style.height = height;
		box.style.width = (this.$width || 0) + "px";

		var scroll = this._editor.getScrollerElement();
		if (scroll.style.height != height){
			scroll.style.height = height;
			this._editor.refresh();
		}
	},
	$setSize:function(x,y){
		if (webix.ui.view.prototype.$setSize.call(this, x, y)){
			this._set_inner_size();
		}
	},
	setValue:function(value){
		if(!value && value !== 0)
			value = "";

		this.config.value = value;
		if(this._editor){
			this._editor.setValue(value);
			//by default - clear editor's undo history when setting new value
			if(!this.config.preserveUndoHistory)
				this._editor.clearHistory();
			this._updateScrollSize();
		}
	},
	getValue:function(){
		return this._editor?this._editor.getValue():this.config.value;
	},
	focus:function(){
		this._focus_await = true;
		if (this._editor)
			this._editor.focus();
	},
	getEditor:function(waitEditor){
		return waitEditor?this._waitEditor:this._editor;
	},
	//undo, redo, etc
	undo:function(){
		this._editor.undo();
	},
	redo:function(){
		this._editor.redo();
	},
	undoLength:function(){
		return this._editor.historySize().undo;
	}
}, webix.ui.view);

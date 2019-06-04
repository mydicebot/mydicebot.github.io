// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var GUTTER_ID = "CodeMirror-change-markers";
  var hasChange = false;

  function ChangeState(cm, hasGutter) {
    this.hasGutter = hasGutter;
  }

  function clearMarks(cm) {
    var state = cm.state.mydicebot;
    hasChange = false;
    if (state.hasGutter) cm.clearGutter(GUTTER_ID);
  }

  function makeMarker(labels, severity, multiple, tooltips) {
    var marker = document.createElement("div"), inner = marker;
    marker.className = "CodeMirror-lint-marker-mult";
    return marker;
  }

  function startChange(cm) {
      var to = cm.getCursor("to");
      if(to.ch == 0 && to.line == 0) {
          hasChange = false;
          return;
      }
      hasChange = true;
      cm.setGutterMarker(to.line, GUTTER_ID, makeMarker());
  }

  function onChange(cm) {
    var state = cm.state.mydicebot;
    if (!state) return;
    clearTimeout(state.timeout);
    state.timeout = setTimeout(function(){startChange(cm);}, 50);
  }

  CodeMirror.defineOption("mydicebot", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      clearMarks(cm);
      cm.off("change", onChange);
      delete cm.state.mydicebot;
    }

    if (val) {
      var gutters = cm.getOption("gutters"), hasChangeGutter = false;
      for (var i = 0; i < gutters.length; ++i) if (gutters[i] == GUTTER_ID) hasChangeGutter = true;
      var state = cm.state.mydicebot = new ChangeState(cm, hasChangeGutter);
      cm.on("change", onChange);
    }
  });

  CodeMirror.commands.changeGutterMarker = function(cm) {
      clearMarks(cm);
  };
  CodeMirror.commands.isChange = function(cm) {
      return hasChange;
  };
});

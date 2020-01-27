(function extBracketMatch() {
var TokenIterator, Range;
function rangeFromPos(pos, len) {
	if (len == null) len = 1;
	return new Range(pos.row, pos.column, pos.row, pos.column + len);
}
function highlightBracketsHook() {
	if (this.$highlightPending) return;
	var self = this;
	this.$highlightPending = true;
	setTimeout(function lookForBrackets() {
		self.$highlightPending = false;
		var session = self.session;
		if (!session || !session.bgTokenizer) return;
		//
		if (session.$bracketHighlights != null && session.$bracketHighlights.length) {
			for (var i = 0; i < session.$bracketHighlights.length; i++) {
				session.removeMarker(session.$bracketHighlights[i]);
			}
			session.$bracketHighlights = null;
		}
		//
		var cur = self.getCursorPosition();
		var iter = new TokenIterator(session, cur.row, cur.column);
		var tk = iter.getCurrentToken();
		var depth = 0;
		while (tk) {
			if (tk.type.includes("paren.lparen")) {
				depth -= tk.value.length;
				if (depth < 0) break;
			} else if (tk.type.includes("paren.rparen")) {
				depth += tk.value.length;
			}
			tk = iter.stepBackward();
		}
		if (!tk) return;
		var start = iter.getCurrentTokenPosition();
		start.column += tk.value.length - 1;
		//
		var mt = /\.(depth\d+)/.exec(tk.type);
		var typeSuffix = mt ? " ace_" + mt[1] : "";
		//
		iter = new TokenIterator(session, cur.row, cur.column);
		tk = iter.stepForward();
		depth = 0;
		while (tk) {
			if (tk.type.includes("paren.lparen")) {
				depth += tk.value.length;
			} else if (tk.type.includes("paren.rparen")) {
				depth -= tk.value.length;
				if (depth < 0) break;
			}
			tk = iter.stepForward();
		}
		if (!tk) return;
		var end = iter.getCurrentTokenPosition();
		//
		var hls = session.$bracketHighlights;
		if (hls == null) session.$bracketHighlights = hls = [];
		//
		var startVis = session.documentToScreenPosition(start.row, start.column);
		var   endVis = session.documentToScreenPosition(  end.row,   end.column);
		if (start.row != end.row) {
			var range, vis;
			if (startVis.column > endVis.column) {
				range = new Range(start.row, session.screenToDocumentColumn(startVis.row, endVis.column), start.row, start.column);
				hls.push(session.addMarker(range, "ace_bracket_bottom ace_bracket_line"+typeSuffix, "text"));
			} else if (startVis.column < endVis.column) {
				range = new Range(end.row, session.screenToDocumentColumn(endVis.row, startVis.column), end.row, end.column);
				hls.push(session.addMarker(range, "ace_bracket_top ace_bracket_line"+typeSuffix, "text"));
			}
			//
			var lineVisCol = Math.min(startVis.column, endVis.column);
			for (var i = startVis.row + 1; i <= endVis.row - 1; i++) {
				var iPosVis = session.screenToDocumentPosition(i, lineVisCol);
				hls.push(session.addMarker(rangeFromPos(iPosVis), "ace_bracket_left ace_bracket_line"+typeSuffix, "line", true));
			}
		} else if (start.column == end.column - 1) {
			hls.push(session.addMarker(rangeFromPos(start, 2), "ace_bracket"+typeSuffix, "text"));
			return;
		}
		//
		hls.push(session.addMarker(rangeFromPos(start), "ace_bracket"+typeSuffix, "text"));
		hls.push(session.addMarker(rangeFromPos(end), "ace_bracket"+typeSuffix, "text"));
	}, 50);
}
function patchEditor(editor) {
	editor.$highlightBrackets = highlightBracketsHook;
}
GMEdit.register("ext-bracket-match", {
	init: function() {
		TokenIterator = ace.require("ace/token_iterator").TokenIterator;
		Range = ace.require("ace/range").Range;
		patchEditor(window.aceEditor);
		GMEdit.on("editorCreated", function(e) {
			patchEditor(e.editor);
		});
	},
	cleanup: function() {}
});
})();
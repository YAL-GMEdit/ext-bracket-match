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
		var leftCol = Math.min(start.column, end.column);
		var leftRowTop = start.row + 1, leftRowBot = end.row - 1;
		if (start.row != end.row) {
			var range;
			if (start.column > end.column) {
				range = new Range(start.row, end.column, start.row, start.column);
				hls.push(session.addMarker(range, "ace_bracket_bottom ace_bracket_line", "text"));
			} else if (start.column < end.column) {
				range = new Range(start.row, start.column, start.row, end.column);
				hls.push(session.addMarker(range, "ace_bracket_bottom ace_bracket_line", "text"));
			}
			//
			for (var i = leftRowTop; i <= leftRowBot; i++) {
				range = new Range(i, leftCol, i, leftCol + 1);
				hls.push(session.addMarker(range, "ace_bracket_left ace_bracket_line", "text", true));
			}
		} else if (start.column == end.column - 1) {
			hls.push(session.addMarker(rangeFromPos(start, 2), "ace_bracket", "text"));
			return;
		}
		//
		hls.push(session.addMarker(rangeFromPos(start), "ace_bracket", "text"));
		hls.push(session.addMarker(rangeFromPos(end), "ace_bracket", "text"));
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
	},
	cleanup: function() {}
});
})();
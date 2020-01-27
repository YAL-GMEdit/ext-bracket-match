# ext-bracket-match
This extension overrides bracket highlighting behaviour with something resembling [VSCode's indent guide highlighting](https://code.visualstudio.com/updates/v1_23#_highlighted-indent-guides).

This may slightly increase the CPU load for cursor navigation in very large files.

![screenshot](./ext-bracket-match.png)

If your theme implements rainbow brackets, you can do that too, like so:
```css
/* curly brackets */
#main .ace-tm .ace_curly.ace_paren.ace_depth1 {
	color: #C6FF79;
}

/* bracket match rectangles and lines */
#main .ace-tm .ace_marker-layer .ace_bracket.ace_depth1,
#main .ace-tm .ace_marker-layer .ace_bracket_line.ace_depth1 {
	border-color: #C6FF79;
}
```

[Install instructions](https://github.com/GameMakerDiscord/GMEdit/wiki/Using-plugins#installing-plugins)
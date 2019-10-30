'use strict';
import { window, TextEditorDecorationType, Range } from 'vscode';
import { OverviewRulerLane,ThemableDecorationRenderOptions } from 'vscode';

interface HighlightColors {
    light: string
    dark: string
}

function isAlphaNumeric (ch: string) {
    return ch.match(/^[a-zA-Z_]+[a-zA-Z0-9_]*$/i) !== null;
}

// from https://gist.github.com/keesey/e09d0af833476385b9ee13b6d26a2b84
function levenshtein(a: string, b: string): number {
	const an = a.length;
	const bn = b.length;
	if (an === 0) {
		return bn;
	}
	if (bn === 0) {
		return an;
	}
	const matrix = new Array<number[]>(bn + 1);
	for (let i = 0; i <= bn; ++i) {
		let row = matrix[i] = new Array<number>(an + 1);
		row[0] = i;
	}
	const firstRow = matrix[0];
	for (let j = 1; j <= an; ++j) {
		firstRow[j] = j;
	}
	for (let i = 1; i <= bn; ++i) {
		for (let j = 1; j <= an; ++j) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1], // substitution
					matrix[i][j - 1], // insertion
					matrix[i - 1][j] // deletion
				) + 1;
			}
		}
	}
	return matrix[bn][an];
};

class Highlighter {
    private decorators: TextEditorDecorationType[]
    private ranges: {}
    private words: string[]

    constructor() {
        this.decorators = []
        this.ranges = {}
        this.words = []
    }
    public setDecorators() { 
        let colors: HighlightColors[] = [
            {
                "light": "#b3d9ff",
                "dark": "cyan"
            },
            {
                "light": "#e6ffb3",
                "dark": "pink"
            },
            {
                "light": "#b3b3ff",
                "dark": "lightgreen"
            },
            {
                "light": "#ffd9b3",
                "dark": "magenta"
            },
            {
                "light": "#ffb3ff",
                "dark": "cornflowerblue"
            },
            {
                "light": "#b3ffb3",
                "dark": "orange"
            },
            {
                "light": "#ffff80",
                "dark": "green"
            },
            {
                "light": "#d1e0e0",
                "dark": "red"
            }
        ]
        colors.forEach(function (this: Highlighter, color) {
            var dark: ThemableDecorationRenderOptions = {
                // this color will be used in dark color themes
                overviewRulerColor: color.dark,
                backgroundColor: color.dark,
                borderColor: color.dark
            }
            dark.color = '#555555'
            let decorationType = window.createTextEditorDecorationType({
                borderWidth: '2px',
                borderStyle: 'solid',
                overviewRulerLane: OverviewRulerLane.Right,
                light: {
                    // this color will be used in light color themes
                    overviewRulerColor: color.light,
                    borderColor: color.light,
                    backgroundColor: color.light
                },
                dark: dark
            });
            this.decorators.push(decorationType);
        }, this);
    }

    private extractWords(): string[] {
        const editor = window.activeTextEditor;
        if (!editor) {
            return [];
        }
        let words = new Set<string>();
        const expression = /\b[a-zA-Z_]+[a-zA-Z0-9_]*\b/;
        const regEx = new RegExp(expression, 'gi');
        let match;
        while (match = regEx.exec(editor.document.getText())) {
            words.add(match.toString());
            console.info(match.toString());
        }
            
        const selected_text = editor.document.getText(editor.selection);
        let filtered_words: string[] = [];
        words.forEach(function (word) {
            if (levenshtein(selected_text, word) <= 1) {
                filtered_words.push(word);
            }
        });
        window.showInformationMessage("Found " + filtered_words.join(", "));

        return filtered_words;
    }

    public updateDecorations(active?: any) {
        const editor = window.activeTextEditor;
        if (!editor) {
            return;
        }
        if (active) return;
        const selected_text = editor.document.getText(editor.selection);
        if (selected_text == '' && active == true) {
            window.showInformationMessage("Please select some word.");
            return;
        }
        if (!isAlphaNumeric(selected_text) && active == true) {
            window.showInformationMessage("Colorize similar support alphanumeric only.");
            return;
        }
        const text = editor.document.getText();
        let decs: Range[][] = [];
        this.decorators.forEach(function () {
            let dec: Range[] = [];
            decs.push(dec);
        });
        this.words = this.extractWords();
        if (this.words.length > decs.length) {
            window.showInformationMessage("Stop coloring since too many similar words!");
            return;
        }
        
        this.words.forEach((w, n) => {
            const expression = '\\b' + w + '\\b'
            const regEx = new RegExp(expression, 'gi');
            let match;
            while (match = regEx.exec(text)) {
                const startPos = editor.document.positionAt(match.index);
                const endPos = editor.document.positionAt(match.index + match[0].length);
                const decoration = new Range(startPos, endPos);
                decs[n].push(decoration);
            }
        });
        this.decorators.forEach(function (d, i) {
            editor.setDecorations(d, decs[i]);
        });
    }

    public clearAll() {
        this.words = [];
        this.updateDecorations();
        
        let decs: Range[][] = [];
        this.decorators.forEach(function () {
            let dec: Range[] = [];
            decs.push(dec);
        });
        
        this.decorators.forEach(function (d, i) {
            if (!window.activeTextEditor) {
                return;
            }
            window.activeTextEditor.setDecorations(d, decs[i]);
        });
    }
}

export default Highlighter
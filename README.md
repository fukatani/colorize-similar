# Screenshot

![screencast](https://github.com/fukatani/colorize-similar/raw/master/docs/screen.png)

## Features

Similar words (ex. variable_x and variable_y, noodle and poodle) often causes bugs by mix-up. By this plugin, you can identify similar words with selected words by coloring.
For finding similar words, we use edit distance (a.k.a. Levenshtein distance).

## Usage

colorize-similar supports two command. They are `extension.ColorizeSimilar` and `extension.clearColorizeSimilar`.

`extension.ColorizeSimilar`: Colorize selected word and similar words.
Note: You need to select word before executing `extension.ColorizeSimilar`.
`extension.clearColorizeSimilar`: 

You can execute these commands by `Ctrl + Shift + P` -> `Colorize Similar`.
Or you can assign these commands to any short cut keys.

## Known Issues

Currently, this plugin supports alphanumeric characters only.

# parcel-namer-custom
> Parcel namer plugin to rename bundles by interpolating a filename template.

## Installation
1. `$ npm install parcel-namer-custom --save-dev`
2. Update your `.parcelrc` with the entry below.
   ```
   "namers": ["parcel-namer-rewrite", "..."],
   ```

*Important:* the three dots indicate to Parcel to run their default namer on any bundles that haven't been named yet.

## Configuration
Plugin configuration lives in your `package.json`, as `parcel-namer-custom` object prop:
- Keys should be Regular Expressions matching against a bundles' filepath.
- Values should be filename templates.

## Filename templates
This plugin takes an approach similar to Webpacks' [interpolateName](https://github.com/webpack/loader-utils#interpolatename).

The following tokens are replaced in the filename template:
- `[path]` the path of the bundle relative to the project root,
- `[folder]` the folder the bundle is in,
- `[base]` the filename (including extension) of the bundle,
- `[ext]` the input extension of the bundle,
- `[name]` the basename of the bundle,
- `[type]` the output type of the bundle,
- `[hash]` the hash of the bundle,
- `[N]` the N-th match obtained from matching the current filename against the Regular Expression.

### Examples
```
// package.json
"parcel-namer-custom": {
  "admin.js$": "[folder]/[name].[ext]",
  ".scss$": "[folder]/[name].[hash].[type]",
  ".jsx?$": "scripts/[name].[hash].[type]"
}

// src/admin/console.js -> admin/console.js
// src/styles/main.scss -> styles/main.1722cc.css
// src/modules/main.jsx -> scripts/main.9488dd.js
```

## Debugging
Run Parcel with `--log-level info` to see what bundles are renamed.

## Changelog
See the [Changelog](./CHANGELOG.md) for a list of changes.

## License
    The MIT License (MIT)

    Copyright (c) 2020 Mark van Seventer

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

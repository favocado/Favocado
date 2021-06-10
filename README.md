# Favocado

### Prerequisites
- [Node](https://nodejs.org/en/download)

#### Notice
this master branch only contain core parts.
you may need to implement new binding objects following files in [Binding folder](https://github.com/favocado/favocado/tree/master/Generator/Binding).

please check these branchs for configuration examples.
- [pdf-js](https://github.com/favocado/favocado/tree/pdf-js) for fuzzing PDF objects.
- [chromium](https://github.com/favocado/favocado/tree/chromium) for fuzzing DOM objects in chromium.
- [webkitgtk++](https://github.com/favocado/favocado/tree/webkit-gtk) for fuzzing DOM objects in webkitgtk++.
- mojom for fuzzing Mojom IPC (updating).

### Usage:

#### Generate Testcase 
* Generate html copus:
    `node .\Generator\Run\Gen.js -o output -n 10`

#### Context-dependent Fuzzing.

To fuzzing in context-dependent you need to set up a Logger, which will writeout(realtime) generated code when fuzzing.
check this [repo](https://github.com/favocado/webkitgtk-fuzz) for more detail.

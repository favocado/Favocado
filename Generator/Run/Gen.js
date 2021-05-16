require('../Core/Core_Config');
const fs = require('fs')
var crypto = require('crypto');
const fsPromises = fs.promises;

var optparse = require('./opt_parser');

var SWITCHES = [
    ['-n', '--number NUMBER', "number of testcases you want to generate"],
    ['-o', '--output TEXT', "output folder"],
    ['-r', '--relative', "enable relative fuzzing mode"],
];

var parser = new optparse.OptionParser(SWITCHES);
parser.banner = 'Usage: node gen.js [options]';

// Internal variable to store options.
var options = {
    number: 10,
    output: '.',
    relative: false
};


parser.on('number', function(name, value) {
    options.number = value;
    console.log(value)
});

parser.on('output', function(name, value) {
    options.output = value;
});

parser.on('relative', function() {
    options.relative = true;
});

parser.parse(process.argv);


function md5(name) {
    var hash = crypto.createHash('md5').update(name).digest('hex');
    return hash
}

async function genCode(dir) {

    eval(fs.readFileSync(__dirname+'/../Core/Engine_Objects.js') + '')
    eval(fs.readFileSync(__dirname+'/../Core/Engine_Interfaces.js') + '')
    eval(fs.readFileSync(__dirname+'/../Core/Core_Templates.js') + '')
    eval(fs.readFileSync(__dirname+'/../Core/Core_Utils.js') + '')
    eval(fs.readFileSync(__dirname+'/../Core/Core_Generator.js') + '')
    eval(fs.readFileSync(__dirname+'/../Core/Core_Relative.js') + '')

    eval(fs.readFileSync(__dirname+'/../Binding/Binding_Interfaces.js') + '')
    eval(fs.readFileSync(__dirname+'/../Binding/Binding_Objects.js') + '')
    eval(fs.readFileSync(__dirname+'/../Binding/Binding_Static.js') + '')
    eval(fs.readFileSync(__dirname+'/../Binding/Binding_Templates.js') + '')
    eval(fs.readFileSync(__dirname+'/../Binding/Binding_Generator.js') + '')

    initFuzzing(true);

    var css = gen_Style(20);
    header = Header + initObjectsToFuzz() + makeHeader(20)

    var count = 0
    var code = ""
    for (let i = 0; i < 60; i++) {
        // refresh header    
        if (i % 20 == 19) code += header
        code += makeStatement(30)
        count += 1
    }

    code = "<!doctype html> \n<body></body>\n" + css + "<script>" + header + code
    code += "\n</script></html>"
    filename = md5(code) + ".html";

    fs.writeFile(dir + "/" + filename, code, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("created new corpus:" + filename);
    });
}

function gen(options)
{
    // output folder
    var output = options.output;
    console.log("creating " + output)
    if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
        console.log("created " + output)
    }

    FuzzObjectRelation = options.relative;
    for(let i=0; i< options.number; i++)
        genCode(output);
}

gen(options);

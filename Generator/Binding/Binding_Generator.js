// this is an example
// give object type -> get object value
function getBindingObject(typename) {
    if (BindingPropertyValues.hasOwnProperty(typename))
        return fixtype(randArray(BindingPropertyValues[typename])); // not return astring
    if (ListSubTypes.hasOwnProperty(typename)) return genSubObject(typename);
    if (
        (typename == 'Color') |
        typename.includes('Color') |
        typename.includes('color')
    ) {
        if (rand(2) == 1) return makeAColor();
        return 'color.' + getRandom_Property('Color', 1).name;
    }
    if (typename.includes('Coord') | typename.includes('coord'))
        return randCoord(0x1000);
    if ((typename == 'cScript') | (typename == 'Script')) {
        var sc = genCScript();
        if (sc === false) // cscript inside cscript
        {
            return '\\"' + sc + '\\"';
        }
        else return '"' + sc + '"';
    }
    if (typename == 'nMilliseconds') return rand(0x2000);
    if (typename == 'object')
        return getRandObjectNoFalse('Object')
    if (typename == 'oFunc') return getRandomObjectType('Func');
    if (typename == 'aFields') return MakeArrayType('Field_Ar');
    if (typename == 'Annotation3DName') return 'Annotation3DName';
    if (typename == 'AnnotationName') return 'AnnotationName';

    if (typename.includes('Props_Annotation'))
        return CreateAnnotationProps(typename); // create object properties for specify annot

    if (typename == 'Label')
        return cat([
            '[',
            getBindingObject('LabelStyle'),
            ",",
            getRandObjectNoFalse('String'),
            ",",
            getRandObjectNoFalse('Int-0-4'),
            ']',
        ], 0);

    var ret = getBindingSpecifyString(typename);
    if (ret != -1) {
        if (ret == undefined) console.log(typename);
        return "'" + ret + "'";
    }
    return ret;
}

//@param nType: number of object types to fuzz.
//@param nCount: number of objects will be created per type.
function initObjectsToFuzz(nType, nCount = 3) {
    var code = 'fthis=this;';
    // we dont have any available objects => generate new.
    pickRandomObjectTypes(nType);
    for (var i = 0; i < ListObjectsTypeFuzzing.length; i++) {
        for (var n = 0; n < nCount; n++)
            try {
                var f = 'gen_' + ListObjectsTypeFuzzing[i];
                if (
                    eval('typeof ' + f) !== 'undefined' &&
                    typeof eval(f) === 'function'
                ) {
                    f = eval(f);
                    code += f();
                }
                else break;
            } catch (e) {
                console.log(e)
            }
    }
    return code;
}


function getGenFunctions() {
    return Object.keys(ListDefinedInterfaces).reduce((res, k) => {
        var f = 'gen_' + k;
        if (eval('typeof ' + f) !== 'undefined' && typeof eval(f) === 'function') {
            res.push(f);
        }
        return res;
    }, []);
}

function pickRandomObjectTypes(num) {
    var functions = getGenFunctions();
    if (num > functions.length) num = functions.length;
    var startIndex = rand(functions.length - num);
    for (var i = startIndex; i < startIndex + num; i++) {
        ListObjectsTypeFuzzing.push(functions[i].replace('gen_', ''));
    }
}


function getBindingSpecifyString(typename) {
    // all specify string should be here
    if (typename == 'FieldName') return getRandomObjectType("Field");
    if (typename == 'MIMEType') return 'implement me';
    if (typename == 'IconName') return 'implement me';
    if (typename == 'CryptFilter') return 'implement me';
    if (typename == 'ReadStream') return 'implement me';
    if (typename == 'TemplateName') return 'implement me';

    if (typename == 'ScriptName') return 'implement me';


    if (BindingStrPropertyValues.hasOwnProperty(typename)) {
        return fixtype(randArray(BindingStrPropertyValues[typename])); // this all should be string type
    }
    return -1;
}

function getFieldName() {
    // find from random
    for (var i = rand(ListAllObject.length); i < ListAllObject.length; i++) {
        if (ListAllObject[i].type.indexOf('Field') == 0) {
            return ListAllObject[i].name;
        }
    }
    // find from a->z
    for (var i in ListAllObject) {
        console.log(i)
        if (ListAllObject[i].type.indexOf('Field') == 0) {
            return ListAllObject[i].name;
        }
    }
    //nothing found
    return '\xfe\xff';
}

function genSubObject(type, isRandom = 0) {
    if (!ListSubTypes.hasOwnProperty(type)) return -1;
    var tmp = ""
    var code = "{"
    // console.log(ListSubTypes[type].length)
    for (var k in ListSubTypes[type]) {
        tmp = k
        if (k.includes("_optional")) {
            tmp = k.replace("_optional", "")
            if (rand(2) == 0)
                continue
        }
        var prop = ListSubTypes[type][k]
        if (isRandom & (rand(10) == 0)) // random in sub list
            code += tmp + ":" + getAValue() + ","
        else
            code += tmp + ":" + getRandObjectNoFalse(prop) + ","
    }
    if (code.charAt(code.length - 1) == ",")
        code = code.slice(0, -1);
    code += "}"
    return code
}

function CreateAnnotationProps(typename) {
    var annot_type = typename.replace('Props_', '');
    var annot_obj = ListObjectTypes[annot_type];
    var properties = annot_obj['properties'];
    var ret_data = '{';
    for (var k in properties) {
        if (rand(2) == 0) {
            if (properties[k].readonly == 'None')
                ret_data += k + ':' + getRandomObjectType(properties[k].type) + ',';
        }
    }
    ret_data += '}';
    return ret_data;
}

// fixtype("<Int 0-65000>") -> "4000"
function fixtype(data_type) {
    if (data_type == '<String>') return getRandomObjectType('String');
    var matchs = [];
    var regex = /<([A-Za-z0-9_-]*)>/g;
    do {
        var m = regex.exec(data_type);
        if (m) {
            matchs.push([m[0], m[1]]);
        }
    } while (m);
    for (var i = 0; i < matchs.length; i++) {
        var vkey = getRandomObjectType(matchs[i][1]) + '';
        try {
            vkey = vkey.replace(/"/g, '');
        } catch (e) {
            /*console.log(typeof(vkey))*/
        } // try remove \" before replace into string

        data_type = data_type.replace(matchs[i][0], vkey);
    }
    return data_type;
}

function makeAColor() {
    var c = '';
    c += randArray(BindingStrPropertyValues['ColorSpace']);
    if (c == 'G') c = "'G'," + randFloat();
    else if (c == 'RGB') {
        c = "'RGB'";
        c += ',' + rand(255);
        c += ',' + rand(255);
        c += ',' + rand(255);
    } else if (c == 'CMYK') {
        c = "'CMYK'";
        c += ',' + rand(255);
        c += ',' + rand(255);
        c += ',' + rand(255);
        c += ',' + rand(255);
    } else c = "'T'";
    c = '[' + c + ']';
    return c;
}

function getCoord() {
    // var l = 50
    // var n = Math.floor(596/l)
    var x0 = 0,
        y0 = 0,
        x1 = 0,
        y1 = 0;
    if (rand(3) == 1) x0 = rand(0x100) * rand(0x100) - rand(0x100) * rand(0x200);
    else x0 = rand(0x100) - rand(0x100);
    if (rand(3) == 1) y0 = rand(0x100) * rand(0x100) - rand(0x100) * rand(0x200);
    else y0 = rand(0x100) - rand(0x100);
    if (rand(3) == 1) x1 = rand(0x100) * rand(0x200) - rand(0x100) * rand(0x100);
    else x1 = rand(0x2000) - rand(0x1000);
    if (rand(3) == 1) y1 = rand(0x100) * rand(0x200) - rand(0x100) * rand(0x100);
    else y1 = rand(0x2000) - rand(0x1000);

    var r = [x0, y0, x1, y1];
    return '[' + r + ']';
}

function genField(fieldType) {

    var vn = 'Field_' + makeId();
    var FieldName = makeId();
    addNewObject(vn, 'Field_' + fieldType, {}, {}, FieldName);
    return cat([
        vn,
        "=fthis.addField('",
        FieldName,
        "', '",
        fieldType,
        "', ",
        rand(2),
        ' ,',
        getCoord(),
        ');',
    ], 1);
}
function gen_Field_text() {
    return genField("text");
}

function gen_Field_button() {
    return genField("button");
}

function gen_Field_combobox() {
    return genField("combobox");
}

function gen_Field_listbox() {
    return genField("listbox");
}

function gen_Field_checkbox() {
    return genField("checkbox");
}

function gen_Field_radiobutton() {
    return genField("radiobutton");
}

function gen_Field_signature() {
    return genField("signature");
}

function gen_Doc() {

    addNewObject('fthis', 'Doc');
    return '';
}

function gen_bookmarkRoot() {
    addNewObject('bookmarkRoot', 'Bookmark');
    return '';
}

function gen_app() {
    addNewObject('app', 'app');
    return '';
}

function gen_Annotation() {
    var vn = 'Annot_' + makeId()
    var AnnotName = makeId()
    addNewObject(vn, "Annotation", {}, {}, AnnotName)
    return cat([vn, '=addAnnot({page:', rand(2), ',point:[', rand(1000), ',', rand(1000), '], type: ', getRandomObjectType('Annotation_Type'), ', name:\'', AnnotName, '\', rect:', getCoord(), ', AP:', getRandomObjectType('Annotation_AP'), '});'])
}
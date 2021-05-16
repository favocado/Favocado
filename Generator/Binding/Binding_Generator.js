ListClassId = ["0"]
ListElementId = ["0"]
Black_list = []
// List classname css
ListCssClass = []

function getBindingObject(typename) {
    if (BindingPropertyValues.hasOwnProperty(typename)) {
        return fixtype(randArray(BindingPropertyValues[typename])); // not return astring
    }
    if (ListSubTypes.hasOwnProperty(typename)) {
        return genSubObject(typename, 1);
    }
    if (['GLboolean'].includes(typename)) return randArray(['true', 'false']);
    if (['GLint', 'GLint64', 'GLintptr'].includes(typename)) return randInt();
    if (['GLclampf', 'GLdouble', 'GLfloat'].includes(typename)) return randFloat();
    if (['EventListener', 'EventHandler'].includes(typename)) return getEvent();
    if (["DOMString", "USVString", "HTMLString"].includes(typename)) return randString()
    if (['GLsizei', 'GLsizeiptr', 'unsignedlong', 'GLuint'].includes(typename)) return randUnInt();
    var ret = getBindingRandObjectType(typename)
    if (ret != -1) {
        if (ret == undefined)
            console.log(type_name)
        return '"' + ret + '"'
    }
    return ret;
}

//@param num: number of objects to fuzz.
function initObjectsToFuzz(num) {
    addDocument();
    pickRandomObjectToFuzz(num)
    var str = "";
    for (var i = 0; i < ListObjectsTypeFuzzing.length; i++) {
        var f = eval('gen_' + ListObjectsTypeFuzzing[i]);
        str += f() + ";";
        var f = eval('gen_' + ListObjectsTypeFuzzing[i]);
        str += f() + ";";
    }
    return str;
}


function testBindingGen(objectType) {
    ListObjectsTypeFuzzing.push(objectType)
    var str = "";
    for (var i = 0; i < ListObjectsTypeFuzzing.length; i++) {
        var f = eval('gen_' + ListObjectsTypeFuzzing[i]);
        str += f() + ";";
        var f = eval('gen_' + ListObjectsTypeFuzzing[i]);
        str += f() + ";";
    }

    return str;
}

function addDocument() {
    ListObjectsTypeFuzzing.push("HTMLDocument")
    addNewObject('document', 'HTMLDocument')
}

function pickRandomObjectToFuzz(num) {
    Black_list = ["gen_ResizeObserverEntry", "gen_CryptoKey", "gen_MutationRecord", "gen_PerformancePaintTiming", "gen_PromiseRejectionEvent", "gen_EventSource", "gen_TextTrackList", "gen_SVGScriptElement", "gen_DeviceMotionEvent"]
    if (FuzzObjectRelation) {
        PairList = getPairList()
        var startIndex = rand(PairList.length - num)
        var i = startIndex
        while (i < startIndex + num) {
            var type1 = Object.keys(PairList[i])[0]
            var type2 = PairList[i][type1]
            if ((!Black_list.includes('gen_' + type1)) && (!Black_list.includes('gen_' + type2))) {
                if ((eval('typeof gen_' + type1) === 'function') & (eval('typeof gen_' + type2) === 'function'))
                // check is this object type can be created?
                {
                    if (!ListObjectsTypeFuzzing.includes(type1))
                        ListObjectsTypeFuzzing.push(type1)
                    if (ListObjectsTypeFuzzing.includes(type2))
                        ListObjectsTypeFuzzing.push(type2)
                    i++
                    continue
                }
            }
            i++
        }
    }
    else {
        var functions = getGenFunctions();
        var startIndex = rand(functions.length - num)
        for (var i = startIndex; i < startIndex + num; i++) {
            if (Black_list.includes(functions[i]))
                continue
            ListObjectsTypeFuzzing.push(functions[i].replace("gen_", ""))
        }
    }
}


function getBindingRandObjectType(typename) // getBindingRandObjectType("where") => "beforeBegin"
{
    if (typename.includes('URL')) {
        return randHTMLString();
    }

    if (['Color', 'color'].includes(typename)) return makeColor();
    if (['classId', 'classid'].includes(typename)) return randArray(ListClassId);
    if (['elementId'].includes(typename)) return getElementId();
    if (typename == "fuzzfolder") return "http://" + serverip + "/fuzzing";
    if (['moduleURL'].includes(typename)) return getBindingRandObjectType("fuzzfolder") + "/jsfuzz.js"
    if (typename === 'url') {
        if (rand(5) > 1) return "http://" + getBindingRandObjectType("hostname");
        else return randHTMLString()
    }
    if (typename == "CSS_property") return randArray(Object.keys(CSSProperties))
    if (typename == "InterfaceName") return randArray(Object.keys(ListObjectTypes))
    if (typename == "value") // use cachePropertyValue to find correct value
    {
        if (cachePropertyValue == "") return randHTMLString()
        else return getBindingRandObjectType(cachePropertyValue)
    }

    if (FuzzBinding && BindingStrPropertyValues.hasOwnProperty(typename)) {
        var data_type = randArray(BindingStrPropertyValues[typename])
        return fixtype(data_type)
    }

    if (CSSProperties.hasOwnProperty(typename)) {
        var data_type = randArray(CSSProperties[typename])
        return fixtype(data_type)
    }
    if (typename == "CSS_TEXT") return genCSS_TEXT();
    if (typename == "cssurl") return getBindingRandObjectType("fuzzfolder") + "/cssfuzz.css"
    if (typename == "imgurl") return getBindingRandObjectType("fuzzfolder") + "/fuzz.jpg"
    if (typename == "videourl") return getBindingRandObjectType("fuzzfolder") + "/fuzz.jpg"
    if (typename == "audiourl") return getBindingRandObjectType("fuzzfolder") + "/fuzz.jpg"
    if (typename == "frameurl") return "http://" + serverip + "/Generator/Run/fuzz.html"
    return -1;
}

function gen_Style(count) {
    var style = "";
    for (var i = 0; i < count; i++) {
        var id = makeId();
        ListCssClass.push(id);
        style += "<style>\n ." + id + "{" + genCSS_TEXT() + "};\n</style>\n"
    }
    return style;
}
function genCSS_TEXT() {
    var css_text = "";
    var important = "";
    var CSSkeys = Object.keys(CSSProperties)
    for (var i = 0; i < rand(10) + 5; i++) {
        var key = randArray(CSSkeys)
        var data_type = randArray(CSSProperties[key])
        if (rand(2) == 0) important = " !important";
        else important = "";
        css_text += key + ":" + fixtype(data_type) + important + ";"
    }
    return css_text;
}

function randXMLtext() {
    var tags = Object.keys(TagHTML);
    var HTML = "";
    for (let i = 0; i < rand(0x10); i++) {
        let tag = randArray(tags);
        HTML += "<" + tag + ">" + "</" + tag + ">"
    }
    return "'" + HTML + "'"
}


function fixtype(data_type) // fixtype("<Int 0-65000>") -> "4000"
{
    if (data_type == "<String>")
        return getRandomObjectType("String");
    var matchs = []
    var regex = /<([A-Za-z0-9_-]*)>/g;
    do {
        var m = regex.exec(data_type);
        if (m) {
            matchs.push([m[0], m[1]])
        }
    } while (m);
    for (var i = 0; i < matchs.length; i++) {
        var vkey = getRandomObjectType(matchs[i][1]) + ""
        try {
            vkey = vkey.replace(/"/g, '');
        } catch (e) {
            /*console.log(typeof(vkey))*/
} // try remove \" before replace into string

        data_type = data_type.replace(matchs[i][0], vkey)
    }
    return data_type
}


function getEvent() {
    if (ListFunctions.length == 0)
        return "()=>{" + genCScript() + "}";
    if (rand(2) == 1) {
        var func = randArray(ListFunctions);
        return func.name + "(" + feedArgs(func['numarg'], func['args']) + ")";
    } else return "()=>{" + genCScript() + "}";
}

function getClassId() {
    if (ListClassId.length == 0) return getRandomObjectType("HTMLString")
    else return randArray(ListClassId);
}

function getElementId() {
    if (ListElementId.length == 0) return getRandomObjectType("HTMLString")
    else return randArray(ListElementId)
}

function RandObjectType(typename) {
    var loadvarlue = DomRandObjectType(typename);
    var regex = "<[A-Za-z_]*>";
    var kkk = value.match(regex);
    console.print(kkk);
}


function makeColor() {
    var tmp = rand(4)
    if (tmp < 2)
        return randArray(['red', 'green', 'white', 'black'])
    else
        return "rgb(" + rand(255) + "," + rand(255) + "," + rand(255) + ")"
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

function create_HtmlImg(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var dimension = getRandomObjectType("Int");
    var src = getRandomObjectType("imgurl");

    var stm = cat([`
        ${nv} = document.createElementNS('http://www.w3.org/1999/xhtml', "image");
        document.body.appendChild(${nv});
        ${nv}.height = ${dimension};
        ${nv}.width = ${dimension};
        ${nv}.src = ${src};
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLImageElement");
    return stm;
}


function getGenFunctions() {
    return Object.keys(ListDefinedInterfaces).reduce((res, k) => {
        var f = "gen_" + k;
        if (eval("typeof " + f) !== "undefined" && typeof eval(f) === "function") {
            res.push(f);
        }
        return res;
    }, [])
}

function test_DOMGenerator() {
    addDocument()
    var functions = getGenFunctions();

    for (var i = 0; i < functions.length; i++) {
        var f = eval(functions[i]);
        console.log(functions[i])
        var data = f.call();
        window.eval(data)
        try {
            var object_type = f.name.replace("gen_", "");
            var obj_name = getRandomObjectType(object_type);
            if (obj_name == -1) {
                console.log(
                    f.name + ": No object " + object_type + "in ListAllObject => forgot addNewObject() ???"
                );
                continue
            }
            var test_obj = eval(obj_name)
            var DOMType = String(test_obj.constructor);
            console.log(f.name + ": OK ", obj_name, ": ", DOMType.substring(DOMType.indexOf(" "), DOMType.indexOf("(")));
        } catch (e) {
            console.log(f.name + ": FAIL")
            console.log(e)
        }
    }
}

//======================================INIT SOME BASIC OBJECTS TO FUZZ=================================



//===================Audio Area=======================//
function createAudioContext(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var arg = "";
    if (rand(2) == 0)
        arg = genSubObject("AudioContextOptions");
    var stm = "AudioContext = window.AudioContext || window.webkitAudioContext;";
    stm += cat([`${nv} =  new AudioContext(${arg})`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AudioContext");
    return stm
}

function gen_AudioContext(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var arg = "";
    if (rand(2) == 0)
        arg = genSubObject("AudioContextOptions");
    var stm = "AudioContext = window.AudioContext || window.webkitAudioContext;";
    stm += cat([` ${nv} =  new AudioContext(${arg})`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AudioContext");
    return stm
}

function gen_BaseAudioContext(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = gen_AudioContext(nv);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "BaseAudioContext");
    return stm;
}

function gen_OfflineAudioContext(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = "";
    var arg = genSubObject("OfflineAudioContextOptions");

    if (FuzzWebkit)
        stm = cat([` ${nv} = new webkitOfflineAudioContext(${getRandObjectNoFalse("Int-1-10")}, ${getRandObjectNoFalse("UnsignedInt")}, 44100);`], 1);
    else
        stm = cat([` ${nv} = new OfflineAudioContext(${arg})`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OfflineAudioContext");
    return stm;
}

function testAudio(fuzzWebkit = 0) {
    FuzzWebkit = fuzzWebkit;
    ListObjectsTypeFuzzing.push("AudioContext")
    ListObjectsTypeFuzzing.push("OfflineAudioContext")
    ListObjectsTypeFuzzing.push("BaseAudioContext")
    gen_AudioContext()

}

// =================== End Audio Area ===================//


function generateWebGL(id, version) {
    var canvas = makeId();
    return `
        ${canvas} = document.createElement("canvas");
        document.body.appendChild(${canvas});
        ${id} = ${canvas}.getContext('webgl${version || ''}');
    `;
}

function generateCanvas2DCtx(id, version) {
    var canvas = makeId();
    return `
        ${canvas} = document.createElement("canvas");
        document.body.appendChild(${canvas});
        ${id} = ${canvas}.getContext('2d');
    `;
}


function generateSVGElement(id) {
    return `${id} = document.createElementNS('http://www.w3.org/2000/svg', 'svg');document.body.appendChild(${id});`
}

function gen_KeyboardEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "new KeyboardEvent(", getRandObjectNoFalse("String"), ")"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "KeyboardEvent");
    return stm;
}

function gen_KeyframeEffect(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var img = makeId();
    var stm = cat([`
        ${img} = document.createElement('image');
        ${img}.src = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png';
        ${img}.id = "${img}";
        document.body.appendChild(${img});
        ${nv} = new KeyframeEffect(
            ${img},
            [{ transform: 'translateY(0%)' }, { transform: 'translateY(100%)' }],
            { duration: 3000, fill: 'forwards' }, 
        );
    `], 1);

    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "KeyframeEffect");
    return stm
}

function gen_PaintWorkletGlobalScope(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "CSS.paintWorklet"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PaintWorkletGlobalScope");
    return stm;
}

// TextTrackCueList



function gen_HTMLFrameSetElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('frameset');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLFrameSetElement");
    return stm;
}

// MIDIOutput

// XRViewport

// FileSystemBaseHandle

function gen_SVGFESpotLightElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <filter>
                    <feSpotLight id="${nv}" x="${randInt()}" y="${randInt()}" z="${randInt()}" limitingConeAngle="${randFloat()}" class="${randArray(ListCssClass)}"/>
                </filter>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFESpotLightElement");
    return stm;
}


function gen_DelayNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = "";
    var audioCtxId = -1;
    if (rand(2) == 0)
        audioCtxId = getRandomObjectType("AudioContext");
    else audioCtx = getRandomObjectType("OfflineAudioContext");
    if (audioCtxId == -1) {
        audioCtxId = makeId();
        if (rand(2) == 0)
            stm += gen_AudioContext(audioCtxId);
        else
            stm += gen_OfflineAudioContext(audioCtxId);
    }
    stm += cat([nv, "=", "new DelayNode(" + audioCtxId + ", {})", ";"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DelayNode");
    return stm;
}

// Metadata ->

// XMLHttpRequestEventTarget -> Illegal constructor

function gen_SVGFEMorphologyElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <filter>
                    <feMorphology id="${nv}" operator="dilate" radius="2" class="${randArray(ListCssClass)}"/>
                </filter>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEMorphologyElement");
    return stm;
}

function gen_Accelerometer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new Accelerometer({})", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Accelerometer");
    return stm;
}

// TestInterfaceConstructor2 ->

function gen_SVGFETileElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <feTile id="${nv}" in="SourceGraphic" x="${randInt()}" y="${randInt()}"
                width="${randInt()}" height="${randInt()}"  class="${randArray(ListCssClass)}" />
                <feTile/>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFETileElement");
    return stm;
}

// WebGLMultiDrawInstanced ->

function gen_WebGLShader(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.createShader(${gl}.VERTEX_SHADER);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLShader");
    return stm;
}

function gen_SVGLengthList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElementNS('http://www.w3.org/2000/svg', 'tspan').x.baseVal;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGLengthList");
    return stm;
}

function gen_Geolocation(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "navigator.geolocation", ";"]);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Geolocation");
    return stm;
}

// MediaSettingsRange -> Illegal constructor

function gen_SVGTSpanElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGTSpanElement");
    return stm;
}

// XRLayer ->

// XRWebGLLayer ->

function gen_WebGLBuffer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.createBuffer();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLBuffer");
    return stm;
}

// TrustedURL ->

// CanMakePaymentEvent ->

function gen_OESVertexArrayObject(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('OES_vertex_array_object').createVertexArrayOES();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OESVertexArrayObject");
    return stm;
}

// MetadataCallback ->

// Entry ->

// Plugin -> Illegal constructor

function gen_HTMLSpanElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('span');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLSpanElement");
    return stm;
}

function gen_Headers(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new Headers()", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Headers");
    return stm;
}

function gen_SVGRect(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGRect");
    return stm;
}

function gen_WritableStreamDefaultController(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = `const writableStream = new WritableStream({
        start(controller){
            ${cat(["window.", nv, "=", "controller", ";"], 1)}
        }});
        ${nv} = window.${nv};
    `;
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WritableStreamDefaultController")
    return stm;
}

// SourceBuffer() -> Illegal constructor

function gen_IntersectionObserver(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new IntersectionObserver(function(entries) {})", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "IntersectionObserver");
    return stm;
}

// RTCDtlsTransport -> Illegal constructor

function gen_ErrorCallback(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = "";
    stm += "function function_1(callback){ callback(new Error('error')) };";
    stm += `function_1(function(error) {${cat(["window.", nv, " = ", "error", ";"])}});`;
    stm += nv + " = window." + nv + ";";
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ErrorCallback");
    return stm;
}

// MediaKeySession -> Illegal constructor

function gen_SVGAnimatedString(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <a id="${nv}" href="/docs/Web/SVG/Element/circle">
                    <circle cx="50" cy="40" r="35"/>
                </a>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}').target;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedString");
    return stm;
}

function gen_SVGPointList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <polygon id="${nv}" points="100,1 38,10 0,1 0,0 100,0"></polygon>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}').points;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGPointList");
    return stm;
}

function gen_HTMLOptionElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var selectEle = makeId();
    var stm = cat([selectEle, "=", "document.createElement('select')", ";"], 1);
    stm += cat(["document.body.appendChild(" + selectEle + ");"], 1);
    stm += cat([selectEle + "[0]", "=", "new Option('random', 'random value', false, true)", ";"], 1)
    stm += cat([nv, "=", selectEle + "[0]"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLOptionElement");
    return stm;
}

function gen_SVGAnimatedNumber(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <fePointLight id="${nv}" x="50" y="50" z="220"/>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}').x;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedNumber");
    return stm;
}

// LayoutFragmentRequest ->

// FileWriterSync ->

// TestInterfaceNode ->

function gen_WebGLColorBufferFloat(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('WEBGL_color_buffer_float');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLColorBufferFloat");
    return stm;
}

// CSSStyleValue -> Illegal constructor

function gen_ReadableStream(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new ReadableStream()", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ReadableStream");
    return stm;
}

// BackgroundFetchRecord ->

function gen_Text(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new Text('random')", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Text");
    return stm;
}

// BeforeUnloadEvent

// MediaError ->

// CDATASection

function gen_HTMLDocument(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new Document()", ";"], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLDocument");
    return stm;
}

function gen_PasswordCredential(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new PasswordCredential({id: 'user-random-id', password: '1235'})", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PasswordCredential");
    return stm;
}

// EffectProxy ->

// MediaEncryptedEvent ->

// USBIsochronousOutTransferResult -> USB require

function gen_Keyboard(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "navigator.keyboard", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Keyboard");
    return stm;
}

// XMLDocument -> Illegal constructor

function gen_HTMLButtonElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "document.createElement('button')", ";", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLButtonElement");
    return stm;
}

// AuthenticatorAssertionResponse

function gen_SVGFECompositeElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter filterUnits="objectBoundingBox" x="-5%" y="-5%" width="110%" height="110%">
                <feComposite id="${nv}" in="SourceGraphic" in2="BackgroundImage" operator="over" result="comp"/>
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFECompositeElement");
    return stm;
}

// IdleState ->

// AbstractWorker -> cannot run worker script from a local file.

// ExtendableCookieChangeEvent ->

function gen_FontFaceSet(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var fontFaceId = makeId();
    var stm = "";
    stm += cat([fontFaceId, "=", "new FontFace('Bitter', 'url(https://fonts.gstatic.com/s/bitter/v7/HEpP8tJXlWaYHimsnXgfCOvvDin1pK8aKteLpeZ5c0A.woff2)');"], 0);
    stm += cat([nv, "=", "document.fonts.add(" + fontFaceId + ");"], 0);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "FontFaceSet");
    return stm;
}

// TestInterfaceConditionalSecureContext

function gen_ChildNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var childNodes = makeId();
    var stm = "";
    stm += childNodes + "= document.body.childNodes;";
    stm += "if(!" + childNodes + ".length){document.body.appendChild(document.createElement('div'));}";
    stm += nv + "=" + childNodes + "[0]";
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ChildNode");
    return stm;
}

function gen_AccessibleNodeList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "document.body.childNodes", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AccessibleNodeList");
    return stm;
}

// BluetoothAdvertisingData.manufacturerData

function gen_SVGStopElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <linearGradient gradientTransform="rotate(90)">
                <stop id="${nv}"  offset="95%" stop-color="red" />
            </linearGradient>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGStopElement");
    return stm;
}

function gen_HTMLCollection(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "document.forms", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLCollection");
    return stm;
}

// DirectoryEntry

// IDBTransaction

// Worker

function gen_SVGPatternElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <pattern id="${nv}" viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" width="${randInt()}%" height="${randInt()}%" class="${randArray(ListCssClass)}">
            </pattern>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGPatternElement");
    return stm;
}

// BluetoothRemoteGATTService -> Illegal constructor

function gen_SVGAnimatedRect(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg id="${nv}" viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}').viewBox; 
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedRect");
    return stm;
}

function gen_Float64Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new Float64Array();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Float64Array");
    return stm;
}

function gen_CSSStyleSheet(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.styleSheets[${rand(1000)}%document.styleSheets.length];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSStyleSheet");
    return stm;
}

// RTCRtpSender ->

function gen_WorkerLocation(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "self.location", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WorkerLocation");
    return stm;
}

// StaticRange -> Illegal contructor

function gen_ErrorEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "new ErrorEvent('error');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ErrorEvent");
    return stm;
}

function gen_HTMLFormControlsCollection(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <form id="${nv}">
                <input type="radio" value="10" /> foo 
                <input type="radio" value="30" /> bar 
            </form>
        \`;
        ${nv} = document.getElementById('${nv}').elements;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLFormControlsCollection");
    return stm;
}

// GPUAdapter

// IDBFactory

// NFC

// ExperimentalBadge

// TestAttributes

// PresentationConnectionList -> Illegal contructor

function gen_HTMLAreaElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "document.createElement('area');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLAreaElement");
    return stm;
}

function gen_HTMLFormElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "document.createElement('form');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLFormElement");
    return stm;
}

function gen_Crypto(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, "=", "window.crypto;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Crypto");
    return stm;
}

function gen_ImageBitmapRenderingContext(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = "";
    //this canvas will call into getcontext -> need create new one instead of reuse from getRandomObjectType("canvas")
    var canvas = makeId();
    stm += cat([canvas, "=", "document.createElementNS('http://www.w3.org/1999/xhtml','", "canvas", "')", ";", "document.body.appendChild(", canvas, ");"], 1);
    stm += cat([canvas, `.setAttribute("class", "${randArray(ListCssClass)}");`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(canvas, "HTMLCanvasElement");
    stm += "document.body.appendChild(" + canvas + ");";
    stm += cat([nv, "=", canvas, ".getContext('bitmaprenderer');"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ImageBitmapRenderingContext");
    return stm;
}

// CSSViewportRule

function gen_SVGLength(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGLength();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGLength");
    return stm;
}

// DataTransferItemList ->

function gen_ResourceProgressEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    // var img = getRandomObjectType("Image");
    var img = -1;
    var stm = "";
    if (img === -1) {
        img = makeId();
        stm += cat([img, "=", "document.createElement('img');", "document.body.appendChild(", img, ");"]);
        stm += cat([img, `.setAttribute("class", "${randArray(ListCssClass)}");`], 1);
        stm += img + ".src = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png';";
        if (FuzzIncontext) {
            runMe(stm)
        }
        addNewObject(img, "HTMLImageElement");
    }
    stm += cat([nv, "=", "new ProgressEvent(" + img + ")"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ResourceProgressEvent");
    return stm;
}

function gen_HTMLInputElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "document.createElement('input');", "document.body.appendChild(", nv, ");"], 1);
    stm += cat([nv, `.setAttribute("class", "${randArray(ListCssClass)}");`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLInputElement");
    return stm;
}

// PaymentMethodChangeEvent

function gen_Selection(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "window.getSelection();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Selection");
    return stm;
}

// TimestampTrigger

// NavigationPreloadManager

function gen_AudioBufferSourceNode() {
    var audioCtx = getRandomObjectType("AudioContext");
    var nv = makeId();
    var stm = "";
    if (audioCtx === -1) {
        audioCtx = makeId();
        stm += cat([audioCtx, " = ", "new (window.AudioContext || window.webkitAudioContext)();"]);
        if (FuzzIncontext) {
            runMe(stm)
        }
        addNewObject(audioCtx, "AudioContext");
    }
    stm += cat([nv, "=", audioCtx + ".createBufferSource();"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AudioBufferSourceNode");
    return stm;
}

function gen_PromiseRejectionEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = "";
    var promise = makeId();
    stm += cat([promise, " =  new Promise(function(resolve, reject){reject();});"]);
    stm += cat([nv, " = ", "new PromiseRejectionEvent('unhandledrejection',{ promise: " + promise + ", reason : 'reason'});"])
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PromiseRejectionEvent");
    return stm;
}

// SVGGraphicsElement ->

// PushManager -> The URL protocol of the current origin ('null') is not supported.

// CSSNamespaceRule -> Illegal constructor

function gen_CSSMathMax(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "new window.CSSMathMax(1, 2);"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSMathMax");
    return stm;
}

// InspectorOverlayHost -> 

// VRFrameData -> Chrome does not support

function gen_CompositionEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "new CompositionEvent('string');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CompositionEvent");
    return stm;
}

function gen_DOMStringMap(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = "";
    var htmlElement = getRandomObjectType("HTMLDivElement");
    if (htmlElement === -1) {
        htmlElement = makeId();
        stm += cat([htmlElement, " = ", "document.createElement('div');", "document.body.appendChild(", htmlElement, ");"]);
        stm += cat([htmlElement, `.setAttribute("class", "${randArray(ListCssClass)}");`], 1);
        if (FuzzIncontext) {
            runMe(stm)
        }
        addNewObject(htmlElement, "HTMLDivElement");
    }
    stm += cat([nv, " = ", htmlElement + ".dataset;"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMStringMap");
    return stm;
}

// XRPresentationContext -> 

function gen_DOMException(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "new DOMException();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMException");
    return stm;
}

// TestImplements3 ->

// TestImplements2 ->

function gen_RTCPeerConnectionIceEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "new RTCPeerConnectionIceEvent('" + nv + "', {});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RTCPeerConnectionIceEvent");
    return stm;
}

// TaskAttributionTiming -> Illegal constructor

function gen_SVGAElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = "";
    stm += "document.body.append(document.createElementNS('http://www.w3.org/2000/svg','a'));";
    stm += nv + " = document.querySelector('a');"
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAElement");
    return stm;
}

// PerformanceObserverEntryList ->

// ContactsManager ->

// TestSpecialOperations

function gen_TextMetrics(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var canvasElement = makeId();
    var ctx = makeId();
    var stm = "";
    stm += cat([canvasElement, " = ", "document.createElement('canvas');", "document.body.appendChild(", canvasElement, ");"]);
    stm += cat([ctx, " = ", canvasElement, ".getContext('2d');"]);
    stm += cat([nv, " = ", ctx, ".measureText('Hello world');"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TextMetrics");
    return stm;
}

// CSSKeyframeRule -> Illegal constructor

function gen_SVGAnimateTransformElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg width="${randInt()}" height="${randInt()}" viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <animateTransform id="${nv}" attributeName="transform" attributeType="XML" type="rotate" class="${randArray(ListCssClass)}"
                    from="${randInt()} ${randInt()} ${randInt()}"
                    to="${randInt()} ${randInt()} ${randInt()}"
                    dur="${randInt()}s"
                    repeatCount="indefinite"
                />
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimateTransformElement");
    return stm;
}

function gen_RTCDTMFToneChangeEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "new RTCDTMFToneChangeEvent('tonechange', {});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RTCDTMFToneChangeEvent");
    return stm;
}

function gen_HTMLHeadElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "document.createElement('head');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLHeadElement");
    return stm;
}

function gen_Int8Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "new Int8Array();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Int8Array");
    return stm;
}

function gen_AriaAttributes(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var element = makeId();
    var stm = ""
    stm += element + " = document.createElement('button');"
    stm += element + ".id = '" + element + "';";
    stm += element + ".setAttribute('aria-label', 'label');";
    stm += cat([nv, " = ", element + ".attributes['aria-label'];", "document.body.appendChild(", element, ");"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AriaAttributes");
    return stm;
}

// PresentationReceiver -> 

// PresentationConnection -> 

// ValidityState -> Illegal constructor

// CryptoKey -> promise

// CanvasCaptureMediaStreamTrack

// VRDisplays -> not supported

// VideoPlaybackQuality -> chrome does not support

// USBIsochronousInTransferPacket -> 

// SpeechRecognitionResultList

function gen_WebGLTexture(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.createTexture();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLTexture");
    return stm;
}

// PerformanceEventTiming

function gen_SVGTextPositioningElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <text id="${nv}" x="20" y="35" class="small">My</text>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGTextPositioningElement");
    return stm;
}

// RTCRtpTransceiver -> Illegal constructor

// PictureInPictureWindow -> asynchronus asynchronous API

// IDBCursor

// GlobalEventHandlers -> Not an interface

// RTCDTMFSender

function gen_DocumentOrShadowRoot(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, ' = document;'], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, 'DocumentOrShadowRoot');
    return stm;
}

// PresentationAvailability 

function gen_SVGSwitchElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('switch');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, 'SVGSwitchElement');
    return stm;
}

function gen_DeprecatedStorageInfo(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.webkitStorageInfo;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DeprecatedStorageInfo");
    return stm;
}

function gen_SVGAnimateElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('animate');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimateElement");
    return stm;
}

function gen_WritableStreamDefaultWriter(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var wtbStream = getRandomObjectType("WritableStream");
    var stm = "";
    if (wtbStream === -1) {
        wtbStream = makeId();
        stm += cat([wtbStream, " = new WritableStream({});"]);
    }
    stm += cat([nv, " = ", wtbStream, ".getWriter();"]);
    if (FuzzIncontext) {
        { try { eval(stm) } catch (e) { } }
        try {
            if ([null, undefined, NaN].includes(eval(nv)))
                return ''
        } catch (e) {
        }
    }
    addNewObject(nv, "WritableStreamDefaultWriter");
    stm = cat([stm], 1);
    return stm;
}

// AnimationWorkletGlobalScope

function gen_HTMLSourceElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('source');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLSourceElement");
    return stm;
}

function gen_HTMLTableRowElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('tr');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTableRowElement");
    return stm;
}

// GamepadButtonEvent -> require gamepad

function gen_PresentationRequest(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new PresentationRequest('https://www.google.com/');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PresentationRequest");
    return stm;
}

function gen_CSSImageValue(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var btn = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<button id="${btn}" style="background: no-repeat 5% center url(https://mdn.mozillademos.org/files/16793/magicwand.png) aqua;">Magic Wand</button>\`;
        ${btn} = document.getElementById("${btn}");
        ${nv} = ${btn}.computedStyleMap().get('background-image');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSImageValue");
    return stm;
}
// Clients

// BluetoothRemoteGATTCharacteristic

function gen_DeviceMotionEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = ", "new DeviceMotionEvent('devicemotion', [])", ";"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DeviceMotionEvent");
    return stm;
}

// NavigatorConcurrentHardware

// PaymentAddress

// USBIsochronousInTransferResult

// ImageCapture

// TestInterface

// CSSGroupingRule 

// Gamepad

// IDBVersionChangeEvent

function gen_SVGSetElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElementNS('http://www.w3.org/2000/svg','set');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGSetElement");
    return stm;
}

// XRUnboundedReferenceSpace

function gen_FileReader(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new FileReader();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "FileReader");
    return stm;
}

// LayoutWorkletGlobalScope

// USBConfiguration

function gen_HTMLDirectoryElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('dir');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLDirectoryElement");
    return stm;
}

function gen_AnimationEffect(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var animation = makeId();
    var stm = cat([`
        ${nv} = new KeyframeEffect(
            document.createElement('div'),
            [{ transform: 'translateY(0%)' }, { transform: 'translateY(100%)' }],
            { duration: 3000, fill: 'forwards' }
        );
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AnimationEffect");
    return stm;
}

// IdleManager

function gen_TextTrackList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var video = makeId();
    var stm = ""
    stm += `document.body.innerHTML += \`<video id="${video}" controls width="250" src="https://interactive-examples.mdn.mozilla.net/media/examples/friday.mp4">
        <track default kind="captions" srclang="en" src="https://interactive-examples.mdn.mozilla.net/media/examples/friday.vtt"/>
    </video>\`;`;
    stm += cat([nv, " = ", `document.getElementById("${video}").textTracks;`]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TextTrackList");
    return stm;
}

function gen_VisualViewport(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.visualViewport;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "VisualViewport");
    return stm;
}

function gen_FocusEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var randomStr = getRandomObjectType('string');
    var stm = cat([nv, ` = new FocusEvent(${randomStr});`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "FocusEvent");
    return stm;
}

function gen_RTCIceCandidate(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var randomStr = getRandomObjectType('string');
    var stm = cat([nv, ` = new RTCIceCandidate({sdpMid: ${randomStr}});`]);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RTCIceCandidate");
    return stm;
}

// XRSpace

function gen_SVGPreserveAspectRatio(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg id="${nv}" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}').preserveAspectRatio.baseVal;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGPreserveAspectRatio");
    return stm;
}

// IDBIndex

// DirectoryReader

function gen_WebGLShaderPrecisionFormat(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getShaderPrecisionFormat(${gl}.VERTEX_SHADER, ${gl}.MEDIUM_FLOAT);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLShaderPrecisionFormat");
    return stm;
}

function gen_AnimationEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createEvent('AnimationEvent');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AnimationEvent");
    return stm;
}

function gen_ConstantSourceNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var audioCtx = makeId();
    var stm = cat([`
        ${createAudioContext(audioCtx)}
        ${nv} = ${audioCtx}.createConstantSource();
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ConstantSourceNode");
    return stm;
}


function gen_BlobEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var randomStr = getBindingRandObjectType('string');
    var stm = cat([`${nv} = new Blob([${randomStr}], {type : 'application/json'});`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "BlobEvent");
    return stm;
}

// SVGAnimatedTransformList
function gen_SVGAnimatedTransformList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <linearGradient id="${nv}" gradientTransform="rotate(90)">
                </linearGradient>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}').gradientTransform;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedTransformList");
    return stm;
}

// TestLegacyCallbackInterface

// WorkerTaskQueue

// IdleDeadline

function gen_DOMImplementation(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`${nv} = document.implementation`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMImplementation");
    return stm;
}

// ScrollState

function gen_HTMLDivElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('div');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLDivElement");
    return stm;
}

// TestReportBody

function gen_MediaDevices(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = navigator.mediaDevices;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaDevices");
    return stm;
}

function gen_HTMLEmbedElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('embed');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLEmbedElement");
    return stm;
}

// CSSRule -> Illegal constructor

function gen_ImageData(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new ImageData(100, 100);"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ImageData");
    return stm;
}

function gen_WebGLSampler(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl, 2)};
        ${nv} = ${gl}.createSampler();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLSampler");
    return stm;
}

function gen_DataView(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var buffer = makeId();
    var bufferStm = cat([buffer, " = new ArrayBuffer(16);"]);
    var stm = cat([bufferStm, nv, " = new DataView(" + buffer + ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DataView");
    return stm;
}

// XRStageBounds



// FileSystemDirectoryHandle

// XRFrame

function gen_NavigatorUserAgent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.navigator.userAgent;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "NavigatorUserAgent");
    return stm;
}

// HID

// FileSystemDirectoryIterator

// TestObject

function gen_MutationEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.addEventListener("DOMNodeInserted", function (event) {
            window.${nv} = event;
        }, false);
        document.body.appendChild(document.createElement('div'));
        ${nv} = window.${nv};
        document.removeEventListener("DOMNodeInserted", function() {});
    `], 1);

    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MutationEvent");
    return stm;
}

// Worklet -> Illegal constructor

function gen_SVGTextContentElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElementNS('http://www.w3.org/2000/svg', 'text');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGTextContentElement");
    return stm;
}

// CSSRotate

function gen_OfflineAudioCompletionEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var audioCtx = makeId();
    var arrayBuffer = makeId();
    var stm = cat([`
        ${createAudioContext(audioCtx)}
        ${arrayBuffer} = ${audioCtx}.createBuffer(2, ${audioCtx}.sampleRate * 3, ${audioCtx}.sampleRate);
        ${nv} = new OfflineAudioCompletionEvent("abc", { renderedBuffer: ${arrayBuffer} });
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OfflineAudioCompletionEvent");
    return stm;
}

function gen_Request(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Request('a', {});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Request");
    return stm;
}

// PerformancePaintTiming

function gen_SVGTextPathElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg id="my-svg" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg" version="1.1">
            <text>
                <textPath id="${nv}" href="#">
                    Quick brown fox jumps over the lazy dog.
                </textPath>
            </text>
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGTextPathElement");
    return stm;
}


function gen_WebGLRenderbuffer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.createRenderbuffer();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLRenderbuffer");
    return stm;
}

// WebGLCompressedTextureETC1

// GamepadHapticActuator

// RTCRtpReceiver

function gen_Int16Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Int16Array();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Int16Array");
    return stm;
}

function gen_OESTextureFloatLinear(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('OES_texture_float_linear');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OESTextureFloatLinear");
    return stm;
}

// FeaturePolicy

// PaymentInstruments

// AudioWorkletNode

// CSSSupportsRule

// SVGDiscardElement

// RTCErrorEvent

function gen_HTMLQuoteElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('blockquote');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLQuoteElement");
    return stm
}

// SVGAnimatedLengthList
function gen_SVGAnimatedLengthList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');document.body.appendChild(${nv});${nv}=${nv}.x;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedLengthList");
    return stm;
}

// SpeechRecognitionError

function gen_DOMError(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new DOMError('SyntaxError');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMError");
    return stm;
}

function gen_OESStandardDerivatives(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('OES_standard_derivatives');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OESStandardDerivatives");
    return stm;
}

// PaintSize

function gen_File(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new File(['foo'], 'foo.txt', {type: 'text/plain',});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "File");
    return stm;
}

function gen_HTMLDialogElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('dialog');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLDialogElement");
    return stm;
}


function gen_EXTFragDepth(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('EXT_frag_depth');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EXTFragDepth");
    return stm;
}

function gen_Navigator(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.navigator;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Navigator");
    return stm;
}

function gen_SVGFEFuncGElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg id="my-svg" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg" version="1.1">
            <feFuncG id="${nv}" x="0" y="0" width="60" height="10"/>
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEFuncGElement");
    return stm;
}

function gen_AbsoluteOrientationSensor(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new AbsoluteOrientationSensor({});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AbsoluteOrientationSensor");
    return stm;
}

function gen_SVGFESpecularLightingElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg height="200" width="200" viewBox="0 0 220 220"
            xmlns="http://www.w3.org/2000/svg">
            <feSpecularLighting id="${nv}" result="specOut"
                specularExponent="20" lighting-color="#bbbbbb">
            </feSpecularLighting>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFESpecularLightingElement");
    return stm;
}

function gen_SVGMatrix(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var svg = makeId();
    var stm = cat([`
        ${generateSVGElement(svg)}
        ${nv} = ${svg}.createSVGMatrix();
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGMatrix");
    return stm;
}

function gen_XPathEvaluator(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new XPathEvaluator();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "XPathEvaluator")
    return stm;
}

// VRStageParameters

function gen_SVGAnimateMotionElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg height="200" width="200" viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg">
            <animateMotion id="${nv}" dur="6s" repeatCount="indefinite">
            </animateMotion>
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimateMotionElement");
    return stm;
}

function gen_Uint32Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Uint32Array();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Uint32Array");
    return stm;
}

// GamepadEvent

function gen_SVGFEFuncAElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg height="200" width="200" viewBox="0 0 220 220"
            xmlns="http://www.w3.org/2000/svg">
            <feComponentTransfer>
                <feFuncA id="${nv}" type="identity"></feFuncA>
            </feComponentTransfer>
            </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEFuncAElement");
    return stm;
}

// SerialPort 

function gen_RTCIceTransport(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new RTCIceTransport();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RTCIceTransport");
    return stm;
}

function gen_CredentialsContainer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = navigator.credentials;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CredentialsContainer");
    return stm;
}

function gen_HTMLLinkElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('link');", "document.body.appendChild(", nv, ");"]);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLLinkElement");
    return stm;
}

// SVGAnimatedBoolean

// XRViewerPose

// WebGL2ComputeRenderingContext

function gen_HTMLTextAreaElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('textarea');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTextAreaElement");
    return stm;
}

function gen_HTMLDetailsElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('details');", "document.body.appendChild(", nv, ");"]);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLDetailsElement");
    return stm;
}

// Body

// Credential

// GamepadButton

// BeforeActivateEvent

function gen_IDBOpenDBRequest(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.indexedDB.open(" + getRandomObjectType('string') + ", 4);"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "IDBOpenDBRequest");
    return stm;
}

function gen_MimeTypeArray(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = navigator.mimeTypes;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MimeTypeArray");
    return stm;
}

// BeforeInstallPromptEvent

// TestSpecialOperationsNotEnumerable

// RTCLegacyStatsReport -> not supported

function gen_EventSource(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new EventSource('sse.php');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EventSource");
    return stm;
}

// PermissionStatus

function gen_WebGLSync(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl, 2)}
        ${nv} = ${gl}.fenceSync(${gl}.SYNC_GPU_COMMANDS_COMPLETE, 0);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLSync");
    return stm;
}

// VideoTrack -> not supported

function gen_SubtleCrypto(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.crypto.subtle;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SubtleCrypto");
    return stm;
}

function gen_HTMLMetaElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('meta');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLMetaElement");
    return stm;
}

// Task

function gen_HTMLLegendElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('legend');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLLegendElement");
    return stm;
}

// ExtendableMessageEvent

// IDBDatabase

function gen_URL(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new URL('http://www.example.com');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "URL");
    return stm;
}

function gen_DOMTokenList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var div = makeId();
    var stm = cat([`
        ${div} = document.createElement('div');
        document.body.appendChild(${nv});
        ${nv} = ${div}.classList;
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMTokenList");
    return stm;
}

// DOMFileSystem

// DeprecationReportBody

// IDBObserver

// PushEvent

function gen_SVGFEColorMatrixElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg height="200" width="200" viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg">
            <feColorMatrix id="${nv}" in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0
                            1 1 1 1 0
                            0 0 0 0 0
                            0 0 0 1 0" />
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEColorMatrixElement");
    return stm;
}

// ServiceWorker

// TrustedTypePolicyFactory

function gen_HTMLMenuElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('menu');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLMenuElement");
    return stm;
}

// TestInterfaceEventInitConstructor 

function gen_MessageEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new MessageEvent('worker', {});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MessageEvent");
    return stm;
}

function gen_MediaSession(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = navigator.mediaSession;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaSession");
    return stm;
}

function gen_SVGCircleElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <circle id="${nv}" cx="10" cy="10" r="10"/>
        </svg>\`;

        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGCircleElement");
    return stm;
}

// HTMLPortalElement -> enable portal on chrome

// NodeFilter -> Illegal constructor

function gen_PerformanceMark(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        performance.mark("dog");
        ${nv} = performance.getEntriesByType("mark")[0];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceMark");
    return stm;
}

// CSSTransformValue

function gen_Iterator(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var div = makeId();
    var stm = cat([`
        ${div} = document.createElement('div');
        document.body.appendChild(${nv});
        ${nv} = ${div}.computedStyleMap().keys();
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Iterator");
    return stm;
}

function gen_AnalyserNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var audioCtx = makeId();
    var stm = cat([`
        ${createAudioContext(audioCtx)}
        ${nv} = new AnalyserNode(${audioCtx}, {});
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AnalyserNode");
    return stm;
}

// DeprecatedStorageQuota


function gen_SVGSymbolElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <symbol id="${nv}" width="10" height="10" viewBox="0 0 2 2">
                <circle cx="1" cy="1" r="1" />
            </symbol>
        </svg>\`;

        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGSymbolElement");
    return stm;
}

// peerConnectionCountLimit

// FileWriterCallback

// TextEvent

// OverscrollEvent

// WindowOrWorkerGlobalScope

function gen_ANGLEInstancedArrays(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('ANGLE_instanced_arrays');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ANGLEInstancedArrays");
    return stm;
}

function gen_HTMLAudioElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('audio');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLAudioElement");
    return stm;
}

function gen_SVGFEMergeNodeElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feMerge>
                <feMergeNode id="${nv}" in="blur2" />
            </feMerge>
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEMergeNodeElement");
    return stm;
}

// IDBObservation

function gen_HTMLTableElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('table');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTableElement");
    return stm;
}

function gen_Event(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, ` = new Event('${getBindingRandObjectType("typeEventListener")}');`], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Event");
    return stm;
}

function gen_BarProp(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.personalbar;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "BarProp");
    return stm;
}

// HTMLHyperlinkElementUtils -> mixin

// FileEntrySync

// RTCStatsReport

function gen_SVGStyleElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <style id="${nv}" />
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGStyleElement");
    return stm;
}

function gen_SVGPolygonElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <polygon id="${nv}" points="0,100 50,25 50,75 100,0" />
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGPolygonElement");
    return stm;
}

// CSSFontFaceRule

function gen_ClipboardEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new ClipboardEvent('copy');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ClipboardEvent");
    return stm;
}

function gen_SpeechSynthesisErrorEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new SpeechSynthesisUtterance('a');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SpeechSynthesisErrorEvent");
    return stm;
}

function gen_OscillatorNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var audioCtx = makeId();
    var stm = cat([`
        ${createAudioContext(audioCtx)}
        ${nv} = new OscillatorNode(${audioCtx}, {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OscillatorNode");
    return stm;
}

function gen_HTMLObjectElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('object');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLObjectElement");
    return stm;
}

function gen_CustomEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new CustomEvent('" + makeId() + "', {});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CustomEvent");
    return stm;
}

// MojoHandle

// TrackDefault -> not supported

function gen_HTMLMeterElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('meter');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLMeterElement");
    return stm;
}

function gen_SVGFEPointLightElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feSpecularLighting result="spotlight" specularConstant="1.5"
            specularExponent="80" lighting-color="#FFF">
                <fePointLight id="${nv}" x="50" y="50" z="220"/>
            </feSpecularLighting>
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEPointLightElement");
    return stm;
}

// ReportBody

// WebGLUniformLocation 


function gen_HTMLBodyElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('body');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLBodyElement");
    return stm;
}

// TestVariadicConstructorArguments

function gen_HTMLLabelElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('label');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLLabelElement");
    return stm;
}

// EntryCallback

function gen_FederatedCredential(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new FederatedCredential({provider: 'https://www.google.com/', id: '" + nv + "'});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "FederatedCredential");
    return stm;
}

// MediaStreamTrackEvent

// ServiceWorkerRegistration -> promise

// EntrySync

function gen_WebGLRenderingContext(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var canvas = makeId();
    var stm = cat([`
        ${gen_HTMLCanvasElement(canvas)}
        ${nv} = ${canvas}.getContext('webgl');
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLRenderingContext");
    return stm;
}

// Report

function gen_PerformanceNavigationTiming(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = performance.getEntriesByType('navigation')[0];"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceNavigationTiming");
    return stm;
}

// FetchEvent

function gen_DocumentFragment(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new DocumentFragment();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DocumentFragment");
    return stm;
}

function gen_Float32Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Float32Array();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Float32Array");
    return stm;
}

function gen_HTMLTableColElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('col');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTableColElement");
    return stm;
}

// Magnetometer

function gen_RadioNodeList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var foo = makeId();
    var form = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <form id="${form}">
            <input type="radio" name="${foo}" value="10" /> foo 
            <input type="radio" name="${foo}" value="30" /> bar 
        </form>
        \`;

        ${form} = document.getElementById("${form}");
        ${nv} = ${form}.elements.${foo};
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RadioNodeList");
    return stm;
}

function gen_SVGScriptElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`<svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <script id="${nv}" type="text/javascript"></script>
        </svg>\`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGScriptElement");
    return stm;
}

// BarcodeDetector

function gen_HTMLModElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('ins');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLModElement");
    return stm;
}

// RelatedApplication

function gen_Path2D(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Path2D();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Path2D");
    return stm;
}

function gen_SVGFEImageElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feImage id="${nv}" xlink:href=""/>
        </svg>
        \`;
        ${nv} = document.getElementById("${nv}");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEImageElement");
    return stm;
}

function gen_PannerNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var audioCtx = makeId();
    var stm = cat([`
        ${createAudioContext(audioCtx)}
        ${nv} = new PannerNode(${audioCtx});
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PannerNode");
    return stm;
}

function gen_WebGLTransformFeedback(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl, 2)}
        ${nv} = ${gl}.createTransformFeedback();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLTransformFeedback");
    return stm;
}

// NavigatorCookies

// CSS -> Illegal constructor

// AccessibleNode

function gen_EventTarget(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new EventTarget();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EventTarget");
    return stm;
}

function gen_GamepadList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = navigator.getGamepads();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "GamepadList");
    return stm;
}

// CSSPerspective

function gen_ArrayBuffer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new ArrayBuffer(8);"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ArrayBuffer");
    return stm;
}

// DetectedBarcode

// NonDocumentTypeChildNode

function gen_WebGLQuery(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl, 2)}
        ${nv} = ${gl}.createQuery();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLQuery");
    return stm;
}

// BackgroundFetchRegistration

function gen_Touch(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var eventTarget = getRandomObjectType("EventTarget");
    var stm = "";
    if (eventTarget === -1) {
        eventTarget = makeId();
        stm += cat([eventTarget, " = new EventTarget();"]);
    }
    stm += cat([nv, " = new Touch({identifier: 1, target: " + eventTarget + "});"]);
    stm = cat([stm], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Touch");
    return stm;
}

// BluetoothCharacteristicProperties -> Illegal constructor

// RemotePlayback

function gen_VTTCue(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new VTTCue(1 , 2, 'a');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "VTTCue");
    return stm;
}

//ApplicationCacheErrorEvent 

function gen_Notification(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Notification('title', {});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Notification");
    return stm;
}

// Cache -> Illegal constructor

function gen_HTMLDataElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('data');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLDataElement");
    return stm;
}

function gen_XPathExpression(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new XPathEvaluator().createExpression('/');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "XPathExpression");
    return stm;
}

// MediaDeviceInfo
function gen_MediaDeviceInfo(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();


    if (FuzzIncontext) {
        var stm = cat([`navigator.mediaDevices.enumerateDevices()
                    .then(function(devices) {
                      devices.forEach(function(device) {
                        ${nv} = devices[${rand(1000)}%devices.length];
                        addNewObject(${nv}, "MediaDeviceInfo");
                      });
                    })
                    .catch(function(err) {
                    });`], 1);
        runMe(stm)
        return stm
    }
    var stm = cat([`navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
              devices.forEach(function(device) {
                ${nv} = devices[${rand(1000)}%devices.length];
              });
            })
            .catch(function(err) {
            });`], 1);
    addNewObject(nv, "MediaDeviceInfo");
    return stm;
}

function gen_ProgressEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new ProgressEvent(" + getRandomObjectType('HTMLString') + ")"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ProgressEvent");
    return stm;
}

// IDBKeyRange -> Illegal constructor

function gen_HTMLTimeElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('time');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTimeElement");
    return stm;
}

function gen_SVGGeometryElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <path id="${nv}" d="M 10,30
                    A 20,20 0,0,1 50,30
                    A 20,20 0,0,1 90,30
                    Q 90,60 50,90
                    Q 10,60 10,30 z"/>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGGeometryElement");
    return stm;
}

function gen_AbortSignal(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new AbortController().signal;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AbortSignal");
    return stm;
}

// TestInterfaceCustomConstructor

// AudioWorkletGlobalScope

// TestImplements



function gen_OverconstrainedError(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new OverconstrainedError(" + getRandomObjectType('HTMLString') + ", " + getRandomObjectType('HTMLString') + ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OverconstrainedError");
    return stm;
}

function gen_OffscreenCanvasRenderingContext2D(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var offscreenCV = makeId();
    var stm = cat([`
        ${offscreenCV} = new OffscreenCanvas(256, 256);
        ${nv} = ${offscreenCV}.getContext('2d');
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OffscreenCanvasRenderingContext2D");
    return stm;
}

// MediaKeyMessageEvent

// ScrollTimeline

// GPUDevice

function gen_Screen(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.screen;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Screen");
    return stm;
}

function gen_Uint8Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Uint8Array();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Uint8Array");
    return stm;
}

function gen_WebGLProgram(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.createProgram();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLProgram");
    return stm;
}

// ScriptedTaskQueue

function gen_DOMQuad(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new DOMQuad();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMQuad");
    return stm;
}

function gen_Response(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Response();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Response");
    return stm;
}

function gen_XPathNSResolver(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var xPath = makeId();
    var stm = cat([`
        ${xPath} = new XPathEvaluator();
        ${nv} = ${xPath}.createNSResolver(document.createElement('p'));
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "XPathNSResolver");
    return stm;
}

function gen_ApplicationCache(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.applicationCache;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ApplicationCache");
    return stm;
}

function gen_HTMLOptGroupElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('optgroup');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLOptGroupElement");
    return stm;
}

// TextTrackCue

// GPUQueue

function gen_MediaStreamEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new MediaStreamEvent('addstream', {});"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaStreamEvent");
    return stm;
}

// CSSVariableReferenceValue

// Client

function gen_WebGL2RenderingContextBase(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var canvas = makeId();
    var stm = cat([`
        ${canvas} = document.createElement('canvas');
        document.body.appendChild(${canvas});
        ${nv} = ${canvas}.getContext('webgl2');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGL2RenderingContextBase");
    return stm;
}


function gen_SVGTransformList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var svg = makeId();
    var stm = cat([`
        ${svg} = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        document.body.appendChild(${svg});
        ${nv} = ${svg}.createSVGTransform();
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGTransformList");
    return stm;
}

// XR

// AuthenticatorResponse

// DevToolsHost

// NavigatorOnLine

function gen_History(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = history;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "History");
    return stm;
}

// USBOutTransferResult

// TestCallbackFunctions

function gen_SVGPoint(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var svg = makeId();
    var stm = cat([`
        ${svg} = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        document.body.appendChild(${svg});
        ${nv} = ${svg}.createSVGPoint();
    `], 1)
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGPoint");
    return stm;
}

function gen_EXTBlendMinMax(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('EXT_blend_minmax');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EXTBlendMinMax");
    return stm;
}

// CookieChangeEvent

// DirectoryReaderSync

function gen_NodeIterator(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createNodeIterator(document.body);"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "NodeIterator");
    return stm;
}


function gen_MediaList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.styleSheets[0].media;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaList");
    return stm;
}

function gen_AbortController(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new AbortController();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AbortController");
    return stm;
}

// SpeechGrammarList

// WindowClient

// AudioTrack -> not supported

// FileSystemWriter

// AudioParamMap

function gen_SVGAnimationElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg width="120" height="120" viewBox="0 0 120 120" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="100" height="100">
                    <animate id="${nv}" attributeType="XML" attributeName="x" from="-100" to="120" dur="10s" repeatCount="indefinite"/>
                </rect>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimationElement");
    return stm;
}

// TestInheritedLegacyUnenumerableNamedProperties

function gen_SpeechSynthesis(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.speechSynthesis;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SpeechSynthesis");
    return stm;
}

function gen_XMLHttpRequest(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new XMLHttpRequest();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "XMLHttpRequest");
    return stm;
}

function gen_HTMLOListElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('ol');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLOListElement");
    return stm;
}

// CSSConditionRule -> Illegal constructor

// WebGLCompressedTextureETC

function gen_SVGComponentTransferFunctionElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg width="120" height="120" viewBox="0 0 120 120" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <feComponentTransfer>
                    <feFuncA id="${nv}" type="identity"></feFuncA>
                </feComponentTransfer>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGComponentTransferFunctionElement");
    return stm;
}

function gen_Window(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Window");
    return stm;
}

function gen_Animation(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new Animation(
            new KeyframeEffect(
                document.createElement('div'),
                [{ transform: 'translateY(0%)' }, { transform: 'translateY(100%)' }],
                { duration: 3000, fill: 'forwards' }
            ),
            document.timeline
        );
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Animation");
    return stm;
}

function gen_HTMLPreElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('pre');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLPreElement");
    return stm;
}

function gen_CSSMathSum(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <div id="${nv}" style="width: calc(30% - 20px);">abc</div>
        \`;
        ${nv} = document.getElementById('${nv}').computedStyleMap().get('width');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSMathSum");
    return stm;
}

function gen_MemoryInfo(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.performance.memory;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MemoryInfo");
    return stm;
}

// RTCCertificate -> promise

function gen_XMLSerializer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new XMLSerializer();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "XMLSerializer");
    return stm;
}

function gen_PerformanceMeasure(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        performance.measure("measure");
        ${nv} = performance.getEntriesByType("measure")[0];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceMeasure");
    return stm;
}

function gen_MediaStreamAudioDestinationNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MediaStreamAudioDestinationNode(new AudioContext, {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaStreamAudioDestinationNode");
    return stm;
}

function gen_DOMMatrix(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new DOMMatrix();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMMatrix");
    return stm;
}

function gen_SVGViewElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <view id="${nv}" viewBox="0 0 1200 400"/>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGViewElement");
    return stm;
}

function gen_MimeType(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = navigator.mimeTypes[0];"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MimeType");
    return stm;
}

function gen_WebGLCompressedTextureS3TCsRGB(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('WEBGL_compressed_texture_s3tc_srgb');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLCompressedTextureS3TCsRGB");
    return stm;
}

function gen_TextDecoder(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new TextDecoder('windows-1251');"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TextDecoder");
    return stm;
}

// StylePropertyMap

function gen_StyleMedia(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = window.styleMedia;"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "StyleMedia");
    return stm;
}

function gen_SVGDefsElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <defs id="${nv}">
                <circle id="myCircle" cx="0" cy="0" r="5" />
            </defs>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGDefsElement");
    return stm;
}

function gen_SVGRectElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <rect id="${nv}" x="120" width="100" height="100" rx="15" />
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGRectElement");
    return stm;
}

function gen_Gyroscope(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new Gyroscope();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Gyroscope");
    return stm;
}

// WindowEventHandlers

// SyncEvent

function gen_HTMLMapElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('map');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLMapElement");
    return stm;
}

function gen_MessageChannel(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new MessageChannel();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MessageChannel");
    return stm;
}

function gen_HTMLShadowElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('shadow');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLShadowElement");
    return stm;
}

// IDBObjectStore

// WorkletGroupEffectProxy

function gen_SVGUseElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <use id="${nv}" href="#myCircle" x="10" fill="blue"/>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGUseElement");
    return stm;
}


// AnimationTimeline

// TestInterfaceConstructor4

function gen_SVGImageElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <image id="${nv}" xlink:href="https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png" height="200" width="200"/>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGImageElement");
    return stm;
}

// TouchList

function gen_FormData(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = new FormData();"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "FormData");
    return stm;
}

// TestInterfaceCheckSecurity

// AmbientLightSensor

// TaskWorkletGlobalScope

// SQLTransaction

// MediaKeys

// PopStateEvent

// SpeechRecognition

function gen_HTMLHeadingElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElement('h1');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLHeadingElement");
    return stm;
}

function gen_HTMLCanvasElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([nv, " = document.createElementNS('http://www.w3.org/1999/xhtml','canvas');", "document.body.appendChild(", nv, ");"], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLCanvasElement");
    return stm;
}

// PagePopupController

// Lock -> promise

// ElementInternals

// NoncedElement

function gen_SVGFEGaussianBlurElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feGaussianBlur id="${nv}" in="SourceGraphic" stdDeviation="5" />
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEGaussianBlurElement");
    return stm;
}

// ScriptedTaskQueueController

function gen_OESTextureHalfFloat(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('OES_texture_half_float');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OESTextureHalfFloat");
    return stm;
}

// AudioNode

// KeyboardLayoutMap -> promise

// AudioScheduledSourceNode

function gen_ShadowRoot(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.querySelector('body').createShadowRoot();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ShadowRoot");
    return stm;
}

// MIDIPort

function gen_SVGFEFuncBElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feComponentTransfer>
                <feFuncB id="${nv}" type="identity"></feFuncB>
            </feComponentTransfer>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEFuncBElement");
    return stm;
}

function gen_UIEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new UIEvent('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "UIEvent");
    return stm;
}

// Coordinates

function gen_PaymentRequestUpdateEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new PaymentRequestUpdateEvent('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PaymentRequestUpdateEvent");
    return stm;
}

function gen_MediaQueryList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.matchMedia('(max-width: 600px)');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaQueryList");
    return stm;
}

function gen_NodeList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.body.childNodes;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "NodeList");
    return stm;
}

// DocumentAndElementEventHandlers

function gen_Document(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new Document();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Document");
    return stm;
}

// Sensor -> Illegal constructor

// SpeechSynthesisVoice

// SVGUnitTypes

// CSSMatrixComponent

function gen_SVGForeignObjectElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <foreignObject id="${nv}" x="20" y="20" width="160" height="160" />
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGForeignObjectElement");
    return stm;
}

// CSPViolationReportBody

function gen_SVGMarkerElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <marker id="${nv}" viewBox="0 0 10 10" refX="0" refY="5" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto"> 
            </marker>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGMarkerElement");
    return stm;
}

// TrustedTypePolicy

// MIDIAccess -> promise

// RTCQuicStream

// TestConstants

// CSSPageRule -> Illegal constructor

function gen_EXTColorBufferHalfFloat(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('EXT_color_buffer_half_float');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EXTColorBufferHalfFloat");
    return stm;
}

// DetectedFace

function gen_SVGPathElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <path id="${nv}" d="M 10,30
            A 20,20 0,0,1 50,30
            A 20,20 0,0,1 90,30
            Q 90,60 50,90
            Q 10,60 10,30 z"/>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGPathElement");
    return stm;
}

// FontFaceSource

function gen_PerformanceServerTiming(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = performance.getEntriesByType('resource')[0];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceServerTiming");
    return stm;
}

// DocumentType

function gen_DOMRectList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.documentElement.getClientRects();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMRectList");
    return stm;
}

// PushSubscription

// WebGLCompressedTextureASTC

function gen_StorageEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new StorageEvent('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "StorageEvent");
    return stm;
}


function gen_OffscreenCanvas(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new OffscreenCanvas(100, 100);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OffscreenCanvas");
    return stm;
}

// BluetoothDevice

// PositionError

function gen_PointerEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new PointerEvent('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PointerEvent");
    return stm;
}

// USBEndpoint

// WebGLTimerQueryEXT -> not supported

// MIDIInput -> Illegal constructor

function gen_LinearAccelerationSensor(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new LinearAccelerationSensor();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "LinearAccelerationSensor");
    return stm;
}

// MediaStreamAudioSourceNode

// BatteryManager -> promise

// XRView

function gen_XMLHttpRequestUpload(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new XMLHttpRequest().upload;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "XMLHttpRequestUpload");
    return stm;
}


function gen_WebGLDepthTexture(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('WEBGL_depth_texture');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLDepthTexture");
    return stm;
}

// AudioTrackList

// PaymentResponse

function gen_SVGFEOffsetElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg width="${randInt()}" height="${randInt()}" viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter class="${randArray(ListCssClass)}" width="${randInt()}" height="${randInt()}">
                <feOffset id="${nv}" in="SourceGraphic" dx="${randInt()}" dy="${randInt()}" />
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEOffsetElement");
    return stm;
}

// RTCQuicStreamEvent

// SQLStatementCallback

// PushMessageData

function gen_HTMLTitleElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('title');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTitleElement");
    return stm;
}

// FileSystemCallback

// Bluetooth

// ReadableStreamDefaultController

// FileSystemFileHandle

function gen_HTMLVideoElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('video');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLVideoElement");
    return stm;
}

function gen_WaveShaperNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new WaveShaperNode(new AudioContext(), {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WaveShaperNode");
    return stm;
}

function gen_TimeRanges(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var video = makeId();
    var stm = cat([`
        ${video} = document.createElement('video');
        document.body.appendChild(${video});
        ${nv} = ${video}.buffered;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TimeRanges");
    return stm;
}

// ComputedAccessibleNode

// ActivateInvisibleEvent

// WorkletGlobalScope

// XRStationaryReferenceSpace

function gen_NavigatorDeviceMemory(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = navigator.deviceMemory
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "NavigatorDeviceMemory");
    return stm;
}

function gen_MediaCapabilities(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = navigator.mediaCapabilities;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaCapabilities");
    return stm;
}

// CSSFontFeatureValuesRule

// FormDataEvent

function gen_Storage(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.localStorage;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Storage");
    return stm;
}

// ParentNode

function gen_EXTShaderTextureLOD(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('EXT_shader_texture_lod');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EXTShaderTextureLOD");
    return stm;
}

function gen_WebGLCompressedTextureS3TC(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = (
            ${gl}.getExtension('WEBGL_compressed_texture_s3tc') ||
            ${gl}.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
            ${gl}.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc')
          );
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLCompressedTextureS3TC");
    return stm;
}

// USBConnectionEvent

function gen_Location(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.location;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Location");
    return stm;
}

function gen_InputDeviceCapabilities(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new InputDeviceCapabilities();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "InputDeviceCapabilities");
    return stm;
}

function gen_Performance(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.performance;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Performance");
    return stm;
}

function gen_HTMLFrameElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('frame');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLFrameElement");
    return stm;
}

function gen_SVGTextElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <text id="${nv}" x="20" y="35" class="small">My</text>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGTextElement");
    return stm;
}

// XRInputSourceEvent

function gen_CSSMathValue(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <div id="${nv}" style="width: calc(30% - 20px);"></div>
        \`;
        ${nv} = document.getElementById('${nv}').computedStyleMap().get('width');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSMathValue");
    return stm;
}

function gen_HTMLDListElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('dl');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLDListElement");
    return stm;
}

function gen_OESTextureFloat(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('OES_texture_float');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OESTextureFloat");
    return stm;
}

// WebGLMultiDraw

function gen_SpeechSynthesisUtterance(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new SpeechSynthesisUtterance();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SpeechSynthesisUtterance");
    return stm;
}

function gen_HTMLTableCaptionElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('caption');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTableCaptionElement");
    return stm;
}

function gen_SVGLineElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <line id="${nv}" x1="${randInt()}" y1="${randInt()}" x2="${randInt()}" y2="${randInt()}" stroke="black" />
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGLineElement");
    return stm;
}

function gen_AudioWorklet(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new AudioContext().audioWorklet;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AudioWorklet");
    return stm;
}

function gen_SVGAnimatedNumberList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <text id="${nv}" x="${randInt()}" y="${randInt()}" class="${randArray(ListCssClass)}">My</text>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}').rotate;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedNumberList");
    return stm;
}

// USBIsochronousOutTransferPacket

function gen_HTMLOutputElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('output');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLOutputElement");
    return stm;
}

function gen_SVGAnimatedLength(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <rect id="${nv}" fill="green" height="${randInt()}cm" class="${randArray(ListCssClass)}" stroke="black" stroke-width="${randInt()}" width="${randInt()}cm" x="${randInt()}cm" y="${randInt()}cm"/>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}').x;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedLength");
    return stm;
}

// RTCQuicTransport

// PublicKeyCredential

// InputDeviceInfo

// TrustedScriptURL

function gen_DynamicsCompressorNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new AudioContext().createDynamicsCompressor();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DynamicsCompressorNode");
    return stm;
}

function gen_HTMLParagraphElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('p');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLParagraphElement");
    return stm;
}

// BluetoothRemoteGATTServer

// SVGFitToViewBox

// SVGAnimatedAngle

// FileWriter

// BackgroundFetchUpdateUIEvent

// SVGNumberList
function gen_SVGNumberList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <text id="${nv}" x="${randInt()}" y="${randInt()}" class="${randArray(ListCssClass)}">My</text>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}').rotate.baseVal;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGNumberList");
    return stm;
}

// MediaKeySystemAccess -> promise

function gen_AudioDestinationNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new AudioContext().destination;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AudioDestinationNode");
    return stm;
}

// MIDIConnectionEvent

// BackgroundFetchManager

// TrustedHTML

// WakeLockRequest

function gen_HTMLUListElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('ul');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLUListElement");
    return stm;
}

function gen_SVGMPathElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <path d="M-25,-12.5 L25,-12.5 L 0,-87.5 z"
            fill="yellow" stroke="red" stroke-width="7.06"  >
                <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" >
                <mpath id="${nv}" xlink:href="#path1"/>
                </animateMotion>
            </path>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGMPathElement");
    return stm;
}

// ServiceWorkerContainer -> promise

// RTCTrackEvent

// CSSMathProduct

function gen_ConvolverNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new ConvolverNode(new AudioContext(), {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ConvolverNode");
    return stm;
}

// MIDIMessageEvent

function gen_HTMLAllCollection(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.all;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLAllCollection");
    return stm;
}

// DOMStringList

// SpeechSynthesisEvent

// VTTRegion

// CookieStore

// PageTransitionEvent

function gen_TextDecoderStream(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new TextDecoderStream();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TextDecoderStream");
    return stm;
}

// NotificationEvent

// AuthenticatorAttestationResponse

// PaymentRequestEvent

// TestNotEnumerableNamedGetter

function gen_DOMRectReadOnly(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DOMRectReadOnly(1, 2, 3, 4);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMRectReadOnly");
    return stm;
}

// WakeLock

// WebGLContextEvent

// AnimationEffectTimingReadOnly

// WebGL2ComputeRenderingContextBase


function gen_SVGFEBlendElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feBlend id="${nv}" in="SourceGraphic" in2="floodFill" mode="multiply"/>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEBlendElement");
    return stm;
}

// USBDevice

function gen_PerformanceNavigation(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = performance.navigation;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceNavigation");
    return stm;
}

function gen_WritableStream(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new WritableStream();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WritableStream");
    return stm;
}

function gen_CanvasRenderingContext2D(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var canvas = makeId();
    var stm = cat([`
        ${canvas} = document.createElement('canvas');
        document.body.appendChild(${canvas});
        ${nv} = ${canvas}.getContext('2d');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CanvasRenderingContext2D");
    return stm;
}

// FileReaderSync

function gen_SVGEllipseElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse id="${nv}" cx="100" cy="50" rx="100" ry="50" />
        </svg>
    \`;
    ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGEllipseElement");
    return stm;
}

function gen_CSSKeywordValue(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new CSSKeywordValue(${randString()});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSKeywordValue");
    return stm;
}

// XRSession

// PresentationConnectionAvailableEvent

function gen_WebGL2RenderingContext(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${generateWebGL(nv, 2)}
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGL2RenderingContext");
    return stm;
}

// MojoWatcher

function gen_HTMLScriptElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('script');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLScriptElement");
    return stm;
}

function gen_ResizeObserver(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new ResizeObserver(function(e) {})
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ResizeObserver");
    return stm;
}

// TrustedScript

function gen_HTMLTrackElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('track');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTrackElement");
    return stm;
}

function gen_Permissions(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = navigator.permissions;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Permissions");
    return stm;
}

// PerformanceLongTaskTiming

// WebGLMultiview

// TrackDefaultList -> not supported

function gen_PerformanceTiming(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = performance.timing;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceTiming");
    return stm;
}

// SVGFilterPrimitiveStandardAttributes

// VREyeParameters

// EventListener

// FaceDetector

function gen_NamedNodeMap(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('div').attributes;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "NamedNodeMap");
    return stm;
}



function gen_IIRFilterNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new IIRFilterNode(new AudioContext(), { feedforward: [0.00020298, 0.0004059599, 0.00020298], feedback: [1.0126964558, -1.9991880801, 0.9873035442] });

    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "IIRFilterNode");
    return stm;
}

function gen_EXTDisjointTimerQueryWebGL2(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('EXT_disjoint_timer_query');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EXTDisjointTimerQueryWebGL2");
    return stm;
}

function gen_SVGTransform(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var svg = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg id="${svg}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <feDiffuseLighting in="SourceGraphic" result="light"
                lighting-color="white">
                </feDiffuseLighting>
            </svg>
        \`;
        ${nv} = document.getElementById('${svg}').createSVGTransform();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGTransform");
    return stm;
}

// SVGZoomAndPan

function gen_SVGDescElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <desc id="${nv}">
                desc
            </desc>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGDescElement");
    return stm;
}

function gen_WebGLDebugRendererInfo(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('WEBGL_debug_renderer_info');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLDebugRendererInfo");
    return stm;
}

function gen_Uint16Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new Uint16Array();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Uint16Array");
    return stm;
}

// PaymentManager

// TextDetector

// VideoTrackList

// DocumentTimeline

function gen_EXTColorBufferFloat(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl, 2)}
        ${nv} = ${gl}.getExtension('EXT_color_buffer_float');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EXTColorBufferFloat");
    return stm;
}

// SharedWorkerGlobalScope

// DirectoryEntrySync

function gen_HTMLBaseElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('base');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLBaseElement");
    return stm;
}

function gen_SVGAnimatedPreserveAspectRatio(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg id="${nv}" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}').preserveAspectRatio;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedPreserveAspectRatio");
    return stm;
}

// Mojo

function gen_OESElementIndexUint(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('OES_element_index_uint');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OESElementIndexUint");
    return stm;
}

function gen_Blob(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new Blob([]);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Blob");
    return stm;
}

function gen_HTMLBRElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('br');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLBRElement");
    return stm;
}

function gen_LockManager(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = navigator.locks;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "LockManager");
    return stm;
}

function gen_CSSUnparsedValue(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new CSSUnparsedValue([]);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSUnparsedValue");
    return stm;
}

// SpeechRecognitionResult

// MerchantValidationEvent -> not support

// SQLStatementErrorCallback

// VoidCallback

function gen_CSSScale(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = CSSStyleValue.parse('transform', 'translate3d(10px,10px,0) scale(0.5)')[1];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSScale");
    return stm;
}

// CSSMediaRule

// XRReferenceSpace

// CSSStyleRule
function gen_CSSRule(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.styleSheets[${rand(1000)}%document.styleSheets.length].cssRules[0];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSRule");
    return stm;
}

// IntersectionObserverEntry

// PortalActivateEvent

function gen_RTCDataChannel(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`    
        ${nv} = new RTCPeerConnection().createDataChannel("my channel");
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RTCDataChannel");
    return stm;
}

function gen_DOMMatrixReadOnly(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DOMMatrixReadOnly([1,1,1,1,1,1]);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMMatrixReadOnly");
    return stm;
}

// BluetoothUUID

// LayoutConstraints

// ImageBitmap -> promise

function gen_CSSUnitValue(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new CSSUnitValue(5, 'px')
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSUnitValue");
    return stm;
}

function gen_MutationObserver(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MutationObserver(function() {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MutationObserver");
    return stm;
}

function gen_SVGPolylineElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <polyline id="${nv}" points="0,100 50,25 50,75 100,0" />
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGPolylineElement");
    return stm;
}

// GamepadAxisEvent


function gen_CanvasPattern(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var ctx = makeId();
    var pattentCanvas = makeId();
    var stm = cat([`
        ${generateCanvas2DCtx(ctx)}
        ${pattentCanvas} = document.createElement('canvas');
        document.body.appendChild(${pattentCanvas});
        ${nv} = ${ctx}.createPattern(${pattentCanvas}, 'repeat');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CanvasPattern");
    return stm;
}

// CSSImportRule

function gen_SVGNumber(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var svg = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg id="${svg}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            </svg>
        \`;
        ${svg} = document.getElementById('${svg}');
        ${nv} = ${svg}.createSVGNumber();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGNumber");
    return stm;
}

function gen_AudioParam(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var ctx = makeId();
    var stm = cat([`
        ${ctx} = new AudioContext();
        ${nv} = ${ctx}.createGain().gain;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AudioParam");
    return stm;
}

// CSSSkewY

// CSSSkewX

// CSSNumericArray

// WebGLCompressedTexturePVRTC

function gen_MessagePort(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MessageChannel().port1;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MessagePort");
    return stm;
}

function gen_HTMLContentElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('content');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLContentElement");
    return stm;
}

function gen_DOMPoint(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DOMPoint(1,2,3,4);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMPoint");
    return stm;
}

// WebGLDebugShaders

// NavigatorLanguage

// TestCallbackInterface

// LayoutFragment

// Serial

// IDBCursorWithValue

// SpeechGrammar

function gen_RTCDataChannelEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var channel = makeId();
    var stm = cat([`
        ${channel} = new RTCPeerConnection().createDataChannel("chat");
        ${nv} = new RTCDataChannelEvent("datachannel", {"channel": ${channel}});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RTCDataChannelEvent");
    return stm;
}

// SVGElement

function gen_PerformanceResourceTiming(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = performance.getEntriesByType("resource")[0];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceResourceTiming");
    return stm;
}

// EXTDisjointTimerQuery -> no support

// ArrayBufferView

function gen_CloseEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new CloseEvent('close')
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CloseEvent");
    return stm;
}

function gen_SVGFEConvolveMatrixElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter id="emboss">
                <feConvolveMatrix id="${nv}"
                    kernelMatrix="3 0 0
                                0 0 0
                                0 0 -3"/>
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEConvolveMatrixElement");
    return stm;
}

function gen_SourceBufferList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var ctx = makeId();
    var stm = cat([`
        ${nv} = new MediaSource().sourceBuffers;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SourceBufferList");
    return stm;
}

function gen_SVGAnimatedEnumeration(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <pattern id="${nv}" viewBox="0,0,10,10" width="10%" height="10%">
                <polygon points="0,0 2,5 0,10 5,8 10,10 8,5 10,0 5,2"/>
            </pattern>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}').patternUnits;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedEnumeration");
    return stm;
}

// AudioProcessingEvent

// VRDisplayEvent

function gen_HTMLDataListElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var ctx = makeId();
    var stm = cat([`
        ${nv} = document.createElement('datalist');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLDataListElement");
    return stm;
}

function gen_HTMLMediaElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('audio');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLMediaElement");
    return stm;
}

// CSSTransformComponent

// CSSMathMin

// WorkletAnimation

// WebGLDrawBuffers

function gen_WebGLVertexArrayObject(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl, 2)}
        ${nv} = ${gl}.createVertexArray();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLVertexArrayObject");
    return stm;
}

// DeviceMotionEventRotationRate

function gen_CSSRuleList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.styleSheets[${rand(1000)}%(document.styleSheets.length)].cssRules;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSRuleList");
    return stm;
}

// BluetoothAdvertisingEvent

// WorkerInternals

function gen_SensorErrorEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var ctx = makeId();
    var stm = cat([`
        ${nv} = new SensorErrorEvent('SensorErrorEvent', {error: new DOMException()});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SensorErrorEvent");
    return stm;
}

// TestInterfaceDocument

// OESTextureHalfFloatLinear

// NavigatorAutomationInformation

function gen_BigInt64Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new BigInt64Array();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "BigInt64Array");
    return stm;
}

// SQLTransactionErrorCallback

// TestInterface2

// TestInterface5

function gen_SVGAngle(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var svg = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg id="${svg}" viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            </svg>
        \`;
        ${svg} = document.getElementById('${svg}'); 
        ${nv} = ${svg}.createSVGAngle();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAngle");
    return stm;
}

// Database

function gen_PluginArray(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = navigator.plugins;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PluginArray");
    return stm;
}

// PortalHost

// CSSKeyframesRule

// NavigatorID

// CSSMathNegate

// SVGAnimatedInteger
function gen_SVGAnimatedInteger(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter>
                <feConvolveMatrix id="${nv}" class="${randArray(ListCssClass)}"
                    kernelMatrix="${randInt()} ${randInt()} ${randInt()}
                                ${randInt()} ${randInt()} ${randInt()}
                                ${randInt()} ${randInt()} ${randInt()}"/>
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}').orderX;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGAnimatedInteger");
    return stm;
}

function gen_HTMLSelectElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('select');
        document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLSelectElement");
    return stm;
}

function gen_WebGLVertexArrayObjectOES(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('OES_vertex_array_object').createVertexArrayOES();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLVertexArrayObjectOES");
    return stm;
}

// TestSubObject

function gen_TextTrack(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var video = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <video id="${video}" controls width="250" src="https://interactive-examples.mdn.mozilla.net/media/examples/friday.mp4">
                <track default kind="captions" srclang="en" src="https://interactive-examples.mdn.mozilla.net/media/examples/friday.vtt"/>
            </video>
        \`;
        ${nv} = document.getElementById('${video}').textTracks[0];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TextTrack");
    return stm;
}

// WorkerGlobalScope

function gen_HTMLIFrameElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('iframe'); ${nv}.src=${getRandomObjectType("frameurl")};document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLIFrameElement");
    return stm;
}

// GPU

// XRHitResult

function gen_DeviceOrientationEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DeviceOrientationEvent('deviceorientation', {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DeviceOrientationEvent");
    return stm;
}

function gen_WebGLFramebuffer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.createFramebuffer();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebGLFramebuffer");
    return stm;
}

function gen_TouchEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new TouchEvent('a', {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TouchEvent");
    return stm;
}

// SVGURIReference

function gen_HTMLTableCellElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('td');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTableCellElement");
    return stm;
}

function gen_DOMRect(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DOMRect(1,2,3,4);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMRect");
    return stm;
}

// AnimationEffectTiming

// DisplayLockContext

// DetectedText

function gen_XSLTProcessor(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new XSLTProcessor()
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "XSLTProcessor");
    return stm;
}

function gen_WheelEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new WheelEvent('a', {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WheelEvent");
    return stm;
}

function gen_AudioBuffer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new AudioBuffer({length: 1, sampleRate: 8000});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AudioBuffer");
    return stm;
}

function gen_FontFace(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new FontFace('myfont', 'url(myfont.woff)');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "FontFace");
    return stm;
}

// CSSMathInvert

function gen_RTCPeerConnection(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new RTCPeerConnection();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RTCPeerConnection");
    return stm;
}

// MediaKeyStatusMap

// MojoInterfaceRequestEvent

// HashChangeEvent

// SVGStringList
function gen_SVGStringList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var svg = makeId();
    var stm = cat([`
    document.body.innerHTML += \`
        <svg id="${nv}" viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}').requiredExtensions;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGStringList");
    return stm;
}

function gen_HTMLTableSectionElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('tbody');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTableSectionElement");
    return stm;
}

function gen_PerformanceObserver(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new PerformanceObserver(function() {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceObserver");
    return stm;
}


function gen_TextEncoder(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new TextEncoder();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TextEncoder");
    return stm;
}

// VRDisplayCapabilities




function gen_SVGClipPathElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <clipPath id="${nv}" class="${randArray(ListCssClass)}" >
                <circle cx="${randInt()}" cy="${randInt()}" r="${randInt()}" />
            </clipPath>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGClipPathElement");
    return stm;
}

// SQLResultSet

function gen_StorageManager(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = navigator.storage;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "StorageManager");
    return stm;
}


// ExtendableEvent


function gen_DOMParser(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DOMParser();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMParser");
    return stm;
}


function gen_MediaElementAudioSourceNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MediaElementAudioSourceNode(
            new AudioContext(), {mediaElement: document.createElement('audio')}
        );
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaElementAudioSourceNode");
    return stm;
}

// InterventionReportBody

function gen_SVGGradientElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <linearGradient id="${nv}" gradientTransform="rotate(90)" class="${randArray(ListCssClass)}">
            </linearGradient>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGGradientElement");
    return stm;
}

// XRRigidTransform

function gen_HTMLProgressElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('progress');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLProgressElement");
    return stm;
}

// ServiceWorkerGlobalScope

function gen_NetworkInformation(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = navigator.connection;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "NetworkInformation");
    return stm;
}

function gen_HTMLOptionsCollection(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <select id="${nv}">
                <option>1</option>
                <option>2</option>
            </select>
        \`

        ${nv} = document.getElementById('${nv}').options;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLOptionsCollection");
    return stm;
}

// WebGLLoseContext

function gen_TransitionEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new TransitionEvent('TransitionEvent');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TransitionEvent");
    return stm;
}

function gen_SVGFEDisplacementMapElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feDisplacementMap id="${nv}" in2="turbulence" in="SourceGraphic"
            scale="50" xChannelSelector="R" yChannelSelector="G"/>
        </svg>
        \`

        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEDisplacementMapElement");
    return stm;
}

// PhotoCapabilities

// PushSubscriptionOptions

function gen_SharedArrayBuffer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new SharedArrayBuffer(8);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SharedArrayBuffer");
    return stm;
}

// XRRay

// KHRParallelShaderCompile

function gen_FileList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <input id="${nv}" type="file">
    \`
    ${nv} = document.getElementById('${nv}').files;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "FileList");
    return stm;
}

function gen_PaymentRequest(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        var supportedInstruments = [{
            supportedMethods: 'basic-card',
            data: {
            supportedNetworks: ['visa', 'mastercard', 'amex', 'jcb',
                                'diners', 'discover', 'mir', 'unionpay']
            }
        }];
        var details = {
            total: {label: 'Donation', amount: {currency: 'USD', value: '65.00'}},
            displayItems: [
            {
                label: 'Original donation amount',
                amount: {currency: 'USD', value: '65.00'}
            }
            ],
            shippingOptions: [
            {
                id: 'standard',
                label: 'Standard shipping',
                amount: {currency: 'USD', value: '0.00'},
                selected: true
            }
            ]
        };
        
        ${nv} = new PaymentRequest(supportedInstruments, details, {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PaymentRequest");
    return stm;
}

// TestInterfaceNamedConstructor

// SQLTransactionCallback

function gen_External(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.external
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "External");
    return stm;
}

function gen_HTMLFieldSetElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('fieldset');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLFieldSetElement");
    return stm;
}

function gen_CSSStyleDeclaration(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.styleSheets[${rand(1000)}%document.styleSheets.length].cssRules[0].style;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSStyleDeclaration");
    return stm;
}

// BackgroundFetchEvent

function gen_TreeWalker(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createTreeWalker(document.body)
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TreeWalker");
    return stm;
}

// FileCallback

// Node

function gen_ChannelMergerNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new ChannelMergerNode(new AudioContext(), {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ChannelMergerNode");
    return stm;
}

function gen_WebSocket(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new WebSocket('ws://192.168.95.142:8080');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WebSocket");
    return stm;
}

// TestInterfaceEmpty

// EntriesCallback

function gen_StylePropertyMapReadOnly(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <div id="${nv}">test</div>
        \`;
        ${nv} = document.getElementById('${nv}').computedStyleMap();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "StylePropertyMapReadOnly");
    return stm;
}

function gen_GainNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new GainNode(new AudioContext(), {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "GainNode");
    return stm;
}

// ReadableStreamDefaultReader

function gen_InputEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new InputEvent('InputEvent');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "InputEvent");
    return stm;
}

// TestIntegerIndexedGlobal

function gen_Range(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new Range();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Range");
    return stm;
}

// ChannelSplitterNode

function gen_BroadcastChannel(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new BroadcastChannel('BroadcastChannel');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "BroadcastChannel");
    return stm;
}

function gen_SecurityPolicyViolationEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new SecurityPolicyViolationEvent('foo', {
            disposition: 'enforce',
            documentURI: 'localhost:3000',
            effectiveDirective: 'effectiveDirective',
            originalPolicy: 'originalPolicy',
            statusCode: 200,
            violatedDirective: 'violatedDirective'
        });
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SecurityPolicyViolationEvent");
    return stm;
}

function gen_DataTransfer(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DataTransfer()
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DataTransfer");
    return stm;
}

// CSSNumericValue

function gen_Comment(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new Comment();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Comment");
    return stm;
}

function gen_CSSTranslate(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();

    var stm = cat([`
        ${nv} = CSSStyleValue.parse('transform', 'translate3d(${randInt()}px,${randInt()}px,${randInt()}) scale(${randFloat()})')[0];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSTranslate");
    return stm;
}

// BluetoothRemoteGATTDescriptor

// CanvasPath

function gen_DOMPointReadOnly(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DOMPointReadOnly(1, 2, 3, 4);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DOMPointReadOnly");
    return stm;
}

// SyncManager

function gen_ProcessingInstruction(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createProcessingInstruction('xml-stylesheet', 'href="mycss.css" type="text/css"');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ProcessingInstruction");
    return stm;
}

function gen_HTMLLIElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('li');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLLIElement");
    return stm;
}

// SVGTests

function gen_SVGSVGElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg id="${nv}" viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGSVGElement");
    return stm;
}

function gen_MediaSource(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MediaSource();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaSource");
    return stm;
}

// DedicatedWorkerGlobalScope



function gen_Int32Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new Int32Array();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Int32Array");
    return stm;
}

// Position

// SpeechRecognitionEvent

// SQLResultSetRowList

// UserActivation

function gen_MediaRecorder(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MediaRecorder(new MediaStream(), {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaRecorder");
    return stm;
}

// SharedWorker


function gen_SVGMetadataElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
                <metadata id="${nv}">
                </metadata>
            </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGMetadataElement");
    return stm;
}

function gen_TextEncoderStream(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new TextEncoderStream()
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TextEncoderStream");
    return stm;
}

function gen_CSSPositionValue(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new CSSPositionValue(CSS.px(${randInt()}), CSS.px(${randInt()}));
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CSSPositionValue");
    return stm;
}

// FileEntry

function gen_EXTTextureFilterAnisotropic(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = (${gl}.getExtension('EXT_texture_filter_anisotropic') ||
        ${gl}.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
        ${gl}.getExtension('WEBKIT_EXT_texture_filter_anisotropic'));
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EXTTextureFilterAnisotropic");
    return stm;
}

// SQLError

function gen_CustomElementRegistry(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.customElements;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CustomElementRegistry");
    return stm;
}

// XRInputSource

// XRBoundedReferenceSpace

function gen_HTMLTemplateElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('template');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLTemplateElement");
    return stm;
}

// AudioWorkletProcessor

function gen_SVGFEMergeElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feMerge id="${nv}">
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEMergeElement");
    return stm;
}

// TestInterfaceNamedConstructor2

function gen_CacheStorage(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.caches;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CacheStorage");
    return stm;
}

// DOMFileSystemSync

function gen_SVGFilterElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter id="${nv}" class="${randArray(ListCssClass)}>
                <feGaussianBlur stdDeviation="5"/>
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFilterElement");
    return stm;
}

// NonElementParentNode

function gen_OrientationSensor(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new AbsoluteOrientationSensor({frequency: 60, referenceFrame: 'device'});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "OrientationSensor");
    return stm;
}

// EnterPictureInPictureEvent

// CredentialUserData

// VRPose

function gen_HTMLUnknownElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('${nv}');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLUnknownElement");
    return stm;
}

// RTCError

// RelativeOrientationSensor

// CSSSkew

// XRRenderState

function gen_DragEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new DragEvent('DragEvent');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "DragEvent");
    return stm;
}

// UnderlyingSourceBase

function gen_HTMLHRElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('hr');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLHRElement");
    return stm;
}

// LayoutChild

// MIDIInputMap

function gen_HTMLPictureElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('picture');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLPictureElement");
    return stm;
}
// something wrong with this func
function gen_SVGFEDistantLightElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter class="${randArray(ListCssClass)}>
                <feDiffuseLighting in="SourceGraphic" result="light"
                    lighting-color="white">
                    <feDistantLight id="${nv}" class="${randArray(ListCssClass)} azimuth="${randInt()}" elevation="${randInt()}"/>
                </feDiffuseLighting>
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEDistantLightElement");
    return stm;
}

// TestIntegerIndexed

// XRSessionEvent

// HTMLElement

// InstallEvent

function gen_XPathResult(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.evaluate("/html/body//h2", document, null, XPathResult.ANY_TYPE, null);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "XPathResult");
    return stm;
}

// WebGLRenderingContextBase

// FeaturePolicyViolationReportBody

// MediaStreamTrack

function gen_CanvasGradient(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var ctx = makeId();
    var stm = cat([`
        ${generateCanvas2DCtx(ctx)}
        ${nv} = ${ctx}.createLinearGradient(1,2,3,4);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "CanvasGradient");
    return stm;
}

function gen_MediaQueryListEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MediaQueryListEvent({media: 'media', matches: true});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaQueryListEvent");
    return stm;
}

function gen_PeriodicWave(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new PeriodicWave(new AudioContext(), {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PeriodicWave");
    return stm;
}

function gen_SVGMaskElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <mask id="${nv}" class="${randArray(ListCssClass)}">
            </mask>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGMaskElement");
    return stm;
}

function gen_PerformanceEntry(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = performance.getEntries()[0];
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "PerformanceEntry");
    return stm;
}

// ScreenOrientation

function gen_HTMLMarqueeElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('marquee');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLMarqueeElement");
    return stm;
}

// MojoInterfaceInterceptor

function gen_WorkerNavigator(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.self.navigator;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "WorkerNavigator");
    return stm;
}

function gen_Clipboard(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = navigator.clipboard;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Clipboard");
    return stm;
}

// AnimationPlaybackEvent

function gen_MediaMetadata(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MediaMetadata();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MediaMetadata");
    return stm;
}

// TestInterfaceConstructor

// PaintRenderingContext2D

// AbortPaymentEvent

// USB

function gen_HTMLFontElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('font');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLFontElement");
    return stm;
}

// PerformanceElementTiming

function gen_SVGLinearGradientElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <linearGradient id="${nv}" gradientTransform="rotate(90)">
            </linearGradient>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGLinearGradientElement");
    return stm;
}

function gen_SVGFETurbulenceElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <feTurbulence id="${nv}" type="turbulence" baseFrequency="0.05"
            numOctaves="${randInt()}" result="turbulence"/>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFETurbulenceElement");
    return stm;
}

function gen_AudioListener(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new AudioContext().listener;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "AudioListener");
    return stm;
}

function gen_StereoPannerNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new AudioContext().createStereoPanner();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "StereoPannerNode");
    return stm;
}

function gen_HTMLAnchorElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('a');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLAnchorElement");
    return stm;
}

function gen_EXTsRGB(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var gl = makeId();
    var stm = cat([`
        ${generateWebGL(gl)}
        ${nv} = ${gl}.getExtension('EXT_sRGB');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "EXTsRGB");
    return stm;
}

function gen_ReportingObserver(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new ReportingObserver(function(r, e){})
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ReportingObserver");
    return stm;
}

// Presentation

// IDBObserverChanges

function gen_SVGFEFuncRElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter class="${randArray(ListCssClass)}" x="${randInt()}" y="${randInt()}" width="${randInt()}%" height="${randInt()}%">
                <feComponentTransfer>
                    <feFuncR id="${nv}" type="identity"></feFuncR>
                </feComponentTransfer>
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEFuncRElement");
    return stm;
}

// AccessibilityRole

function gen_URLSearchParams(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new URLSearchParams();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "URLSearchParams");
    return stm;
}

// XRPose

// TestInterfaceOriginTrialEnabled

function gen_MouseEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new MouseEvent('MouseEvent', {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "MouseEvent");
    return stm;
}

function gen_Attr(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
            <div id="${nv}">Attr</div>
        \`;
        ${nv} = document.getElementById('${nv}').getAttributeNode('id');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Attr");
    return stm;
}

function gen_TrackEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new TrackEvent('TrackEvent');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TrackEvent");
    return stm;
}

// WebGLActiveInfo

// BluetoothLEScan

// CharacterData

// IdleStatus

// PerformanceLayoutJank

function gen_SVGGElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <g id="${nv}" fill="white" stroke="green" stroke-width="5" class="${randArray(ListCssClass)}>
            </g>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGGElement");
    return stm;
}

function gen_HTMLStyleElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('style');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLStyleElement");
    return stm;
}

// TestTypedefs

// USBInTransferResult

// TestInterfaceConstructor3

function gen_Uint8ClampedArray(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new ImageData(100, 100).data;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Uint8ClampedArray");
    return stm;
}

function gen_HTMLImageElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('img');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLImageElement");
    return stm;
}

function gen_BigUint64Array(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new BigUint64Array();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "BigUint64Array");
    return stm;
}

// RTCStatsResponse

// TaskWorklet

function gen_StyleSheetList(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.styleSheets;
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "StyleSheetList");
    return stm;
}

function gen_Element(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('div');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "Element");
    return stm;
}

// BluetoothServiceDataMap

// TestNode

function gen_SVGFEFloodElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter id="floodFilter" filterUnits="userSpaceOnUse">
                <feFlood id="${nv}" x="${randInt()}" y="${randInt()}" width="${randInt()}" height="${randInt()}" class="${randArray(ListCssClass)}"
                    flood-color="green" flood-opacity="0.5"/>
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEFloodElement");
    return stm;
}

// TestInterfaceSecureContext

function gen_IDBRequest(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = window.indexedDB.open("toDoList", 4);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "IDBRequest");
    return stm;
}

// GamepadPose

function gen_HTMLSlotElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('slot')
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLSlotElement");
    return stm;
}

function gen_SVGRadialGradientElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <radialGradient id="${nv}" class="${randArray(ListCssClass)}>
                <stop offset="${randInt()}%" stop-color="gold" />
                <stop offset="${randInt()}%" stop-color="red" />
            </radialGradient>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGRadialGradientElement");
    return stm;
}

function gen_BiquadFilterNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new BiquadFilterNode(new AudioContext(), {})
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "BiquadFilterNode");
    return stm;
}



function gen_RTCSessionDescription(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new RTCSessionDescription({});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "RTCSessionDescription");
    return stm;
}

// USBAlternateInterface

function gen_FontFaceSetLoadEvent(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new FontFaceSetLoadEvent("FontFaceSetLoadEvent", {});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "FontFaceSetLoadEvent");
    return stm;
}

function gen_HTMLParamElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = document.createElement('param');document.body.appendChild(${nv});
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "HTMLParamElement");
    return stm;
}

function gen_SVGTitleElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <title id="${nv}" class="${randArray(ListCssClass)}">I'm a circle</title>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGTitleElement");
    return stm;
}

function gen_TransformStream(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new TransformStream();
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "TransformStream");
    return stm;
}

function gen_SVGFEComponentTransferElement(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        document.body.innerHTML += \`
        <svg viewBox="${randInt()} ${randInt()} ${randInt()} ${randInt()}" class="${randArray(ListCssClass)}" xmlns="http://www.w3.org/2000/svg">
            <filter x="${randInt()}" y="${randInt()}" width="${randInt()}%" height="${randInt()}%">
                <feComponentTransfer id="${nv}" class="${randArray(ListCssClass)}">
                </feComponentTransfer>
            </filter>
        </svg>
        \`;
        ${nv} = document.getElementById('${nv}');
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "SVGFEComponentTransferElement");
    return stm;
}

// Scheduling

function gen_ScriptProcessorNode(id = "") {
    var nv = id;
    if (nv == "")
        nv = makeId();
    var stm = cat([`
        ${nv} = new AudioContext().createScriptProcessor(4096, 1, 1);
    `], 1);
    if (FuzzIncontext) {
        runMe(stm)
    }
    addNewObject(nv, "ScriptProcessorNode");
    return stm;
}

// MIDIOutputMap

// SpeechRecognitionAlternative

// USBInterface
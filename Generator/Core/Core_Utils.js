// for support context-dependent fuzz(bundle into a single file), we should not put these functions to classes.

var RandomProtoCache = [];
var countO = 0;
var WorkingObjectType = 'Object';
var listObjectGenerating = [];
function rand(n) {
  return Math.floor(Math.random() * n);
}

function randArray(a, debug = 0) {
  if (a == []) return null;
  var ret = a[rand(a.length)];
  if (debug) console.log('===>' + ret);
  return ret;
}

function cat(data, is_wrap = 0, debug = 0) {
  if (debug) {
    console.log('===>' + data);
    undefined.xxx = 1;
  }
  var s = '';
  for (var i = 0; i < data.length; ++i) {
    var c = data[i];
    if (isNaN(c)) {
      if (typeof c != 'string') {
        if (debug) console.log('NOT A STRING' + data + ':' + data[i]);
        // trigger stop generator
        undefined.xxx = 1;
      }
    } else c = data[i].toString();
    s += c;
  }
  if (is_wrap) return 'try{' + s + '}catch(e){};';
  return s;
}

function makeExpr(d, b) {
  if (rnd(TOTALLY_RANDOM) == 2) return totallyRandom(d, b);

  if (d <= 0 || rnd(7) === 1) return makeTerm(d - 1, b);

  if (rnd(6) === 1 && b.length) return Random.index(b);

  if (rnd(10) === 1) return makeImmediateRecursiveCall(d, b);

  d = rnd(d); // !

  var expr = Random.index(exprMakers)(d, b);

  if (rnd(4) === 1) return '(' + expr + ')';
  else return expr;
}

function getMethodsByName(name) {
  if (ListObjectTypes.hasOwnProperty(name) == false) {
    if (isDebug) console.log('FAIL in getMethodsByName: ' + name);
    undefined.xx = 1;
  }
  if (ListObjectTypes[name].p_typename === '')
    return ListObjectTypes[name].methods;
  return {
    ...getMethodsByName(ListObjectTypes[name].p_typename),
    ...ListObjectTypes[name].methods,
  };
}

function getPropertiesByName(name) {
  if (ListObjectTypes[name].p_typename == '')
    return ListObjectTypes[name].properties;
  return {
    ...getPropertiesByName(ListObjectTypes[name].p_typename),
    ...ListObjectTypes[name].properties,
  };
}

function parse_method(mt_name, pickone) {
  // return value = {type: , method_name: , arg:{args}| number , exception }
  //pickone = {'rai_exc': 1, 'void': {'arg0': 'Float32Array', 'arg1': 'Float32Array', 'arg2': 'Float32Array'}, 'numarg': 3}
  return_value = {};
  return_value['type'] = mt_name;
  for (var key in pickone) {
    if (key == 'rai_exc') return (return_value[key] = pickone[key]);
    else if (key == 'numarg') {
      numarg = 3;
    }
  }
}

// forwat: 0 -> anything; 1 -> good return value
function getRandom_Method(obj, forwat = 0, myList = null) {
  // return -1; {'type': , 'name': , 'args':{args}| number , 'rai_exc' }
  if (myList === null) myList = ListObjectTypes;
  // console.log(ListObjectTypes)
  // console.log(obj)
  //'methods': {'getModifierState': [{'rai_exc': 0, 'type': 'boolean', 'args': {'arg0': 'DOMString'}, 'numarg': 1}], }
  var type = '';
  if (obj.name == undefined) type = obj;
  else type = obj.type;
  WorkingObjectType = type;
  if (!myList.hasOwnProperty(type)) {
    console.log(type);
    return -1;
  }

  if (RandomProtoCache.indexOf(type) < 0) {
    var methods = getMethodsByName(type);
    var properties = getPropertiesByName(type);
    RandomProtoCache[type] = { methods: methods, properties: properties };
  }

  var methods = RandomProtoCache[type].methods;
  if (obj.type == type)
    if (Object.keys(obj.new_methods).length !== 0)
      // concat new_method with base method
      methods = { ...methods, ...obj.new_methods };
  arr_mt = Object.keys(methods);
  if (arr_mt.length === 0) return -1;
  if (forwat == 0) {
    //anything
    var mt = randArray(arr_mt);
    var pickone = randArray(methods[mt]);
    pickone['name'] = mt;
    return pickone;
  }
  if (forwat == 1) {
    var mt = randArray(arr_mt);
    // try get random good method
    for (var i = 0; i < 3; i++) {
      var k = rand(arr_mt.lenght);
      for (k; k < arr_mt.lenght; k++) {
        var mt = arr_mt[k];
        var pickone = methods[mt];
        if (myList.hasOwnProperty(pickone['type'])) {
          pickone['name'] = mt;
          return pickone;
        }
      }
    }
    // can't random -> try from 0-> end to confirm nothing here
    for (var k = 0; k < arr_mt.lenght; k++) {
      var mt = arr_mt[k];
      var pickone = methods[mt];
      if (myList.hasOwnProperty(pickone['type'])) {
        pickone['name'] = mt;
        return pickone;
      }
    }
  }
  return -1;
}

function escapse(str) {
  var result = '';
  var j = '';
  for (var i in str) {
    if (str[i] == '"' && j != '\\') {
      result += '\\';
    }
    if (str[i] == "'" && j != '\\') {
      result += '\\';
    }
    result += str[i];
    j = str[i];
  }
  return result;
}

// forwat: 0 -> read only; 1 -> read,write ; 2-> read write with good value
// level = 0 -> get all properties at current __proto and new define properties
function getRandom_Property(obj, forwat = 0, level = 0, myList = null) {
  // return -1 or [ name:property_name, type:]
  if (myList == null) {
    myList = ListObjectTypes;
  }
  var type = '';
  if (obj.name == undefined) type = obj;
  else type = obj.type;
  WorkingObjectType = type;
  if (!myList.hasOwnProperty(type)) {
    if (isDebug)
    {
      console.log(type);
      undefined.xx = 1;
    }
    return -1;
  }
  if (RandomProtoCache.indexOf(type) < 0) {
    var methods = getMethodsByName(type);
    var properties = getPropertiesByName(type);
    RandomProtoCache[type] = { methods: methods, properties: properties };
  }
  var properties = RandomProtoCache[type]['properties'];
  if (obj.type == type)
    if (level == 0 && Object.keys(obj.new_properties).length !== 0)
      properties = { ...properties, ...obj.new_properties }; // concat new_properties with base properties
  //'properties': {'code': {'readonly': 'True', 'type': 'DOMString'}, }
  var arr_prop = Object.keys(properties);
  if (arr_prop.length === 0) return -1;
  var prop = '';
  if (forwat == 0) {
    // anything
    prop = randArray(arr_prop);
    return { name: prop, type: properties[prop]['type'] };
  }
  if (forwat == 1) {
    // not readonly, for asign new value
    //try pick random
    var k = rand(arr_prop.length);
    for (k; k < arr_prop.length; k++) {
      if (prop != '') break;

      if (properties[arr_prop[k]]['readonly'] == 'None') {
        // not readonly
        prop = arr_prop[k];
        break;
      }
    }
    if (prop != '') return { name: prop, type: properties[prop]['type'] };

    // random can't get it, try from start to end to confirm nothing here
    for (var k = 0; k < arr_prop.length; k++) {
      if (prop != '') break;
      if (properties[arr_prop[k]]['readonly'] == 'None') {
        // not readonly
        prop = arr_prop[k];
      }
      if (prop != '') return { name: prop, type: properties[prop]['type'] };
    }
    if (prop == '') return -1;
  }
  if (forwat == 2) {
    //good return value
    //try pick random
    for (var i = 0; i < 3; i++) {
      var k = rand(arr_prop.length);
      for (k; k < arr_prop.length; k++) {
        if (prop != '') break;
        var return_type = properties[arr_prop[k]]['type'].replace('_Ar', '');
        if (
          myList.hasOwnProperty(return_type) &&
          properties[arr_prop[k]]['readonly'] == 'None'
        ) {
          // good value
          prop = arr_prop[k];
          break;
        }
      }
      if (prop != '') return { name: prop, type: properties[prop]['type'] };
    }
    // random can't get it, try from start to end to confirm nothing here
    for (var k = 0; k < arr_prop.length; k++) {
      var return_type = properties[arr_prop[k]]['type'].replace('_Ar', '');
      if (myList.hasOwnProperty(return_type)) {
        // good value
        prop = arr_prop[k];
        break;
      }
    }
    if (prop != '') return { name: prop, type: properties[prop]['type'] };
    else return -1;
  }
  if (isDebug) console.log('NOT SUPPORT TYPE: ' + type + forwat + level);
  return -1;
}

function checkTypeInside(type_obj, type_name) {
  if (!ListObjectTypes.hasOwnProperty(type_obj)) {
    // we dont interface for this object
    if (isDebug) console.log('havent implemented interface:' + type_obj);
    return -1;
  }
  if (type_obj.indexOf(type_name) !== -1) return 1;
  if (type_name.includes('Array') && type_obj.includes('_Ar')) return 1;
  if (ListObjectTypes[type_obj].has_parrent)
    return checkTypeInside(ListObjectTypes[type_obj].p_typename, type_name);
  else return -1;
}

function randFloat(typename = '') {
  if (typename == '')
    return randArray([
      -2,
      rand(0x10),
      rand(2),
      -(2 ** rand(65)),
      2 ** rand(65) + 1,
    ]);
  else {
    var ar = typename.split('-');
    let min = ar[1];
    let max = ar[2];
    return Math.random() * (max - min) + parseFloat(min);
  }
}
function randInt(typename = '') {
  if (typename == '')
    return randArray([
      -2,
      rand(0x10),
      1,
      2,
      3,
      4,
      -(2 ** rand(64)) + rand(4),
      2 ** rand(64) + rand(4),
    ]);
  else {
    var ar = typename.split('-');
    let min = ar[1];
    let max = ar[2];
    if (rand(2) == 0) return -(rand(max - min) + parseInt(min));
    else return rand(max - min) + parseInt(min);
  }
}

function randUnInt(typename = '') {
  if (typename == '')
    return randArray([
      1,
      2,
      3,
      0,
      rand(0x10),
      rand(2),
      2 ** rand(64) + rand(4),
    ]);
  else {
    var ar = typename.split('-');
    let min = ar[1];
    let max = ar[2];
    return rand(max - min) + parseInt(min);
  }
}

function randString() {
  return `unescape('${randHTMLString()}')`;
}

function randHTMLString() {
  return escape(makeAString());
}
function randCoord(max) {
  return '[' + [rand(max), rand(max), rand(max), rand(max)].toString() + ']';
}
function makeAString() {
  var strlen = rand(MAX_STRLEN);
  return_data = '';
  for (var i = 0; i < strlen; i++)
    return_data += String.fromCharCode(rand(0x100));
  return return_data;
}

function randXMLtext() {
  var tags = Object.keys(TagHTML);
  var HTML = '';
  for (let i = 0; i < rand(0x10); i++) {
    let tag = randArray(tags);
    HTML += '<' + tag + '>' + '</' + tag + '>';
  }
  return "'" + HTML + "'";
}

function MakeArrayType(type) {
  let arr = '[ ';
  let count = 2 ** rand(4);
  for (let i = 0; i < count; i++) {
    if (getRandomObjectType(type) == -1) break;
    arr += getRandomObjectType(type) + ',';
  }
  arr = arr.slice(0, arr.length - 1);
  arr += ']';
  return arr;
}

function runMe(stm, ischeck = 0) {
  if (isfunc > 0 || !FuzzIncontext)
    // we dont want excute code in function
    return '';
  // if (rand(15) == 0) {
  //   var t = rand(20) * 100;
  //   stm = 'setInterval(`' + stm + '`,' + t + ');';
  // }
  if (LogAll == 1) {
    Logger(stm);
  } else if (ischeck == 0) {
    Logger(stm);
  }
  return eval(stm); // run it in context
}

function generateObjectType(typename) {
  function removeGeneratingList(typename) {
    var index = listObjectGenerating.indexOf(typename); // we are finishing generate this object, remove it from list
    if (index > -1) {
      listObjectGenerating.splice(index, 1);
    }
  }
  if (listObjectGenerating.indexOf(typename) != -1)
    // break looping here
    return -1;
  listObjectGenerating.push(typename);
  var obj = '';
  if (FuzzBinding) {
    var ret = getBindingObject(typename); // return variable name - or value
    if (ret != -1) {
      if (ret == undefined) undefined.typename = 1;
      removeGeneratingList(typename);
      return ret;
    }

    if (ListDefinedInterfaces.hasOwnProperty(typename)) {
      f = 'gen_' + typename;
      if (Black_list.includes(f)) return -1;
      if (eval('typeof ' + f) === 'function') {
        // set isfunc=0 to push object to global object(ListAllObject)
        var func = eval(f);
        var ret = func();
        obj = GetAnObjectFromList(
          merge2List(ListAllObject, FListAllObject[isfunc]),
          typename
        );
        if (obj !== -1) {
          if (obj == undefined) {
            undefined.typename = 1;
          }
          generatorBuff += ret;
          removeGeneratingList(typename);
          return obj.name;
        }
      }
    }
  }

  if (Fuzzing_Mojo) {
    var ret = getMojoObject(typename);
    if (ret != -1) {
      if (ret == undefined) {
        if (isDebug) console.log('not found: ' + typename);
      }
      removeGeneratingList(typename);
      return ret;
    }
    // fuzz Mojo
    // console.log(typename)
    if (ListMojoObject.hasOwnProperty(typename)) {
      var nv = makeId();
      var ret = GenMojo(typename, nv);
      if (ret == undefined) undefined.typename = 1;
      if (ret != -1) {
        obj = GetAnObjectFromList(
          merge2List(ListAllObject, getFList(FListAllObject)),
          typename
        ); // check to make sure we created this object
        generatorBuff += ret;
        removeGeneratingList(typename);
        return nv;
      } else return -1;
    }
  }

  removeGeneratingList(typename);
  return -1;
}

function GetAnObjectFromList(List, type = '') {
  // if type == "" => pick random
  var keys = Object.keys(List);
  if (keys.length == 0) return -1;
  if (type == '') {
    // pick random
    var type = randArray(keys);
    var obj = randArray(List[type]);
    if (obj == undefined) return -1;
    return obj;
  }
  if (List.hasOwnProperty(type)) {
    // pick follow type
    var obj = randArray(List[type]);
    if (obj == undefined) return -1;
    return obj;
  } // we dont have this object type in List
  else return -1;
}

function removeObjectFromList(List, objname) {
  for (var key in List) {
    var rm_id = -1;
    for (var id in List[key]) {
      // List[key] = [{name:'123', type:abc}, {}...]
      List[key] = List[key].filter(function (el) {
        return el.name !== objname;
      });
    }
  }
}
// @Param
// typename: String => object type we want to get
// @return
// String => object which its type is typename
function getRandomObjectType(typename) {
  // return a string or number
  if (rand(10) == 1) {
    var objname = generateObjectType(typename);
    if (objname != -1) {
      return objname;
    }
  }

  if (rand(3) == 0) {
    //reuse exists objects
    var obj = GetAnObjectFromList(
      merge2List(ListAllObject, getFList(FListAllObject)),
      typename
    );
    // check object still available here
    if (obj !== -1) {
      if (typeof (obj.name === 'string')) {
        if (FuzzIncontext && isfunc == 0) {
          if ([null, undefined, NaN].includes(runMe(obj.name, 1))) {
            // object is null now -> remove
            removeObjectFromList(ListAllObject, obj.name);
            removeObjectFromList(ListObject, obj.name);
            for (var i = 0; i <= isfunc; i++)
              removeObjectFromList(FListAllObject[isfunc], obj.name);
            for (var i = 0; i <= isfunc; i++)
              removeObjectFromList(FListObject[isfunc], obj.name);
            return getRandomObjectType(typename);
          }
        }
        return obj.name;
      } else {
        if (isDebug) {
          console.log(
            'getRandomObjectType with type=' + typename + ' returned undefined'
          );
          undefined.typename = 1;
        }
      }
    }
  }

  if (typename.includes('_Ar')) {
    return MakeArrayType(typename.replace('_Ar', ''));
  }
  if (['Boolean', 'boolean', 'bool', 'Bool'].includes(typename))
    return randArray(['true', 'false']);
  if (typename == 'UnsignedInt') return randUnInt();
  if (typename.includes('Int-')) return randInt(typename);
  if (['int', 'Int'].includes(typename)) return randInt();
  // if((typename == 'Number') || (typename == 'number')) return randInt();
  if (typename == 'None') return randArray(InterestingArg);
  if (typename == 'Void') return randArray(InterestingArg);
  if (['double', 'Double', 'long', 'Long'].includes(typename))
    return randFloat();
  if (typename.includes('Float-')) return randFloat(typename);
  if (typename == 'Float' || typename == 'float') return randFloat();
  if (['Char', 'char'].includes(typename))
    return '"' + String.fromCharCode(rand(0x10000)) + '"';
  if (['String', 'string'].includes(typename)) return randString();
  if (typename == 'Func') {
    if (ListFunctions.length == 0) return '()=>{}';
    else randArray(ListFunctions).name;
  }
  if (typename == 'object') {
    return GetAnObjectFromList(
      merge2List(ListAllObject, getFList(FListAllObject))
    ).name;
  }
  if (typename == 'mySelf_prop') {
    return getRandom_Property(WorkingObjectType).name;
  }

  var obj = GetAnObjectFromList(
    merge2List(ListAllObject, getFList(FListAllObject)),
    typename
  );
  // check object still available here
  if (obj !== -1) {
    if (typeof (obj.name === 'string')) {
      if (FuzzIncontext && isfunc == 0) {
        if ([null, undefined, NaN].includes(runMe(obj.name, 1))) {
          // object is null now -> remove
          removeObjectFromList(ListAllObject, obj.name);
          removeObjectFromList(ListObject, obj.name);
          for (var i = 0; i <= isfunc; i++)
            removeObjectFromList(FListAllObject[isfunc], obj.name);
          for (var i = 0; i <= isfunc; i++)
            removeObjectFromList(FListObject[isfunc], obj.name);
          return getRandomObjectType(typename);
        }
      }
      return obj.name;
    } else {
      if (isDebug)
        console.log(
          'getRandomObjectType with type=' + typename + ' returned undefined'
        );
      undefined.typename = 1;
    }
  }

  return generateObjectType(typename);

  // console.log("havent implemented getRandomObjectType for: "+typename)
}

function getRandObjectNoFalse(type_name) {
  // if (Object.keys(ListObject).length === 0) {console.log("havent initialized fuzzing objects???"); undefined.xxx = 1}; // nothing, need create new one
  var value = getRandomObjectType(type_name);
  if (value != -1) return value;
  if (type_name.includes('_Ar')) {
    var ret = '[';
    for (var i = 0; i < rand(10); i++)
      ret +=
        GetAnObjectFromList(merge2List(ListAllObject, getFList(FListAllObject)))
          .name + ',';
    ret += ']';
    return ret;
  }
  var obj = GetAnObjectFromList(
    merge2List(ListAllObject, getFList(FListAllObject))
  );
  return obj.name;
}

function getRealType(typename) {
  return typename
    .replace(/_Ar/g, '')
    .replace('?', '')
    .replace('_rca', '')
    .replace('_rma', '')
    .replace('_rmt', '')
    .replace('_rcv', '')
    .replace('&', '');
}

function makeId() {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  text += countO;
  countO++;
  var binder = '';
  // if(isfunc&&rand(2) == 0)
  // 	binder = "var "
  return binder + text;
}

// listM: list all object we want to fuzz
// listT: list interfaces -> detail info of methods, properties
// from listT, we correct all information(arguments, return type...) of methods, properties in listM.
function MergeMix(listM, listT) {
  var newList = {};
  for (var object_type in listM) {
    //'properties': {'code': {'readonly': 'True', 'type': 'DOMString'}, 'isComposing': {'readonly': 'True', 'type': 'boolean'}
    if (listT.hasOwnProperty(object_type)) {
      // defined array have this objecttype => go merge
      var properties = {};
      var methods = {};
      var onlyme = {};

      var tmp_propM = listM[object_type]['properties'];
      var tmp_propT = listT[object_type]['properties'];
      var tmp_methM = listM[object_type]['methods'];
      var tmp_methT = listT[object_type]['methods'];
      var tmp_onlyM = listM[object_type]['onlyme'];
      var tmp_onlyT = listT[object_type]['onlyme'];
      var parent = '';
      for (var prop_name in tmp_propM) {
        if (tmp_propT.hasOwnProperty(prop_name)) {
          properties[prop_name] = tmp_propT[prop_name];
        } else {
          properties[prop_name] = {};

          // pdf have different defined properties binding object
          if (typeof tmp_propM[prop_name] == 'string') {
            properties[prop_name]['type'] = tmp_propM[prop_name];
            properties[prop_name]['readonly'] = 'None';
          } // == object {type:xyz, readonly:none}
          else {
            properties[prop_name]['type'] = tmp_propM[prop_name].type;
            properties[prop_name]['readonly'] = tmp_propM[prop_name].readonly;
          }
        }
      }

      for (var meth_name in tmp_methM) {
        if (tmp_methT.hasOwnProperty(meth_name)) {
          methods[meth_name] = tmp_methT[meth_name];
        } else {
          methods[meth_name] = [
            {
              rai_exc: '1',
              type: 'None',
              args: {},
              numarg: tmp_methM[meth_name],
            },
          ];
        }
      }

      for (var meth_name in tmp_onlyM) {
        onlyme[meth_name] = [
          {
            rai_exc: '1',
            type: 'None',
            args: {},
            numarg: tmp_onlyM[meth_name],
          },
        ];
      }

      if (listM[object_type]['p_typename'] == '')
        parent = listT[object_type]['p_typename'];
      else parent = listM[object_type]['p_typename'];

      newList[object_type] = {
        properties: properties,
        methods: methods,
        onlyme: onlyme,
        has_parrent: listM[object_type]['has_parrent'],
        p_typename: parent,
      };
    } // merge only listM
    else {
      var properties = {};
      var methods = {};
      var onlyme = {};
      var tmp_propM = listM[object_type]['properties'];
      var tmp_methM = listM[object_type]['methods'];
      var tmp_onlyM = listM[object_type]['onlyme'];
      for (var prop_name in tmp_propM) {
        properties[prop_name] = {};

        // pdf have different defined properties binding object
        if (typeof tmp_propM[prop_name] == 'string') {
          properties[prop_name]['type'] = tmp_propM[prop_name];
          properties[prop_name]['readonly'] = 'None';
        } // == object {type:xyz, readonly:none}
        else {
          properties[prop_name]['type'] = tmp_propM[prop_name].type;
          properties[prop_name]['readonly'] = tmp_propM[prop_name].readonly;
        }
      }
      for (var meth_name in tmp_methM) {
        methods[meth_name] = [
          {
            rai_exc: '1',
            type: 'None',
            args: {},
            numarg: tmp_methM[meth_name],
          },
        ];
      }
      for (var meth_name in tmp_onlyM) {
        onlyme[meth_name] = [
          {
            rai_exc: '1',
            type: 'None',
            args: {},
            numarg: tmp_onlyM[meth_name],
          },
        ];
      }
      newList[object_type] = {
        properties: properties,
        methods: methods,
        onlyme: onlyme,
        has_parrent: listM[object_type]['has_parrent'],
        p_typename: listM[object_type]['p_typename'],
      };
    }
  }
  // Merge the rest of ListT to newList
  for (var object_type in listT) {
    if (listM.hasOwnProperty(object_type)) continue;
    var parent = listT[object_type]['p_typename'];
    if (parent == '') parent = 'Object';
    newList[object_type] = {
      properties: listT[object_type]['properties'],
      methods: listT[object_type]['methods'],
      onlyme: {},
      has_parrent: 1,
      p_typename: parent,
    };
  }
  return newList;
}

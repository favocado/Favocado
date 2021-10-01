// for support context-dependent fuzz(bundle into a single file), we should not put these functions to classes.

//List all functions were generated
ListFunctions = [];

// List functions inside another function
FListFunctions = [];

// list objects have type in ListObjectsTypeFuzzing(later use to generate global fuzzing statements)
ListObject = {};

// List objects have type in ListObjectsTypeFuzzing and in function(later use to generate local(in function) fuzzing statements)
FListObject = [];

// List All objects include ListObject
ListAllObject = {};

// List objects have type not in ListObjectsTypeFuzzing and in function
FListAllObject = [];

// tmp buffer help to create object before get value by function getRandomObjectType and getRandObjectNoFalse
generatorBuff = '';

//this list for extend class and random arg
ListObjectsTypeFuzzing = [];

// initialization code should be in header
Header = '';

// List arguments.
ListArgsValue = {};

is_setter_getter = 0;
// make sure ObjectLiteral not same prop
C_Getter = [];
C_Setter = [];
cachePropertyValue = '';
// check inside GencScript
is_GencScript = 0;
var isfunc = 0; // for check global variable or inside function
// loop counter.
Current_loop = 0;

var CacheValueMakerWeight = [];
CacheValueMakerWeight.totalWeight = 0;
CacheValueMakerWeight.Count = 0;
var CacheStatementMakerWeight = [];
CacheStatementMakerWeight.totalWeight = 0;
CacheStatementMakerWeight.Count = 0;
CacheStatementHeaderWeight = [];
CacheStatementHeaderWeight.totalWeight = 0;
CacheStatementHeaderWeight.Count = 0;
var InterestingName = ['valueOf', 'toString', 'length'];
var InterestingArg = [
  '[]',
  '[,,]',
  '{}',
  '()=>{}',
  6.176516726456e-312,
  '1e81',
  '' + Math.PI,
  /*"3/0", "-3/0", "0/0" ,*/ 'null',
  'null',
  'null',
  'undefined',
  'undefined',
  'NaN',
  'NaN',
];
var WorkingObjectName = '';
var ValueMaker = [
  {
    w: 10,
    v: function () {
      var object = GetAnObjectFromList(ListAllObject);
      if (object === -1) return 1;
      return object.name;
    },
  },
  {
    w: 20,
    v: function () {
      return randArray(InterestingArg);
    },
  },
  {
    w: 1,
    v: function () {
      return randString();
    },
  },
];

// return avalue to asign
function getAValue() {
  if (CacheValueMakerWeight.Count < ValueMaker.length) {
    var sumWeight = 0;
    for (var i = CacheValueMakerWeight.Count; i < ValueMaker.length; i++)
      sumWeight += ValueMaker[i].w;
    CacheValueMakerWeight.totalWeight += sumWeight;
    for (var i = CacheValueMakerWeight.Count; i < ValueMaker.length; i++) {
      for (var j = 0; j < ValueMaker[i].w; j++)
        CacheValueMakerWeight.push(ValueMaker[i].v);
    }
    CacheValueMakerWeight.Count = ValueMaker.length;
  }
  return randArray(CacheValueMakerWeight)();
}

function getStmHeadArg() {
  var k = rand(7);
  if (k == 0) return cat(['[', rand(0x10000000), ',', rand(0xffffffff), ']']);
  if (k == 1) return randString();
  if (k == 2) return makeAFunction(rand(5));
  if (k == 3) return randArray(InterestingArg);
  if (k == 4) {
    var obj = GetAnObjectFromList(ListObject);
    if (obj !== -1) return obj.name;
    else return randInt();
  }
  if (k > 4) return randInt();
}

var ObjectLiteralMaker = [
  function (dr) {
    if (C_Setter == 1) return ObjectLiteralMaker[2](dr);
    C_Setter = 1;
    return cat([
      ' set ',
      randArray(InterestingName),
      '(arg)',
      makeFunctionBody(dr),
      ',',
    ], 0);
  },
  function (dr) {
    if (C_Getter == 1) return ObjectLiteralMaker[0](dr);
    C_Getter = 1;
    return cat([
      ' get ',
      randArray(InterestingName),
      '()',
      makeFunctionBody(dr),
      ',',
    ], 0);
  },
  function (dr) {
    if (C_Getter == 0) return ObjectLiteralMaker[1](dr);
    return cat([makeId(), ': ', getAValue(dr), ', '], 0);
  },
];

function checkIsEmptyObject(objType) {
  if (
    Object.keys(ListObjectTypes[objType].methods) == 0 &&
    Object.keys(ListObjectTypes[objType].properties)
  )
    return true;
  return false;
}

//
function feedArgs(numarg, listargs = {}) {
  var strarg = '';
  // if ((Object.keys(listargs).length == 0)&&(numarg == 0))
  // {
  //     if(rand(20)==0)
  //         return ""
  // }
  var list_length = Object.keys(listargs).length;
  if (list_length != 0) {
    var wrap_object = true;
    if ('arg0' in listargs || 'arg0_optional' in listargs) wrap_object = false;
    var strarg = '';
    if (wrap_object) strarg = '{';

    var ret_val = '';
    for (var k in listargs) {
      var tmp = k;
      if (k == 'ObjectLiteral') {
        return getRandObjectNoFalse(listargs[k]);
      }
      if (k.includes('_optional')) {
        tmp = k.replace('_optional', '');
        if (rand(list_length + 1) == 0) continue;
      }
      ret_val = getRandObjectNoFalse(listargs[k]);
      if (ret_val == -1) ret_val = getAValue();
      else {
        if (randArray(0x20) == 0) ret_val = getAValue();
      }

      if (FuzzIncontext) {
        var str = undefined;
        try {
          str = runMe(ret_val, 1); // check object type != undefined
        } catch (e) {
          str = undefined;
        }
        if (typeof str === 'string')
          if (
            FuzzBinding && BindingStrPropertyValues.hasOwnProperty(str)
          ) {
            cachePropertyValue = str;
          }
      }

      if (!wrap_object) {
        strarg += ret_val + ',';
      } else strarg += tmp + ':' + ret_val + ',';
    }
    cachePropertyValue = '';
    if (strarg != '{') strarg = strarg.slice(0, strarg.length - 1);
    if (wrap_object) strarg += '}';
    if (ret_val != -1) return strarg;
    else return -1;
  }
  strarg = '';
  var k = rand(10);
  if (k === 0) numarg = rand(7);

  if (numarg == 0) return '';
  for (var i = 0; i < numarg; i++) {
    k = rand(3);
    if (k == 0) {
      strarg += GetAnObjectFromList(ListAllObject).name + ',';
    }
    if (k > 0) strarg += getAValue() + ',';
  }
  strarg = strarg.slice(0, strarg.length - 1);
  return strarg;
}

function ProcessArgsData(arg, objType) {
  var arr = {};
  if (typeof objType == 'object') {
    for (var key in objType)
      pushToList(
        {
          name: arg + '.' + key,
          type: objType[key],
          new_properties: [],
          new_methods: [],
        },
        objType[key],
        arr,
        1
      );
    return arr;
  }

  pushToList(
    {
      name: arg,
      type: objType,
      new_properties: [],
      new_methods: [],
    },
    objType,
    arr,
    1
  );
  return arr;
}

// if objType=undefined assign stm to variable name, then add to list if possible
// else just run or return stm
function processReturnData(stm, objType = undefined) {
  if (stm == undefined)
    // trigger exception
    stm.processReturnData = 1;
  if (FuzzIncontext) {
    // run stm => assign result to new variable
    if (typeof objType == 'string' && ListObjectTypes.hasOwnProperty(objType)) {
      var nv = makeId();
      stm = cat([nv, '=', stm], 1);
      if (isfunc == 0) {
        // out of function
        runMe(stm);
        stm = '';
        addNewObject(nv, objType);
        return stm;
      } // in function
      else {
        // stm = stm + `addNewObject('${nv}', '${objType}');`;
        addNewObject(nv, objType);
        if (stm == undefined) undefined.processReturnData = 1;
        return stm;
      }
    }
    if (typeof objType == 'object') {
      var nv = makeId();
      stm = cat([nv, '=', stm], 1);
      if (isfunc == 0) {
        runMe(stm);
        stm = '';
        for (var key in objType) addNewObject(nv + '.' + key, objType[key]);
        if (stm == undefined) undefined.processReturnData = 1;
        return stm;
      } // in func
      else {
        var adds = '';
        for (var key in objType) {
          addNewObject(nv, objType[key]);
          adds += `addNewObject('${nv + '.' + key}', '${objType[key]}');`;
        }
        return stm + adds;
      }
    }
    // objType = undefined then just run the code
    //everything else -> just run
    stm = cat([stm], 1);
    if (isfunc == 0) {
      runMe(stm);
      stm = '';
    }
    if (stm == undefined) undefined.processReturnData = 1;
    return stm;
  } else {
    // just assign if objectType != undefined
    if (typeof objType == 'string' && ListObjectTypes.hasOwnProperty(objType)) {
      var nv = makeId();
      stm = cat([nv, '=', stm], 1);
      addNewObject(nv, objType);
      if (stm == undefined) undefined.processReturnData = 1;
      return stm;
    }
    if (typeof objType == 'object') {
      // {x: object, y: function}
      var nv = makeId();
      stm = cat([nv, '=', stm], 1);
      var adds = '';
      for (var key in objType) {
        addNewObject(nv, objType[key]);
        adds += `addNewObject('${nv + '.' + key}', '${objType[key]}');`;
      }
      if (stm == undefined) undefined.processReturnData = 1;
      return stm + adds;
    }
    // objectType = undefined just return stm with wrap.
    //everything else -> just return
    stm = cat([stm], 1);
    return stm;
  }
}

//var1.x.y.callme()
function getACuteCall(obj, isglobal = true) {
  var stm = obj.name;
  var prop = getRandom_Property(obj, 2);
  if (prop == -1) return -1;
  var type = prop['type'];
  stm += '.' + prop['name'];
  var isArg = true;
  if (obj.name.includes('arg'))
    // we dont want excute code when object is arguments(arg0, arg1, ...) of function
    isArg = false;
  var tmpFuzzIncontext = FuzzIncontext;
  FuzzIncontext = FuzzIncontext & isArg & isglobal;

  if (FuzzIncontext) {
    if ([null, undefined, NaN].includes(runMe(stm, 1))) {
      // if no value -> set new value
      stm = cat([stm, '=' + getRandObjectNoFalse(type), ';']);
      stm = processReturnData(stm);
      FuzzIncontext = tmpFuzzIncontext;
      return stm;
    }
  }

  if (type.includes('_Ar')) {
    type = type.replace('_Ar', '');
    stm += `[${rand(1000)}%${stm}.length]`;
    if (FuzzIncontext) {
      if ([null, undefined, NaN].includes(runMe(stm, 1))) {
        // if no value -> set new value
        stm = processReturnData(
          cat([stm, '=' + getRandObjectNoFalse(type), ';'])
        );
        FuzzIncontext = tmpFuzzIncontext;
        return stm;
      }
    }
  }

  while (true) {
    var k = rand(2);
    if (k == 0) {
      // random properties
      prop = getRandom_Property(type, 2);
      if (prop == -1) {
        stm = processReturnData(
          cat([stm, '=' + getRandObjectNoFalse(type), ';'])
        );
        FuzzIncontext = tmpFuzzIncontext;
        return stm;
      }
      type = prop['type'];
      stm += '.' + prop['name'];
      // check if property is undefined or null => asign new value
      if (FuzzIncontext) {
        if ([null, undefined, NaN].includes(runMe(stm, 1))) {
          stm = processReturnData(
            cat([stm, '=' + getRandObjectNoFalse(type), ';'])
          );
          FuzzIncontext = tmpFuzzIncontext;
          return stm;
        }
      }
      // black list callnext for color object in adobe
      // if (FuzzAdobe && ['Color', 'color'].includes(type)) {
      //   return cat([stm, '=' + getRandObjectNoFalse(type), ';'], 1);
      // }
      // end black list callnext

      if (type.includes('_Ar')) {
        type = type.replace('_Ar', '');
        stm += '[0]';
        if (FuzzIncontext) {
          if ([null, undefined, NaN].includes(runMe(stm, 1)))
            stm = processReturnData(
              cat([stm, '=' + getRandObjectNoFalse(type), ';'])
            );
          FuzzIncontext = tmpFuzzIncontext;
          return stm;
        }
      }
    }

    if (k == 1) {
      // random method
      var mt = getRandom_Method(type);
      if (mt == -1) {
        stm = processReturnData(
          cat([stm, '=' + getRandObjectNoFalse(type), ';'])
        );
        FuzzIncontext = tmpFuzzIncontext;
        return stm;
      }

      var feed_arg = feedArgs(mt['numarg'], mt['args']);
      if (feed_arg == -1) {
        stm = processReturnData(cat([stm, '=' + getAValue(), ';']));
        FuzzIncontext = tmpFuzzIncontext;
        return stm;
      } else {
        var mt_type = mt['type'];
        if (
          (typeof mt_type == 'string' && mt_type.includes('_Promise')) ||
          (Fuzzing_Mojo && ListMojoObject.hasOwnProperty(obj.type))
        ) {
          var promise_tail = '';
          if (mt_type != 'void') {
            if (typeof mt_type == 'string')
              promise_tail = playPromise(mt['type'].replace('_Promise', ''));
            else promise_tail = playPromise(mt['type']);
          } else promise_tail = '';
          var args = feedArgs(mt['numarg'], mt['args']);
          var stm = cat([
            stm,
            '.',
            mt['name'],
            '(',
            args,
            ')',
            promise_tail,
            ';',
          ]);
          stm = processReturnData(stm);
          FuzzIncontext = tmpFuzzIncontext;
          return stm;
        }

        var stm = cat([
          stm,
          '.',
          mt['name'],
          '(',
          feedArgs(mt['numarg'], mt['args']),
          ')',
          ';',
        ]);
        stm = processReturnData(stm, mt['type']);
        FuzzIncontext = tmpFuzzIncontext;
        return stm;
      }
    }
  }
}

//define setter getter
function makeObjLiteralPart(depth, child = 1) {
  // New-style literal getter/setter
  var dr = rand(5) + 1; // should fixed this random because forloop can increase code very big
  FListObject[isfunc] = {}; // clear after create function
  FListAllObject[isfunc] = {};
  FListFunctions[isfunc] = [];

  var result = '{';
  for (var i = 0; i < dr; i++) result += randArray(ObjectLiteralMaker)(dr);
  if (!child) {
    // detect the last one return, so it will not clean the list soon
    C_Setter = 0;
    C_Getter = 0;
  }
  result += '}';
  FListObject[isfunc] = {}; // clear after create function
  FListAllObject[isfunc] = {};
  FListFunctions[isfunc] = [];
  return result;
}

function makeAClass(dr) {
  var Class_properties = {};
  var Class_methods = {};
  var classbody = '';
  if (rand(4) == 0)
    classbody += cat(['constructor() ', makeFunctionBody(dr), ';']);
  for (var i = 0; i < rand(10); i++) {
    var k = rand(2);
    if (k == 1) {
      var prop = makeId();
      classbody += prop + '=' + getStmHeadArg() + ';';
      Class_properties[prop] = { readonly: 'None', type: 'Any' };
    } else {
      if (rand(2) == 1) {
        var mt = makeId();
        classbody += mt + '()' + makeFunctionBody(dr) + ';';
        Class_methods[mt] = [{ numarg: 0, args: {}, type: 'void', rai_exc: 0 }];
      } else {
        // random setter getter properties
        var mt = randArray([
          '[Symbol.species]',
          'length',
          'prototype',
          ['[Symbol.toPrimitive]'],
        ]);
        var typefunc = randArray(['get', 'set']);
        var have_arg = '';
        if (typefunc == 'set') have_arg = 'abc';
        classbody +=
          typefunc +
          ' ' +
          mt +
          '(' +
          have_arg +
          ')' +
          makeFunctionBody(dr) +
          ';';
        Class_methods[mt] = 0;
      }
    }
  }
  var nclass = makeId();
  var extendcls = randArray(ListObjectsTypeFuzzing);
  var stm = cat([
    'class ',
    nclass,
    ' extends ',
    extendcls,
    '{',
    classbody,
    '};',
  ]);
  ListObjectTypes[nclass] = {
    properties: Class_properties,
    methods: Class_methods,
    has_parrent: 1,
    onlyme: {},
    p_typename: extendcls,
  };
  return stm;
}

function getAStatement(dr, arr = {}) {
  if (CacheStatementMakerWeight.Count < StatementMaker.length) {
    var sumWeight = 0;
    for (
      var i = CacheStatementMakerWeight.Count;
      i < StatementMaker.length;
      i++
    )
      sumWeight += StatementMaker[i].w;
    CacheStatementMakerWeight.totalWeight += sumWeight;
    for (
      var i = CacheStatementMakerWeight.Count;
      i < StatementMaker.length;
      i++
    ) {
      for (var j = 0; j < StatementMaker[i].w; j++)
        CacheStatementMakerWeight.push(StatementMaker[i].v);
    }
    CacheStatementMakerWeight.Count = StatementMaker.length;
  }
  var func = randArray(CacheStatementMakerWeight);
  var stm = func(dr, arr);
  if (stm == undefined) {
    console.log(func);
    undefined.getAStatement = 1;
  }
  if (stm == -1) undefined.getAStatement = 1;
  stm = generatorBuff + stm;
  generatorBuff = '';
  return stm;
}

function getAStatementHeader(dr) {
  if (is_GencScript) return '';
  if (CacheStatementHeaderWeight.Count < StatementHeader.length) {
    var sumWeight = 0;
    for (
      var i = CacheStatementHeaderWeight.Count;
      i < StatementHeader.length;
      i++
    )
      sumWeight += StatementHeader[i].w;
    CacheStatementHeaderWeight.totalWeight += sumWeight;
    for (
      var i = CacheStatementHeaderWeight.Count;
      i < StatementHeader.length;
      i++
    ) {
      for (var j = 0; j < StatementHeader[i].w; j++)
        CacheStatementHeaderWeight.push(StatementHeader[i].v);
    }
    CacheStatementHeaderWeight.Count = StatementHeader.length;
  }
  let func_call = randArray(CacheStatementHeaderWeight);
  let stm = func_call(dr);
  if (stm == undefined) {
    console.log(func_call);
    undefined.getAStatementHeader = 1;
  }
  if (stm == -1) undefined.getAStatementHeader = 1;
  stm = generatorBuff + stm;
  generatorBuff = '';
  return stm;
}

function merge2List(Listx, Listy) {
  // result is ListX
  tmpList = {};
  for (key in Listx) {
    if (tmpList.hasOwnProperty(key)) tmpList[key].concat(Listx[key]);
    else {
      tmpList[key] = Listx[key];
    }
  }

  for (key in Listy) {
    if (tmpList.hasOwnProperty(key)) tmpList[key].concat(Listy[key]);
    else {
      tmpList[key] = Listy[key];
    }
  }
  return tmpList;
}

// if List is ListObject(fuzzing objects) then just push object-(type in ListObjectsTypeFuzzing) to List without recurse parrent __proto__.
// push object to types include parrent __proto__.
function pushToList(object, type, List, isListObject = 0) {
  if (typeof type != 'string') {
    console.log(type);
    undefined.xx = 1;
  }
  if (type == '') return;
  // if(ListObjectTypes.hasOwnProperty(type) == false ) // confirm existence of this type
  // {

  // }

  if (isListObject && !ListObjectsTypeFuzzing.includes(type)) {
    // if List is ListObject and object type not in ListObjectsTypeFuzzing => ignore
    // pushToList(object, ListObjectTypes[type].p_typename , List, isListObject ) /. check: is parrent class in ListObjectsTypeFuzzing?
    return;
  }
  if (List.hasOwnProperty(type)) {
    List[type].push(object);
  } // create new
  else {
    List[type] = [];
    List[type].push(object);
  }
  if (ListObjectTypes.hasOwnProperty(type) == false) return;
  pushToList(object, ListObjectTypes[type].p_typename, List, isListObject);
}

// add new object to list after define, so we can reuse later
//Cname: maybe field_name,annot name
function addNewObject(
  obj_name,
  obj_typename,
  obj_new_properties = {},
  obj_new_methods = {},
  cname = ''
) {
  obj_typename = obj_typename.replace('?', '');
  if (FuzzIncontext && isfunc == 0) {
    try {
      var realObj = runMe(obj_name, 1);
      if ([null, undefined, NaN].includes(realObj)) {
        if (FuzzIncontext) return
        console.log(obj_name + ':' + obj_typename + ' failed initialization');
        undefined.x = 1;
        return;
      }
    } catch (e) {
      if (isDebug) {
        console.log(e);
        undefined.x = 1;
      }
      return;
    }

    if (obj_typename == 'Object') {
      var obj_typename = runMe(obj_name + '.constructor.name', 1);
    }
  }

  // if(real_type != obj_typename )
  // {
  //     console.log(obj_name + ":"+ obj_typename + "=>" + real_type)
  // }
  // try to push new object type to ListObjectsTypeFuzzing, then we can extend fuzzing area.
  if (
    !Fuzzing_Mojo &&
    ListObjectTypes.hasOwnProperty(obj_typename) &&
    !ListObjectsTypeFuzzing.includes(obj_typename) &&
    !ListEngineObjects.hasOwnProperty(obj_typename)
  )
    ListObjectsTypeFuzzing.push(obj_typename);

  if (!ListObjectsTypeFuzzing.includes(obj_typename)) {
    // object type not in ListObjectsTypeFuzzing -> add to ListAllObject
    addNewSubObject(
      obj_name,
      obj_typename,
      (obj_new_properties = {}),
      (obj_new_methods = {}),
      (cname = '')
    );
    return;
  }

  if (isfunc > 0) {
    // if this object was created inside function body(not global) -> do not add to ListAllObject
    pushToList(
      {
        name: obj_name,
        type: obj_typename,
        new_properties: obj_new_properties,
        new_methods: obj_new_methods,
        cname: cname,
      },
      obj_typename,
      FListObject[isfunc],
      1
    );
    pushToList(
      {
        name: obj_name,
        type: obj_typename,
        new_properties: obj_new_properties,
        new_methods: obj_new_methods,
        cname: cname,
      },
      obj_typename,
      FListAllObject[isfunc]
    );

    return;
  }
  // add to fuzzing list object.
  pushToList(
    {
      name: obj_name,
      type: obj_typename,
      new_properties: obj_new_properties,
      new_methods: obj_new_methods,
      cname: cname,
    },
    obj_typename,
    ListObject,
    1
  );
  // add to ListAllObject too
  pushToList(
    {
      name: obj_name,
      type: obj_typename,
      new_properties: obj_new_properties,
      new_methods: obj_new_methods,
      cname: cname,
    },
    obj_typename,
    ListAllObject
  );
}

function addNewSubObject(
  obj_name,
  obj_typename,
  obj_new_properties = {},
  obj_new_methods = {},
  cname = ''
) {
  if (isfunc > 0) {
    // object inside function
    pushToList(
      {
        name: obj_name,
        type: obj_typename,
        new_properties: obj_new_properties,
        new_methods: obj_new_methods,
        cname: cname,
      },
      obj_typename,
      FListAllObject[isfunc]
    );
    return;
  }
  pushToList(
    {
      name: obj_name,
      type: obj_typename,
      new_properties: obj_new_properties,
      new_methods: obj_new_methods,
      cname: cname,
    },
    obj_typename,
    ListAllObject
  );
}

function addNewFunction(func_name, args, numarg) {
  if (isfunc > 0) {
    // function inside function
    FListFunctions[isfunc].push({
      name: func_name,
      type: 'None',
      args: args,
      rai_exc: 1,
      numarg: numarg,
    });
    return;
  }
  ListFunctions.push({
    name: func_name,
    type: 'None',
    args: args,
    rai_exc: 1,
    numarg: numarg,
  });
}

function makeStatement(depth) {
  var dr = depth - rand(3);
  if (dr <= 0) return cat(['/*default Statement*/', getAStatement(0)]);
  var code = '';
  var i = 0;
  for (i; i < dr; i++) {
    code += getAStatement(i);
  }
  return code;
}

function makeHeader(depth) {
  var dr = depth - rand(3);
  if (dr <= 0)
    return cat(['/*default StatementHeader*/', getAStatementHeader(0)]);
  var code = '';
  var i = 0;
  for (i; i < dr; i++) {
    let stm = getAStatementHeader(i);
    code += stm;
  }
  return code;
}

function getFList(List) {
  var tmp = {};
  for (var i = 0; i <= isfunc; i++) {
    tmp = merge2List(tmp, List[i]);
  }
  return tmp;
}
//  @param
// depth : int =>  how many statements should be generated
// arr  : {} => list addition fuzzing objects
// is_for : int => 0: function body; 1: for loop
// return_type : String => return value for this function
// @return String => { //this is function body }

function makeFunctionBody(depth = 5, arr = {}, is_for = 0, return_type = 'nope') {
  isfunc++;
  FListObject[isfunc] = {}; // clear after create function
  FListAllObject[isfunc] = {};
  FListFunctions[isfunc] = [];
  // var dr = rand(depth)
  var code = '{';
  if (isDebug) code += '/*function body*/';
  if (isfunc <= MAX_FUNC) {
    if (depth == undefined)
      undefined.x = 1;
    var dr = depth;
    if (dr >= MAX_STM_1FUNC) dr = MAX_STM_1FUNC;

    if (dr <= 0) {
      var stm = cat([
        ' { /*default makeFunctionBody*/',
        getAStatement(dr, arr),
        ' } ',
      ], 0);
      FListObject[isfunc] = {}; // init before create
      FListAllObject[isfunc] = {};
      FListFunctions[isfunc] = [];
      isfunc--;
      return stm;
    }
    // rand assign value for array if this is forloop
    if (is_for) {
      var h = rand(3);
      for (var i = 0; i < h; i++) {
        var vr = getRandomObjectType(randArray(['Array']));
        if (vr === -1) continue;
        code += cat(
          [vr, '[', 'izz' + (isfunc - 1), ']', '=', getAValue(), ';'],
          1
        );
      }
    }
    for (var i = 0; i <= dr; i++)
      code += getAStatement(dr, merge2List(arr, getFList(FListObject)));

    if (!is_for) {
      // make return value
      if (return_type != 'nope') code += 'return ' + getRandomObjectType(return_type);
    }
    code += '}';
  } else code += '}';
  FListObject[isfunc] = {}; // clear after create function
  FListAllObject[isfunc] = {};
  FListFunctions[isfunc] = [];
  isfunc--;
  return code;
}

function genCScript() {
  if (is_GencScript == 1) return false;
  is_GencScript = 1;
  isfunc++;
  FListObject[isfunc] = {}; // init before create
  FListAllObject[isfunc] = {};
  FListFunctions[isfunc] = [];

  var code = makeStatement(10);
  FListObject[isfunc] = {}; // clear after create function
  FListAllObject[isfunc] = {};
  FListFunctions[isfunc] = [];
  isfunc--;
  is_GencScript = 0;
  return code;
}

function playPromise(PromiseType, dr = 5) {
  isfunc++;
  FListObject[isfunc] = {}; // init before create
  FListAllObject[isfunc] = {};
  FListFunctions[isfunc] = [];

  var arr = ProcessArgsData('arg0', PromiseType);
  var code = processReturnData('arg0', PromiseType);
  // make it always gen statements
  // if (isfunc <= MAX_FUNC)
  for (var i = 0; i <= dr; i++)
    code += getAStatement(dr, merge2List(arr, getFList(FListObject)));
  code = cat([
    '.then(function(arg0){',
    code,
    '}).catch(function (e)',
    makeFunctionBody(2),
    ')',
  ]);
  FListObject[isfunc] = {}; // clear after create function
  FListAllObject[isfunc] = {};
  FListFunctions[isfunc] = [];
  isfunc--;
  return code;
}


//  @param
// depth : int =>  how many statements should be generated
// arr  : {} => list addition fuzzing objects
// add_new : String => function name
// return_type : String => return value for this function
// @return String => function random_name(arg1, arg2, arg3 ...) { //this is function body }

function makeAFunction(
  depth,
  arr = {},
  add_new = 'nope',
  return_type = 'nope'
) {
  var dr = depth;
  var id = add_new; // use add_new as function name which was set before
  var numarg = rand(6);
  var args = [];
  args_save = {};
  for (var i = 0; i < numarg; i++) {
    args += 'arg' + i;
    var argtype = 'Object';
    if (ListObjectsTypeFuzzing.length > 0)
      argtype = randArray(ListObjectsTypeFuzzing);
    else argtype = randArray(Object.keys(ListObjectTypes));

    pushToList(
      {
        name: 'arg' + i,
        type: argtype,
        new_properties: [],
        new_methods: [],
      },
      argtype,
      arr
    );
    args_save['arg' + i] = argtype;
    /*        if (rand(7) == 1) // function as arg
        {
            if (fuzz_Chrome || fuzz_Firefox) {
                strarg += cat([makeId(), "=", makeAFunction(rand(10)), ","]);
            }
        }*/
    if (i == numarg - 1) break;
    args += ',';
  }

  if (id == 'nope') id = makeId();
  var fnc = cat([
    id,
    '= function',
    '(',
    args,
    ')',
    makeFunctionBody(dr, arr, 0, return_type),
  ]);
  processReturnData(fnc);
  addNewFunction(id, args_save, numarg);
  return fnc;
}

function FindAGoodMethod(obj) {
  for (var key in mt_keys) {
    if (RandomProtoCache.indexOf(type) < 0) {
      var methods = getMethodsByName(type);
      var properties = getPropertiesByName(type);
      RandomProtoCache[type] = { methods: methods, properties: properties };
    }
    var methods = RandomProtoCache[type].methods;
  }
  if (Object.keys(obj.new_methods).length !== 0)
    // concat new_method with base method
    methods = { ...methods, ...obj.new_methods };
  if (methods.length === 0) return -1;
  var check = 1;
  var return_mt = '';
  for (k_mt in methods) {
    check = 1;
    var mts = methods[k_mt]; // mt = [{numarg:0, args:{}, type: "None", rai_exc: 0}, {}]
    for (var idx in mts) {
      var f_mt = mts[idx]; // {numarg:0, args:{}, type: "None", rai_exc: 0}
      for (var arg in mts['args']) {
        if (getRandomObjectType(arg) == -1) check = 0;
      }
      if (check == 1) return {};
    }
  }
}

function makeForLoop(depth, v, reps) {
  var sInit = '';
  var sCond = '';
  var sNext = '';

  switch (rand(2)) {
    case 0: // Generates constructs like `for (var x = 3; x > 0; x--) { ... }`
      sInit = 'var ' + v + ' = ' + reps;
      sCond = v + ' > 0';
      if (rand(2)) {
        sNext = '--' + v;
      } else {
        sNext = v + '--';
      }
      break;
    default:
      // Generates constructs like `for (var x = 0; x < 3; x++) { ... }`
      sInit = 'var ' + v + ' = 0';
      sCond = v + ' < ' + reps;
      if (rand(2)) {
        sNext = '++' + v;
      } else {
        sNext = v + '++';
      }
  }

  var head = 'for (' + sInit + '; ' + sCond + '; ' + sNext + ')';
  Current_loop++;
  var body = makeFunctionBody(depth, {}, 1); // no new var
  Current_loop--;
  return head + body;
}

function removeEngineObjects() {
  if (!IncludeEngineObject) {
    for (key of Object.keys(ListEngineInterfaces)) {
      ListDefinedInterfaces[key] = {
        properties: {},
        methods: {},
        has_parrent: ListDefinedInterfaces[key].has_parrent,
        p_typename: ListDefinedInterfaces[key].p_typename,
      };
    }
  }
}

// fuzzAll = true -> fuzz all interfaces 
//         = false -> only fuzz objects(methods, properties) were defined in file Binding_Objects.js
function initFuzzing(fuzzAll) {
  AllObjects = { ...ListBindingObject, ...ListEngineObjects }
  ListDefinedInterfaces = { ...ListBindingInterfaces, ...ListEngineInterfaces }
  if (!fuzzAll)
    ListObjectTypes = MergeMix(AllObjects, ListDefinedInterfaces)
  else
    ListObjectTypes = ListDefinedInterfaces
  if (FuzzBinding) {
    StatementHeader = StatementHeader.concat(BindingStatementHeader)
    StatementMaker = StatementMaker.concat(BindingStatementBody)
  }
  removeEngineObjects();
}



function testGenerator() {
  ListObjectsTypeFuzzing.push('HTMLDocument');
  var ret = '';
  console.log("playPromise('HTMLDocument', 10)");
  ret = playPromise('HTMLDocument', 10);
  // console.log(ret)
  // console.log('playPromise({x:"HTMLDocument",y:"string"},10)')
  // ret = playPromise({x:"HTMLDocument",y:"string"},10)
  // console.log(ret)
}

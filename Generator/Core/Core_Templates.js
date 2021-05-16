// should priority operators (assign,define) doing first before generate corpus
var StatementHeader = [
  // x = new Int8Array(0x1337||myobject)
  {
    w: 7,
    v: function (dr) {
      var type = randArray(ListTypeNames);
      if (type.includes('Array')) {
        // create array object
        var stm = cat(['new ', type, '(', 2 ** rand(/*0x20000*/ 10), ')', ';']);
        stm = processReturnData(stm, type);
        return stm;
      }
      var stm = cat(['new ', type, '(', getStmHeadArg(), ')', ';']);
      stm = processReturnData(stm, type);
      return stm;
    },
  },

  // newobj = {lenght: object|number ...}
  {
    w: 10,
    v: function (dr) {
      var stm = cat([
        '{',
        randArray(InterestingName),
        ':',
        getStmHeadArg(),
        '}',
        ';',
      ]);
      stm = processReturnData(stm, 'Object');
      // console.log(stm.value)
      return stm;
    },
  },
  // newobj = {lenght: ()=>{}}
  {
    w: 2,
    v: function (dr) {
      if (isfunc >= MAX_FUNC) return getAStatementHeader(dr);

      var stm = cat([
        '{',
        randArray(InterestingName),
        ':()=>',
        makeFunctionBody(),
        '}',
        ';',
      ]);
      stm = processReturnData(stm, 'Object');
      return stm;
    },
  },
  // make new object
  {
    w: 2,
    v: function (dr) {
      if (isfunc >= MAX_FUNC) return getAStatementHeader(dr);
      var nv = makeId();
      var stm = cat([nv, '=', makeObjLiteralPart(dr, 0), ';']);
      stm = processReturnData(stm, 'Object');
      return stm;
    },
  },
  // make statement: var xxx1 = A.toString()
  {
    w: 0, // dup -> should set 0
    v: function (dr) {
      var obj = GetAnObjectFromList(ListObject);
      if (obj === -1) return getAStatementHeader(dr);
      var vn = obj.name;
      var mt = getRandom_Method(obj, 1);
      if (mt == -1) return getAStatementHeader(dr);
      var feed_args = feedArgs(mt['numarg'], mt['args']);
      if (feed_args == -1) return getAStatementHeader(dr);
      stm = cat([vn, '.', mt['name'], '(', feed_args, ');']);
      stm = processReturnData(stm, 'Object');
      return stm;
    },
  },
  // make special for __defineGetter__ __defineSetter__
  {
    w: 1,
    v: function (dr) {
      if (isfunc >= MAX_FUNC) return getAStatementHeader(dr);
      var obj = GetAnObjectFromList(ListObject);
      if (obj === -1) return getAStatementHeader(dr);
      var nv = obj.name;
      var mt = randArray(['__defineGetter__', '__defineSetter__']);
      var stm = cat([
        nv,
        '.',
        mt,
        '(',
        rand(0x100),
        ',',
        'function()',
        makeFunctionBody(dr),
        ');',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // make a function: x = function KKK(arg1,arg2..){do something} => ListFunctions.push(x); ListObject.push(x)
  {
    w: 1,
    v: function (dr) {
      if (isfunc >= MAX_FUNC) return getAStatementHeader(dr);
      var nv = makeId();
      stm = makeAFunction(dr, {}, nv) + ';';
      return stm;
    },
  },
  // create a class: class MyClass extends Array { //class body }
  {
    w: 0,
    v: function (dr) {
      if (isfunc > 0) return getAStatementHeader(dr);
      var stm = makeAClass(dr) + ';';
      stm = processReturnData(stm);
      return stm;
    },
  },
  // create a function
];

// mix properties, for loop, function ...
var StatementMaker = [
  // create a stament like: var1.x.y.callme() => crazyyyyyy ^.^!!
  {
    w: 10,
    v: function (dr, arr = {}) {
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      WorkingObjectName = obj.name;
      var stm = getACuteCall(obj);
      if (stm == -1) return getAStatementHeader(dr, arr);
      // stm = processReturnData(stm); // already excute in getACuteCall
      return stm;
    },
  },
  // create a stament like: var1.charCodeAt(1,2,3)
  {
    w: 3,
    v: function (dr, arr = {}) {
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      var vn = obj.name;
      WorkingObjectName = obj.name;
      var mt = getRandom_Method(obj);
      if (mt === -1) {
        // this one can make loop incase: {methods:{}, properties:{}...}
        if (checkIsEmptyObject(obj.type)) return getAStatementHeader(dr, arr);
        return getAStatement(dr, arr);
      }
      var stm = cat([
        vn,
        '.',
        mt['name'],
        '(',
        feedArgs(mt['numarg']),
        ')',
        ';',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // create a stament like: var1.charCodeAt(1,2,3) -> full correct!
  {
    w: 10,
    v: function (dr, arr = {}) {
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      var vn = obj.name;
      WorkingObjectName = obj.name;
      var mt = getRandom_Method(obj);
      if (mt === -1) {
        // this one can make loop incase: {methods:{}, properties:{}...}
        if (checkIsEmptyObject(obj.type)) return getAStatementHeader(dr, arr);
        return getAStatement(dr, arr);
      }
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
        var stm = cat([vn, '.', mt['name'], '(', args, ')', promise_tail, ';']);
        stm = processReturnData(stm);
        return stm;
      }
      var stm = cat([
        vn,
        '.',
        mt['name'],
        '(',
        feedArgs(mt['numarg'], mt['args']),
        ')',
        ';',
      ]);
      stm = processReturnData(stm, mt['type']);
      return stm;
    },
  },

  // create a statement like: var1.lenght = 123 -> 1/4 random
  {
    w: 20,
    v: function (dr, arr = {}) {
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      var vn = obj.name;
      WorkingObjectName = obj.name;
      var prop = getRandom_Property(obj, 1);
      if (prop == -1) return getAStatement(dr, arr);

      if (rand(4) == 0) {
        var stm = cat([vn, '.', prop['name'], '=', getAValue(), ';']);
        stm = processReturnData(stm);
        return stm;
      }
      var stm = cat([
        vn,
        '.',
        prop['name'],
        '=',
        getRandObjectNoFalse(prop['type']),
        ';',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // create a statement like: var1.color = (a,b)=>{stms...; return "red" }
  {
    w: 4,
    v: function (dr, arr = {}) {
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      var vn = obj.name;
      WorkingObjectName = obj.name;
      var prop = getRandom_Property(obj, 1);
      if (prop == -1) return getAStatement(dr, arr);
      funcName = makeId();
      var func = makeAFunction(dr, arr, funcName, prop['type']);
      var stm = cat([
        func,
        ";",
        vn,
        '.',
        prop['name'],
        '=',
        funcName,
        ';',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // create statement like: for(var i = 1;i++;i< n) { x[i]=1}
  {
    w: 1,
    v: function (dr, arr = {}) {
      if (Current_loop >= MAX_LOOP_IN_LOOP) return getAStatement(dr, arr);
      var stm = makeForLoop(dr, 'izz' + isfunc, rand(0x100)) + ';';
      stm = processReturnData(stm);
      return stm;
    },
  },
  // create statement like: array[0x10] = x
  {
    w: 0,
    v: function (dr, arr = {}) {
      var vr = getRandomObjectType('_Ar');
      if (vr === -1) return getAStatementHeader(dr, arr);
      var stm = cat([vr, '[', 2 ** rand(16), '] =', getAValue(), ';']);
      stm = processReturnData(stm);
      return stm;
    },
  },

  // trigger gc
  {
    w: 1,
    v: function (dr, arr = {}) {
      var stm = 'for(var i=0;i<((1024 * 1024)/0x10);i++) var a= new String();';
      if (Current_loop >= MAX_LOOP_IN_LOOP) return getAStatement(dr, arr);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // array.__proto__ = xyz;
  {
    w: 0,
    v: function (dr, arr = {}) {
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      var vn = obj.name;
      var stm = cat([vn, '.', '__proto__', '=', getAValue(), ';']);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // obj1.defineProperty ()
  {
    w: 1,
    v: function (dr, arr = {}) {
      if (isfunc >= MAX_FUNC) return getAStatement(dr, arr);
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      var stm = cat([
        'Object',
        '.',
        'defineProperties(',
        obj.name,
        ',',
        rand(0x10),
        ',',
        makeObjLiteralPart(dr, 0),
        ');',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // obj1.__defineSetter__ ()
  {
    w: 1,
    v: function (dr, arr = {}) {
      if (isfunc >= MAX_FUNC) return getAStatement(dr, arr);
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      var stm = cat([
        obj.name,
        '.__defineSetter__',
        '(',
        rand(0x100),
        ',',
        'function(value)',
        makeFunctionBody(dr),
        ');',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // obj1.__defineGetter__ ()
  {
    w: 1,
    v: function (dr, arr = {}) {
      if (isfunc >= MAX_FUNC) return getAStatement(dr, arr);
      var tmplist = merge2List(arr, ListObject);
      var obj = GetAnObjectFromList(tmplist);
      if (obj === -1) return getAStatementHeader(dr, arr);
      var stm = cat([
        obj.name,
        '.__defineGetter__',
        '(',
        rand(0x100),
        ',',
        'function()',
        makeFunctionBody(dr),
        ');',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  //  call a function in ListFunctions : abcdef(1, [2] .. )
  {
    w: 1,
    v: function (dr, arr = {}) {
      if (ListFunctions.length === 0) return getAStatement(dr, arr);
      var func = randArray(ListFunctions);
      var stm = cat([
        func['name'],
        '(',
        feedArgs(func['numarg'], func['args']),
        ');',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // call from prototype: Array.prototype.concat()
  {
    w: 0,
    v: function (dr, arr = {}) {
      var type = randArray(ListTypeNames);
      var mt = getRandom_Method(type);
      if (mt == -1) return getAStatement(dr, arr);
      stm = cat([
        type,
        '.prototype.',
        mt['name'],
        '(',
        feedArgs(mt['numarg'], mt['args']),
        ');',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // make call to onlyme method: ArrayBuffer.transfer(x,y)
  {
    w: 0,
    v: function (dr, arr = {}) {
      var type_name = randArray(ListTypeNames);
      var methods = ListObjectTypes[type_name].onlyme;
      if (Object.keys(methods).length == 0) return getAStatement(dr, arr);
      var mtname = randArray(Object.keys(methods));
      let mt = randArray(methods[mtname]);
      var stm = cat([
        type_name,
        '.',
        mtname,
        '(',
        feedArgs(mt['numarg'], mt['args']),
        ');',
      ]);
      stm = processReturnData(stm);
      return stm;
    },
  },
  // delete object, not valid in strict-mode
  /*{
        w: 10, v: function(dr, arr=[]){
            var tmplist = ListObject; if(tmplist.length === 0 ) return getAStatementHeader(dr, arr); return cat(["delete ",randArray(tmplist).name,";"],1)
        }
    }*/
];

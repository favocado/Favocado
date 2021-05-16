ListEngineInterfaces = {};

ListEngineInterfaces['Object'] = {
  properties: {},
  methods: {
    __lookupGetter__: [
      { rai_exc: 0, numarg: 1, args: { sprop: 'string' }, type: 'boolean' },
    ],
    __lookupSetter__: [
      { rai_exc: 0, numarg: 1, args: { sprop: 'string' }, type: 'boolean' },
    ],
    isPrototypeOf: [
      { rai_exc: 1, numarg: 1, args: { object: 'Object' }, type: 'boolean' },
    ],
    propertyIsEnumerable: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'mySelf_prop' }, type: 'boolean' },
    ],
    toString: [{ rai_exc: 0, numarg: 0, args: {}, type: 'string' }],
    valueOf: [{ rai_exc: 0, numarg: 0, args: {}, type: 'any' }],
    toLocaleString: [{ rai_exc: 0, numarg: 0, args: {}, type: 'string' }],
  },
  onlyme: {
    assign: [
      {
        rai_exc: 0,
        numarg: 2,
        args: { target: 'object', sources: 'object' },
        type: 'object',
      },
    ],
    getOwnPropertyDescriptor: [
      {
        rai_exc: 0,
        numarg: 2,
        args: { obj: 'Object', prop: 'string' },
        type: 'string',
      },
    ],
    getOwnPropertyDescriptors: [
      { rai_exc: 0, numarg: 1, args: { obj: 'object' }, type: 'object' },
    ],
    getOwnPropertyNames: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'Array' },
    ],
    getOwnPropertySymbols: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'Array' },
    ],
    is: [
      {
        rai_exc: 0,
        numarg: 2,
        args: { arg0: 'object', arg1: 'object' },
        type: 'boolean',
      },
    ],
    preventExtensions: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'void' },
    ],
    seal: [{ rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'void' }],
    create: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'object' },
      {
        rai_exc: 0,
        numarg: 2,
        args: { arg0: 'object', arg1: 'object_Ar' },
        type: 'object',
      },
    ],
    defineProperties: [
      {
        rai_exc: 0,
        numarg: 2,
        args: { arg0: 'object', arg1: 'object' },
        type: 'void',
      },
    ],
    defineProperty: [
      {
        rai_exc: 0,
        numarg: 2,
        args: { arg0: 'object', arg1: 'string', arg2: 'object' },
        type: 'void',
      },
    ],
    freeze: [{ rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'void' }],
    getPrototypeOf: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'string' },
    ],
    setPrototypeOf: [
      {
        rai_exc: 0,
        numarg: 2,
        args: { arg0: 'object', arg1: 'object' },
        type: 'void',
      },
    ],
    isExtensible: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'boolean' },
    ],
    isFrozen: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'boolean' },
    ],
    isSealed: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'boolean' },
    ],
    keys: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'boolean' },
    ],
    entries: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'Array' },
    ],
    values: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'Array' },
    ],
  },
  has_parrent: 0,
  p_typename: '',
};

ListEngineInterfaces['Function'] = {
  properties: {
    length: { readonly: 'False', type: 'number' },
    name: { readonly: 'False', type: 'string' },
    arguments: { readonly: 'False', type: 'object' },
    caller: { readonly: 'False', type: 'object' },
  },
  methods: {
    apply: [
      {
        rai_exc: 0,
        numarg: 2,
        args: { arg0: 'object', arg1: 'Array' },
        type: 'object',
      },
    ],
    bind: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'object' }, type: 'Function' },
    ],
    call: [{ rai_exc: 0, numarg: 1, args: {}, type: 'void' }],
    toString: [{ rai_exc: 0, numarg: 0, args: {}, type: 'string' }],
  },
  onlyme: {},
  has_parrent: 1,
  p_typename: 'Object',
};

ListEngineInterfaces['TypedArray'] = {
  properties: {
    buffer: { readonly: 'False', type: 'object' },
    byteLength: { readonly: 'False', type: 'number' },
    byteOffset: { readonly: 'False', type: 'number' },
    length: { readonly: 'False', type: 'number' },
  },
  methods: {
    entries: [{ rai_exc: 0, numarg: 0, args: {}, type: 'Array' }],
    keys: [{ rai_exc: 0, numarg: 0, args: {}, type: 'Array' }],
    values: [{ rai_exc: 0, numarg: 0, args: {}, type: 'Array' }],
    copyWithin: [
      {
        rai_exc: 0,
        numarg: 3,
        args: { arg0: 'number', arg1: 'number', arg2_optional: 'number' },
        type: 'Array',
      },
    ],
    every: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' },
    ],
    fill: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Object' }, type: 'None' }],
    filter: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' },
    ],
    find: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' }],
    findIndex: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' },
    ],
    forEach: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' },
    ],
    includes: [
      {
        rai_exc: 0,
        numarg: 1,
        args: { arg0: 'Object', arg1_optional: 'Number' },
        type: 'None',
      },
    ],
    indexOf: [
      {
        rai_exc: 0,
        numarg: 1,
        args: { arg0: 'Number', arg1_optional: 'Number' },
        type: 'None',
      },
    ],
    join: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Object' }, type: 'None' }],
    lastIndexOf: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'Object' }, type: 'None' },
    ],
    map: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' }],
    reverse: [{ rai_exc: 0, numarg: 0, args: {}, type: 'None' }],
    reduce: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'Funtion' }, type: 'None' },
    ],
    reduceRight: [
      { rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' },
    ],
    set: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Array' }, type: 'None' }],
    slice: [
      {
        rai_exc: 0,
        numarg: 2,
        args: { arg0_optional: 'Number', arg1_optional: 'Number' },
        type: 'None',
      },
    ],
    some: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' }],
    sort: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Function' }, type: 'None' }],
    subarray: [
      {
        rai_exc: 0,
        numarg: 1,
        args: { arg0_optional: 'Number', arg1_optional: 'Number' },
        type: 'None',
      },
    ],
    toLocaleString: [{ rai_exc: 0, numarg: 0, args: {}, type: 'None' }],
    toString: [{ rai_exc: 0, numarg: 0, args: {}, type: 'None' }],
  },
  onlyme: {
    of: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Object' }, type: 'None' }],
    from: [{ rai_exc: 0, numarg: 1, args: { arg0: 'Object' }, type: 'None' }],
  },
  has_parrent: 1,
  p_typename: 'Object',
};

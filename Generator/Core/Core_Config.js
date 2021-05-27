isDebug = false;
// config fuzzing binding object
FuzzBinding = true;
// Fuzz with engine objects
IncludeEngineObject = true;
//max String length
MAX_STRLEN = 20;
// max num of functions inside a function
MAX_FUNC = 1;
//max number statements inside a function
MAX_STM_1FUNC = 10;
//max number of loopers inside a looper
MAX_LOOP_IN_LOOP = 1;
// web server ip
serverip = '127.0.0.1';

// fuzzing with object relation.
FuzzObjectRelation = 0;

// fuzz in context
FuzzIncontext = false;
// log everything for context dependent fuzzing.
LogAll = false;
// hook Logger -> console.log 
Logger = console.log

Fuzzing_Mojo = false;

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
Fuzzing_Mojo = false;
// fuzz in context
FuzzIncontext = false;
// log everything for context dependent fuzzing.
LogAll = false;
// logger to log test statements, using for context dependent fuzzing only.
Logger = function(){}

Fuzzing_Mojo = false;

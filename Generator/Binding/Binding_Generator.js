// this is an example
// give object type -> get object value
function getBindingObject(typename) {
    return "null";
}

//@param num: number of objects to fuzz.
function initObjectsToFuzz(num) {
    ListObjectsTypeFuzzing.push("Object");
    var code = "var obj123 = new Object();"
    addNewObject('obj123', "Object");
    return code;
}


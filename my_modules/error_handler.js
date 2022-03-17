exports.handleError = function(line){
  error = false;
  errors = ["java.lang.ClassCastException: class jdk.internal.loader", "java.lang.NoSuchMethodError: sun.security.util.ManifestEntryVerifier", "java.lang.UnsupportedClassVersionError", "Could not reserve enough space"];
  errorsInfo = {
    "java.lang.ClassCastException: class jdk.internal.loader": "JAVA_INCOMPATIBLE",
    "java.lang.NoSuchMethodError: sun.security.util.ManifestEntryVerifier": "JAVA_ERROR_ManifestEntryVerifier",
    "java.lang.UnsupportedClassVersionError": "JAVA_ERROR_UnsupportedClassVersion",
    "Could not reserve enough space": "JAVA_ERROR_ReserveSpace"
  }
  errors.forEach(function(errCode){
    if(line.toString().search(errCode) != -1){
      error = errorsInfo[errCode];
    }
  });
  return error;
}
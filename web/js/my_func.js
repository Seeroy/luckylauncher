function getAuthCredetinalsByUsername(username) {
  access_token = generateAccessToken().toString();
  authpir = {
    access_token: 'null',
    client_token: 'null',
    uuid: access_token,
    name: username,
    user_properties: '{}',
    meta: {
      type: 'mojang',
      demo: false
    }
  };
  return authpir;
}

function downloadFile(url, directory, type = "https", callback) {
  filename = url.toString().split("/");
  filename = filename[filename.length - 1];
  fs.mkdirSync(directory, { recursive: true });
  if (fs.existsSync(directory + filename)) {
    callback(directory + filename);
  } else {
    if (type == "https") {
      https.get(url, (res) => {
        const path = directory + filename;
        const writeStream = fs.createWriteStream(path);

        res.pipe(writeStream);

        writeStream.on("finish", () => {
          writeStream.close();
          callback(directory + filename);
        });
      });
    } else if (type == "http") {
      http.get(url, (res) => {
        const path = directory + filename;
        const writeStream = fs.createWriteStream(path);

        res.pipe(writeStream);

        writeStream.on("finish", () => {
          writeStream.close();
          callback(directory + filename);
        });
      });
    }
  }
}

function launcherOptionsGenerator(version, versionType = "release", authCredetinals, minRam, maxRam, javaPath, forgePath) {
  if(typeof version == "number"){
    version = version.toString();
  }
  if (javaPath == "") {
    if (forgePath == "") {
      launcherOptions = {
        clientPackage: null,
        root: "./minecraft",
        version: {
          number: version,
          type: versionType
        },
        javaPath: javaPath,
        memory: {
          max: maxRam + "M",
          min: minRam + "M",
        },
        authorization: authCredetinals,
        overrides: {
          detached: false
        }
      }
    } else {
      launcherOptions = {
        clientPackage: null,
        root: "./minecraft",
        version: {
          number: version,
          type: versionType
        },
        javaPath: javaPath,
        forge: forgePath,
        memory: {
          max: maxRam + "M",
          min: minRam + "M",
        },
        authorization: authCredetinals,
        overrides: {
          detached: false
        }
      }
    }
  } else {
    if (forgePath == "") {
      launcherOptions = {
        clientPackage: null,
        root: "./minecraft",
        version: {
          number: version,
          type: versionType
        },
        javaPath: javaPath,
        memory: {
          max: maxRam + "M",
          min: minRam + "M",
        },
        authorization: authCredetinals,
        overrides: {
          detached: false
        }
      }
    } else {
      launcherOptions = {
        clientPackage: null,
        root: "./minecraft",
        version: {
          number: version,
          type: versionType
        },
        javaPath: javaPath,
        forge: forgePath,
        memory: {
          max: maxRam + "M",
          min: minRam + "M",
        },
        authorization: authCredetinals,
        overrides: {
          detached: false
        }
      }
    }
  }
  return launcherOptions;
}

function launchMinecraft(launcherOptions) {
  result = require('electron').ipcRenderer.sendSync("startMinecraft", launcherOptions);
  return result;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function generateAccessToken() {
  int = getRandomInt(298528826) + "-" + getRandomInt(298528826) + "." + getRandomInt(298528826);
  return MD5(int);
}

function destroyTheme() {
  if (currentBgMode == "animation") {
    ctheme.destroy();
  }
}

function reloadThemeFromDB() {
  db.get('theme__bgType', function (err, vallue) {
    if (err) {
      if (err.name == "NotFoundError") {
        db.put("theme__bgType", "whitescreen");
      }
    } else {
      currentBgMode = vallue;
      if (vallue == "animation") {
        $("#bgLauncherMode2").attr("checked", "checked");
        db.get('theme__animType', function (err, tm) {
          if (err) {
            if (err.name == "NotFoundError") {
              db.put("theme__animType", "birds");
              theme_mode = "birds";
            }
          } else {
            theme_mode = tm;
            $(".props-modal .form-check select option[value='" + theme_mode + "']").prop("selected",
              true);
            switch (theme_mode) {
              case "birds":
                $(".layout").css("background", "transparent");
                $("#vanta-bg").show();
                $(".whitebg-zapas").show();
                ctheme = VANTA.BIRDS({
                  el: "#vanta-bg",
                  mouseControls: false,
                  touchControls: false,
                  gyroControls: false,
                  minHeight: 200.00,
                  minWidth: 200.00,
                  scale: 1.00,
                  scaleMobile: 1.00,
                  backgroundColor: "white"
                });
                break;
              case "particles":
                $(".layout").css("background", "transparent");
                $("#vanta-bg").show();
                $(".whitebg-zapas").show();
                ctheme = VANTA.NET({
                  el: "#vanta-bg",
                  mouseControls: false,
                  touchControls: false,
                  gyroControls: false,
                  minHeight: 200.00,
                  minWidth: 200.00,
                  scale: 1.00,
                  scaleMobile: 1.00,
                  backgroundColor: 0xffffff
                })
                break;
              case "dots":
                $(".layout").css("background", "transparent");
                $("#vanta-bg").show();
                $(".whitebg-zapas").show();
                ctheme = VANTA.DOTS({
                  el: "#vanta-bg",
                  mouseControls: false,
                  touchControls: false,
                  gyroControls: false,
                  minHeight: 200.00,
                  minWidth: 200.00,
                  scale: 1.00,
                  scaleMobile: 1.00,
                  backgroundColor: 0xffffff,
                  size: 5.40,
                  spacing: 55.00
                })
                break;
              default:
                $(".layout").css("background", "white");
                $("#vanta-bg").hide();
                $(".whitebg-zapas").hide();
                break;
            }
          }
        });
      } else if (vallue == "whitescreen") {
        $("#bgLauncherMode1").attr("checked", "checked");
        $(".layout").css("background", "white");
        $("#vanta-bg").hide();
        $(".whitebg-zapas").hide();
      } else {
        $("#bgLauncherMode3").attr("checked", "checked");
      }
    }
  });
}
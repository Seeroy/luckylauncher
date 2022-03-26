const {
  app,
  BrowserWindow
} = require('electron');
const path = require('path');
const {
  ipcMain
} = require('electron');
const fs = require('fs');
var win;
var mcprocess;
var f_log = "";
var winConsole;
const version = "1.0.1";
var sm = false;
var glob = require("glob");
const os = require("os");
const getIP = require('external-ip')();
const errorHandler = require('./my_modules/error_handler');
var MD5 = require("crypto-js/md5");

const {
  Client,
  Authenticator
} = require('minecraft-launcher-core');
const launcher = new Client();
var b = {
  status: "",
  download_type: "",
  full__progress: "",
  full__total: "",
  cur__progress: "",
  cur__total: "",
  cur__name: ""
};

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 600,
    minWidth: 1024,
    minHeight: 600,
    hasShadow: true,
    icon: "luckylauncher_logo.ico",
    resizable: true,
    maximizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'web/preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('web/index.html');
  setTimeout(function () {
    userConsoleLog("[LL]: LuckyLauncher version: " + version);
    userConsoleLog("[LL]: Electron version: " + process.versions.electron);
  }, 1200);
}

function createConsoleWindow() {
  winConsole = new BrowserWindow({
    width: 800,
    height: 600,
    hasShadow: true,
    resizable: true,
    maximizable: true,
    icon: "luckylauncher_logo.ico",
    webPreferences: {
      preload: path.join(__dirname, 'web/preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  winConsole.loadFile('web/console.html');
  winConsole.setMenu(null);
  winConsole.on("closed", function () {
    winConsole = "";
    delete winConsole;
  });
}

ipcMain.on('closeApp', (event) => {
  app.quit();
  event.returnValue = true;
});

ipcMain.on('userConsoleLog', (event, arg) => {
  userConsoleLog(arg);
  event.returnValue = true;
});

ipcMain.on("collectAllStats", (event) => {
  cp = os.cpus();
  uniqueid = os.version + "925_" + cp[0].model + cp[1].speed + Math.round(os.totalmem() / 1024 / 1024);
  uniqueid = MD5(uniqueid).toString();

  let pform = {
    name: os.type(),
    release: os.release(),
    arch: process.arch,
    version: os.version()
  }

  let cpu = {
    model: cp[0].model,
    speed: cp[0].speed,
    cores: cp.length
  }

  let vers = {
    launcher: version,
    electron: process.versions.electron,
    node: process.versions.node
  }

  if (fs.existsSync("./minecraft") && fs.existsSync("./minecraft/versions")) {
    mcvers = fs.readdirSync("./minecraft/versions");
  }

  if (fs.existsSync("./minecraft") && fs.existsSync("./minecraft/mods")) {
    optivers = [];
    glob("./minecraft/mods/OptiFine*", function (er, files) {
      optivers.push(files);
      if (fs.existsSync("./minecraft/libraries/luckylauncher/optifines")) {
        inlib = fs.readdirSync("./minecraft/libraries/luckylauncher/optifines");
        optivers.push(inlib);
      }
      if (fs.existsSync("./minecraft") && fs.existsSync("./minecraft/LL_downloads")) {
        forgevers = fs.readdirSync("./minecraft/LL_downloads");
      }

      let gamevers = {
        minecraft: mcvers,
        optifine: optivers,
        forge: forgevers
      }

      statss = {
        platform: pform,
        totalmem: Math.round(os.totalmem() / 1024 / 1024),
        cpu: cpu,
        unique_id: uniqueid,
        versions: vers,
        games: gamevers,
        cwd: process.cwd()
      }

      win.webContents.send("collectedStats", statss);
    });
  }
});

ipcMain.on('hideApp', (event) => {
  win.minimize();
  event.returnValue = true;
});

ipcMain.on('focusFix', (event) => {
  win.blur();
  win.focus();
  event.returnValue = "ok";
});

ipcMain.on('getConsoleLogs', (event) => {
  event.returnValue = f_log;
});

ipcMain.on("startMinecraft", function (event, args) {
  console.log(args);
  sm = false;
  b = {
    status: "",
    download_type: "",
    full__progress: "",
    full__total: "",
    cur__progress: "",
    cur__total: "",
    cur__name: ""
  };
  mcprocess = launcher.launch(args);
  event.returnValue = "ok";
});

ipcMain.on("killMinecraft", function (event) {
  mcprocess.then(function (result) {
    result.kill();
    event.returnValue = "ok";
  });
});

ipcMain.on("createConsole", function (event) {
  createConsoleWindow();
});

ipcMain.on("launcherVersion", function (event) {
  event.returnValue = version;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

launcher.on('data', function (e) {
  if (e.toString().search("Setting user") != -1) {
    b["status"] = "starting";
    win.webContents.send("downloadProgress", b);
  }
  if (e.toString().search("Sound engine started") != -1 || e.toString().search("Launching wrapped minecraft") != -1) {
    b["status"] = "started";
    win.webContents.send("downloadProgress", b);
  }
  userConsoleLog(e);
  err = errorHandler.handleError(e);
  switch (err) {
    case "JAVA_INCOMPATIBLE":
      win.webContents.send("showError", {
        title: "Ошибка запуска",
        message: "Неподходящая версия JAVA для запуска данной версии!<br>Подробная информация в консоли",
        button: "Окей"
      });
      sm = true;
      break;
    case "JAVA_ERROR_ManifestEntryVerifier":
      win.webContents.send("showError", {
        title: "Ошибка запуска",
        message: "Несовместимость версий JAVA и Forge!<br>Подробная информация в консоли",
        button: "Окей"
      });
      sm = true;
      break;
    case "JAVA_ERROR_UnsupportedClassVersion":
      win.webContents.send("showError", {
        title: "Ошибка запуска",
        message: "У вас слишком старая версия JAVA<br>Подробная информация в консоли",
        button: "Окей"
      });
      sm = true;
      break;
    case "JAVA_ERROR_ReserveSpace":
      win.webContents.send("showError", {
        title: "Ошибка запуска",
        message: "Не удалось выделить необходимое количество памяти для выполения JAVA<br>Подробная информация в консоли",
        button: "Окей"
      });
      sm = true;
      break;
      s
  }
});

launcher.on('close', function (e) {
  b["status"] = "stopped";
  win.webContents.send("downloadProgress", b);
  if (e != 0 && e != null) {
    if (sm == false) {
      win.webContents.send("showError", {
        title: "Ошибка запуска",
        message: "Произошла неизвестная ошибка запуска!<br>Подробности в консоли",
        button: "Окей"
      });
    }
    userConsoleLog("<span style='color: red;'>[LL]: Process closed with code: " + e + "</span>");
  } else {
    userConsoleLog("[LL]: Process closed with code: " + e);
  }
});

launcher.on('debug', function (e) {
  userConsoleLog(e);
});

launcher.on('progress', function (e) {
  b["full__progress"] = e.task;
  b["full__total"] = e.total;
  if (b["status"] != "") {
    win.webContents.send("downloadProgress", b);
  }
});

launcher.on('download-status', function (e) {
  b["cur__progress"] = e.current;
  b["cur__total"] = e.total;
  b["cur__name"] = e.name;
  b["download__type"] = e.type;
  b["status"] = "downloading";
  if (b["status"] != "") {
    win.webContents.send("downloadProgress", b);
  }
});


function userConsoleLog(log) {
  f_log = f_log + "<br>" + log;
}

const { app, BrowserWindow, Menu, MenuItem, dialog } = require('electron')
var path = require('path');

// The default value of app.allowRendererProcessReuse is deprecated, it is currently "false".  It will change to be "true" in Electron 9.  For more information please check https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true

// ウインドウオブジェクトのグローバル参照を保持してください。さもないと、そのウインドウは
// JavaScript オブジェクトがガベージコレクションを行った時に自動的に閉じられます。
let win

function createWindow () {
  // browser window を生成する
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    icon: 'img/Material_icon_v2.png'
  });

  setMenu();

  // そしてこのアプリの index.html をロード
  win.loadFile('index.html');

  // ウィンドウが閉じられた時に発火
  win.on('closed', () => {
    // ウインドウオブジェクトの参照を外す。
    // 通常、マルチウインドウをサポートするときは、
    // 配列にウインドウを格納する。
    // ここは該当する要素を削除するタイミング。
    win = null
  });
}

// このイベントは、Electronが初期化処理と
// browser windowの作成を完了した時に呼び出されます。
// 一部のAPIはこのイベントが発生した後にのみ利用できます。
app.on('ready', createWindow);

// 全てのウィンドウが閉じられた時に終了する
app.on('window-all-closed', () => {
  // macOSでは、ユーザが Cmd + Q で明示的に終了するまで、
  // アプリケーションとそのメニューバーは有効なままにするのが一般的。
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // macOSでは、ユーザがドックアイコンをクリックしたとき、
  // そのアプリのウインドウが無かったら再作成するのが一般的。
  if (win === null) {
    createWindow()
  }
});

// このファイル内には、
// 残りのアプリ固有のメインプロセスコードを含めることができます。 
// 別々のファイルに分割してここで require することもできます。

//メニュー
function setMenu(){
  const menu = new Menu()
  const menuItemFile = [
    new MenuItem({label: 'Exit(&E)', role: 'quit'})
  ];
  menu.append(new MenuItem({ label: 'File(&F)', submenu: menuItemFile }));
  const menuItemAbout = [
    new MenuItem({label: 'Debag(&D)', click: () => {win.webContents.openDevTools()}}),
    new MenuItem({label: 'About(&A)', click: showAbout})
  ];
  menu.append(new MenuItem({ label: 'Help(&H)', submenu: menuItemAbout }));
  Menu.setApplicationMenu(menu);
}

function showAbout(){
  chromeVersion = new String("Chrome: "+ process.versions.chrome + "\n") ;
  electronVersion = new String("Electron: "+ process.versions.electron + "\n") ;
  dialog.showMessageBox(
    { 
      type: "info",
      title: path.basename(process.execPath,path.extname(process.execPath)),
      message: "MCaddonSetupManager",
      detail: chromeVersion+electronVersion
    }
  );
}
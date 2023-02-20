// 宣言
var isChanged = false;
var is_compact = false;
var is_simple_mode = false;
var format_version = 2;
var is_ore_ui = false;
var is_separator_drag = false;
var is_dependencies_enable = false;
var is_capabilities_enable = false;
var is_metadata_enable = false;
var is_subpacks_enable = false;
var is_world_template = false;
var is_skin_pack = false;
var timeoutID;
// 高頻度防止
var is_can_issue = true;
// ヘルプの表示
var help_page_num = 0;
// シンプルモード用
var module_description = "";
// JSON Data
var json_code = "";
// 各種ファイル入出力処理
var native_file_system = !!window.showOpenFilePicker;
// ファイルハンドラ
var file_handle = undefined;
// 無効なインデックス
var disabled_module_index = [];
// バージョン
const VERSION = "1.8.0";
// generated with object
var generated_with = {};
// Locate text
const LOCATE = {
  window: {
    page_leave: "このページを離れようとしています。",
  },
  issue: {
    clear: "問題はありません",
    text: {
      uuid_empty: "UUIDが空です。UUIDを入力してください。",
      uuid_not_valid: "入力されている文字列は有効なUUIDではありません。",
      name_empty: "名前が空です。",
      last_character_backslash:
        '最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',

      header_min_engine_version_higher:
        "フォーマットバージョン1では1.13より低いバージョンに設定する必要があります。これより高いバージョンはフォーマットバージョン2でサポートしています。",
      header_min_engine_version_lower: "version1.12以下を指定することはできません。",
      header_base_game_version_lower: "version1.12以下を指定することはできません。",
      header_name_empty: '名前が空です。名前が空の場合、"名前がありません"と表示されます。',
      header_description_empty:
        '説明がありません。説明が空の場合、"不明なパックの説明"と表示されます。',
      modules_module_null: "typeがnullになっています。typeを選択してください。",
      modules_module_past_versions:
        '"%s"は過去のバージョンでサポートされたtypeです。最新バージョンでは動作しません。"script"を使用してください。',
      modules_description_empty: "説明がありません。",
      modules_not_specified: "プライマリファイルが指定されていません",
      modules_not_extension:
        "指定されたファイルは .js の拡張子を持っていません。 プライマリファイルはJavaScriptファイル以外をサポートしません。",
      dependencies_uuid_module_name_empty:
        "UUID/モジュール名が空です。UUIDを指定するかモジュール名を指定してください。",
      dependencies_uuid_module_name_uuid_not_valid:
        "入力されている文字列は有効なUUID/モジュール名ではありません。",
      capabilities_not_selected: "一つも項目が選択されていません。",
      metadata_author_not_one: "名前が一つもありません。",
      metadata_url_empty: "URLが入力されていません。",
      metadata_license_empty: "ライセンスが入力されていません。",
      subpacks_folder_empty: "フォルダー名が空です。",
    },
  },
  import: {
    not_manifest: "このファイルはmanifest.jsonではありません。manifest.jsonを選択してください。",
  },
  display_preview: {
    no_title: "名前がありません",
    no_description: "§c不明なパックの説明",
  },
};
// module name list
const VANILLA_SCRIPT_MODULES = [
  "@minecraft/server",
  "@minecraft/server-gametest",
  "@minecraft/server-ui",
  "@minecraft/server-admin",
  "@minecraft/server-net",
];

class JSONReplace {
  constructor() {
    this.replace_point = new Object();
  }
  /**
   *
   * @param {*} data
   * @returns {*}
   */
  register(data) {
    let key = undefined;
    if (Array.isArray(data)) {
      // 配列
      if (
        (Math.max.apply(
          null,
          data.map((val) => String(val).length)
        ) >= 5 &&
          data.length >= 6) ||
        data.join(",").length >= 80 ||
        data.some((val) => typeof val == "object") ||
        data.length == 0
      ) {
        // 5文字以上、6要素以上。80文字以上。オブジェクトアリ。空
        key = data;
      } else {
        key = getUuid_v4();
        this.replace_point[`"${key}"`] = data;
      }
    } else if (typeof data == "string") {
      // 文字列
      key = getUuid_v4();
      this.replace_point[`"${key}"`] = data.replace(/\\[^n\\]|\\$/g, "").replace(/\n|\\n/g, "\\n");
    } else {
      // それ以外
      key = data;
    }
    return key;
  }
  replaceAll(/**@type {string} */ string_json, compact = false) {
    const keys = Object.keys(this.replace_point);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const data = this.replace_point[key];
      string_json = string_json.replace(key, () => {
        if (Array.isArray(data))
          return compact
            ? JSON.stringify(data)
            : JSON.stringify(data)
                .split(/^\[/)
                .join("[")
                .split(/,/)
                .join(", ")
                .split(/\]$/)
                .join("]");
        else if (typeof data == "string") return `"${data}"`;
      });
    }
    return string_json;
  }
}
class Issue {
  constructor() {
    this.error_list = new Array();
    this.warning_list = new Array();
    $("ul.issue-list li").remove();
    $(".stat-warning,.stat-error").removeClass("stat-warning stat-error");
  }
  setIssueList() {
    $("span.issue-error-num").text(this.error_list.length);
    $("span.issue-warning-num").text(this.warning_list.length);
    if (this.warning_list.length <= 0 && this.error_list.length <= 0) {
      $("ul.issue-list").append(`<li>${LOCATE.issue.clear}</li>`);
    } else {
      this.error_list.forEach((val) => {
        $("ul.issue-list").append(
          $("<li>").append(
            $("<img>").attr({
              src: "./img/error.svg",
              alt: "",
              width: "24px",
              height: "24px",
            }),
            $("<p>").text(val[0])
          )
        );
        val[1].addClass("stat-error");
      });
      this.warning_list.forEach((val) => {
        $("ul.issue-list").append(
          $("<li>").append(
            $("<img>").attr({
              src: "./img/warning.svg",
              alt: "",
              width: "24px",
              height: "24px",
            }),
            $("<p>").text(val[0])
          )
        );
        val[1].addClass("stat-warning");
      });
    }
  }
  addWarning(issue_comment, issue_element) {
    this.warning_list.push([issue_comment, issue_element]);
  }
  addError(issue_comment, issue_element) {
    this.error_list.push([issue_comment, issue_element]);
  }
}

// UUID生成
function getUuid_v4() {
  let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  for (let i = 0, len = chars.length; i < len; i++) {
    switch (chars[i]) {
      case "x":
        chars[i] = Math.floor(Math.random() * 16).toString(16);
        break;
      case "y":
        chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
        break;
    }
  }
  return chars.join("");
}
// UUIDチェック
function isUUID(uuid = "") {
  const s = uuid.match(
    "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
  );
  if (s === null) {
    return false;
  }
  return true;
}

// ページ離脱時に警告表示
window.addEventListener("beforeunload", (event) => {
  if (isChanged) {
    event.preventDefault();
    event.returnValue = LOCATE.window.page_leave;
  }
});

/* ------------------------- UI 制御 ------------------------- */
// input,textarea,select変更
$(document).on("change keyup click", "input,textarea,select", function (e) {
  onChangedJSON();
  isChanged = $(e.target).is("[ui]") ? isChanged : true;
  $("#edit_state").toggleClass("changed", isChanged);
});
window.addEventListener("load", function () {
  $('input[type="button"].generate_uuid')
    .parents("div.type-uuid")
    .find('input[type="text"]')
    .val(getUuid_v4);
  onChangedJSON();
});
// 改行入力制限
// $("textarea").on("keydown", function (e) {
//   if (e.key == "Enter") return false;
// });
// セパレータ移動
$(".separator").on("mousedown", function () {
  if (!is_separator_drag) {
    is_separator_drag = true;
  } else if (is_separator_drag) {
    is_separator_drag = false;
  }
});
$(document).on("mouseup", function () {
  is_separator_drag = false;
  $("html").css("cursor", "");
  const separator = $(".separator");
  separator.prev().removeClass("drag-lock");
  separator.next().removeClass("drag-lock");
});
$(document).on("mousemove", function (e) {
  if (is_separator_drag) {
    $("html").css("cursor", "e-resize");
    const separator = $(".separator");
    separator.prev().addClass("drag-lock");
    separator.next().addClass("drag-lock");
    const maxwidth = $("html").width() - 2;
    const next_width = maxwidth - e.clientX;
    const prev_width = maxwidth - next_width;
    separator.next().css("flex-basis", next_width);
    separator.prev().css("flex-basis", prev_width);
  }
});
// ウィンドウワイズ変更時にcss削除
window.addEventListener("resize", function () {
  $("div.preview").css("display", "");
  $("div.editor").css("flex-basis", "");
  $("div.data_check").css("flex-basis", "");
  help_page_num = 5;
  switchHelp();
});
// リンク一覧の範囲外クリック
$(document).on("click", function (ev) {
  if ($("details.open-more-info").attr("open")) {
    if ($(ev.target).is("details.open-more-info>summary")) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    $("details.open-more-info").prop("open", false);
  }
});
$("details.open-more-info").on("mouseenter mouseleave", function (ev) {
  $("details.open-more-info").prop("open", $(ev.target).is(":hover"));
});
// ヘルプを表示
$("#show_help").on("click", function () {
  $("#page-help").fadeIn("fast");
  switchHelp();
});
$("#page-help").on("click", function () {
  switchHelp();
});
// ヘルプ切換
function switchHelp() {
  switch (help_page_num) {
    case 1:
      $("#help-content-1").fadeOut("fast");
      $("#help-content_2").slideToggle("fast");
      help_page_num++;
      return;
    case 2:
      $("#help-content_2").slideToggle("fast");
      $("#help-content-3").fadeIn("fast");
      help_page_num++;
      return;
    case 3:
      $("#help-content-3").fadeOut("fast");
      $("#page-help").hide();
      help_page_num = 0;
      return;
    case 5:
      $("#help-content-1").hide();
      $("#help-content_2").hide();
      $("#help-content-3").hide();
      $("#page-help").hide();
      help_page_num = 0;
      return;
    case 0:
    default:
      $("#help-content-1").fadeIn("fast");
      help_page_num++;
      return;
  }
}
// プレビュー表示切替(phone)
$("div#show-preview").on("click", function () {
  const showPreview = $("div#show-preview");
  $("div.preview").slideToggle();
  showPreview.toggleClass("active", !showPreview.hasClass("active"));
});
// about開く
$("#open-about").on("click", function () {
  $("div.page-about").removeClass("about-hide");
});
// about閉じる
$("#close-about-btn").on("click", function () {
  $("div.page-about").addClass("about-hide");
});
$(".page-about").on("click", function (ev) {
  if ($(ev.target).is(".page-about")) $("div.page-about").addClass("about-hide");
});
//tab変更
$(document).on("click", ".tab-children:not(.selected)>input", function () {
  const className = $(this).attr("class");
  if (
    className == "modules" ||
    (is_dependencies_enable && className == "dependencies") ||
    (is_subpacks_enable && className == "subpacks")
  ) {
    const new_selected_tab = $(this).parent();
    const new_selected_index = new_selected_tab.index();
    $(`.${className}` + ".tab-children").removeClass("selected");
    new_selected_tab.addClass("selected");
    $(`.${className}` + ".tab-content-list>div")
      .removeClass("selected-tab-content")
      .eq(new_selected_index)
      .addClass("selected-tab-content");
  }
});
//tab追加
$("#modules_add,#dependencies_add,#subpacks_add").on("click", function () {
  if (
    $(this).hasClass("modules") ||
    (is_subpacks_enable && $(this).hasClass("subpacks")) ||
    (is_dependencies_enable && $(this).hasClass("dependencies"))
  ) {
    addTab($(this).attr("class"));
  }
  onChangedJSON();
});
//タブ追加
function addTab(className = "") {
  const tabBody = $(`.${className}` + ".tab-body");
  const tabNumber = tabBody.children("label").length;
  tabBody.append(
    $("<label>")
      .addClass(`${className} tab-children invisible_Control`)
      .append(
        $("<input>").attr("type", "button").addClass(className),
        $("<div>").addClass("tab-number").text(tabNumber),
        $("<div>").addClass("tab-underBar")
      )
  );
  tabBody.children("li:last-child").hide().show(150);
  const tabContentList = $(`.${className}` + ".tab-content-list");
  const cloned_tabContent = /** @type {jQuery} */ (
    tabContentList.children("div:first-child").clone().removeClass("selected-tab-content")
  );
  Array.prototype.forEach.call(cloned_tabContent.find(`input:not([type="button"])`), (elm) => {
    elm.value = elm.defaultValue;
  });
  Array.prototype.forEach.call(cloned_tabContent.find(`textarea`), (elm) => {
    elm.value = elm.defaultValue;
  });
  tabContentList.append(cloned_tabContent);
}
//tab削除
$("#modules-delete,#dependencies-delete,#subpacks-delete").on("click", function (e) {
  const className = `.${$(this).attr("class")}`;
  if (
    $(this).hasClass("modules") ||
    (is_subpacks_enable && $(this).hasClass("subpacks")) ||
    (is_dependencies_enable && $(this).hasClass("dependencies"))
  ) {
    deleteTab(className);
  }
  onChangedJSON();
  e.stopPropagation();
});
function deleteTab(className = "") {
  let tabChildren = $(className + ".tab-children");
  if (className == "" || tabChildren.length <= 1) return;
  $(className + ".tab-children.selected").remove();
  $(className + ".tab-content-list>.selected-tab-content").remove();
  tabChildren = $(className + ".tab-children");
  const tab_contents = $(className + ".tab-content-list>div");
  // 番号再振り当て
  let index_num = 0;
  for (let i = 0; i < tabChildren.length; i++) {
    const tab_child = tabChildren.eq(i);
    const tab_content = tab_contents.eq(i);
    if (i == 0) {
      tab_child.addClass("selected");
      tab_content.addClass("selected-tab-content");
    }
    const tabNumber = tab_child.children("div.tab-number");
    tabNumber.text(index_num);
    index_num++;
  }
}
//author追加
$("#author-add").on("click", function () {
  addAuthor();
  onChangedJSON();
});
function addAuthor(name = "") {
  $("div.authors_list").append(
    $("<label>")
      .addClass("author_name")
      .append(
        $("<div>").addClass("author_num").text($(".author_name").length),
        $("<input>").attr({
          type: "text",
          ["class"]: "metadata_author",
          value: name,
        })
      )
  );
}
//author削除
$("#author-delete").on("click", function () {
  $("div.authors_list>.author_name:last-child").remove();
  onChangedJSON();
});
// preview切替ボタンのアニメーション
let btn_anim = new Animation(
  new KeyframeEffect(
    document.getElementsByClassName("preview-toggle-text")[0],
    [
      { transform: "rotate(0deg)" },
      { transform: "rotate(180deg)" },
      { transform: "rotate(360deg)" },
    ],
    { duration: 500, direction: "alternate", easing: "ease" }
  )
);
// preview表示の切替
document.getElementById("toggle-preview").addEventListener("click", (ev) => {
  document.getElementsByClassName("preview-ore-ui-card")[0].classList.toggle("hide");
  document.getElementsByClassName("preview-card")[0].classList.toggle("hide");
  is_ore_ui = !is_ore_ui;
  btn_anim.play();
});
// ore uiのdetails切替
document.getElementById("preview-ore-ui-summary").addEventListener("click", (event) => {
  document.getElementById("preview-ore-ui-toggle").classList.toggle("close");
  document.getElementById("preview-ore-ui-details").classList.toggle("close");
});
// イシューリスト開閉
$("#issue-control").on("click", function () {
  const control_bar_img = $("div.issue-status-label svg");
  if (control_bar_img.hasClass("close")) {
    // 開く
    control_bar_img.attr("class", "open");
  } else {
    // 閉じる
    control_bar_img.attr("class", "close");
  }
  $("div.issue_content").slideToggle();
});

/* ------------------------- page 入出力 ------------------------- */
// シェア
if (navigator.share) {
  $(".about-external-link .share").addClass("supported");
  $("#page-share").on("click", async () => {
    await navigator.share({
      title: "Manifest Generator",
      text: "Manifest Generator -manifest.jsonを簡単に作成・編集-",
      url: "https://toka7290.github.io/MCAddonSetupManager/",
    });
  });
}
// ショートカットキー
$(window).on("keydown", async function (e) {
  if (e.defaultPrevented) {
    return;
  }
  if (e.ctrlKey) {
    switch (e.key.toLowerCase()) {
      case "s":
        e.stopPropagation();
        e.preventDefault();
        if (e.shiftKey) await writeFile(json_code, true);
        else await writeFile(json_code);
        break;
      case "o":
        e.stopPropagation();
        e.preventDefault();
        await setJSONData(await openFile());
        break;
    }
  }
});
// Native file systemが使える場合
if (native_file_system) {
  // 切替
  $(".file_load_button").removeClass("disabled");
  $(".import_button").addClass("disabled");
  $(".preview_control_child.save").removeClass("disabled");
  // インポート処理
  $("#load_file").on("click", async () => {
    setJSONData(await openFile());
  });
  // 保存
  $("#control_save").on("click", async () => {
    writeFile(json_code);
  });
  // 外部のエディタで変更があった場合に表示を更新
  $(window).on("focus", () => {
    if (!isChanged && file_handle) {
      readFile();
    }
  });
} else {
  // File reader
  $(".file_load_button").addClass("disabled");
  $(".import_button").removeClass("disabled");
  $(".preview_control_child.save").addClass("disabled");
  $("#input-file").on("change", function () {
    importJsonFile();
  });
}
async function openFile() {
  const option = {
    // 複数ファイルの受け入れ
    multiple: false,
    // "すべて" のファイルオプション無効
    excludeAcceptAllOption: false,
    // 任意のファイルオプション
    types: [
      {
        description: "JSON",
        accept: {
          "application/json": [".json"],
        },
      },
    ],
  };
  let handle;
  try {
    handle = await window.showOpenFilePicker(option);
  } catch (e) {
    // ピッカーキャンセル
    return;
  }
  [file_handle] = handle;
  return await readFile();
}
// 読み込み処理
async function readFile() {
  if (!file_handle) return;
  // ハンドルからファイルを取得
  const file = await file_handle.getFile();
  // テキスト取得
  return await file.text();
}
// 書き込み処理
async function writeFile(contents, save_as = false) {
  let handle;
  if (!save_as) handle = file_handle;
  // ファイルハンドルが指定されていないとき
  if (!handle) {
    // ハンドルを取得＆ファイルを新規作成
    try {
      handle = await window.showSaveFilePicker({
        // "すべて" のファイルオプション無効
        excludeAcceptAllOption: false,
        // 任意のファイルオプション
        types: [
          {
            description: "JSON",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });
    } catch (e) {
      // ピッカーキャンセル
      return;
    }
  }
  // Create a FileSystemWritableFileStream to write to.
  const writable = await handle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(contents);
  // Close the file and write the contents to disk.
  await writable.close();
  // 保存できたら離脱可に
  isChanged = false;
  $("#edit_state").toggleClass("changed", isChanged);
  // ハンドラを保存
  if (!save_as && handle) file_handle = handle;
}
// インポート処理
function importJsonFile() {
  const data = $("#input-file").prop("files")[0];
  const file_reader = new FileReader();
  file_reader.onload = function () {
    const json_text = file_reader.result;
    setJSONData(json_text);
  };
  try {
    file_reader.readAsText(data);
  } catch (e) {
    window.alert(LOCATE.import.not_manifest);
    console.error("error:" + e);
  }
}
/** ファイルドラッグ&ドロップ */
$(document).on("dragenter dragover", function (/** @type {jQuery.Event} */ event) {
  event.stopPropagation();
  event.preventDefault();
  $(".file-drop-zone").removeClass("hide");
});
$(".file-drop-zone-pick").on("dragleave", function (/** @type {Event} */ event) {
  event.stopPropagation();
  event.preventDefault();
  $(".file-drop-zone").addClass("hide");
});
$(document).on("drop", async function (/** @type {jQuery.Event} */ _event) {
  isChanged = true;
  $(".file-drop-zone").addClass("hide");
  var event = _event;
  if (_event.originalEvent) {
    event = _event.originalEvent;
  }
  event.stopPropagation();
  event.preventDefault();
  if (native_file_system) {
    setJSONData(await event.dataTransfer.files[0].text());
  } else {
    $("#input-file").prop("files", event.dataTransfer.files);
    importJsonFile();
  }
});
// コピー
if (!!navigator.clipboard) {
  $(".preview_control_child.copy").removeClass("disabled");
  $("#control_copy").on("click", async function () {
    await navigator.clipboard.writeText(json_code);
    $("p#control_copy_text").text("Copied");
    setTimeout(function () {
      $("p#control_copy_text").text("Copy");
    }, 1000);
  });
} else {
  $(".preview_control_child.copy").addClass("disabled");
}
// ダウンロード
$("#control_download").on("click", function () {
  $("<a></a>", {
    href: window.URL.createObjectURL(new Blob([json_code])),
    download: "manifest.json",
    target: "_blank",
  })[0].click();
});
// シンプルモード
$("#control_simple").on("click", function (ev) {
  is_simple_mode = ev.target.checked;
  syncEditorMode();
});
function syncEditorMode() {
  $(".editor_element_group.editor_normal_mode").toggleClass("hide", is_simple_mode);
  $(".editor_element_group.editor_simple_mode").toggleClass("hide", !is_simple_mode);
  const simple_name_elem = $("#simple_pack_name");
  const simple_name_elem_val = simple_name_elem.val();
  const simple_description_elem = $("#simple_description");
  const simple_description_elem_val = simple_description_elem.val();
  const name_elem = $("#header_pack_name");
  const name_elem_val = /**@type {string} */ (name_elem.val());
  const description_elem = $("#header_description");
  const description_elem_val = /**@type {string} */ (description_elem.val());
  // シンプルモードへ移行時
  if (is_simple_mode) {
    if (simple_name_elem_val == "" && name_elem_val != "") {
      simple_name_elem.val(name_elem_val);
    }
    if (simple_description_elem_val == "" && description_elem_val != "") {
      simple_description_elem.val(description_elem_val);
    }
    module_description = $(
      `.modules.tab-content-list > div:nth-child(1) #modules_description`
    ).val();
    let type = "behavior";
    switch ($(`.modules.tab-content-list > div:nth-child(1) #modules_type`).val()) {
      case "resources":
        type = "texture";
        break;
      case "world_template":
        type = "world";
        break;
      case "skin_pack":
        type = "skin";
        break;
      default:
        break;
    }
    $(`input[type="radio"][name="simple_type_child"][value="${type}"]`).prop("checked", true);
  } else {
    // シンプルモードリセット
    simple_name_elem.val("");
    simple_description_elem.val("");
  }
}
// コンパクト
$("#control_compact").on("click", function (ev) {
  is_compact = ev.target.checked;
});

/* ------------------------- json 処理 ------------------------- */
// フォーマットバージョン変更
$("#format_version").on("change", function () {
  format_version = Number($("#format_version").val());
});
//UUID生成
$(document).on("click", 'input[type="button"].generate_uuid', function () {
  $(this).parents("div.type-uuid").find('input[type="text"]').val(getUuid_v4);
  onChangedJSON();
});
// 更新処理
function onChangedJSON() {
  if (is_simple_mode) syncSimpleData();
  setDisabled();
  setControls();
  setSelectRestriction();

  if (is_can_issue) checkIssue();
  setDelayIssue();
  json_code = getJSONData();
  $("pre.language-json code.language-json").remove();
  $("pre.language-json").append($("<code>").addClass("language-json").text(json_code));
  updateDisplayPreview();
  Prism.highlightAll();
}
// 高頻度更新防止処理
function setDelayIssue() {
  is_can_issue = false;
  if (typeof timeoutID === "number") {
    window.clearTimeout(timeoutID);
  }
  timeoutID = window.setTimeout(function () {
    is_can_issue = true;
    checkIssue();
  }, 500);
}
// チェックボックス変更
function setDisabled() {
  is_dependencies_enable =
    $("#dependencies_enable").is(":checked") || $("#dependencies_enable").is(":indeterminate");
  is_capabilities_enable =
    $("#capabilities_enable").is(":checked") || $("#capabilities_enable").is(":indeterminate");
  is_metadata_enable =
    $("#metadata_enable").is(":checked") || $("#metadata_enable").is(":indeterminate");
  is_subpacks_enable =
    $("#subpacks_enable").is(":checked") || $("#subpacks_enable").is(":indeterminate");
  const dependencies_contents = $(".dependencies.tab-content-list div.value-element");
  if (is_dependencies_enable) {
    dependencies_contents.find("div.value-label").removeClass("disabled");
    dependencies_contents.find("input").prop("disabled", false);
    if ($("#dependencies_uuid").val() == "") $("#dependencies_enable").prop("indeterminate", true);
    else $("#dependencies_enable").prop("indeterminate", false);
  } else {
    dependencies_contents.find("div.value-label").addClass("disabled");
    dependencies_contents.find("input").prop("disabled", true);
  }
  const capabilities_contents = $(".capabilities_list .value-element");
  if (is_capabilities_enable) {
    capabilities_contents.removeClass("disabled");
    capabilities_contents.find("input").prop("disabled", false);
    if (!$("div.capabilities_list div input").is(":checked"))
      $("#capabilities_enable").prop("indeterminate", true);
    else $("#capabilities_enable").prop("indeterminate", false);
  } else {
    capabilities_contents.addClass("disabled");
    capabilities_contents.find("input").prop("disabled", true);
  }
  const metadata_contents = $(".metadata_list .value-element");
  if (is_metadata_enable) {
    metadata_contents.removeClass("disabled");
    metadata_contents.find("input").prop("disabled", false);
    if (
      ![
        $(".metadata_author").length > 0 ? $(".metadata_author").val() != "" : false,
        $("#metadata_url").val() != "",
        $("#metadata_license").val() != "",
      ].some((ele) => ele)
    )
      $("#metadata_enable").prop("indeterminate", true);
    else $("#metadata_enable").prop("indeterminate", false);
  } else {
    metadata_contents.addClass("disabled");
    metadata_contents.find("input").prop("disabled", true);
  }
  const subpacks_contents = $(".subpacks.tab-content-list div.value-element");
  if (is_subpacks_enable) {
    subpacks_contents.find("div.value-label").removeClass("disabled");
    subpacks_contents.find("input").prop("disabled", false);
    if (!($("#subpacks_folder_name").val() != "" || $("#subpacks_name").val() != ""))
      $("#subpacks_enable").prop("indeterminate", true);
    else $("#subpacks_enable").prop("indeterminate", false);
  } else {
    subpacks_contents.find("div.value-label").addClass("disabled");
    subpacks_contents.find("input").prop("disabled", true);
  }
}
// コントロールの状態を設定
function setControls() {
  [".dependencies", ".subpacks"].forEach((className, num) => {
    setTabControls(className, [
      [is_dependencies_enable, is_subpacks_enable][num],
      [is_dependencies_enable, is_subpacks_enable][num],
      [is_dependencies_enable, is_subpacks_enable][num] &&
        $(className + ".tab-children").length > 1,
    ]);
  });
  // authors
  if ($(".author_name").length > 1)
    $(".remove_author").removeClass("disabled").find("input").prop("disabled", false);
  else $(".remove_author").addClass("disabled").find("input").prop("disabled", true);
}
function setTabControls(className = "", stat = [0, 0, 0]) {
  [".tab-body", ".add-tab", ".remove-tab"].forEach((control, index) => {
    const element = $(className + control);
    if (stat[index] == 1) {
      element.removeClass("disabled").find("input").prop("disabled", false);
    } else if (stat[index] == 0) {
      element.addClass("disabled").find("input").prop("disabled", true);
    }
  });
}
// 実表示
function updateDisplayPreview() {
  // タイトルと説明を取得
  let title = /**@type {string} */ ($("#header_pack_name").val());
  let description = /**@type {string} */ ($("#header_description").val());
  // OreUIの場合
  if (is_ore_ui) {
    title = title.replace(/\s+|\\n/g, " ").replace(/§[0-9a-gklmnor]/g, "");
    $("#ore-ui-card-title").text(title);
    $("#ore-ui-card-description").text(
      description.replace(/\s+|\\n/g, " ").replace(/§[0-9a-gklmnor]/g, "")
    );
  } else {
    // タイトル
    if (title == "") title = LOCATE.display_preview.no_title;
    else if (title.match(/\\/g) != null) {
      let split_text = title.split("\\\\");
      let result = "";
      for (let index = 0; index < split_text.length; index++) {
        let i = split_text[index].indexOf("\\n");
        if (index >= 1) result += `\\\\`;
        if (i != -1) {
          result += `${
            split_text[index].slice(
              0,
              split_text[index].indexOf("\\n") - split_text[index].length
            ) + "\u2026"
          }`;
          break;
        } else {
          result += `${split_text[index]}`;
        }
      }
      title = result;
    }
    // $("#card-title").html(MinecraftText.toHTML(title));
    $("#card-title").text(title);
    // 説明
    if (description == "") description = LOCATE.display_preview.no_description;
    else if (description.match(/\\/g) != null) {
      let position = 0;
      let i = 0;
      let result = "";
      let split_text = description.split("\\\\");
      for (let index = 0; index < split_text.length; index++) {
        do {
          i++;
          position = split_text[index].indexOf("\\n", position + 1);
          if (position == -1) break;
        } while (i < 3);
        if (index >= 1) result += `\\\\`;
        if (position != -1) {
          result += `${
            split_text[index].slice(0, position + 1 - split_text[index].length) + "\u2026"
          }`;
          break;
        } else {
          result += `${split_text[index]}`;
        }
      }
      description = result;
    }
    // $("#card-description").html(MinecraftText.toHTML(description));
    // MinecraftText.refeashObfuscate();
    $("#card-description").text(description);
    MCFormat.formatAll();
  }
}
// モジュールタイプ変更
function setSelectRestriction() {
  //typeをすべて取得
  let selected_modules = Array.prototype.map.call(
    $(`.modules.tab-content-list > div #modules_type`),
    (elem) => elem.value
  );

  // 共通制限
  // ワールドテンプレートの判定
  is_world_template = selected_modules.some((m) => m == "world_template");
  // スキンパックの判定
  is_skin_pack = selected_modules.some((m) => m == "skin_pack");
  // min_engine_version の無効切替
  $("#header_min_engine_version").toggleClass("disabled", is_world_template || is_skin_pack);
  $("#header_min_engine_version_input input").prop("disabled", is_world_template || is_skin_pack);
  // base_game_version の無効切替
  $("#header_base_game_version").toggleClass("disabled", format_version >= 2 && !is_world_template);
  $("#header_base_game_version_input input").prop(
    "disabled",
    format_version >= 2 && !is_world_template
  );
  // lock_templateの無効切替
  $("#header_lock_template_options")
    .prop("disabled", !is_world_template)
    .parent()
    .toggleClass("disabled", !is_world_template);
  // pack_scopeの無効切替
  $("#header_pack_scope_label").toggleClass("disabled", is_world_template || is_skin_pack);
  $("#header_pack_scope").prop("disabled", is_world_template || is_skin_pack);

  // モジュールの追加制限
  // モジュール制限
  let disabled_module = [false, false, false, false, false, false, false, false, false];
  // enum
  const m_num = {
    ["data"]: 0,
    ["resources"]: 1,
    ["client_data"]: 2,
    ["script"]: 3,
    ["interface"]: 4,
    ["world_template"]: 5,
    ["skin_pack"]: 6,
    ["javascript"]: 7,
    ["plugin"]: 8,
  };
  // 共存不可のモジュールがあるか
  let exclusive =
    is_world_template || is_skin_pack || selected_modules.some((m) => m == "resources");

  // 無効なインデックスのリセット
  disabled_module_index = [];
  // 各モジュールに対する処理
  for (let index = 0; index < selected_modules.length; index++) {
    const module = $(`.modules.tab-content-list > div:nth-child(${index + 1})`);
    // タイプ選択の選択肢を制限
    const type_select = module.find(" #modules_type");
    disabled_module.forEach((val, i) => {
      type_select.find(`option:nth-child(${i + 1})`).prop("disabled", val);
    });

    // 無効なモジュールを選択している場合に変更
    if (disabled_module[m_num[selected_modules[index]]]) {
      // 選択可能なインデックスを取得
      const enable_module = disabled_module.indexOf(false);
      // 選択可能なtypeがない場合
      if (enable_module == -1) {
        disabled_module_index.push(index);
        continue;
      }
      // 選択可能なインデックスに値を変更
      type_select.prop("selectedIndex", enable_module);
      // モジュールタイプ一覧を変更
      selected_modules[index] = type_select.val();
    }

    // 選択しているモジュールを選択不可能に
    disabled_module[m_num[selected_modules[index]]] ||= true;

    // gametestの判定
    let is_gametest =
      selected_modules[index] == "script" ||
      selected_modules[index] == "javascript" ||
      selected_modules[index] == "plugin";
    // gametestモジュールの重複を不可に
    disabled_module[m_num["script"]] ||= is_gametest;
    disabled_module[m_num["javascript"]] ||= is_gametest;
    disabled_module[m_num["plugin"]] ||= is_gametest;

    // 複数モジュールを許可していないtypeを選択不可に強制
    disabled_module[m_num["resources"]] ||= true;
    disabled_module[m_num["world_template"]] ||= true;
    disabled_module[m_num["skin_pack"]] ||= true;

    // gametestの選択制限
    // "language"の切替
    module.find("#modules_language_label").toggleClass("disabled", !is_gametest);
    module.find("#modules_language").prop("disabled", !is_gametest);
    // "entry"の切替
    module.find("#modules_entry_label").toggleClass("disabled", !is_gametest);
    module.find("#modules_entry").prop("disabled", !is_gametest);

    // 複数モジュールを許可していないtypeが選択されている場合は複数モジュール不可に
    if (exclusive) disabled_module.fill(true);
  }
  // まだ追加できるモジュールがあれば追加を許可
  return exclusive
    ? setTabControls(".modules", [false, 0, 0])
    : setTabControls(".modules", [
        true,
        disabled_module.some((v) => v == false),
        selected_modules.length - 1,
      ]);
}
// イシューチェック
function checkIssue() {
  // イシュー削除
  const issue_control = new Issue();
  // format_version固有
  let element = $("#header_min_engine_version_major");
  let element_val = element.val();
  switch (format_version) {
    case 1:
      if (element_val > 1 || Number($("#header_min_engine_version_minor").val()) >= 13) {
        //1.13以上は警告
        issue_control.addWarning(
          `[Header:min engine version] ${LOCATE.issue.text.header_min_engine_version_higher}`,
          element.parent().find("input")
        );
      }
      break;
    case 2:
      if (element_val <= 1 && Number($("#header_min_engine_version_minor").val()) < 13) {
        // 1.12以下はエラー
        issue_control.addError(
          `[Header:min engine version] ${LOCATE.issue.text.header_min_engine_version_lower}`,
          element.parent().find("input")
        );
      }
      if (
        Number($("#header_base_game_version_major").val()) <= 1 &&
        Number($("#header_base_game_version_minor").val()) < 13
      ) {
        // 1.12以下はエラー
        issue_control.addError(
          `[Header:base game version] ${LOCATE.issue.text.header_base_game_version_lower}`,
          $("#header_base_game_version_major").parent().find("input")
        );
      }
      break;
  }
  element = $("#header_pack_name");
  element_val = element.val();
  if (element_val == "") {
    //名前がありません
    issue_control.addWarning(`[Header:name] ${LOCATE.issue.text.header_name_empty}`, element);
  } else if (element_val.toString().replace(/\\\\/g, "").slice(-1) == "\\") {
    //名前の最後の文字がバックスラッシュ
    issue_control.addError(`[Header:name] ${LOCATE.issue.text.last_character_backslash}`, element);
  }
  element = $("#header_description");
  element_val = element.val();
  if (element_val == "") {
    //説明がありません
    issue_control.addWarning(
      `[Header:description] ${LOCATE.issue.text.header_description_empty}`,
      element
    );
  } else if (element_val.toString().replace(/\\\\/g, "").slice(-1) == "\\") {
    //説明の最後の文字がバックスラッシュ
    issue_control.addError(
      `[Header:description] ${LOCATE.issue.text.last_character_backslash}`,
      element
    );
  }
  element = $("#header_uuid");
  element_val = element.val();
  if (element_val == "") {
    issue_control.addError(`[Header:uuid] ${LOCATE.issue.text.uuid_empty}`, element);
  } else if (!isUUID(element_val)) {
    //UUIDではありません
    issue_control.addError(`[Header:uuid] ${LOCATE.issue.text.uuid_not_valid}`, element);
  }
  // モジュール
  const modules_length = $(".modules.tab-children").length;
  for (let i = 0; i < modules_length; i++) {
    if (disabled_module_index.some((v) => v == i)) continue;
    const c_num = i + 1;
    element = $(`.modules.tab-content-list > div:nth-child(${c_num}) #modules_type`);
    let module_type = element.val();
    if (module_type == null) {
      issue_control.addError(
        `[Modules:${i}:type] ${LOCATE.issue.text.modules_module_null}`,
        element
      );
    }
    if (module_type == "javascript" || module_type == "plugin") {
      issue_control.addWarning(
        `[Modules:${i}:type] ${LOCATE.issue.text.modules_module_past_versions
          .split(/%s/)
          .join(module_type)}`,
        element
      );
    }
    element = $(`.modules.tab-content-list > div:nth-child(${c_num}) #modules_description`);
    element_val = element.val();
    if (element_val == "") {
      // 説明がありません
      issue_control.addWarning(
        `[Modules:${i}:description] ${LOCATE.issue.text.modules_description_empty}`,
        element
      );
    } else if (element_val.replace(/\\\\/g, "").slice(-1) == "\\") {
      //最後の文字がバックスラッシュ
      issue_control.addError(
        `[Modules:${i}:description] ${LOCATE.issue.text.last_character_backslash}`,
        element
      );
    }
    element = $(`.modules.tab-content-list > div:nth-child(${c_num}) #modules_uuid`);
    element_val = element.val();
    if (element_val == "") {
      issue_control.addError(`[Modules:${i}:uuid] ${LOCATE.issue.text.uuid_empty}`, element);
    } else if (!isUUID(element_val)) {
      //UUIDではありません
      issue_control.addError(`[Modules:${i}:uuid] ${LOCATE.issue.text.uuid_not_valid}`, element);
    }
    if (module_type == "script" || module_type == "javascript" || module_type == "plugin") {
      element = $(`.modules.tab-content-list > div:nth-child(${c_num}) #modules_entry`);
      element_val = element.val();
      if (element_val == "") {
        //空です
        issue_control.addError(
          `[Modules:${i}:entry] ${LOCATE.issue.text.modules_not_specified}`,
          element
        );
      } else if (!element_val.match(/\.js$/)) {
        //JSではありません
        issue_control.addError(
          `[Modules:${i}:entry] ${LOCATE.issue.text.modules_not_extension}`,
          element
        );
      }
    }
  }
  if (is_dependencies_enable) {
    const dependencies_length = $(".dependencies.tab-children").length;
    for (let i = 0; i < dependencies_length; i++) {
      const child_num = i + 1;
      element = $(
        `div.dependencies.tab-content-list > div:nth-child(${child_num}) #dependencies_uuid`
      );
      element_val = element.val();
      if (element_val == "") {
        issue_control.addWarning(
          `[Dependencies:${i}:uuid/module_name] ${LOCATE.issue.text.dependencies_uuid_module_name_empty}`,
          element
        );
      } else if (VANILLA_SCRIPT_MODULES.some((str) => str == element_val)) {
        // module_nameを指定しているとき
      } else if (!isUUID(element_val)) {
        // 有効なUUID/module_nameではありません
        issue_control.addWarning(
          `[Dependencies:${i}:uuid/module_name] ${LOCATE.issue.text.dependencies_uuid_module_name_uuid_not_valid}`,
          element
        );
      }
    }
  }
  if (is_capabilities_enable) {
    if (
      !$("#experimental_custom_ui").is(":checked") &&
      !$("#chemistry").is(":checked") &&
      !$("#raytraced").is(":checked") &&
      !$("#script_eval").is(":checked") &&
      !$("#editorExtension").is(":checked")
    ) {
      //空です
      issue_control.addWarning(
        `[Capabilities] ${LOCATE.issue.text.capabilities_not_selected}`,
        $(".capabilities_list>input")
      );
    }
  }
  if (is_metadata_enable) {
    const metadata_length = $("label.author_name").length;
    if (metadata_length) {
      for (let i = 0; i < metadata_length; i++) {
        element = $("input.metadata_author").eq(i);
        element_val = element.val();
        if (element_val == "") {
          // 名前が空です。
          issue_control.addWarning(
            `[Metadata:author:${i}] ${LOCATE.issue.text.name_empty}`,
            element
          );
        } else if (element_val.replace(/\\\\/g, "").slice(-1) == "\\") {
          //名前の最後の文字がバックスラッシュ
          issue_control.addError(
            `[Metadata:author:${i}] ${LOCATE.issue.text.last_character_backslash}`,
            element
          );
        }
      }
    } else {
      // 名前が一つもありません。
      issue_control.addWarning(
        `[Metadata:author] ${LOCATE.issue.text.metadata_author_not_one}`,
        $("div.add_author")
      );
    }
    element = $("#metadata_url");
    element_val = element.val();
    if (element_val == "") {
      //URLがありません
      issue_control.addWarning(`[Metadata:url] ${LOCATE.issue.text.metadata_url_empty}`, element);
    } else if (element_val.replace(/\\\\/g, "").slice(-1) == "\\") {
      //urlの最後の文字がバックスラッシュ
      issue_control.addError(
        `[Metadata:url] ${LOCATE.issue.text.last_character_backslash}`,
        element
      );
    }
    element = $("#metadata_license");
    element_val = element.val();
    if (element_val == "") {
      //Licenseがありません
      issue_control.addWarning(
        `[Metadata:license] ${LOCATE.issue.text.metadata_license_empty}`,
        element
      );
    } else if (element_val.toString().replace(/\\\\/g, "").slice(-1) == "\\") {
      //ライセンスの最後の文字がバックスラッシュ
      issue_control.addError(
        `[Metadata:license] ${LOCATE.issue.text.last_character_backslash}`,
        element
      );
    }
  }
  if (is_subpacks_enable) {
    const subpacks_length = $(".subpacks.tab-children").length;
    for (let i = 0; i < subpacks_length; i++) {
      const child_num = i + 1;
      const tab_content = $(`div.subpacks.tab-content-list > div:nth-child(${child_num})`);
      element = tab_content.find("#subpacks_folder_name");
      if (element.val() == "") {
        issue_control.addError(
          `[Subpacks:${i}:folder_name] ${LOCATE.issue.text.subpacks_folder_empty}`,
          element
        );
      }
      element = tab_content.find("#subpacks_name");
      element_val = element.val().toString();
      if (element_val == "") {
        issue_control.addError(`[Subpacks:${i}:name] ${LOCATE.issue.text.name_empty}`, element);
      } else if (element_val.replace(/\\\\/g, "").slice(-1) == "\\") {
        //名前の最後の文字がバックスラッシュ
        issue_control.addError(
          `[Subpacks:${i}:name] ${LOCATE.issue.text.last_character_backslash}`,
          element
        );
      }
    }
  }
  issue_control.setIssueList();
}

// エラー時のテキスト
function setErrorText(text = "", message = "") {
  let messageText = "有効なjsonではありません。";
  // 空白の場合は何も付け足さない
  if (text == "" || message == "") return messageText;
  const splitText = message.split(" ");
  const lineIndex = splitText.findIndex((element) => element == "line");
  const positionIndex = splitText.findIndex((element) => element == "position");
  const lineText = text.split(/\n/g);
  if (lineIndex != -1) {
    const line = parseInt(splitText[lineIndex + 1], 10);
    messageText += `\n${line}行目で問題が発生しました。\n${lineText
      .slice(line - 2, line + 1)
      .join("\n")}`;
  } else if (positionIndex != -1) {
    const position = splitText[positionIndex + 1];
    const LineNum = text.substring(0, position).match(/\n/g)?.length + 1 ?? 0 + 1;
    messageText += `\n${LineNum}行目で問題が発生しました。\n${lineText
      .slice(LineNum - 2, LineNum + 1)
      .join("\n")}`;
  }
  return messageText;
}
// jsonデータ取り出し
async function setJSONData(json_text = "") {
  let json_data = {};
  try {
    json_data = JSON.parse(json_text);
  } catch (e) {
    if (
      json_text.match(/\/\*[\s\S]*?\*\/ | \/\/(?=.*)(?!.*(\"\,|\")).*/g) &&
      window.confirm(
        `${setErrorText(json_text, e.message)}\nコメントアウトを除去して再試行しますか？\n`
      )
    ) {
      let data = json_text.replace(/\/\*[\s\S]*?\*\/ | \/\/(?=.*)(?!.*(\"\,|\")).*/g, "");
      try {
        json_data = JSON.parse(data);
      } catch (er) {
        window.alert(setErrorText(data, er.message));
        console.error("error:" + er);
      }
    } else {
      console.error("error:" + e);
    }
  }
  // format_versionがない場合pack_manifest検査
  if (json_data?.["format_version"]) {
    $("#format_version").val(json_data["format_version"]);
  } else if (json_data?.["header"]?.["modules"]) {
    window.alert("古い形式(pack_manifest.json)から変換します。");
    // pack_manifest.json
    const header = json_data["header"];
    $("#header_pack_name").val(header?.["name"] ?? "");
    $("#header_description").val(header?.["description"] ?? "");
    $("#header_uuid").val(header?.["pack_id"] ?? "");
    $("#header_version").val(header?.["packs_version"] ?? "1.0.0");

    if (header["modules"] != null) {
      for (let i = 0; i < header["modules"].length; i++) {
        if (0 < i) addTab("modules");
        const module = header["modules"][i];
        const module_element = $(`.modules.tab-content-list > div:nth-child(${i + 1})`);
        module_element.find("#modules_type").val(module?.["type"] ?? "data");
        module_element.find("#modules_description").val(module?.["description"] ?? "");
        const modules_version = (module?.["version"] ?? "1.0.0").split(".");
        module_element.find("#modules_version_major").val(modules_version?.[0] ?? 1);
        module_element.find("#modules_version_minor").val(modules_version?.[1] ?? 0);
        module_element.find("#modules_version_patch").val(modules_version?.[2] ?? 0);
        module_element.find("#modules_uuid").val(module?.["uuid"] ?? "");
      }
    }
    if (header["dependencies"] != null) {
      $("#dependencies_enable").prop("checked", true);
      for (let i = 0; i < header["dependencies"].length; i++) {
        if (0 < i) addTab("dependencies");
        const dependency = header["dependencies"][i];
        const tab_content = $(`div.dependencies.tab-content-list > div:nth-child(${i + 1})`);
        tab_content.find("#dependencies_uuid").val(dependency?.["uuid"] ?? "");
        const modules_version = (dependency?.["version"] ?? "1.0.0").split(".");
        $("#dependencies-version").val(modules_version ?? "1.0.0");
      }
    }
    onChangedJSON();
    return;
  }
  $("#header_pack_name").val(json_data["header"]?.["name"] ?? "");
  $("#header_description").val(json_data["header"]?.["description"] ?? "");
  if (typeof json_data["header"]?.["version"] == "string") {
    $("#header_version").val(json_data["header"]?.["version"]);
  } else if (Array.isArray(json_data["header"]?.["version"])) {
    $("#header_version").val(json_data["header"]?.["version"].join("."));
  } else {
    $("#header_version").val("1.0.0");
  }
  $("#header_min_engine_version_major").val(json_data["header"]?.["min_engine_version"]?.[0] ?? 1);
  $("#header_min_engine_version_minor").val(json_data["header"]?.["min_engine_version"]?.[1] ?? 13);
  $("#header_min_engine_version_patch").val(json_data["header"]?.["min_engine_version"]?.[2] ?? 0);
  $("#header_uuid").val(json_data["header"]?.["uuid"] ?? "");
  $("#header_platform_locked").prop("checked", json_data["header"]?.["platform_locked"] ?? false);
  $("#header_base_game_version_major").val(json_data["header"]?.["base_game_version"]?.[0] ?? 1);
  $("#header_base_game_version_minor").val(json_data["header"]?.["base_game_version"]?.[1] ?? 13);
  $("#header_base_game_version_patch").val(json_data["header"]?.["base_game_version"]?.[2] ?? 0);
  $("#header_lock_template_options").prop(
    "checked",
    json_data["header"]?.["lock_template_options"] ?? false
  );
  $("#header_pack_scope").val(json_data["header"]?.["pack_scope"] ?? "none");

  if (json_data?.["modules"]) {
    for (let i = 0; i < json_data["modules"].length; i++) {
      if (0 < i) addTab("modules");
      const module = json_data["modules"][i];
      const module_element = $(`.modules.tab-content-list > div:nth-child(${i + 1})`);
      module_element.find(`#modules_type`).val(module?.["type"] ?? "data");
      module_element.find(`#modules_description`).val(module?.["description"] ?? "");
      module_element.find(`#modules_version_major`).val(module?.["version"]?.[0] ?? 1);
      module_element.find(`#modules_version_minor`).val(module?.["version"]?.[1] ?? 0);
      module_element.find(`#modules_version_patch`).val(module?.["version"]?.[2] ?? 0);
      module_element.find(`#modules_uuid`).val(module?.["uuid"] ?? "");
      module_element.find(`#modules_language`).val(module?.["language"] ?? "javascript");
      module_element.find(`#modules_entry`).val(module?.["entry"] ?? "");
    }
  }
  if (json_data?.["dependencies"]) {
    $("#dependencies_enable").prop("checked", true);
    for (let i = 0; i < json_data["dependencies"].length; i++) {
      if (0 < i) addTab("dependencies");
      const dependency = json_data["dependencies"][i];
      const tab_content = $(`div.dependencies.tab-content-list > div:nth-child(${i + 1})`);
      tab_content
        .find("#dependencies_uuid")
        .val(dependency?.["uuid"] ?? dependency?.["module_name"] ?? "");
      if (typeof dependency?.["version"] == "string") {
        tab_content.find("#dependencies-version").val(dependency?.["version"]);
      } else if (Array.isArray(dependency?.["version"])) {
        tab_content.find("#dependencies-version").val(dependency?.["version"].join("."));
      } else {
        tab_content.find("#dependencies-version").val("1.0.0-e");
      }
    }
  }
  if (json_data?.["capabilities"]) {
    $("#capabilities_enable").prop("checked", true);
    for (const capabilities of json_data["capabilities"]) {
      switch (capabilities) {
        case "experimental_custom_ui":
          $("#experimental_custom_ui").prop("checked", true);
          break;
        case "chemistry":
          $("#chemistry").prop("checked", true);
          break;
        case "raytraced":
          $("#raytraced").prop("checked", true);
          break;
        case "script_eval":
          $("#script_eval").prop("checked", true);
          break;
        case "editorExtension":
          $("#editorExtension").prop("checked", true);
          break;
        default:
          break;
      }
    }
  }

  if (json_data?.["metadata"]) {
    const metadata = json_data["metadata"];
    generated_with = metadata?.["generated_with"];
    let is_metadata_enable = false;
    if (metadata?.["authors"]) {
      for (const author of metadata["authors"]) {
        addAuthor(author);
      }
      is_metadata_enable ||= true;
    }
    if (metadata?.["url"]) is_metadata_enable ||= true;
    $("#metadata_url").val(metadata?.["url"] ?? "");
    if (metadata?.["license"]) is_metadata_enable ||= true;
    $("#metadata_license").val(metadata?.["license"] ?? "");
    $("#metadata_enable").prop("checked", is_metadata_enable);
  }
  if (json_data?.["subpacks"]) {
    $("#subpacks_enable").prop("checked", true);
    for (let i = 0; i < json_data["subpacks"].length; i++) {
      if (0 < i) addTab("subpacks");
      const subpack = json_data["subpacks"][i];
      const tab_content = $(`div.subpacks.tab-content-list > div:nth-child(${i + 1})`);
      tab_content.find("#subpacks_folder_name").val(subpack?.["folder_name"] ?? "");
      tab_content.find("#subpacks_name").val(subpack?.["name"] ?? "");
      tab_content.find("#subpacks_memory_tier").val(subpack?.["memory_tier"] ?? 0);
    }
  }
  syncEditorMode();
  onChangedJSON();
}
// json 出力
function getJSONData() {
  const DataReplacer = new JSONReplace();
  let json_raw = new Object();
  json_raw["format_version"] = format_version;

  json_raw["header"] = new Object();
  json_raw["header"]["name"] = DataReplacer.register($("#header_pack_name").val());
  json_raw["header"]["description"] = DataReplacer.register($("#header_description").val());
  let version_raw = $("#header_version").val();
  if (new RegExp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/).test(version_raw)) {
    json_raw["header"]["version"] = DataReplacer.register(
      version_raw.split(/\./).map((v) => Number(v))
    );
  } else if (
    new RegExp(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    ).test(version_raw)
  ) {
    json_raw["header"]["version"] = version_raw;
  } else {
    json_raw["header"]["version"] = DataReplacer.register([1, 0, 0]);
  }
  json_raw["header"]["uuid"] = $("#header_uuid").val();
  json_raw["header"]["platform_locked"] = $("#header_platform_locked").is(":checked")
    ? true
    : undefined;
  if (is_world_template) {
    if (format_version >= 2) {
      json_raw["header"]["base_game_version"] = DataReplacer.register([
        Number($("#header_base_game_version_major").val()),
        Number($("#header_base_game_version_minor").val()),
        Number($("#header_base_game_version_patch").val()),
      ]);
    }
    json_raw["header"]["lock_template_options"] = $("#header_lock_template_options").is(":checked");
  } else if (!is_skin_pack) {
    json_raw["header"]["min_engine_version"] = DataReplacer.register([
      Number($("#header_min_engine_version_major").val()),
      Number($("#header_min_engine_version_minor").val()),
      Number($("#header_min_engine_version_patch").val()),
    ]);
    json_raw["header"]["pack_scope"] =
      $("#header_pack_scope").val() != "none" ? $("#header_pack_scope").val() : undefined;
  }

  json_raw["modules"] = new Array();
  const modules_length = $(".modules.tab-children").length;
  for (let i = 0; i < modules_length; i++) {
    if (disabled_module_index.some((v) => v == i)) continue;
    const child_num = i + 1;
    const module_content = $(`.modules.tab-content-list > div:nth-child(${child_num})`);
    const module_type = module_content.find(`#modules_type`).val();
    if (module_type == null || module_type == undefined) continue;
    json_raw["modules"][i] = new Object();
    json_raw["modules"][i]["type"] = module_type;
    json_raw["modules"][i]["description"] = DataReplacer.register(
      module_content.find(`#modules_description`).val()
    );
    json_raw["modules"][i]["version"] = DataReplacer.register([
      Number(module_content.find(`#modules_version_major`).val()),
      Number(module_content.find(`#modules_version_minor`).val()),
      Number(module_content.find(`#modules_version_patch`).val()),
    ]);
    json_raw["modules"][i]["uuid"] = module_content.find("#modules_uuid").val();
    json_raw["modules"][i]["language"] =
      module_type == "script" || module_type == "javascript"
        ? DataReplacer.register(module_content.find(`#modules_language`).val())
        : undefined;
    json_raw["modules"][i]["entry"] =
      module_type == "script" || module_type == "javascript" || module_type == "plugin"
        ? DataReplacer.register(module_content.find(`#modules_entry`).val())
        : undefined;
  }
  if (is_dependencies_enable) {
    json_raw["dependencies"] = new Array();
    const dependencies_length = $(".dependencies.tab-children").length;
    for (let i = 0; i < dependencies_length; i++) {
      const child_num = i + 1;
      const tab_content = $(`div.dependencies.tab-content-list > div:nth-child(${child_num})`);
      json_raw["dependencies"][i] = new Object();
      let name_raw = tab_content.find("#dependencies_uuid").val();
      if (isUUID(name_raw)) {
        json_raw["dependencies"][i]["uuid"] = name_raw;
      } else {
        json_raw["dependencies"][i]["module_name"] = name_raw;
      }
      let version_raw = tab_content.find("#dependencies-version").val();
      if (new RegExp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/).test(version_raw)) {
        json_raw["dependencies"][i]["version"] = DataReplacer.register(
          version_raw.split(/\./).map((v) => Number(v))
        );
      } else if (
        new RegExp(
          /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
        ).test(version_raw)
      ) {
        json_raw["dependencies"][i]["version"] = version_raw;
      } else {
        json_raw["dependencies"][i]["version"] = DataReplacer.register([1, 0, 0]);
      }
    }
  }
  if (is_capabilities_enable && $("div.capabilities_list div input").is(":checked")) {
    json_raw["capabilities"] = new Array();
    if ($("#experimental_custom_ui").is(":checked")) {
      json_raw["capabilities"].push("experimental_custom_ui");
    }
    if ($("#chemistry").is(":checked")) {
      json_raw["capabilities"].push("chemistry");
    }
    if ($("#raytraced").is(":checked")) {
      json_raw["capabilities"].push("raytraced");
    }
    if ($("#script_eval").is(":checked")) {
      json_raw["capabilities"].push("script_eval");
    }
    if ($("#editorExtension").is(":checked")) {
      json_raw["capabilities"].push("editorExtension");
    }
  }
  json_raw["metadata"] = new Object();
  if (is_metadata_enable) {
    // authors
    const authors = $("input.metadata_author");
    if (
      (() => {
        for (let index = 0; index < authors.length; index++) {
          if (authors.eq(index).val() != "") return true;
        }
        return false;
      })()
    ) {
      json_raw["metadata"]["authors"] = new Array();
      for (let i = 0; i < authors.length; i++) {
        json_raw["metadata"]["authors"].push(DataReplacer.register(authors.eq(i).val()));
      }
    }
    // url
    if ($("#metadata_url").val() != "")
      json_raw["metadata"]["url"] = DataReplacer.register($("#metadata_url").val());
    // license
    if ($("#metadata_license").val() != "")
      json_raw["metadata"]["license"] = DataReplacer.register($("#metadata_license").val());
  }
  // generated_with
  json_raw["metadata"]["generated_with"] = new Object();
  generated_with["TokaTools-Manifest-Generator"] = Array.from(
    new Set([...(generated_with["TokaTools-Manifest-Generator"] ?? new Array())]).add(VERSION)
  );
  for (const key in generated_with) {
    json_raw["metadata"]["generated_with"][key] = DataReplacer.register(generated_with[key]);
  }
  if (is_subpacks_enable) {
    json_raw["subpacks"] = new Array();
    const subpacks_length = $(".subpacks.tab-children").length;
    for (let i = 0; i < subpacks_length; i++) {
      const child_num = i + 1;
      json_raw["subpacks"][i] = new Object();
      const tab_content = $(`div.subpacks.tab-content-list > div:nth-child(${child_num})`);
      json_raw["subpacks"][i]["folder_name"] = tab_content.find("#subpacks_folder_name").val();
      json_raw["subpacks"][i]["name"] = DataReplacer.register(
        $(`div.subpacks.tab-content-list > div:nth-child(${child_num}) #subpacks_name`).val()
      );
      json_raw["subpacks"][i]["memory_tier"] = Number(
        tab_content.find("#subpacks_memory_tier").val()
      );
    }
  }
  return DataReplacer.replaceAll(
    JSON.stringify(json_raw, undefined, is_compact ? undefined : "  "),
    is_compact
  );
}

/**
 * シンプルモードのデータ同期
 */
function syncSimpleData() {
  const simple_name_elem = $("#simple_pack_name");
  const simple_name_elem_val = /** @type {string}*/ (simple_name_elem.val());
  const simple_description_elem = $("#simple_description");
  const simple_description_elem_val = /**@type {string} */ (simple_description_elem.val());
  const name_elem = $("#header_pack_name");
  const description_elem = $("#header_description");
  name_elem.val(simple_name_elem_val);
  description_elem.val(simple_description_elem_val);
  // UUID自動セット
  const header_uuid = $("#header_uuid");
  if (header_uuid.val() == "") {
    header_uuid.val(getUuid_v4());
    isChanged = true;
  }
  // モジュールの設定
  const modules_length = $(".modules.tab-children").length;
  for (let i = 0; i < modules_length; i++) {
    const child_num = i + 1;
    const modules_content = $(`.modules.tab-content-list > div:nth-child(${child_num})`);
    const modules_type = modules_content.find(`#modules_type`);
    let type = "data",
      module_name = "behavior";
    switch ($(`input[type="radio"][name="simple_type_child"]:checked`).val()) {
      case "behavior":
        type = "data";
        module_name = "behavior";
        break;
      case "texture":
        type = "resources";
        module_name = "resources";
        break;
      case "world":
        type = "world_template";
        module_name = "world template";
        break;
      case "skin":
        type = "skin_pack";
        module_name = "skin pack";
        break;
      default:
        break;
    }
    // モジュール変更
    if (modules_type.val() != type) {
      module_description = "";
    }
    modules_type.val(type);
    // description モジュール変更＆もともと空のときセット
    const modules_description = modules_content.find(`#modules_description`);
    if (module_description == "") {
      // §とバックスラッシュを削除
      modules_description.val(
        `${[simple_name_elem_val.replace(/§.|\\n/g, ""), module_name]
          .filter((v) => v)
          .join(" ")} module`
      );
      isChanged = true;
    }
    // モジュールUUIDセット
    const modules_uuid = modules_content.find("#modules_uuid");
    if (modules_uuid.val() == "") {
      modules_uuid.val(getUuid_v4());
      isChanged = true;
    }
  }
}

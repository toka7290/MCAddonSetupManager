// 宣言
var isChanged = false;
var format_version = 2;
var is_separator_drag = false;
var is_dependencies_enable = false;
var is_capabilities_enable = false;
var is_metadata_enable = false;
var is_subpacks_enable = false;
var is_world_template = false;
var is_skin_pack = false;
var is_compact = false;
var timeoutID;
var is_can_issue = true;
var help_page_num = 0;

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
      this.replace_point[`"${key}"`] = data.replace(/\\[^n\\]|\\$/g, "");
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
                .join("[ ")
                .split(/,/)
                .join(", ")
                .split(/\]$/)
                .join(" ]");
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
    $("span.issue-error-num").text("エラー:" + this.error_list.length);
    $("span.issue-warning-num").text("警告:" + this.warning_list.length);
    if (this.warning_list.length <= 0 && this.error_list.length <= 0) {
      $("ul.issue-list").append("<li>問題はありません</li>");
    } else {
      this.error_list.forEach((val) => {
        $("ul.issue-list").append(
          $("<li>").append(
            $("<img>").attr({
              src: "img/error.svg",
              alt: "",
              width: "19px",
              height: "19px",
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
              src: "img/warning.svg",
              alt: "",
              width: "19px",
              height: "19px",
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
$(window).bind("beforeunload", function () {
  if (isChanged) {
    return "このページを離れようとしています。";
  }
});

/* ------------------------- UI 制御 ------------------------- */
// input,textarea,select変更
$(document).on("change keyup", "input,textarea,select", function () {
  onChangedJSON();
  isChanged = true;
});
$(window).on("load", function () {
  onChangedJSON();
});
// 改行入力制限
$("textarea").on("keydown", function (e) {
  if (e.key == "Enter") return false;
});
// セパレータ移動
$(".separator").on("mousedown", function (e) {
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
$(window).resize(function () {
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
  let tabChildren = $(className + ".tab-children");
  if (
    tabChildren.length > 1 &&
    ($(this).hasClass("modules") ||
      (is_subpacks_enable && $(this).hasClass("subpacks")) ||
      (is_dependencies_enable && $(this).hasClass("dependencies")))
  ) {
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
  onChangedJSON();
  e.stopPropagation();
});
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
          class: "metadata_author",
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
  $("#page-share")
    .addClass("supported")
    .on("click", async () => {
      await navigator.share({
        title: "とかさんの Manifest Generator",
        text: "とかさんの Manifest Generator -manifest.jsonを簡単に作成・編集-",
        url: "https://toka7290.github.io/MCAddonSetupManager/",
      });
    });
}
// 外部インポート
$("#input-file").on("change", function () {
  importJsonFile();
});
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
    window.alert("このファイルはmanifest.jsonではありません。manifest.jsonを選択してください。");
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
$(document).on("drop", function (/** @type {jQuery.Event} */ _event) {
  isChanged = true;
  $(".file-drop-zone").addClass("hide");
  var event = _event;
  if (_event.originalEvent) {
    event = _event.originalEvent;
  }
  event.stopPropagation();
  event.preventDefault();
  $("#input-file").prop("files", event.dataTransfer.files);
  importJsonFile();
});
// コンパクト
$("#control_compact").on("click", function (ev) {
  is_compact = ev.target.checked;
});
// コピー
$("#control_copy").on("click", function () {
  const codeBuffer = $("textarea#code-buffer");
  codeBuffer.select();
  document.execCommand("copy");
  $("p#control_copy_text").text("Copied");
  codeBuffer.blur();
  setTimeout(function () {
    $("p#control_copy_text").text("Copy");
  }, 1000);
});
// ダウンロード
$("#control_download").on("click", function () {
  let content = $("textarea#code-buffer").val();
  $("<a></a>", {
    href: window.URL.createObjectURL(new Blob([content])),
    download: "manifest.json",
    target: "_blank",
  })[0].click();
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
  setDisabled();
  setControls();
  setSelectRestriction();

  if (is_can_issue) checkIssue();
  setDelayIssue();
  const json_code = getJSONData();
  $("pre.language-json code.language-json").remove();
  $("pre.language-json").append($("<code>").addClass("language-json").text(json_code));
  $("textarea#code-buffer").val(json_code);
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
  // タイトル
  let title = $("#header_pack_name").val().toString();
  if (title == "") title = "名前がありません";
  else if (title.match(/\\/g) != null) {
    let split_text = title.split("\\\\");
    let result = "";
    for (const index in split_text) {
      let i = split_text[index].indexOf("\\n");
      if (index >= 1) result += `\\\\`;
      if (i != -1) {
        result += `${
          split_text[index].slice(0, split_text[index].indexOf("\\n") - split_text[index].length) +
          "\u2026"
        }`;
        break;
      } else {
        result += `${split_text[index]}`;
      }
    }
    title = result;
  }
  $("#card-title").html(MinecraftText.toHTML(title));
  // 説明
  let description = $("#header_description").val().toString();
  if (description == "") description = "§c不明なパックの説明";
  else if (description.match(/\\/g) != null) {
    let position = 0;
    let i = 0;
    let result = "";
    let split_text = description.split("\\\\");
    for (const index in split_text) {
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
  $("#card-description").html(MinecraftText.toHTML(description));
  MinecraftText.refeashObfuscate();
}
// モジュールタイプ変更
function setSelectRestriction() {
  //type取得
  let selected_modules = Array.prototype.map.call(
    $(`.modules.tab-content-list > div #modules_type`),
    (elem) => elem.value
  );
  // 共通制限
  is_world_template = selected_modules.some((m) => m == "world_template");
  is_skin_pack = selected_modules.some((m) => m == "skin_pack");
  $("#header_min_engine_version").toggleClass("disabled", is_world_template || is_skin_pack);
  $("#header_min_engine_version_input input").prop("disabled", is_world_template || is_skin_pack);
  $("#header_base_game_version").toggleClass("disabled", format_version >= 2 && !is_world_template);
  $("#header_base_game_version_input input").prop(
    "disabled",
    format_version >= 2 && !is_world_template
  );
  $("#header_lock_template_options")
    .prop("disabled", !is_world_template)
    .parent()
    .toggleClass("disabled", !is_world_template);
  $("#header_pack_scope_label").toggleClass("disabled", is_world_template || is_skin_pack);
  $("#header_pack_scope").prop("disabled", is_world_template || is_skin_pack);
  // モジュールの追加制限
  // 共存不可のモジュールがある場合は終了
  if (is_world_template || is_skin_pack || selected_modules.some((m) => m == "resources"))
    return setTabControls(".modules", [true, 0, 0]);
  // モジュール制限
  let disabled_module = [false, false, false, false, false, false, false];
  const m_num = {
    ["data"]: 0,
    ["resources"]: 1,
    ["client_data"]: 2,
    ["javascript"]: 3,
    ["interface"]: 4,
    ["world_template"]: 5,
    ["skin_pack"]: 6,
  };
  for (let index = 0; index < selected_modules.length; index++) {
    // 切替
    disabled_module.forEach((val, i) => {
      $(
        `.modules.tab-content-list > div:nth-child(${index + 1}) #modules_type option:nth-child(${
          i + 1
        })`
      ).prop("disabled", val);
    });
    // 無効なモジュールを選択している場合に変更
    if (disabled_module[m_num[selected_modules[index]]]) {
      const enable_module = disabled_module.indexOf(false);
      const type_elem = $(
        `.modules.tab-content-list > div:nth-child(${index + 1}) #modules_type`
      ).prop("selectedIndex", enable_module);
      disabled_module[enable_module] = true;
      selected_modules[index] = type_elem.val();
    }
    // 選択しているモジュールを除外
    disabled_module[m_num[selected_modules[index]]] = true;
    // もともとの除外項目
    if (!index)
      ["resources", "world_template", "skin_pack"].forEach((val) => {
        disabled_module[m_num[val]] = true;
      });
    // "entry"の切替
    $(`.modules.tab-content-list > div:nth-child(${index + 1}) #modules_entry_label`).toggleClass(
      "disabled",
      selected_modules[index] != "javascript"
    );
    $(`.modules.tab-content-list > div:nth-child(${index + 1}) #modules_entry`).prop(
      "disabled",
      selected_modules[index] != "javascript"
    );
  }
  // まだ追加できるモジュールがあれば追加を許可
  return setTabControls(".modules", [true, disabled_module.some((v) => v == false), 1]);
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
          "[Header:min engine version] フォーマットバージョン1では1.13より低いバージョンに設定する必要があります。これより高いバージョンはフォーマットバージョン2でサポートしています。",
          element.parent().find("input")
        );
      }
      break;
    case 2:
      if (element_val <= 1 && Number($("#header_min_engine_version_minor").val()) < 13) {
        // 1.12以下はエラー
        issue_control.addError(
          "[Header:min engine version] version1.12以下を指定することはできません。",
          element.parent().find("input")
        );
      }
      if (
        Number($("#header_base_game_version_major").val()) <= 1 &&
        Number($("#header_base_game_version_minor").val()) < 13
      ) {
        // 1.12以下はエラー
        issue_control.addError(
          "[Header:base game version] version1.12以下を指定することはできません。",
          $("#header_base_game_version_major").parent().find("input")
        );
      }
      break;
  }
  element = $("#header_pack_name");
  element_val = element.val();
  if (element_val == "") {
    //名前がありません
    issue_control.addWarning(
      '[Header:name] 名前が空です。名前が空の場合、"名前がありません"と表示されます。',
      element
    );
  } else if (element_val.toString().replace(/\\\\/g, "").slice(-1) == "\\") {
    //名前の最後の文字がバックスラッシュ
    issue_control.addError(
      '[Header:name] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
      element
    );
  }
  element = $("#header_description");
  element_val = element.val();
  if (element_val == "") {
    //説明がありません
    issue_control.addWarning(
      '[Header:description] 説明がありません。説明が空の場合、"不明なパックの説明"と表示されます。',
      element
    );
  } else if (element_val.toString().replace(/\\\\/g, "").slice(-1) == "\\") {
    //説明の最後の文字がバックスラッシュ
    issue_control.addError(
      '[Header:description] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
      element
    );
  }
  element = $("#header_uuid");
  element_val = element.val();
  if (element_val == "") {
    issue_control.addError(`[Header:uuid] UUIDが空です。UUIDを入力してください。`, element);
  } else if (!isUUID(element_val)) {
    //UUIDではありません
    issue_control.addError(
      "[Header:uuid] 入力されている文字列は有効なUUIDではありません。",
      element
    );
  }
  // モジュール
  const modules_length = $(".modules.tab-children").length;
  for (let i = 0; i < modules_length; i++) {
    const c_num = i + 1;
    element = $(`.modules.tab-content-list > div:nth-child(${c_num}) #modules_type`);
    let module_name = element.val();
    if (module_name == null) {
      issue_control.addError(
        `[Modules:${i}:type] typeがnullになっています。typeを選択してください。`,
        element
      );
    }
    element = $(`.modules.tab-content-list > div:nth-child(${c_num}) #modules_description`);
    element_val = element.val();
    if (element_val == "") {
      // 説明がありません
      issue_control.addWarning(`[Modules:${i}:description] 説明がありません。`, element);
    } else if (element_val.replace(/\\\\/g, "").slice(-1) == "\\") {
      //最後の文字がバックスラッシュ
      issue_control.addError(
        `[Modules:${i}:description] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。`,
        element
      );
    }
    element = $(`.modules.tab-content-list > div:nth-child(${c_num}) #modules_uuid`);
    element_val = element.val();
    if (element_val == "") {
      issue_control.addError(`[Modules:${i}:uuid] UUIDが空です。UUIDを入力してください。`, element);
    } else if (!isUUID(element_val)) {
      //UUIDではありません
      issue_control.addError(
        `[Modules:${i}:uuid] 入力されている文字列は有効なUUIDではありません。`,
        element
      );
    }
    if (module_name == "javascript") {
      element = $(`.modules.tab-content-list > div:nth-child(${c_num}) #modules_entry`);
      element_val = element.val();
      if (element_val == "") {
        //空です
        issue_control.addError(
          `[Modules:${i}:entry] プライマリファイルが指定されていません`,
          element
        );
      } else if (!element_val.match(/\.js$/)) {
        //JSではありません
        issue_control.addError(
          `[Modules:${i}:entry] 指定されたファイルは .js の拡張子を持っていません。 プライマリファイルはJavaScriptファイル以外をサポートしません。`,
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
        issue_control.addError(
          `[Dependencies:${i}:uuid] UUIDが空です。UUIDを入力してください。`,
          element
        );
      } else if (!isUUID(element_val)) {
        //UUIDではありません
        issue_control.addError(
          `[Dependencies:${i}:uuid] 入力されている文字列は有効なUUIDではありません。`,
          element
        );
      }
    }
  }
  if (is_capabilities_enable) {
    if (
      !$("#experimental_custom_ui").is(":checked") &&
      !$("#chemistry").is(":checked") &&
      !$("#raytracing").is(":checked")
    ) {
      //空です
      issue_control.addWarning(
        "[Capabilities] 一つも項目が選択されていません。",
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
          issue_control.addWarning(`[Metadata:author:${i}] 名前が空です。`, element);
        } else if (element_val.replace(/\\\\/g, "").slice(-1) == "\\") {
          //名前の最後の文字がバックスラッシュ
          issue_control.addError(
            `[Metadata:author:${i}] 最後の文字がバックスラッシュ"\\"です。消去するかエスケープ文字にして再登録してください。`,
            element
          );
        }
      }
    } else {
      // 名前が一つもありません。
      issue_control.addWarning("[Metadata:author] 名前が一つもありません。", $("div.add_author"));
    }
    element = $("#metadata_url");
    element_val = element.val();
    if (element_val == "") {
      //URLがありません
      issue_control.addWarning("[Metadata:url] URLが入力されていません。", element);
    } else if (element_val.replace(/\\\\/g, "").slice(-1) == "\\") {
      //urlの最後の文字がバックスラッシュ
      issue_control.addError(
        '[Metadata:url] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
        element
      );
    }
    element = $("#metadata_license");
    element_val = element.val();
    if (element_val == "") {
      //Licenseがありません
      issue_control.addWarning("[Metadata:license] ライセンスが入力されていません。", element);
    } else if (element_val.toString().replace(/\\\\/g, "").slice(-1) == "\\") {
      //ライセンスの最後の文字がバックスラッシュ
      issue_control.addError(
        '[Metadata:license] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
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
        issue_control.addError(`[Subpacks:${i}:folder_name] フォルダー名が空です。`, element);
      }
      element = tab_content.find("#subpacks_name");
      element_val = element.val().toString();
      if (element_val == "") {
        issue_control.addError(`[Subpacks:${i}:name] 名前が空です。`, element);
      } else if (element_val.replace(/\\\\/g, "").slice(-1) == "\\") {
        //名前の最後の文字がバックスラッシュ
        issue_control.addError(
          `[Subpacks:${i}:name] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。`,
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
  if (lineIndex != -1) {
    const line = parseInt(splitText[lineIndex + 1], 10);
    const getBeginningOfLineIndex = (maxLine) => {
      let lastIndex = 0;
      for (let i = 1; i < maxLine; i++) {
        lastIndex = text.indexOf("\n", lastIndex) + 1;
      }
      return lastIndex;
    };
    const prevLineIndex = getBeginningOfLineIndex(line - 1);
    const LineLastIndex = getBeginningOfLineIndex(line + 1) - 1;
    messageText += `\n${line - 1}~${line}行で問題が発生しました。\n${text.substring(
      prevLineIndex,
      LineLastIndex
    )}`;
  } else if (positionIndex != -1) {
    const position = splitText[positionIndex + 1];
    const prevLineIndex = text.lastIndexOf("\n", text.lastIndexOf("\n", position) - 1) + 1;
    const prevLineNum = text.substr(0, prevLineIndex).match(/\n/g)?.length ?? 0 + 1;
    messageText += `\n${prevLineNum}~${prevLineNum + 1}行で問題が発生しました。\n${text.substring(
      prevLineIndex,
      text.indexOf("\n", position - 1)
    )}`;
  }
  return messageText;
}
// jsonデータ取り出し
function setJSONData(json_text = "") {
  let json_data = {};
  try {
    json_data = JSON.parse(json_text);
  } catch (e) {
    window.alert(`${setErrorText(json_text, e.message)}\nコメントアウトを除去して再度試みます。\n`);
    try {
      var data = json_text.replace(/\/\*[\s\S]*?\*\/ | \/\/(?=.*)(?!.*(\"\,|\")).*/g, "");
      json_data = JSON.parse(data);
    } catch (e) {
      window.alert(setErrorText(data, e.message));
      console.error("error:" + e);
      return;
    }
  }
  // format_versionがない場合pack_manifest検査
  if (json_data["format_version"] != null) {
    $("#format_version").val(json_data["format_version"]);
  } else if (json_data["header"]["modules"] != null) {
    // pack_manifest.json
    if (json_data["header"]["pack_id"] != null) {
      $("#header_uuid").val(json_data["header"]["pack_id"]);
    }
    if (json_data["header"]["name"] != null) {
      $("#header_pack_name").val(json_data["header"]["name"]);
    }
    if (json_data["header"]["packs_version"] != null) {
      const header_version = json_data["header"]["packs_version"].split(".");
      if (header_version[0] != null) {
        $("#header_version_major").val(header_version[0]);
      }
      if (header_version[1] != null) {
        $("#header_version_minor").val(header_version[1]);
      }
      if (header_version[2] != null) {
        $("#header_version_patch").val(header_version[2]);
      }
    }
    if (json_data["header"]["description"] != null) {
      $("#header_description").val(json_data["header"]["description"]);
    }
    if (json_data["header"]["modules"] != null) {
      for (let i = 0; i < json_data["header"]["modules"].length; i++) {
        const child_num = i + 1;
        if (i > 0) {
          addTab("modules");
        }
        if (json_data["header"]["modules"][i]["type"] != null) {
          $(".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_type").val(
            json_data["header"]["modules"][i]["type"]
          );
        }
        if (json_data["header"]["modules"][i]["description"] != null) {
          $(
            ".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_description"
          ).val(json_data["header"]["modules"][i]["description"]);
        }
        if (json_data["header"]["modules"][i]["version"] != null) {
          const modules_version = json_data["header"]["modules"][i]["version"].split(".");
          if (modules_version[0] != null) {
            $(
              ".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_version_major"
            ).val(modules_version[0]);
          }
          if (modules_version[1] != null) {
            $(
              ".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_version_minor"
            ).val(modules_version[1]);
          }
          if (modules_version[2] != null) {
            $(
              ".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_version_patch"
            ).val(modules_version[2]);
          }
        }
        if (json_data["header"]["modules"][i]["uuid"] != null) {
          $(".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_uuid").val(
            json_data["header"]["modules"][i]["uuid"]
          );
        }
      }
    }
    if (json_data["header"]["dependencies"] != null) {
      $("#dependencies_enable").prop("checked", true);
      for (let i = 0; i < json_data["header"]["dependencies"].length; i++) {
        const child_num = i + 1;
        if (i > 0) {
          addTab("dependencies");
        }
        const tab_content = $(
          "div.dependencies.tab-content-list > div:nth-child(" + child_num + ")"
        );
        if (json_data["header"]["dependencies"][i]["uuid"] != null) {
          tab_content
            .find("#dependencies_uuid")
            .val(json_data["header"]["dependencies"][i]["uuid"]);
        }
        if (json_data["header"]["dependencies"][i]["version"] != null) {
          const modules_version = json_data["header"]["dependencies"][i]["version"].split(".");
          if (modules_version[0] != null) {
            tab_content.find("#dependencies_version_major").val(modules_version[0]);
          }
          if (modules_version[1] != null) {
            tab_content.find("#dependencies_version_minor").val(modules_version[1]);
          }
          if (modules_version[2] != null) {
            tab_content.find("#dependencies_version_patch").val(modules_version[2]);
          }
        }
      }
    }
    window.alert("古い形式(pack_manifest.json)から変換します。");
    onChangedJSON();
    return;
  }
  $("#header_pack_name").val(json_data["header"]?.["name"] ?? "");
  $("#header_description").val(json_data["header"]?.["description"] ?? "");
  $("#header_version_major").val(json_data["header"]?.["version"]?.[0] ?? 1);
  $("#header_version_minor").val(json_data["header"]?.["version"]?.[1] ?? 0);
  $("#header_version_patch").val(json_data["header"]?.["version"]?.[2] ?? 0);
  // return;
  if (json_data["header"]["min_engine_version"] != null) {
    if (json_data["header"]["min_engine_version"][0] != null) {
      $("#header_min_engine_version_major").val(json_data["header"]["min_engine_version"][0]);
    }
    if (json_data["header"]["min_engine_version"][1] != null) {
      $("#header_min_engine_version_minor").val(json_data["header"]["min_engine_version"][1]);
    }
    if (json_data["header"]["min_engine_version"][2] != null) {
      $("#header_min_engine_version_patch").val(json_data["header"]["min_engine_version"][2]);
    }
  }
  if (json_data["header"]["uuid"] != null) {
    $("#header_uuid").val(json_data["header"]["uuid"]);
  }
  if (json_data["header"]["platform_locked"] != null && json_data["header"]["platform_locked"]) {
    $("#header_platform_locked").prop("checked", true);
  }
  if (json_data["header"]["base_game_version"] != null) {
    if (json_data["header"]["base_game_version"][0] != null) {
      $("#header_base_game_version_major").val(json_data["header"]["base_game_version"][0]);
    }
    if (json_data["header"]["base_game_version"][1] != null) {
      $("#header_base_game_version_minor").val(json_data["header"]["base_game_version"][1]);
    }
    if (json_data["header"]["base_game_version"][2] != null) {
      $("#header_base_game_version_patch").val(json_data["header"]["base_game_version"][2]);
    }
  }
  $("#header_lock_template_options").prop(
    "checked",
    json_data["header"]["lock_template_options"] ?? false
  );
  $("#header_pack_scope").val(json_data["header"]["pack_scope"] ?? "none");

  if (json_data["modules"] != null) {
    for (let i = 0; i < json_data["modules"].length; i++) {
      const child_num = i + 1;
      if (i > 0) {
        addTab("modules");
      }
      if (json_data["modules"][i]["type"] != null) {
        $(".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_type").val(
          json_data["modules"][i]["type"]
        );
      }
      if (json_data["modules"][i]["description"] != null) {
        $(".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_description").val(
          json_data["modules"][i]["description"]
        );
      }
      if (json_data["modules"][i]["version"] != null) {
        if (json_data["modules"][i]["version"][0] != null) {
          $(
            ".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_version_major"
          ).val(json_data["modules"][i]["version"][0]);
        }
        if (json_data["modules"][i]["version"][1] != null) {
          $(
            ".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_version_minor"
          ).val(json_data["modules"][i]["version"][1]);
        }
        if (json_data["modules"][i]["version"][2] != null) {
          $(
            ".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_version_patch"
          ).val(json_data["modules"][i]["version"][2]);
        }
      }
      if (json_data["modules"][i]["uuid"] != null) {
        $(".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_uuid").val(
          json_data["modules"][i]["uuid"]
        );
      }
      $(".modules.tab-content-list > div:nth-child(" + child_num + ") #modules_entry").val(
        json_data["modules"][i]?.["entry"]
      );
    }
  }
  if (json_data["dependencies"] != null) {
    $("#dependencies_enable").prop("checked", true);
    for (let i = 0; i < json_data["dependencies"].length; i++) {
      const child_num = i + 1;
      if (i > 0) {
        addTab("dependencies");
      }
      const tab_content = $("div.dependencies.tab-content-list > div:nth-child(" + child_num + ")");
      if (json_data["dependencies"][i]["uuid"] != null) {
        tab_content.find("#dependencies_uuid").val(json_data["dependencies"][i]["uuid"]);
      }
      if (json_data["dependencies"][i]["version"] != null) {
        if (json_data["dependencies"][i]["version"][0] != null) {
          tab_content
            .find("#dependencies_version_major")
            .val(json_data["dependencies"][i]["version"][0]);
        }
        if (json_data["dependencies"][i]["version"][1] != null) {
          tab_content
            .find("#dependencies_version_minor")
            .val(json_data["dependencies"][i]["version"][1]);
        }
        if (json_data["dependencies"][i]["version"][2] != null) {
          tab_content
            .find("#dependencies_version_patch")
            .val(json_data["dependencies"][i]["version"][2]);
        }
      }
    }
  }

  if (json_data["capabilities"] != null) {
    $("#capabilities_enable").prop("checked", true);
    for (const capabilities of json_data["capabilities"]) {
      switch (capabilities) {
        case "experimental_custom_ui":
          $("#experimental_custom_ui").prop("checked", true);
          break;
        case "chemistry":
          $("#chemistry").prop("checked", true);
          break;
        case "raytracing":
          $("#raytracing").prop("checked", true);
          break;
        default:
          break;
      }
    }
  }

  if (json_data["metadata"] != null) {
    $("#metadata_enable").prop("checked", true);
    if (json_data["metadata"]["authors"] != null) {
      for (const author of json_data["metadata"]["authors"]) {
        addAuthor(author);
      }
    }
    if (json_data["metadata"]["url"] != null) {
      $("#metadata_url").val(json_data["metadata"]["url"]);
    }
    if (json_data["metadata"]["license"] != null) {
      $("#metadata_license").val(json_data["metadata"]["license"]);
    }
  }
  if (json_data["subpacks"] != null) {
    $("#subpacks_enable").prop("checked", true);
    for (let i = 0; i < json_data["subpacks"].length; i++) {
      const child_num = i + 1;
      if (i > 0) {
        addTab("subpacks");
      }
      const tab_content = $("div.subpacks.tab-content-list > div:nth-child(" + child_num + ")");
      if (json_data["subpacks"][i]["folder_name"] != null) {
        tab_content.find("#subpacks_folder_name").val(json_data["subpacks"][i]["folder_name"]);
      }
      if (json_data["subpacks"][i]["name"] != null) {
        tab_content.find("#subpacks_name").val(json_data["subpacks"][i]["name"]);
      }
      if (json_data["subpacks"][i]["memory_tier"] != null) {
        tab_content.find("#subpacks_memory_tier").val(json_data["subpacks"][i]["memory_tier"]);
      }
    }
  }
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
  json_raw["header"]["version"] = DataReplacer.register([
    Number($("#header_version_major").val()),
    Number($("#header_version_minor").val()),
    Number($("#header_version_patch").val()),
  ]);
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
    const child_num = i + 1;
    const modules_content = $(`.modules.tab-content-list > div:nth-child(${child_num})`);
    json_raw["modules"][i] = new Object();
    json_raw["modules"][i]["type"] = modules_content.find(`#modules_type`).val();
    json_raw["modules"][i]["description"] = DataReplacer.register(
      modules_content.find(`#modules_description`).val()
    );
    json_raw["modules"][i]["version"] = DataReplacer.register([
      Number(modules_content.find(`#modules_version_major`).val()),
      Number(modules_content.find(`#modules_version_minor`).val()),
      Number(modules_content.find(`#modules_version_patch`).val()),
    ]);
    json_raw["modules"][i]["uuid"] = modules_content.find("#modules_uuid").val();
    json_raw["modules"][i]["entry"] =
      json_raw["modules"][i]["type"] == "javascript"
        ? DataReplacer.register(modules_content.find(`#modules_entry`).val())
        : undefined;
  }
  if (is_dependencies_enable) {
    json_raw["dependencies"] = new Array();
    const dependencies_length = $(".dependencies.tab-children").length;
    for (let i = 0; i < dependencies_length; i++) {
      const child_num = i + 1;
      const tab_content = $(`div.dependencies.tab-content-list > div:nth-child(${child_num})`);
      json_raw["dependencies"][i] = new Object();
      json_raw["dependencies"][i]["uuid"] = tab_content.find("#dependencies_uuid").val();
      json_raw["dependencies"][i]["version"] = DataReplacer.register([
        Number(tab_content.find("#dependencies_version_major").val()),
        Number(tab_content.find("#dependencies_version_minor").val()),
        Number(tab_content.find("#dependencies_version_patch").val()),
      ]);
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
    if ($("#raytracing").is(":checked")) {
      json_raw["capabilities"].push("raytracing");
    }
  }
  const isValue = [
    (() => {
      const author_length = $("label.author_name").length;
      for (let index = 0; index < author_length; index++) {
        if ($(".metadata_author").eq(index).val() != "") return true;
      }
      return false;
    })(),
    $("#metadata_url").val() != "",
    $("#metadata_license").val() != "",
  ];
  if (is_metadata_enable && isValue.some((ele) => ele)) {
    json_raw["metadata"] = new Object();
    if (isValue[0]) {
      json_raw["metadata"]["authors"] = new Array();
      const metadata_length = $("label.author_name").length;
      for (let i = 0; i < metadata_length; i++) {
        json_raw["metadata"]["authors"].push(
          DataReplacer.register($("input.metadata_author").eq(i).val())
        );
      }
    }
    if (isValue[1]) json_raw["metadata"]["url"] = DataReplacer.register($("#metadata_url").val());
    if (isValue[2])
      json_raw["metadata"]["license"] = DataReplacer.register($("#metadata_license").val());
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

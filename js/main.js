$(function () {
  // 宣言
  var isChanged = false;
  var format_version = 2;
  var is_separator_drag = false;
  var is_dependencies_enable = false;
  var is_capabilities_enable = false;
  var is_metadata_enable = false;
  var is_subpacks_enable = false;
  var is_world_template = false;
  var timeoutID;
  var is_can_issue = true;
  var help_page_num = 0;
  onChangedJSON();
  // ページ離脱時に警告表示
  $(window).bind("beforeunload", function () {
    if (isChanged) {
      return "このページを離れようとしています。";
    }
  });
  // 変更
  $(document).on("change", "input,textarea,select", function () {
    onChangedJSON();
    isChanged = true;
  });
  $(document).on("keyup", "input,textarea,select", function () {
    onChangedJSON();
    isChanged = true;
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
    separator.prev().removeClass("drag_lock");
    separator.next().removeClass("drag_lock");
  });
  $(document).on("mousemove", function (e) {
    if (is_separator_drag) {
      $("html").css("cursor", "e-resize");
      const separator = $(".separator");
      separator.prev().addClass("drag_lock");
      separator.next().addClass("drag_lock");
      const maxwidth = $("html").width() - 5;
      const next_width = maxwidth - e.clientX;
      const prev_width = maxwidth - next_width;
      separator.next().css("flex-basis", next_width);
      separator.prev().css("flex-basis", prev_width);
    }
  });
  // シェア
  $("#page_share").on("click", function () {
    const data = {
      title: "とかさんの Manifest Generator",
      text: "とかさんの Manifest Generator -manifest.jsonを簡単に作成・編集-",
      url: "https://toka7290.github.io/MCAddonSetupManager/",
    };
    if (navigator.share) {
      navigator.share(data);
    }
  });
  // 外部インポート
  $("#input_file").on("change", function () {
    importJsonFile();
  });
  // ヘルプを表示
  $("#show_help").on("click", function () {
    $("#page_help").fadeIn("fast");
    switchHelp();
  });
  $("#page_help").on("click", function () {
    switchHelp();
  });
  // ファイルドラッグ&ドロップ
  $(document).on("dragenter dragover", function (event) {
    event.stopPropagation();
    event.preventDefault();
    $(".file_drop_zone").removeClass("hide");
  });
  $(".file_drop_zone,.file_drop_zone_textarea").on(
    "dragleave",
    function (event) {
      event.stopPropagation();
      event.preventDefault();
      $(".file_drop_zone").addClass("hide");
    }
  );
  $(document).on("drop", function (_event) {
    isChanged = true;
    $(".file_drop_zone").addClass("hide");
    var event = _event;
    if (_event.originalEvent) {
      event = _event.originalEvent;
    }
    event.stopPropagation();
    event.preventDefault();
    $("#input_file").prop("files", event.dataTransfer.files);
    importJsonFile();
  });
  // プレビュー表示切替
  $("div#show_preview").on("click", function () {
    const show_preview = $("div#show_preview");
    $("div.preview").slideToggle();
    if (show_preview.hasClass("active")) {
      show_preview.removeClass("active");
    } else {
      show_preview.addClass("active");
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
  // about開く
  $("#open_about").on("click", function () {
    $("div.page_about").removeClass("about_hide");
  });
  // about閉じる
  $("#close_about_btn").on("click", function () {
    $("div.page_about").addClass("about_hide");
  });
  // コピー
  $("#control_copy").on("click", function () {
    const code_buffer = $("textarea#code_buffer");
    code_buffer.select();
    document.execCommand("copy");
    $("p#control_copy_text").text("Copied");
    code_buffer.blur();
    setTimeout(function () {
      $("p#control_copy_text").text("Copy");
    }, 1000);
  });
  // ダウンロード
  $("#control_download").on("click", function () {
    let content = $("textarea#code_buffer").val();
    $("<a></a>", {
      href: window.URL.createObjectURL(new Blob([content])),
      download: "manifest.json",
      target: "_blank",
    })[0].click();
  });
  // イシューリスト開閉
  $("div.issue_control_bar").on("click", function () {
    const control_bar_img = $("div.issue_control_bar img");
    if (control_bar_img.hasClass("close")) {
      // 開く
      control_bar_img.attr("class", "open");
    } else {
      // 閉じる
      control_bar_img.attr("class", "close");
    }
    $("div.issue_content").slideToggle();
  });

  // フォーマットバージョン変更
  $("#format_version").on("change", function () {
    format_version = Number($("#format_version").val());
  });
  //UUID生成
  $(document).on("click", 'input[type="button"].generate_uuid', function () {
    $(this).parents("div.type_uuid").find('input[type="text"]').val(getUuid_v4);
    onChangedJSON();
  });

  //tab変更
  $(document).on(
    "click",
    '.tab_children:not(:selected) input[type="button"]',
    function () {
      const className = $(this).attr("class");
      if (
        className == "modules" ||
        (is_dependencies_enable && className == "dependencies") ||
        (is_subpacks_enable && className == "subpacks")
      ) {
        const new_selected_tab = $(this).parent();
        const new_selected_index = new_selected_tab.index();
        $(`.${className}` + ".tab_children").removeClass("selected");
        new_selected_tab.addClass("selected");
        $(`.${className}` + ".tab_content_list>div")
          .removeClass("selected_tab_content")
          .eq(new_selected_index)
          .addClass("selected_tab_content");
      }
    }
  );
  //tab削除
  $("#modules_remove,#dependencies_remove,#subpacks_remove").on(
    "click",
    function (e) {
      const className = `.${$(this).attr("class")}`;
      let tab_children = $(className + ".tab_children");
      if (
        tab_children.length > 1 &&
        ($(this).hasClass("modules") ||
          (is_subpacks_enable && $(this).hasClass("subpacks")) ||
          (is_dependencies_enable && $(this).hasClass("dependencies")))
      ) {
        $(className + ".tab_children.selected").remove();
        $(className + ".tab_content_list>.selected_tab_content").remove();
        tab_children = $(className + ".tab_children");
        const tab_contents = $(className + ".tab_content_list>div");
        // 番号再振り当て
        let index_num = 0;
        for (let i = 0; i < tab_children.length; i++) {
          const tab_child = tab_children.eq(i);
          const tab_content = tab_contents.eq(i);
          if (i == 0) {
            tab_child.addClass("selected");
            tab_content.addClass("selected_tab_content");
          }
          const tab_number = tab_child.children("div.tab_number");
          tab_number.text(index_num);
          index_num++;
        }
      }
      onChangedJSON();
      e.stopPropagation();
    }
  );
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

  //author追加
  $("#author_add").on("click", function () {
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
  $("#author_remove").on("click", function () {
    $("div.authors_list>.author_name:last-child").remove();
    onChangedJSON();
  });
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
  //タブ追加
  function addTab(className = "") {
    const tab_body = $(`.${className}` + ".tab_body");
    const tab_number = tab_body.children("label").length;
    tab_body.append(
      $("<label>")
        .addClass(`${className} tab_children`)
        .append(
          $("<input>").attr({
            type: "button",
            class: className,
          }),
          $("<div>").addClass("tab_number").text(tab_number),
          $("<div>").addClass("tab_underBar")
        )
    );
    tab_body.children("li:last-child").hide().show(150);
    const tab_content_list = $(`.${className}` + ".tab_content_list");
    tab_content_list.append(
      tab_content_list
        .children("div:first-child")
        .clone()
        .removeClass("selected_tab_content")
    );
  }

  // インポート処理
  function importJsonFile() {
    const data = $("#input_file").prop("files")[0];
    const file_reader = new FileReader();
    file_reader.onload = function () {
      const json_text = file_reader.result;
      setJSONData(json_text);
    };
    try {
      file_reader.readAsText(data);
    } catch (e) {
      console.error("error:" + e);
    }
  }
  // ヘルプ切換
  function switchHelp() {
    switch (help_page_num) {
      case 1:
        $("#help_content_1").fadeOut("fast");
        $("#help_content_2").slideToggle("fast");
        help_page_num++;
        return;
      case 2:
        $("#help_content_2").slideToggle("fast");
        $("#help_content_3").fadeIn("fast");
        help_page_num++;
        return;
      case 3:
        $("#help_content_3").fadeOut("fast");
        $("#page_help").hide();
        help_page_num = 0;
        return;
      case 5:
        $("#help_content_1").hide();
        $("#help_content_2").hide();
        $("#help_content_3").hide();
        $("#page_help").hide();
        help_page_num = 0;
        return;
      case 0:
      default:
        $("#help_content_1").fadeIn("fast");
        help_page_num++;
        return;
    }
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
    $("#card_title").html(MinecraftText.toHTML(title));
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
            split_text[index].slice(
              0,
              position + 1 - split_text[index].length
            ) + "\u2026"
          }`;
          break;
        } else {
          result += `${split_text[index]}`;
        }
      }
      description = result;
    }
    $("#card_description").html(MinecraftText.toHTML(description));
    MinecraftText.refeashObfuscate();
  }
  // 更新処理
  function onChangedJSON() {
    setDisabled();
    setControls(setSelectRestriction());

    if (is_can_issue) checkIssue();
    setDelayIssue();
    const json_code = getJSONData();
    $("pre.language-json code.language-json").remove();
    const content = '<code class="language-json">' + json_code + "</code>";
    $("pre.language-json").append(content);
    $("textarea#code_buffer").val(json_code);
    updateDisplayPreview();
    Prism.highlightAll();
  }
  function setControls(module = [0, 0]) {
    setTabControls(".modules", [1, module]);
    [".dependencies", ".subpacks"].forEach((className, num) => {
      setTabControls(className, [
        [is_dependencies_enable, is_subpacks_enable][num],
        [is_dependencies_enable, is_subpacks_enable][num],
        $(className + ".tab_children").length > 1,
      ]);
    });
    // authors
    if ($(".author_name").length > 1)
      $(".remove_author")
        .removeClass("disabled")
        .find("input")
        .prop("disabled", false);
    else
      $(".remove_author")
        .addClass("disabled")
        .find("input")
        .prop("disabled", true);
  }
  function setTabControls(className = "", stat = [0, 0, 0]) {
    [".tab_body", ".add_tab", ".remove_tab"].forEach((control, index) => {
      const element = $(className + control);
      if (stat[index] == 1) {
        element.removeClass("disabled").find("input").prop("disabled", false);
      } else if (stat[index] == 0) {
        element.addClass("disabled").find("input").prop("disabled", true);
      }
    });
  }
  // チェックボックス変更
  function setDisabled() {
    is_dependencies_enable =
      $("#dependencies_enable").is(":checked") ||
      $("#dependencies_enable").is(":indeterminate");
    is_capabilities_enable =
      $("#capabilities_enable").is(":checked") ||
      $("#capabilities_enable").is(":indeterminate");
    is_metadata_enable =
      $("#metadata_enable").is(":checked") ||
      $("#metadata_enable").is(":indeterminate");
    is_subpacks_enable =
      $("#subpacks_enable").is(":checked") ||
      $("#subpacks_enable").is(":indeterminate");
    const dependencies_contents = $(
      ".dependencies.tab_content_list div.value_element"
    );
    if (is_dependencies_enable) {
      dependencies_contents.find("div.value_label").removeClass("disabled");
      dependencies_contents.find("input").prop("disabled", false);
      if ($("#dependencies_uuid").val() == "")
        $("#dependencies_enable").prop("indeterminate", true);
      else $("#dependencies_enable").prop("indeterminate", false);
    } else {
      dependencies_contents.find("div.value_label").addClass("disabled");
      dependencies_contents.find("input").prop("disabled", true);
    }
    const capabilities_contents = $(".capabilities_list .value_element");
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
    const metadata_contents = $(".metadata_list .value_element");
    if (is_metadata_enable) {
      metadata_contents.removeClass("disabled");
      metadata_contents.find("input").prop("disabled", false);
      if (
        ![
          $(".metadata_author").length > 0
            ? $(".metadata_author").val() != ""
            : false,
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
    const subpacks_contents = $(".subpacks.tab_content_list div.value_element");
    if (is_subpacks_enable) {
      subpacks_contents.find("div.value_label").removeClass("disabled");
      subpacks_contents.find("input").prop("disabled", false);
      if (
        !(
          $("#subpacks_folder_name").val() != "" ||
          $("#subpacks_name").val() != ""
        )
      )
        $("#subpacks_enable").prop("indeterminate", true);
      else $("#subpacks_enable").prop("indeterminate", false);
    } else {
      subpacks_contents.find("div.value_label").addClass("disabled");
      subpacks_contents.find("input").prop("disabled", true);
    }
  }
  // モジュールタイプ変更
  function setSelectRestriction() {
    is_world_template = false;
    let useable_module = [false, false, false, false, false];
    let module_num = {};
    module_num["resources"] = 0;
    module_num["data"] = 1;
    module_num["client_data"] = 2;
    module_num["interface"] = 3;
    module_num["world_template"] = 4;
    // クラスのリセット
    const min_engine_version = $("#min_engine_version").removeClass("disabled");
    const min_engine_version_input = $("#min_engine_version_input input").prop(
      "disabled",
      false
    );
    const base_game_version = $("#base_game_version").addClass("disabled");
    const base_game_version_input = $("#base_game_version_input input").prop(
      "disabled",
      true
    );
    const lock_template_options = $("#header_lock_template_options");
    lock_template_options.parent().addClass("disabled");
    lock_template_options.prop("disabled", true);
    const controls_tab_length = $(".modules.tab_children").length;
    // 使用切換
    for (let i = 1; i <= controls_tab_length; i++) {
      const modules_type = $(
        ".modules.tab_content_list > div:nth-child(" + i + ") #modules_type"
      );
      modules_type.children("option").prop("disabled", false);
      const modules_type_val = modules_type.val();
      if (useable_module[module_num[modules_type_val]] || i == 1) {
        switch (modules_type_val) {
          case "resources":
          case "interface":
            break;
          case "data":
            useable_module[2] = true;
            break;
          case "client_data":
            useable_module[1] = true;
            break;
          case "world_template":
            is_world_template = true;
            min_engine_version.addClass("disabled");
            min_engine_version_input.prop("disabled", true);
            if (format_version >= 2) {
              base_game_version.removeClass("disabled");
              base_game_version_input.prop("disabled", false);
            }
            lock_template_options.parent().removeClass("disabled");
            lock_template_options.prop("disabled", false);
            break;
        }
      } else {
        // 使用できるものに変更
        modules_type.val(Object.keys(module_num)[useable_module.indexOf(true)]);
      }
      type_prevention(controls_tab_length, useable_module, module_num);
    }
    return [
      useable_module.some((val) => {
        return val;
      }) && controls_tab_length <= 1,
      controls_tab_length > 1,
    ];
  }
  // 別タイプの選択制限
  function type_prevention(len, useable_module, module_num) {
    for (let i = 2; i <= len; i++) {
      for (let modules in module_num) {
        const module = $(
          `.modules.tab_content_list > div:nth-child(${i}) #modules_type option[value=${modules}]`
        );
        module.prop("disabled", !useable_module[module_num[modules]]);
      }
    }
  }
  // イシューチェック
  function checkIssue() {
    // イシュー削除
    $("ul.issue_list li").remove();
    $(".stat_warning,.stat_error").removeClass("stat_warning stat_error");
    const error_num = checkJSONError();
    const warning_num = checkJSONWarning();
    $("span.issue_warning_num").text("警告:" + warning_num);
    $("span.issue_error_num").text("エラー:" + error_num);
    if (warning_num <= 0 && error_num <= 0) {
      $("ul.issue_list").append("<li>問題はありません</li>");
    }
  }
  // 警告検査
  function checkJSONWarning() {
    let warning_num = 0;
    // format_version固有
    switch (format_version) {
      case 1:
        if (
          Number($("#header_min_engine_version_major").val()) > 1 ||
          Number($("#header_min_engine_version_minor").val()) >= 13
        ) {
          //1.13以上は警告
          addIssue(
            "warning",
            "[Header:min engine version] フォーマットバージョン1では1.13より低いバージョンに設定する必要があります。これより高いバージョンはフォーマットバージョン2でサポートしています。",
            $("#header_min_engine_version_major").parent().find("input")
          );
          warning_num++;
        }
        break;
      case 2:
        break;
    }
    if ($("#header_pack_name").val() == "") {
      //名前がありません
      addIssue(
        "warning",
        '[Header:name] 名前が空です。名前が空の場合、"名前がありません"と表示されます。',
        $("#header_pack_name")
      );
      warning_num++;
    }
    if ($("#header_description").val() == "") {
      //説明がありません
      addIssue(
        "warning",
        '[Header:description] 説明がありません。説明が空の場合、"不明なパックの説明"と表示されます。',
        $("#header_description")
      );
      warning_num++;
    }
    const modules_length = $(".modules.tab_children").length;
    for (let i = 0; i < modules_length; i++) {
      const child_num = i + 1;
      const modules_description = $(
        ".modules.tab_content_list > div:nth-child(" +
          child_num +
          ") #modules_description"
      );
      if (modules_description.val() == "") {
        //UUIDではありません
        addIssue(
          "warning",
          "[Modules:" + i + ":description] 説明がありません。",
          modules_description
        );
        warning_num++;
      }
    }
    if (is_capabilities_enable) {
      if (
        !$("#experimental_custom_ui").is(":checked") &&
        !$("#chemistry").is(":checked") &&
        !$("#raytracing").is(":checked")
      ) {
        //空です
        addIssue(
          "warning",
          "[Capabilities] 項目が一つも選択されていません。",
          $(".capabilities_list>input")
        );
        warning_num++;
      }
    }
    if (is_metadata_enable) {
      const metadata_length = $("label.author_name").length;
      if (metadata_length) {
        for (let i = 0; i < metadata_length; i++) {
          const author_name = $("input.metadata_author").eq(i);
          if (author_name.val() == "") {
            // 名前が空です。
            addIssue(
              "warning",
              `[Metadata:author:${i}] 名前が空です。`,
              author_name
            );
            warning_num++;
          }
        }
      } else {
        // 名前が一つもありません。
        addIssue(
          "warning",
          "[Metadata:author] 名前が一つもありません。",
          $("div.add_author")
        );
        warning_num++;
      }
      if ($("#metadata_url").val() == "") {
        //URLがありません
        addIssue(
          "warning",
          "[Metadata:url] URLが入力されていません。",
          $("#metadata_url")
        );
        warning_num++;
      }
      if ($("#metadata_license").val() == "") {
        //Licenseがありません
        addIssue(
          "warning",
          "[Metadata:license] ライセンスが入力されていません。",
          $("#metadata_license")
        );
        warning_num++;
      }
    }
    return warning_num;
  }
  // エラー検査
  function checkJSONError() {
    let error_num = 0;
    let element_val = $("#header_pack_name")
      .val()
      .toString()
      .replace(/\\\\/g, "");
    if (element_val.slice(-1) == "\\") {
      //名前の最後の文字がバックスラッシュ
      addIssue(
        "error",
        '[Header:name] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
        $("#header_pack_name")
      );
      error_num++;
    }
    element_val = $("#header_description")
      .val()
      .toString()
      .replace(/\\\\/g, "");
    if (element_val.slice(-1) == "\\") {
      //説明の最後の文字がバックスラッシュ
      addIssue(
        "error",
        '[Header:description] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
        $("#header_description")
      );
      error_num++;
    }
    switch (format_version) {
      case 1:
        break;
      case 2:
        if (
          Number($("#header_min_engine_version_major").val()) <= 1 &&
          Number($("#header_min_engine_version_minor").val()) < 13
        ) {
          // 1.12以下はエラー
          addIssue(
            "error",
            "[Header:min engine version] version1.12以下を指定することはできません。",
            $("#header_min_engine_version_major").parent().find("input")
          );
          error_num++;
        }
        if (
          Number($("#header_base_game_version_major").val()) <= 1 &&
          Number($("#header_base_game_version_minor").val()) < 13
        ) {
          // 1.12以下はエラー
          addIssue(
            "error",
            "[Header:base game version] version1.12以下を指定することはできません。",
            $("#header_base_game_version_major").parent().find("input")
          );
          error_num++;
        }
        break;
    }
    if (!isUUID($("#header_uuid").val())) {
      //UUIDではありません
      addIssue(
        "error",
        "[Header:uuid] 入力されている文字列は有効なUUIDではありません。",
        $("#header_uuid")
      );
      error_num++;
    }
    const modules_length = $(".modules.tab_children").length;
    for (let i = 0; i < modules_length; i++) {
      const child_num = i + 1;
      const modules_type = $(
        ".modules.tab_content_list > div:nth-child(" +
          child_num +
          ") #modules_type"
      );
      if (modules_type.val() == null) {
        addIssue(
          "error",
          "[Modules:" +
            i +
            ":type] typeがnullになっています。typeを選択してください。",
          modules_type
        );
        error_num++;
      }
      const modules_description = $(
        ".modules.tab_content_list > div:nth-child(" +
          child_num +
          ") #modules_description"
      );
      element_val = modules_description.val().replace(/\\\\/g, "");
      if (element_val.slice(-1) == "\\") {
        //urlの最後の文字がバックスラッシュ
        addIssue(
          "error",
          "[Modules:" +
            i +
            ':description] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
          modules_description
        );
        error_num++;
      }
      const modules_uuid = $(
        ".modules.tab_content_list > div:nth-child(" +
          child_num +
          ") #modules_uuid"
      );
      if (!isUUID(modules_uuid.val())) {
        //UUIDではありません
        addIssue(
          "error",
          "[Modules:" +
            i +
            ":uuid] 入力されている文字列は有効なUUIDではありません。",
          modules_uuid
        );
        error_num++;
      }
    }
    if (is_dependencies_enable) {
      const dependencies_length = $(".dependencies.tab_children").length;
      for (let i = 0; i < dependencies_length; i++) {
        const child_num = i + 1;
        const dependencies_uuid = $(
          "div.dependencies.tab_content_list > div:nth-child(" +
            child_num +
            ") #dependencies_uuid"
        );
        if (!isUUID(dependencies_uuid.val())) {
          //UUIDではありません
          addIssue(
            "error",
            "[Dependencies:" +
              i +
              ":uuid] 入力されている文字列は有効なUUIDではありません。",
            dependencies_uuid
          );
          error_num++;
        }
      }
    }
    if (is_metadata_enable) {
      const metadata_length = $("label.author_name").length;
      for (let i = 0; i < metadata_length; i++) {
        const author_name = $("input.metadata_author").eq(i);
        element_val = author_name.val().replace(/\\\\/g, "");
        if (element_val.slice(-1) == "\\") {
          //名前の最後の文字がバックスラッシュ
          addIssue(
            "error",
            "[Metadata:author:" +
              i +
              '] 最後の文字がバックスラッシュ"\\"です。消去するかエスケープ文字にして再登録してください。',
            author_name
          );
          error_num++;
        }
      }
      element_val = $("#metadata_url").val().replace(/\\\\/g, "");
      if (element_val.slice(-1) == "\\") {
        //urlの最後の文字がバックスラッシュ
        addIssue(
          "error",
          '[Metadata:url] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
          $("#metadata_url")
        );
        error_num++;
      }
      element_val = $("#metadata_license")
        .val()
        .toString()
        .replace(/\\\\/g, "");
      if (element_val.slice(-1) == "\\") {
        //ライセンスの最後の文字がバックスラッシュ
        addIssue(
          "error",
          '[Metadata:license] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
          $("#metadata_license")
        );
        error_num++;
      }
    }
    if (is_subpacks_enable) {
      const subpacks_length = $(".subpacks.tab_children").length;
      for (let i = 0; i < subpacks_length; i++) {
        const child_num = i + 1;
        const tab_content = $(
          "div.subpacks.tab_content_list > div:nth-child(" + child_num + ")"
        );
        const subpacks_folder_name = tab_content.find("#subpacks_folder_name");
        if (
          subpacks_folder_name.val() == null ||
          subpacks_folder_name.val() == ""
        ) {
          addIssue(
            "error",
            "[Subpacks:" + i + ":folder_name] フォルダー名が空です。",
            subpacks_folder_name
          );
          error_num++;
        }
        const subpacks_name = tab_content.find("#subpacks_name");
        const subpacks_name_val = subpacks_name.val().toString();
        if (subpacks_name_val == null || subpacks_name_val == "") {
          addIssue(
            "error",
            "[Subpacks:" + i + ":name] 名前が空です。",
            subpacks_name
          );
          error_num++;
        }
        element_val = subpacks_name_val.replace(/\\\\/g, "");
        if (element_val.slice(-1) == "\\") {
          //名前の最後の文字がバックスラッシュ
          addIssue(
            "error",
            "[Subpacks:" +
              i +
              ':name] 最後の文字がバックスラッシュ"\\"です。エスケープ文字にするか消去してください。',
            subpacks_name
          );
          error_num++;
        }
      }
    }
    return error_num;
  }
  // イシュー更新
  function addIssue(type, issue_content, issue_element) {
    let content = $("<li>");
    if (type == "warning") {
      content.append(
        $("<img>").attr({
          src: "img/warning.svg",
          alt: "",
          width: "19px",
          height: "19px",
        }),
        $("<p>").text(issue_content)
      );
      issue_element.addClass("stat_warning");
    } else if (type == "error") {
      content.append(
        $("<img>").attr({
          src: "img/error.svg",
          alt: "",
          width: "19px",
          height: "19px",
        }),
        $("<p>").text(issue_content)
      );
      issue_element.addClass("stat_error");
    }
    $("ul.issue_list").append(content);
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
  // エラー時のテキスト
  function setErrorText(text = "", message = "") {
    let messageText = "有効なjsonではありません。";
    // 空白の場合は何も付け足さない
    if (text == "" || message == "") return messageText;
    const splitText = message.split(" ");
    const lineIndex = splitText.findIndex((element) => element == "line");
    const positionIndex = splitText.findIndex(
      (element) => element == "position"
    );
    if (lineIndex != -1) {
      const line = parseInt(splitText[lineIndex + 1]);
      const getBeginningOfLineIndex = (maxLine) => {
        let lastIndex = 0;
        for (let i = 1; i < maxLine; i++) {
          lastIndex = text.indexOf("\n", lastIndex) + 1;
        }
        return lastIndex;
      };
      const prevLineIndex = getBeginningOfLineIndex(line - 1);
      const LineLastIndex = getBeginningOfLineIndex(line + 1) - 1;
      messageText += `\n${
        line - 1
      }~${line}行で問題が発生しました。\n${text.substring(
        prevLineIndex,
        LineLastIndex
      )}`;
    } else if (positionIndex != -1) {
      const position = splitText[positionIndex + 1];
      const prevLineIndex =
        text.lastIndexOf("\n", text.lastIndexOf("\n", position) - 1) + 1;
      const prevLineNum = text.substr(0, prevLineIndex).match(/\n/g).length + 1;
      messageText += `\n${prevLineNum}~${
        prevLineNum + 1
      }行で問題が発生しました。\n${text.substring(
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
      window.alert(setErrorText(json_text, e.message));
      console.error("error:" + e);
      return;
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
            $(
              ".modules.tab_content_list > div:nth-child(" +
                child_num +
                ") #modules_type"
            ).val(json_data["header"]["modules"][i]["type"]);
          }
          if (json_data["header"]["modules"][i]["description"] != null) {
            $(
              ".modules.tab_content_list > div:nth-child(" +
                child_num +
                ") #modules_description"
            ).val(json_data["header"]["modules"][i]["description"]);
          }
          if (json_data["header"]["modules"][i]["version"] != null) {
            const modules_version = json_data["header"]["modules"][i][
              "version"
            ].split(".");
            if (modules_version[0] != null) {
              $(
                ".modules.tab_content_list > div:nth-child(" +
                  child_num +
                  ") #modules_version_major"
              ).val(modules_version[0]);
            }
            if (modules_version[1] != null) {
              $(
                ".modules.tab_content_list > div:nth-child(" +
                  child_num +
                  ") #modules_version_minor"
              ).val(modules_version[1]);
            }
            if (modules_version[2] != null) {
              $(
                ".modules.tab_content_list > div:nth-child(" +
                  child_num +
                  ") #modules_version_patch"
              ).val(modules_version[2]);
            }
          }
          if (json_data["header"]["modules"][i]["uuid"] != null) {
            $(
              ".modules.tab_content_list > div:nth-child(" +
                child_num +
                ") #modules_uuid"
            ).val(json_data["header"]["modules"][i]["uuid"]);
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
            "div.dependencies.tab_content_list > div:nth-child(" +
              child_num +
              ")"
          );
          if (json_data["header"]["dependencies"][i]["uuid"] != null) {
            tab_content
              .find("#dependencies_uuid")
              .val(json_data["header"]["dependencies"][i]["uuid"]);
          }
          if (json_data["header"]["dependencies"][i]["version"] != null) {
            const modules_version = json_data["header"]["dependencies"][i][
              "version"
            ].split(".");
            if (modules_version[0] != null) {
              tab_content
                .find("#dependencies_version_major")
                .val(modules_version[0]);
            }
            if (modules_version[1] != null) {
              tab_content
                .find("#dependencies_version_minor")
                .val(modules_version[1]);
            }
            if (modules_version[2] != null) {
              tab_content
                .find("#dependencies_version_patch")
                .val(modules_version[2]);
            }
          }
        }
      }
      window.alert("古い形式(pack_manifest.json)から変換します。");
      onChangedJSON();
      return;
    }
    if (json_data["header"]["name"] != null) {
      $("#header_pack_name").val(json_data["header"]["name"]);
    }
    if (json_data["header"]["description"] != null) {
      $("#header_description").val(json_data["header"]["description"]);
    }
    if (json_data["header"]["version"] != null) {
      if (json_data["header"]["version"][0] != null) {
        $("#header_version_major").val(json_data["header"]["version"][0]);
      }
      if (json_data["header"]["version"][1] != null) {
        $("#header_version_minor").val(json_data["header"]["version"][1]);
      }
      if (json_data["header"]["version"][2] != null) {
        $("#header_version_patch").val(json_data["header"]["version"][2]);
      }
    }
    if (json_data["header"]["min_engine_version"] != null) {
      if (json_data["header"]["min_engine_version"][0] != null) {
        $("#header_min_engine_version_major").val(
          json_data["header"]["min_engine_version"][0]
        );
      }
      if (json_data["header"]["min_engine_version"][1] != null) {
        $("#header_min_engine_version_minor").val(
          json_data["header"]["min_engine_version"][1]
        );
      }
      if (json_data["header"]["min_engine_version"][2] != null) {
        $("#header_min_engine_version_patch").val(
          json_data["header"]["min_engine_version"][2]
        );
      }
    }
    if (json_data["header"]["uuid"] != null) {
      $("#header_uuid").val(json_data["header"]["uuid"]);
    }
    if (
      json_data["header"]["platform_locked"] != null &&
      json_data["header"]["platform_locked"]
    ) {
      $("#header_platform_locked").prop("checked", true);
    }
    if (json_data["header"]["base_game_version"] != null) {
      if (json_data["header"]["base_game_version"][0] != null) {
        $("#header_base_game_version_major").val(
          json_data["header"]["base_game_version"][0]
        );
      }
      if (json_data["header"]["base_game_version"][1] != null) {
        $("#header_base_game_version_minor").val(
          json_data["header"]["base_game_version"][1]
        );
      }
      if (json_data["header"]["base_game_version"][2] != null) {
        $("#header_base_game_version_patch").val(
          json_data["header"]["base_game_version"][2]
        );
      }
    }
    if (
      json_data["header"]["lock_template_options"] != null &&
      json_data["header"]["lock_template_options"]
    ) {
      $("#header_lock_template_options").prop("checked", true);
    }

    if (json_data["modules"] != null) {
      for (let i = 0; i < json_data["modules"].length; i++) {
        const child_num = i + 1;
        if (i > 0) {
          addTab("modules");
        }
        if (json_data["modules"][i]["type"] != null) {
          $(
            ".modules.tab_content_list > div:nth-child(" +
              child_num +
              ") #modules_type"
          ).val(json_data["modules"][i]["type"]);
        }
        if (json_data["modules"][i]["description"] != null) {
          $(
            ".modules.tab_content_list > div:nth-child(" +
              child_num +
              ") #modules_description"
          ).val(json_data["modules"][i]["description"]);
        }
        if (json_data["modules"][i]["version"] != null) {
          if (json_data["modules"][i]["version"][0] != null) {
            $(
              ".modules.tab_content_list > div:nth-child(" +
                child_num +
                ") #modules_version_major"
            ).val(json_data["modules"][i]["version"][0]);
          }
          if (json_data["modules"][i]["version"][1] != null) {
            $(
              ".modules.tab_content_list > div:nth-child(" +
                child_num +
                ") #modules_version_minor"
            ).val(json_data["modules"][i]["version"][1]);
          }
          if (json_data["modules"][i]["version"][2] != null) {
            $(
              ".modules.tab_content_list > div:nth-child(" +
                child_num +
                ") #modules_version_patch"
            ).val(json_data["modules"][i]["version"][2]);
          }
        }
        if (json_data["modules"][i]["uuid"] != null) {
          $(
            ".modules.tab_content_list > div:nth-child(" +
              child_num +
              ") #modules_uuid"
          ).val(json_data["modules"][i]["uuid"]);
        }
      }
    }
    if (json_data["dependencies"] != null) {
      $("#dependencies_enable").prop("checked", true);
      for (let i = 0; i < json_data["dependencies"].length; i++) {
        const child_num = i + 1;
        if (i > 0) {
          addTab("dependencies");
        }
        const tab_content = $(
          "div.dependencies.tab_content_list > div:nth-child(" + child_num + ")"
        );
        if (json_data["dependencies"][i]["uuid"] != null) {
          tab_content
            .find("#dependencies_uuid")
            .val(json_data["dependencies"][i]["uuid"]);
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
        const tab_content = $(
          "div.subpacks.tab_content_list > div:nth-child(" + child_num + ")"
        );
        if (json_data["subpacks"][i]["folder_name"] != null) {
          tab_content
            .find("#subpacks_folder_name")
            .val(json_data["subpacks"][i]["folder_name"]);
        }
        if (json_data["subpacks"][i]["name"] != null) {
          tab_content
            .find("#subpacks_name")
            .val(json_data["subpacks"][i]["name"]);
        }
        if (json_data["subpacks"][i]["memory_tier"] != null) {
          tab_content
            .find("#subpacks_memory_tier")
            .val(json_data["subpacks"][i]["memory_tier"]);
        }
      }
    }
    onChangedJSON();
  }
  // json 出力
  function getJSONData() {
    let json_raw = new Object();
    json_raw["format_version"] = format_version;

    json_raw["header"] = new Object();
    json_raw["header"]["name"] = "replace_header_pack_name";
    json_raw["header"]["description"] = "replace_header_description";
    json_raw["header"]["version"] = "replace_header_version";
    if (!is_world_template) {
      json_raw["header"]["min_engine_version"] =
        "replace_header_min_engine_version";
    }
    json_raw["header"]["uuid"] = $("#header_uuid").val();
    if ($("#header_platform_locked").is(":checked")) {
      json_raw["header"]["platform_locked"] = true;
    }
    if (is_world_template) {
      if (format_version >= 2) {
        json_raw["header"]["base_game_version"] = "replace_base_game_version";
      }
      json_raw["header"]["lock_template_options"] = $(
        "#header_lock_template_options"
      ).is(":checked");
    }

    json_raw["modules"] = new Array();
    const modules_length = $(".modules.tab_children").length;
    for (let i = 0; i < modules_length; i++) {
      const child_num = i + 1;
      json_raw["modules"][i] = new Object();
      json_raw["modules"][i]["type"] = $(
        `.modules.tab_content_list > div:nth-child(${child_num}) #modules_type`
      ).val();
      json_raw["modules"][i][
        "description"
      ] = `replace_modules_${i}_description`;
      json_raw["modules"][i]["version"] = `replace_modules_${i}_version`;
      json_raw["modules"][i]["uuid"] = $(
        ".modules.tab_content_list > div:nth-child(" +
          child_num +
          ") #modules_uuid"
      ).val();
    }
    if (is_dependencies_enable) {
      json_raw["dependencies"] = new Array();
      const dependencies_length = $(".dependencies.tab_children").length;
      for (let i = 0; i < dependencies_length; i++) {
        const child_num = i + 1;
        const tab_content = $(
          `div.dependencies.tab_content_list > div:nth-child(${child_num})`
        );
        json_raw["dependencies"][i] = new Object();
        json_raw["dependencies"][i]["uuid"] = tab_content
          .find("#dependencies_uuid")
          .val();
        json_raw["dependencies"][i][
          "version"
        ] = `replace_dependencies_${i}_version`;
      }
    }
    if (
      is_capabilities_enable &&
      $("div.capabilities_list div input").is(":checked")
    ) {
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
      $(".metadata_author").length > 0
        ? $(".metadata_author").val() != ""
        : false,
      $("#metadata_url").val() != "",
      $("#metadata_license").val() != "",
    ];
    if (is_metadata_enable && isValue.some((ele) => ele)) {
      json_raw["metadata"] = new Object();
      if (isValue[0]) {
        json_raw["metadata"]["authors"] = new Array();
        const metadata_length = $("label.author_name").length;
        for (let i = 0; i < metadata_length; i++) {
          json_raw["metadata"]["authors"].push(`replace_${i}_author`);
        }
      }
      if (isValue[1]) json_raw["metadata"]["url"] = "replace_metadata_url";
      if (isValue[2])
        json_raw["metadata"]["license"] = "replace_metadata_license";
    }
    if (is_subpacks_enable) {
      json_raw["subpacks"] = new Array();
      const subpacks_length = $(".subpacks.tab_children").length;
      for (let i = 0; i < subpacks_length; i++) {
        const child_num = i + 1;
        json_raw["subpacks"][i] = new Object();
        const tab_content = $(
          `div.subpacks.tab_content_list > div:nth-child(${child_num})`
        );
        json_raw["subpacks"][i]["folder_name"] = tab_content
          .find("#subpacks_folder_name")
          .val();
        json_raw["subpacks"][i]["name"] = "replace_subpacks_name";
        json_raw["subpacks"][i]["memory_tier"] = Number(
          tab_content.find("#subpacks_memory_tier").val()
        );
      }
    }

    return replaceJsonCode(`${JSON.stringify(json_raw, null, "  ")}`);
  }
  // json バージョン置き換え
  function replaceJsonCode(string_raw) {
    string_raw = string_raw.replace(
      "replace_header_pack_name",
      $("#header_pack_name").val()
    );
    string_raw = string_raw.replace(
      "replace_header_description",
      $("#header_description").val()
    );
    const header_version = JSON.stringify([
      Number($("#header_version_major").val()),
      Number($("#header_version_minor").val()),
      Number($("#header_version_patch").val()),
    ])
      .split(/,/)
      .join(", ");
    const min_engine_version = JSON.stringify([
      Number($("#header_min_engine_version_major").val()),
      Number($("#header_min_engine_version_minor").val()),
      Number($("#header_min_engine_version_patch").val()),
    ])
      .split(/,/)
      .join(", ");
    const header_base_game_version = JSON.stringify([
      Number($("#header_base_game_version_major").val()),
      Number($("#header_base_game_version_minor").val()),
      Number($("#header_base_game_version_patch").val()),
    ])
      .split(/,/)
      .join(", ");
    string_raw = string_raw.replace('"replace_header_version"', header_version);
    if (!is_world_template) {
      string_raw = string_raw.replace(
        '"replace_header_min_engine_version"',
        min_engine_version
      );
    } else {
      string_raw = string_raw.replace(
        '"replace_base_game_version"',
        header_base_game_version
      );
    }

    for (let i = 0; i < $(".modules.tab_children").length; i++) {
      const child_num = i + 1;
      string_raw = string_raw.replace(
        `replace_modules_${i}_description`,
        $(
          `.modules.tab_content_list > div:nth-child(${child_num}) #modules_description`
        ).val()
      );
      const modules_version = JSON.stringify([
        Number(
          $(
            `.modules.tab_content_list > div:nth-child(${child_num}) #modules_version_major`
          ).val()
        ),
        Number(
          $(
            `.modules.tab_content_list > div:nth-child(${child_num}) #modules_version_minor`
          ).val()
        ),
        Number(
          $(
            `.modules.tab_content_list > div:nth-child(${child_num}) #modules_version_patch`
          ).val()
        ),
      ])
        .split(/,/)
        .join(", ");
      string_raw = string_raw.replace(
        `"replace_modules_${i}_version"`,
        modules_version
      );
    }
    if (is_dependencies_enable) {
      const dependencies_length = $(".dependencies.tab_children").length;
      for (let i = 0; i < dependencies_length; i++) {
        const child_num = i + 1;
        const tab_content = $(
          `div.dependencies.tab_content_list > div:nth-child(${child_num})`
        );
        const dependencies_version = JSON.stringify([
          Number(tab_content.find("#dependencies_version_major").val()),
          Number(tab_content.find("#dependencies_version_minor").val()),
          Number(tab_content.find("#dependencies_version_patch").val()),
        ])
          .split(/,/)
          .join(", ");
        string_raw = string_raw.replace(
          `"replace_dependencies_${i}_version"`,
          dependencies_version
        );
      }
    }
    const metadata_length = $("label.author_name").length;
    for (let i = 0; i < metadata_length; i++) {
      string_raw = string_raw.replace(
        `replace_${i}_author`,
        $("input.metadata_author").eq(i).val()
      );
    }
    string_raw = string_raw.replace(
      "replace_metadata_url",
      $("#metadata_url").val()
    );
    string_raw = string_raw.replace(
      "replace_metadata_license",
      $("#metadata_license").val()
    );
    const subpacks_length = $(".subpacks.tab_children").length;
    for (let i = 0; i < subpacks_length; i++) {
      string_raw = string_raw.replace(
        "replace_subpacks_name",
        $(
          `div.subpacks.tab_content_list > div:nth-child(${
            i + 1
          }) #subpacks_name`
        ).val()
      );
    }
    return string_raw;
  }
});

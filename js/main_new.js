//クラス管理してみるテスト
// ゆくゆくはファイル分割して管理モジュールごとに管理したい
class EditorCore {
  static VERSION = "1.8.0";
  #is_changed = false;
  is_compact = false;
  is_simple_mode = false;
  format_version = 2;
  is_separator_drag = false;
  is_dependencies_enable = false;
  is_capabilities_enable = false;
  is_metadata_enable = false;
  is_subpacks_enable = false;
  is_world_template = false;
  is_skin_pack = false;
  timeout_ID;
  help_page_num = 0;
  module_description = "";
  native_file_system = !!window.showOpenFilePicker;
  file_handle = undefined;
  disabled_module_index = [];
  generated_with = {};
  constructor() {}
}

class Viewer {
  constructor() {}
}

class Issue {
  #is_ore_ui = false;
  #is_can_issue = true;
  constructor() {}
}

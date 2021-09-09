/// <reference lib="WebWorker"/>

var _self =
  typeof window !== "undefined"
    ? window // if in browser
    : typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope
    ? self // if in worker
    : {}; // if in node js
/**
 * MCFormat highlighting
 *
 * @author toka7290 <https://tokamcwin10.blog.jp/>
 * @license MIT <https://opensource.org/licenses/MIT>
 * @namespace
 * @public
 */

var MCFormat = (function (_self) {
  // 難読化用
  var requestID;
  // 関数たち
  var export_functions = {
    /**
     * テキストからDOM Stringを取得します。
     * @param {string} texts フォーマットを行う文章
     * @return {string} フォーマットされたDOM String
     * @memberof MCFormat
     * @public
     */
    toDOMString: function (texts) {
      let res = this.toDOM(texts);
      return res.outerHTML;
    },
    /**
     * テキストからDOMを取得します
     * @param {string} texts フォーマットを行う文章
     * @return {Element} フォーマットされたDOM
     * @memberof MCFormat
     * @public
     */
    toDOM: function (texts) {
      let text_area = document.createElement("span");
      return createDOM(texts, text_area);
    },
    /**
     * ".mcf-text"を持っているすべての要素に対してフォーマットを行います。
     * @memberof MCFormat
     * @public
     */
    formatAll: function () {
      let text_area = document.getElementsByClassName("mcf-text");
      if (text_area) {
        Array.prototype.forEach.call(text_area, (/** @type {Element} */ elem) => {
          this.formatElement(elem);
        });
      }
    },
    /**
     * 要素内の文章をフォーマットされた文章に置き換えます。
     * @param {Element} element フォーマットを行う要素
     * @memberof MCFormat
     * @public
     */
    formatElement: function (element) {
      let text = element.textContent;
      element.textContent = "";
      createDOM(text, element);
    },
    /**
     * 難読化文章をアニメーションさせます
     * @memberof MCFormat
     * @public
     */
    workDisplay: function () {
      clearObfuscateAnimation();
      setObfuscateAnimation();
    },
    /**
     * アニメーションを停止させます
     * @memberof MCFormat
     * @public
     */
    stopDisplay: function () {
      clearObfuscateAnimation();
    },
  };
  /**
   * フォーマットされた文章を格納するDOMを作成します
   * @param {string} texts 対象の文章
   * @param {Element} text_area フォーマット文章を格納する要素
   * @returns {Element}
   * @private
   */
  function createDOM(texts, text_area) {
    // セクション分割テキスト
    // [ "", "abc","abc","abc", "", "abc", "abc" ]
    let section_texts = texts.split(/§[0-9a-gklmnor]|\n|\\n/);
    // セクションコード
    // [ "sm", "s0","s3","sf", "sn", "s8" ]
    let section_code = texts.match(/§[0-9a-gklmnor]|\n|\\n/g);

    // 出力の要素
    text_area.classList.add("mcf-text");
    // セクションなし
    if (!section_code) {
      text_area.append(document.createTextNode(texts));
      return text_area;
    }
    // 出力用
    let format = "";
    let prev_color = undefined;
    let text_formats = [];
    for (let index = 0; index < section_texts.length; index++) {
      const text = section_texts[index];
      const code = section_code[index - 1];
      if (!index) {
        text_formats.push({ text: text, text_color: undefined, text_format: undefined });
        continue;
      }
      // フォーマットの更新
      if (code.match(/§[0-9a-g]/)) {
        prev_color = `mcf-${code.slice(-1)}`;
      } else if (code.match(/§[klmno]/)) {
        format += code.slice(-1);
        format.split("").sort().join();
      } else if (code == "§r") {
        prev_color = undefined;
        format = "";
      } else if (code.match(/\n|\\n/)) {
        text_formats.push({ br: true });
      }
      let res = { text: text, text_color: prev_color, text_format: format };
      text_formats.push({ ...res });
    }
    // DOM作成
    text_formats.forEach((section) => {
      if (section.br) {
        text_area.append(document.createElement("br"));
        return;
      }
      // 空のセクションは作らない
      if (section.text == "") return;
      // 色、フォーマット指定なし
      if (!section?.text_color && !section?.text_format?.length) {
        text_area.append(document.createTextNode(section.text));
        return;
      }
      // 装飾用
      let span = document.createElement("span");
      // クラス列挙
      let class_list = [];
      for (const element of section.text_format) {
        class_list.push(`mcf-${element}`);
        if (element == "k") setObfuscateAnimation();
      }
      class_list = [...class_list, section.text_color].filter((f) => f);
      span.classList.add(...class_list);
      span.appendChild(document.createTextNode(section.text));
      text_area.appendChild(span);
    });
    return text_area;
  }
  /**
   * アニメーションを開始します
   */
  function setObfuscateAnimation() {
    requestID = window.setInterval(updateObfuscate, 50);
    // requestID = window.requestAnimationFrame(updateObfuscate);
  }
  /**
   * アニメーションを停止します。
   */
  function clearObfuscateAnimation() {
    window.clearInterval(requestID);
  }
  /**
   * 難読化文字列を更新します。
   * @private
   */
  function updateObfuscate() {
    let obfuscate_element = document.getElementsByClassName("mcf-k");
    if (obfuscate_element) {
      Array.prototype.forEach.call(obfuscate_element, (/** @type {Element} */ elem) => {
        let text = elem.textContent;
        let obfuscate_text = "";
        if (!text.length || text.length > 1000) return;
        let chars = text.match(/./gu);
        for (let index = 0; index < chars.length; index++) {
          obfuscate_text += String.fromCharCode(Math.floor(Math.random() * (0x7d - 0x21) + 0x21));
        }
        elem.textContent = obfuscate_text;
      });
    }
  }
  return export_functions;
})(_self);

if (typeof module !== "undefined" && module.exports) {
  module.exports = MCFormat;
}

// node.js
if (typeof global !== "undefined") {
  global.MCFormat = MCFormat;
}

/*
<span class="mcf-0"></span>
<span class="mcf-1"></span>
<span class="mcf-2"></span>
<span class="mcf-3"></span>
<span class="mcf-4"></span>
<span class="mcf-5"></span>
<span class="mcf-6"></span>
<span class="mcf-7"></span>
<span class="mcf-8"></span>
<span class="mcf-9"></span>
<span class="mcf-a"></span>
<span class="mcf-b"></span>
<span class="mcf-c"></span>
<span class="mcf-d"></span>
<span class="mcf-e"></span>
<span class="mcf-f"></span>
<span class="mcf-g"></span>

<span class="mcf-k"></span>
<span class="mcf-l"></span>
<span class="mcf-m"></span>
<span class="mcf-n"></span>
<span class="mcf-o"></span>


<span class="mcf-text">
    abcdef<br>
    <span class="mcf-m"><span class="mcf-3">abc</span><span class="mcf-5">abc</span></span>
</span>
 */

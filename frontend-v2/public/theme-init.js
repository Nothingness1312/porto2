(function () {
  var stored = localStorage.getItem("kk-theme");
  var theme =
    stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "light");
  document.documentElement.dataset.theme = theme;
})();
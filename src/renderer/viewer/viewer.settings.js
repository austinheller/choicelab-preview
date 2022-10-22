function updateSetting(key, value) {
  var stored = localStorage.getItem("choicelab_viewer");
  if (!stored) {
    localStorage.setItem("choicelab_viewer", JSON.stringify({}));
  }
  var settings = JSON.parse(stored);
  if (typeof key !== "undefined" && typeof value !== "undefined") {
    settings[key] = value;
  }
  localStorage.setItem("choicelab_viewer", JSON.stringify(settings));
}

function getSetting(key) {
  var stored = localStorage.getItem("choicelab_viewer");
  if (!stored) {
    return null;
  }
  var setting = JSON.parse(stored);
  return setting[key];
}

function getSessionSetting(key) {
  var stored = window.sessionStorage.getItem(key);
  if (!stored) {
    return null;
  }
  return JSON.parse(stored);
}

function updateSessionSetting(key, value) {
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export { updateSetting, getSetting, getSessionSetting, updateSessionSetting };

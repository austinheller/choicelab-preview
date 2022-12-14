import React from "react";
import { getSetting, updateSetting } from "./viewer.settings.js";
import { setZoom, zoomIn, zoomOut } from "./viewer.zoom.js";

function openBrowser() {
  window.electron.openExternal("http://localhost:8000");
}

class NavigationControls extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="navigation">
        <button id="zoom-out" onClick={zoomOut}>
          <i className="fa-solid fa-magnifying-glass-minus"></i>
        </button>
        <button id="zoom-out" onClick={zoomIn}>
          <i className="fa-solid fa-magnifying-glass-plus"></i>
        </button>
        <button id="open-browser" onClick={openBrowser}>
          <i className="fa-solid fa-eye"></i>
        </button>
      </div>
    );
  }
}
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.className = `show_${props.for}`;
    var checked = getSetting(this.className);
    if (typeof checked === "undefined" || typeof checked === "null")
      checked = true;
    this.state = { checked: checked };
    this.handleCheck = this.handleCheck.bind(this);
    this.updateStatus(checked);
  }
  updateStatus(checked) {
    if (checked === true) {
      document.body.classList.add(this.className);
      updateSetting(this.className, true);
    } else {
      document.body.classList.remove(this.className);
      updateSetting(this.className, false);
    }
    // drawPaths();
  }
  handleCheck(e) {
    this.setState({
      checked: e.target.checked,
    });
    var checked = e.target.checked;
    this.updateStatus(checked);
  }
  render() {
    return (
      <div className="toggle">
        <input
          type="checkbox"
          id={"toggle_" + this.props.for}
          name={"toggle_" + this.props.for}
          checked={this.state.checked}
          onChange={this.handleCheck}
        />
        <label htmlFor={"toggle_" + this.props.for}>{this.props.label}</label>
      </div>
    );
  }
}

function Toolbar(props) {
  return (
    <div id="toolbar">
      <NavigationControls />
    </div>
  );
}

export { Toolbar };

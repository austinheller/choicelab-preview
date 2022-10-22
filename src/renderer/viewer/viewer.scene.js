function generateUuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function Scene(props) {
  const projectPath = window.sessionStorage.getItem("projectPath");
  // console.log('Creating scene:', props)
  var className = "scene";
  // comments
  var commentsEl;
  var comments = [];
  if (props.comments && props.comments.length > 0) {
    for (var i = 0; i < props.comments.length; i++) {
      var comment = props.comments[i];
      var key = `comment-${i}`;
      comments.push(<li key={key}>{comment}</li>);
    }
    commentsEl = <ul className="comments">{comments}</ul>;
  }
  // actions
  var actionsEl;
  var actions = [];
  var actionRef = null;

  function actionIterator(k) {
    var action = props.actions[k];
    // console.log('Adding action to scene:', action)
    var key = `action-${k}`;
    var contents = "";

    switch (action.type) {
      case "text":
        if (action.content.trim() !== "") {
          const tempParent = document.createElement("div");
          const els = Choicelab.convertTextToHTML(action.content);
          els.forEach((el) => {
            tempParent.appendChild(el);
          });
          contents = tempParent.innerHTML;
        }
        break;

      case "audio":
        var src = projectPath + "/" + action.src;
        contents = <audio src={src} controls></audio>;
        break;

      case "cc":
        contents = <p className="caption">{action.text}</p>;
        break;

      case "response":
        contents = (
          <div>
            <span className="type">Response:</span>
            <audio src={action.src} controls></audio>
          </div>
        );
        break;

      case "input":
        let inputEls = [];
        let a = 0;
        action.inputs.forEach((input) => {
          const inputKey = `input-${a}`;
          if (input.type === "button") {
            inputEls.push(
              <button key={inputKey} value={input.value}>
                {input.label}
              </button>
            );
          } else {
            inputEls.push(
              <input key={inputKey} type={input.type} value={input.value} />
            );
          }
          a++;
        });
        contents = (
          <>
            <span className="type">
              <span className="icon">⑃&nbsp;</span>
              <span className="input">{action.name}</span>
            </span>
            <form>{inputEls}</form>
          </>
        );
        break;
      default:
        contents = <span className="noDisplay">{action.type}</span>;
        break;
    }

    function createHTML() {
      return {
        __html: contents,
      };
    }
    if (action.type === "text") {
      actions.push(
        <li
          key={key}
          data-action={action.type}
          dangerouslySetInnerHTML={createHTML()}
        />
      );
    } else {
      actions.push(
        <li key={key} data-action={action.type}>
          {contents}
        </li>
      );
    }
  }
  for (var k = 0; k < props.actions.length; k++) {
    actionIterator(k);
  }
  actionsEl = <ul className="actions">{actions}</ul>;
  // rules
  var rulesEl;
  if (props.rules) {
    rulesEl = <div className="rules">{props.rules}?</div>;
    className += " has-rules";
  }
  // goto
  var goto, gotoEl;
  if (props.goto) {
    goto = props.goto;
    className += " goto";
    const gotoLink = `#path-${goto}`;
    gotoEl = (
      <div className="goto">
        <a className="goto-link" data-goto={props.goto} href={gotoLink}>
          <i className="icon-path fa-solid fa-code-branch"></i>
          <i className="icon-goto fa-solid fa-arrow-right"></i> {goto}
        </a>
      </div>
    );
    if (typeof props.gotoPrevious !== "undefined") {
      className += " previous-scene-is-goto";
    }
    if (typeof props.gotoNext !== "undefined") {
      className += " next-scene-is-goto";
    }
  }
  // console.log(props.gotoNext, props.gotoPrevious)
  // element to render
  // console.log('Creating scene element...')
  const element = (
    <li className={className} id={generateUuid()} data-goto={goto}>
      <div className="contents">
        {rulesEl}
        {commentsEl}
        {actionsEl}
        {gotoEl}
      </div>
    </li>
  );
  return element;
}

export { Scene };

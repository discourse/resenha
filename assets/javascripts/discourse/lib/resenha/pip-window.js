// Prepares a Document Picture-in-Picture window to host plugin UI: the pip
// document starts empty, so the site's compiled stylesheets, inline style
// blocks (color-scheme custom properties included), and the <html> attributes
// CSS keys off (color mode, touch class, text direction) are mirrored from
// the opener. One-time snapshot — a theme or color-mode switch mid-call
// leaves an open pip window stale until it is reopened.
export function preparePipDocument(pipWindow) {
  const pipDocument = pipWindow.document;

  for (const node of document.querySelectorAll(
    'link[rel="stylesheet"], style'
  )) {
    if (node.tagName === "LINK") {
      const link = pipDocument.createElement("link");
      link.rel = "stylesheet";
      link.href = node.href;
      if (node.media) {
        link.media = node.media;
      }
      pipDocument.head.append(link);
    } else {
      const style = pipDocument.createElement("style");
      style.textContent = node.textContent;
      pipDocument.head.append(style);
    }
  }

  for (const { name, value } of document.documentElement.attributes) {
    if (
      name === "class" ||
      name === "lang" ||
      name === "dir" ||
      name.startsWith("data-")
    ) {
      pipDocument.documentElement.setAttribute(name, value);
    }
  }

  // <use href="#icon"> only resolves within the element's own document, so the
  // icon sprite has to travel too or every button renders blank. It goes in
  // the head: the body is an {{in-element}} destination, and Glimmer clears
  // that element before rendering into it, which would take the sprite with
  // it. Symbols resolve from anywhere in the document tree.
  const sprites = document.getElementById("svg-sprites");
  if (sprites) {
    pipDocument.head.append(sprites.cloneNode(true));
  }

  pipDocument.body.classList.add("resenha-pip");
}

export var get = (url) => {
  return new Promise((resolve, reject) => {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = () => {
      // This is called even on 404 etc so check the status
      if (req.status == 200)
        resolve(req.response);
      else
        reject(Error(req.statusText));
    };

    req.onerror = () => reject(Error("Network Error"));
    req.send();
  });
};

export var getJSON = (url) => {
  return get(url).then(JSON.parse);
};

export var getXML = (url) => {
  return get(url).then((resp) => {
    var n = document.createElement('div');
    n.innerHTML = resp.trim();
    if (n.childNodes.length > 1) return n.childNodes;
    return n.firstChild;
  });
}



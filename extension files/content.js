var reg = (o, n) => o ? o[n] : '';
var cn = (o, s) => o ? o.getElementsByClassName(s) : false;
var tn = (o, s) => o ? o.getElementsByTagName(s) : false;
var gi = (o, s) => o ? o.getElementById(s) : false;
var rando = (n) => Math.round(Math.random() * n);
var unq = (arr) => arr.filter((e, p, a) => a.indexOf(e) == p);
var delay = (ms) => new Promise(res => setTimeout(res, ms));
var ele = (t) => document.createElement(t);
var attr = (o, k, v) => o.setAttribute(k, v);
var a = (l, r) => r.forEach(a => attr(l, a[0], a[1]));

var reChar = (s) => s.match(/&#.+?;/g) && s.match(/&#.+?;/g).length > 0 ? s.match(/&#.+?;/g).map(el=> [el,String.fromCharCode(/d+/.exec(el)[0])]).map(m=> s = s.replace(new RegExp(m[0], 'i'), m[1])).pop() : s;
var unqHsh = (a, o) => a.filter(i => o.hasOwnProperty(i) ? false : (o[i] = true));

var fixNameCase = (s) => s.split(/(?=[^áàâäãåÁÀÂÄÃæéèêëÉÈÊËíìîïñÑóòôöõøœÓÒÔÖÕØŒßÚÙÛÜúùûüa-zA-Z])\b/).map(el=> el.replace(/\w\S*/g, txt=> txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())).join('').replace(/(?<=\bMc)\w/ig, t=> t.charAt(0).toUpperCase());
var nameSplitter = (s) => s ? {first_name: reg(/^\S+/.exec(s),0), last_name: reg(/(?<=\s+).+/.exec(s),0)} : {};


async function githubProfileObjectDOM(path) {
  var attrFilter = (arr, str, prop) => unqHsh(arr.filter(el => el.getAttribute(prop) == str).map(el => el ? el.innerText.trim() : '').filter(r=> r),{}); //this is used for identifying the elements containing the target attribute names we wish to scrape.
  var res = await fetch(`https://github.com/${path}?tab=repositories`); //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API 
  var text = await res.text();
  var doc = new DOMParser().parseFromString(text, 'text/html'); //https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
  var all = Array.from(doc.querySelectorAll('*'));  
  var items = [
      ['additionalName','additional_name'],
      ['name','full_name'],
      ['homeLocation','location'],
      ['worksFor','employer'],
      ['url','url'],
      ['email','email'],
      ['programmingLanguage','language']
    ];
  var obj = {
    profile_path: path
  };
  items.forEach(r=> {
    var val = attrFilter(all, r[0]);
    if(val.length) obj[r[1]] = val[0]; //note: this overrides elements in succession, so multiple itemprops like programmingLanguage, will only show one. If we wanted an array of matches, we would write a condition which checks to see if the key already exists in the object, and if so, then change the value type to an array, and insert matching string.
  });
  return obj;
}

async function getGithubProfileDataDOM(){
  var path = reg(/(?<=github.com\/).+?(?=\/|$)/.exec(window.location.href),0);
  var profile = await githubProfileObjectDOM(path);
  var obj = {...profile,...nameSplitter( profile.full_name ? fixNameCase(profile.full_name) : false)};
  //obj variable is using the spread syntax. This is a quick way to merge objects of the same type. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  obj['domain'] = 'github';
  obj['url'] = `${document.domain}/${obj.profile_path}`;
  return obj;
}

async function initGithubSender(){
  if(/github\.com\/\w+/.test(window.location.href)){
    var obj = await getGithubProfileDataDOM();
    var req = {
      send_to_sheets: true,
      jsonp: obj
    };
    chrome.runtime.sendMessage(req)
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(msg);
});

initGithubSender();

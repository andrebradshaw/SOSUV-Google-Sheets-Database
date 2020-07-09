//This function is used in backgound scripts
var reg = (o, n) => o ? o[n] : '';
var unqHsh = (a, o) => a.filter(i => o.hasOwnProperty(i) ? false : (o[i] = true));
  //cleanObject is a variable function that cleans up an object. Removing any null, undefined or empty objects, empty arrays, or empty strings. We need this instead of just looking for a true value because 0, negative numbers are false, and empty objects/arrays are true.
var cleanObject = (ob) => 
  Object.entries(ob).reduce((r, [k, v]) => {
    if(v != null && v != undefined && v != "" && ( typeof v == 'boolean' || typeof v == 'string' || typeof v == 'symbol' || typeof v == 'number' || typeof v == 'function' || (typeof v == 'object'  && ((Array.isArray(v) && v.length) || (Array.isArray(v) != true)) ) ) ) { 
      r[k] = v; 
      return r;
    } else { 
     return r; 
    }
  }, {});

async function githubProfileObjectAPI(obj,sender){
    var res = await fetch(`https://api.github.com/users/${obj.profile_path}`);
    var jdat = await res.json();
    var langs = await gitHubLangsAPI(obj);
    var profile = cleanObject({...obj,...trimAPIObject(jdat),...{languages: langs}}); // merges the object parsed from the DOM, the trimmed API Object, and the languages object 
    console.log(profile);
    chrome.tabs.sendMessage(sender.tab.id, profile);
    return profile;
}

async function gitHubLangsAPI(obj){
  var res = await fetch(`https://api.github.com/users/${obj.profile_path}/repos?page=1&per_page=100`);
  var jdat = await res.json();
  var langs = jdat && jdat.length ? jdat.map(r=> r.language).filter(r=> r) : [];
  var weighted_langs = unqHsh(langs,{}).map(r=> r ? {
      lang: r,
      count: langs.filter(l=> l == r).length
  } : {});
  return weighted_langs;
}

function trimAPIObject(obj){ //this function specifies the speficif key:value pairs we want from the API response. 
  //using the cleanObject function here to ensure we do not overwrite data from the DOM like Email with a null value. This should really be handled by a more complex condition statement, but lets keep this simple for now.
  return cleanObject({
    bio: obj.bio,
    twitter_username: obj.twitter_username,
    followers: obj.followers,
    following: obj.following,
    created_at: obj.created_at,
    updated_at: obj.updated_at,
    public_repos: obj.public_repos,
    public_gists: obj.public_gists,
    hireable: obj.hireable,
    company: obj.company,
    email: obj.email,
    blog: obj.blog,
  })
}
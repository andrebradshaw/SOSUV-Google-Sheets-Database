chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg.send_to_sheets && msg.jsonp){
    sendData2Sheets(msg.jsonp,sender);
  }
})     //https://developer.chrome.com/extensions/messaging
  
async function sendData2Sheets(jsonp,sender){
  var api_obj = await githubProfileObjectAPI(jsonp,sender);
    console.log(['api',api_obj,encodeURIComponent(JSON.stringify(api_obj)).length])
  var url = `https://script.google.com/macros/s/AKfycbzHHyUeIxQF_5Fxo_yG1Rh9_yfvvpB4nbu8LpVA37w/dev?obj=${encodeURIComponent(JSON.stringify(api_obj))}`
  var res = await fetch(url);
  var text = await res.text();
  console.log(text);
  chrome.tabs.sendMessage(sender.tab.id, text);
} 


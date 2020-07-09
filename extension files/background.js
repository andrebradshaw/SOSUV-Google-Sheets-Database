chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg.send_to_sheets && msg.jsonp){
    sendData2Sheets(msg.jsonp,sender);
  }
})     //https://developer.chrome.com/extensions/messaging
  
async function sendData2Sheets(jsonp,sender){
  var api_obj = await githubProfileObjectAPI(jsonp,sender);
  var your_web_app_url = 'https://script.google.com/macros/s/AKfycbzHHyUeIxQF_5678598_svpB4nbu8LpVA37w/dev';
  var url = `${your_web_app_url}?obj=${encodeURIComponent(JSON.stringify(api_obj))}`
  var res = await fetch(url);
  var text = await res.text();
  console.log(text);
  chrome.tabs.sendMessage(sender.tab.id, text);
} 


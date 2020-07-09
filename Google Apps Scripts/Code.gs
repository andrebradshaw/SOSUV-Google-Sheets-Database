const target_sheet_id = '1YRFm13dlVIqPq9GQMwuW2fJY339F0ID3dl4ADmsHV1k';
const ss = SpreadsheetApp.openById(target_sheet_id);

function getSheetByDomainReference(target_domain){
  var all_sheets = ss.getSheets(); // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSheets()
  var target_sheet = all_sheets.filter(sheet=> sheet.getName() == target_domain);
  if(target_sheet.length){
    return target_sheet[0]; // returning the first index since this is a filtered array.
  }else{
    var new_sheet = ss.insertSheet(target_domain,1);
    return new_sheet;
  }
}

function addObjectToSheet(obj){ // ensure the first object is always the unique identifier
  var target_sheet = getSheetByDomainReference(obj.domain); //change this if you want your sheet name to be something besides the domain.
  
  var header = Object.keys(obj); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  
  var data_array = Object.entries(obj); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
  
  var current_table = getTableValuesBy(target_sheet);
  
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
  var target_index = current_table.findIndex(row=> row[0] == data_array[0][1]); //this assumes the first item in your object/array is the Unique Identifier.

  if(target_index > 0) {
    insertAdditionalHeaders(target_sheet,header); // this creates new headers as we need them in reference to the object received 

    insertRowByColumnLooper(target_sheet,data_array,(target_index+1)); //this overrides the existing record. Opportunity to create a function to handle the existing data and only overrite new columns, or merge new text.

    return 'overwritten on row '+(target_index+1)+'\n'+JSON.stringify(obj);
  } else {
    insertAdditionalHeaders(target_sheet,header); // this creates new headers as we need them in reference to the object received 

    target_sheet.insertRowsBefore(2, 1); // https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertrowsrowindex

    insertRowByColumnLooper(target_sheet,data_array,2); 
    return 'added\n'+JSON.stringify(obj);
    // takes a sheetTable, 2D array with the [[header_name,value_to_set]], and the designated row to set, and sets the data in a loop. The headername is passed through another function to gain the appropriate column index to set.
  }
}


function doGet(e) { //this function is the web service. Remember that there is a max character limit in the get method. Something like 3k characters.
  var obj = e.parameter.obj ? JSON.parse(decodeURIComponent(e.parameter.obj)) : null;
  if(obj) {
    var added_data = addObjectToSheet(obj);
    return ContentService.createTextOutput(added_data); // https://developers.google.com/apps-script/guides/content
  }else{
    return ContentService.createTextOutput('failed');
  }
}



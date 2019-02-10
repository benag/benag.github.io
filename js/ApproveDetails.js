/*** End of parameter converters ***/
function postpone() {
	//populateField(fieldName, fieldValue);
	//callWebServiceWithAllParams("serviceName", "", "onResponse");
	//var popupMsg = getResponseNodeValueByName('PopupMessages');
	showInfoPopup("not implemented yet", "postpone")
}

function setExecutionDate() {
    var exec_date = Storage.get("B1_MONTH_0")+" / "+Storage.get("B1_YEAR_0");
    $("#BITZU_DATE").text(exec_date);
    
    var input    = document.getElementById('B_PARAM_REMARKS_0');
    textarea = document.createElement('textarea');
    textarea.id    = input.id;
    textarea.name  = input.name;
    //textarea.cols  = 40;
    textarea.rows  = 3;
    textarea.value = input.value;
    input.parentNode.replaceChild(textarea, input);   
}


function ApproveBill() {
    Storage.set("B_PARAM_REMARKS_0",Fields.get("B_PARAM_REMARKS_0"));
	Services.call("Bills_Login", ApproveSuccess, ApproveFail);
}

function ApproveSuccess(){
    var successMsg = "חשבון אושר בהצלחה"
    Popup.ok("הצלחה", successMsg, function(){navigate("BillsList.html")})
}

function ApproveFail(){
    var popupMsg = Storage.get("PopupMessages");
    var errorMsg = "בעיה באישור חשבון: "+popupMsg
    Popup.ok("בעיה", errorMsg)
}

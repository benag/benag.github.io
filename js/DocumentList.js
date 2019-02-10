function downloadPage(row, col, rowCells) {
	Storage.copyFromIndex("B7_FILE_TYPE_0", row);
	Storage.copyFromIndex("B7_FILE_TYPE_DESC_0", row);
	Storage.copyFromIndex("B7_FILE_NAME_0", row);
	Storage.copyFromIndex("B7_INSERT_DATE_0", row);
	Storage.copyFromIndex("B7_MARK_FOR_COMBINE_0", row);
	Storage.copyFromIndex("B7_USER_NAME_0", row);
	Storage.copyFromIndex("B7_DOC_NAME_0", row);
	
	Services.call("Bills_getDocument", successFunction, failureFunction)
}

function successFunction(){
    var fileUrl = Storage.get("fileUrl")
    window.open(fileUrl,'_blank');
}

function failureFunction(){
    Popup.ok("שגיאה")
}

$(function(){
    $("#tableFilter").attr("placeholder", "...חיפוש");
})

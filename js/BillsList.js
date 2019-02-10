function convert_B00_USER_TITLE_0(value) {
    return value;
}

function exportCSV() 
{
//extract headers

let headers = [];

$('#tableOutputHead tr th').each(
function (i, thElem){ 
headers.push('"' + thElem.innerText + '"') 
})

//extract rows

let cols = [];
let rows = [];
$('#tableOutputBody tr').each(
function(t, elem){
cols = [];
$(elem).find('td').each(
function(i, tdElem){
cols.push(tdElem.innerText);
})
rows.push('"'+cols.join('","')+'"');
})

//combine all

const result = headers.join(',') + '\r\n' + rows.join('\r\n');

let csvContent = "data:text/csv;charset=utf-8,";

// adding a BOM prefix (\uFEFF) to the beginning of the file 
//(https://stackoverflow.com/questions/155097/microsoft-excel-mangles-diacritics-in-csv-files)

csvContent += '\ufeff' + result;
var encodedUri = encodeURI(csvContent);

//creating the link 
var link = document.createElement("a");
link.setAttribute("href", encodedUri);
link.setAttribute("download", "exportTable.csv");
link.innerHTML= "Click Here to download";
document.body.appendChild(link); // Required for FF

link.click();
}

function Bills_getWaitingFoApprova_List99_onSuccess() {
	//Fields.set(fieldName, value);
	//Services.call(serviceName, successFunction, failureFunction);
	//var popupMsg = Storage.get('PopupMessages');
	var welcome = getResponseNodeValueByName('B00_USER_TITLE_0');
	//showInfoPopup("שלום", welcome)
}

function showActionsMenu(row, col, rowCells) {
	/*Storage.copyFromIndex("B1_DEAL_ID_0", row);
	Storage.copyFromIndex("B1_DEAL_NAME_0", row);
	Storage.copyFromIndex("B1_GUARANTEE_CODE_0", row);
	Storage.copyFromIndex("B1_GUARANTEE_DESC_0", row);
	Storage.copyFromIndex("B1_CONTRACT_NO_0", row);
	Storage.copyFromIndex("B1_ACCOUNT_NO_0", row);
	Storage.copyFromIndex("B1_YEAR_0", row);
	Storage.copyFromIndex("B1_MONTH_0", row);
	Storage.copyFromIndex("B1_TOTAL_SUM_0", row);
	Storage.copyFromIndex("B1_CURRENT_DATE_0", row);
	Storage.copyFromIndex("B1_STAGE_NAME_0", row);
	Storage.copyFromIndex("B1_USER_NAME_0", row);
	Storage.copyFromIndex("B1_BIZUA_PERC_0", row);
	Storage.copyFromIndex("B1_CONTRACT_BILL_STATUS_DESC_0", row);
	Storage.copyFromIndex("B1_URGENT_ACCOUNT_YN_0", row);
	Storage.copyFromIndex("B1_COMPID_0", row);*/

	storeFromIndex("B1_COMPID_0", row);
	storeFromIndex("B1_DEAL_ID_0", row);
	storeFromIndex("B1_CONTRACT_NO_0", row);
	storeFromIndex("B1_GUARANTEE_CODE_0", row);
	storeFromIndex("B1_DEAL_NAME_0", row);
	storeFromIndex("B1_GUARANTEE_DESC_0", row);
	storeFromIndex("B1_ACCOUNT_NO_0", row);
	storeFromIndex("B1_YEAR_0", row);
	storeFromIndex("B1_MONTH_0", row);
	storeFromIndex("B1_TOTAL_SUM_0", row);
	storeFromIndex("B1_STAGE_NAME_0", row);
	storeFromIndex("B1_USER_NAME_0", row);
	storeFromIndex("B1_STATUS_0", row);
	storeFromIndex("B1_CONTRACT_BILL_STATUS_0", row);
	storeFromIndex("B1_CURRENT_DATE_0", row);

    $("#mainPage").append('<div class="ap-drawer-menu">' +
            generateDrawerMenuItemMarkup('decline-icon.png', 'DeclineDetails.html') +
            generateDrawerMenuItemMarkup('approve-icon.png', 'ApproveDetails.html') +
            generateDrawerMenuItemMarkup('documents-icon.png', 'DocumentList.html') +
        '</div>');
        
        
}

function generateDrawerMenuItemMarkup(icon, navTarget) {
    return '<div class="ap-drawer-menu-item"><img src="' + icon + '" onclick="Page.navigate(\'' + navTarget + '\');" ontouchend="Page.navigate(\'' + navTarget + '\');"/></div>';
}

$(document).mouseup(function (e){
	var container = $('.ap-drawer-menu');
	if (!container.is(e.target) && container.has(e.target).length === 0){
		container.remove();
	}
}); 

$(function(){
    $("#tableFilter").attr("placeholder", "...חיפוש");
})
/**
 * Create list: Query webservice, use result json to populate list
 *
 * @param serviceName - name of the service
 * @param listItemTitle - Either A> name of output field which value will be used for list-item title
 *                or B> function(outputParams, index) -
 *                        @param outputParams  - object containing selected item output params
 *                        @param index - index of item in list
 *                        return title for list item in list
 *
 * @param selectionHandler - function(outputParams) - handler function for element pressed
 *                        @param outputParams  - object containing selected item output params
 *                        default: defaultListSelectionHandler
 */
function createList(serviceName, listItemTitle, selectionHandler) {

    //query web service with input parameters
    var params = getInputFieldsAsQueryString();

    var url = "http://35.163.113.45/ServiceManager/Macro/ExecMacro/" + serviceName +
        "?" + params +
        "&json=true";

    //call web service
    jQuery.getJSON(encodeURI(url), function (json) {
        //populate results to list
        populateList(json, serviceName, listItemTitle, selectionHandler);
    });

}

/**
 * Populate webservice result in list
 *
 * @param json - the json result of the webservice call
 * @param serviceName - the name of the called webservice
 * @param listItemTitle - Either A> name of output field which value will be used for list-item title
 *                or B> function(outputParams, index) -
 *                        @param outputParams  - object containing selected item output params
 *                        @param index - index of item in list
 *                        return title for list item in list
 * @param selectionHandler - function(outputParams) - handler function for element pressed
 *                        @param outputParams  - object containing selected item output params
 *                        default: defaultListSelectionHandler
 */
function populateList(json, serviceName, listItemTitle, selectionHandler) {

    //Handle Array Items
    var tableNodes = null;

    //get list items from json
    if (json["Response"][serviceName + "TableArray"] != undefined) {
        //if Object, convert to Array
        tableNodes = [].concat(json["Response"][serviceName + "TableArray"][serviceName + "ArrayItem"]);
    }

    populateListItems(tableNodes, listItemTitle, selectionHandler);
}

/**
 * Populate data in list
 *
 * @param data - data to be populated in list
 * @param listItemTitle - Either A> name of output field which value will be used for list-item title
 *                or B> function(outputParams, index) -
 *                        @param outputParams  - object containing selected item output params
 *                        @param index - index of item in list
 *                        return title for list item in list
 * @param selectionHandler - function(outputParams) - handler function for element pressed
 *                        @param outputParams  - object containing selected item output params
 *                        default: defaultListSelectionHandler
 *
 */

function populateListItems(listData, listItemTitle, selectionHandler) {

    //set default handler
    if (selectionHandler == null) {
        selectionHandler = defaultListSelectionHandler;
    }

    //set default title generator
    if (listItemTitle == null) {
        listItemTitle = defaultTitleGenerator;
    }

    //init list menu
    $("#listMenu").popup();
    $("#listItems").find(".lovItem").remove();

    $("#listMenu").off("click", "li")


    //add list items to lov
    if (listData != null && isArray(listData)) {
        for (var j = 0; j < listData.length; j++) { //row in table

            var liElement = $("<li/>");
            liElement.addClass("lovItem");

            for (var k in listData[j]) {
                var cellName = k;
                var cellValue = listData[j][k];
                liElement.data(cellName, cellValue);

            }

            var aElem = $("<a/>");
            aElem.attr("href", "#");
            aElem.addClass("ui-btn");
            aElem.addClass("ui-btn-icon-right");
            aElem.addClass("ui-icon-carat-r");


            if (isFunction(listItemTitle)) {
                var text = listItemTitle.call(this, liElement.data(), j);
                aElem.text(text);
            }
            else {
                //populate list-item text
                aElem.text(liElement.data(String(listItemTitle)));
            }

            liElement.append(aElem);

            $("#listItems").append(liElement);

        }
    }

    //handle item clicked
    $("#listMenu").on("click", "li",
        function () {
            $("#listMenu").popup("close");
            selectionHandler.call(this, $(this).data());
        }
    );

    $("#listMenu").popup();

    $("#listMenu").popup("open");

}

/**
 * Default function for list title generation
 * @param outputParams  - object containing selected item output params
 * @param index - index of selected list item, 0-based
 * @returns {String}
 */
function defaultTitleGenerator(outputParams, index) {
    return (index + 1) + ") " + outputParams[Object.keys(outputParams)[0]];
}

/**
 * Populate data fields of selected item to input fields
 *
 * @param selected - object containing selected item output params
 */
function defaultListSelectionHandler(selected) {
    for (inputId in selected) {
        var value = selected[inputId];
        populateFieldHTML(inputId, value);
    }
}

function createSelectObject(fieldID) {
    var selectObj = document.getElementById(fieldID);

    if (selectObj.type.indexOf('select') < 0) {
        var newSelect = document.createElement('select');
        newSelect.id = fieldID;
        var parent = selectObj.parentNode;

        if (parent.className.indexOf("ui-input-text") > -1) {
            var temp = selectObj.parentNode;
            selectObj.parentNode.parentNode.replaceChild(newSelect, temp);
        }
        else {
            selectObj.parentNode.replaceChild(newSelect, selectObj);

        }

        selectObj.id = fieldID;
        selectObj = newSelect;
    }
    //remove previous elements
    selectLength = selectObj.length
    for (i = 0; i < selectLength; i++) {
        selectObj.remove(0);
    }

    return selectObj;
}

function populateSelectItems(tableNodes, fieldID) {
    var selectObj = createSelectObject(fieldID)

    if (tableNodes != null && isArray(tableNodes) && tableNodes[0] != undefined) {
        keyName = Object.keys(tableNodes[0]);
        for (var j = 0; j < tableNodes.length; j++) {
            var optionArray = tableNodes[j][keyName].split(',')
            var option = document.createElement('option');
            option.value = optionArray[0];
            option.textContent = optionArray[1];

            if (option.textContent != undefined && option.textContent.trim() != "")
                selectObj.appendChild(option);
        }
    }
    return selectObj;
}

function populateSelect(json, serviceName, fieldID, onChangeFunc, defaultIndex) {
    //Handle Array Items
    var tableNodes = null;

    //get list items from json
    if (json["Response"][serviceName + "TableArray"] != undefined) {
        //if Object, convert to Array
        tableNodes = [].concat(json["Response"][serviceName + "TableArray"][serviceName + "ArrayItem"]);
    }

    var selectObj = populateSelectItems(tableNodes, fieldID);
    if (defaultIndex != undefined) {
        $(selectObj).selectedIndex = defaultIndex;
    }
    else {
        $(selectObj).selectedIndex = 0;
    }

    $(selectObj).selectmenu();
    $(selectObj).selectmenu("refresh");
    $(selectObj).change(onChangeFunc);
}

/**
 * createSelect: Query webservice, use result json to populate select object
 *
 * @param serviceName - name of the service
 * @param fieldID - name of output field which the select would be populated into
 * @param onChangeFunc - (optional) onchange function handler
 * @param defaultIndex - (optional) - index to be selected - default: 0
 */
function createSelect(serviceName, fieldID, onChangeFunc, defaultIndex) {
    if ($("#" + fieldID) == null) return;

    //query web service with input parameters
    var params = getInputFieldsAsQueryString();

    var url = "/ServiceManager/Macro/ExecMacro/" + serviceName +
        "?" + params +
        "&json=true";

    //call web service
    jQuery.getJSON(encodeURI(url), function (json) {
        //populate results to list
        populateSelect(json, serviceName, fieldID, onChangeFunc, defaultIndex);
    });
}

/****** barcode.js ******/

function initBarcodeListener(_onReadCallback, _ignoredChars, _minLength, _maxInputInterval) {
	Barcode.init(_onReadCallback, _ignoredChars, _minLength, _maxInputInterval);
}

/****** gps.js ******/

function getLocation(callback) {
	Location.getCurrentPosition(callback);
}

function populatePosition(callback, position) {
	Location.resolveAddress(callback, position);
}

/****** handlers.js ******/

function callWebService(webService, params, initHandler, responseHandler, failureHandler, asyncFlag, populateFields, context) {
	Services.callWebService(webService, params, initHandler, responseHandler, failureHandler, asyncFlag, populateFields, context);
}

function callWebServiceWithAllParams(webService, initHandler, responseHandler, failureHandler, asyncFlag, populateFields) {
	Services.callWebServiceWithAllParams(webService, initHandler, responseHandler, failureHandler, asyncFlag, populateFields);
}

function navigate(targetUrl) {
	//Page.navigate(targetUrl);
	Router.navigate(targetUrl);
}

function showServiceErrorsPopup(serviceErrorMsg, status) {
	Popup.serviceErrors(serviceErrorMsg, status);
}

/****** init.js ******/

function initData() {
	Init.initData();
}

/****** map.js ******/

function generateAddress() {
	return Location.buildAddress();
}

function geocodeAddress(address, isButtonTriggered) {
	Location.markOnMap(address, isButtonTriggered);
}

/****** spinner.js ******/

function spinner() {
	return {
    	start: Spinner.start,
        stop: Spinner.stop
    };
}

function startSmallSpinner(text) {
	Spinner.startMiniSpinner(text);
}

function stopSmallSpinner() {
	Spinner.stopMiniSpinner();
}

/****** partial.js ******/

function startSession() {
	Services.startSession();
}

function endSession() {
	Services.endSession();
}

function killSession(_sessionId) {
	Services.killSession(_sessionId);
}

/****** popup.js ******/

function showInfoPopup(title, message, okCallback) {
	Popup.info(title, message, okCallback);
}

function showConfirmPopup(title, message, okCallback, cancelCallback) {
	Popup.confirm(title, message, okCallback, cancelCallback);
}

/****** fields.js *****/

function getResponseNodeListValueByName(nodeName) {		// some clients might use it
    if (window.response == null)
        return "";
    return findValues(window.response, nodeName);
}

function getFieldValue(key) {
	return Fields.get(key) || '';
}

function populateField(fieldName, fieldValue) {
	Fields.setAndStore(fieldName, fieldValue);
}

function populateFieldHTML(fieldName, fieldValue) {
	Fields.set(fieldName, fieldValue);
}

function setDefaultValues() {
	Fields.setDefaultValues();
}

function setUserDataValuesInFields() {
	Fields.setFromStorage();
}

function validateRequiredFields() {
	Fields.validate();
}

function getURLParameters(url) {
	return Page.parseQueryParams();
}

function refreshInputElements() {}		// backward compatibility, old pages might call this on init
function removeDuplicatedFields() {}	// backward compatibility, old pages might call this on init


/****** storage.js ******/

function clearUserData() {
	Storage.clear();
}

function clearStorageByPrefix(prefix) {
	Storage.clearByPrefix(prefix);
}

function clearAllStorageIndices(paramName) {
	Storage.clearAllIndices(paramName);
}

function containsKey(key) {
	return Storage.contains(key);
}

function backupField(fieldName) {
	Storage.backup(fieldName);
}

function storeFromIndex(fieldName, index, shouldBackup) {
	if (shouldBackup === true) {
		Storage.backupAndCopyFromIndex(fieldName, index);
	} else {
		Storage.copyFromIndex(fieldName, index);	
	}
}

function store(fieldName, fieldValue, shouldBackup) {
	if (shouldBackup === true) {
		Storage.backupAndSet(fieldName, fieldValue);
	} else {
		Storage.set(fieldName, fieldValue);
	}
}

function restoreBackedupIndices() {
	Storage.restoreBackups();
}

function storeArrayInSessionStorage(array) {	// backward compatibility, old pages might call it
	populateArray(array);
}

function removeItem(key) {
	Storage.remove(key);
}

function removeItemNameContains(substr) {
	Storage.removeBySubstring(substr);
}

function saveUserData() {
	Fields.storeAll();
}

function getSessionFieldValue(key, shouldTrimValue) {
    return Storage.get(key);	// will always clean value
}

/* Refactored */
/* Working */

var Barcode = function() {
		
	return {
		init: function(callback, filter, minLength, maxInterval) {
			$('#header').append('<div id="barcodeToast"><div id="barcodeValue"></div></div>');
		    
		    var _timeoutHandler = 0;
		    var _inputString = '';
		    
		    $(document).on({
		        keypress: function(e) {
		            if (_timeoutHandler > 0) {
		                clearTimeout(_timeoutHandler);
		            }
		            _inputString += e.key;
		            
		            var maxInputInterval = (maxInterval !== undefined ? maxInterval : 50);
		            
		            _timeoutHandler = setTimeout(function () {
		            	// min length threshold
		            	var minLength = (minLength !== undefined ? minLength : 6);
		                if (_inputString.length < minLength) {
		                    _inputString = '';
		                    return;
		                }
		                
		                // filter chars and toast
		                if (filter !== undefined) {
		                	_inputString = _inputString.replace(new RegExp('[' + filter + ']', 'g'), '');
		                }
		                $('#barcodeValue').text('Barcode: ' + _inputString);
		                
		                // callback
		                var onReadCallback = (typeof callback === 'string' ? window[callback] : typeof callback === 'function' ? callback : undefined);
		                if (onReadCallback !== undefined) {
		                	onReadCallback(_inputString);
		                }
		                
		                _inputString = '';
		                
		            }, maxInputInterval);
		        }
		    });
		}
	};
}();

/*\
 |*|  :: cookies.js ::
 |*|  A complete cookies reader/writer framework with full unicode support.
 |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
 |*|
 |*|  This framework is released under the GNU Public License, version 3 or later.
 |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
 |*|
 |*|  Syntaxes:
 |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 |*|  * docCookies.getItem(name)
 |*|  * docCookies.removeItem(name[, path], domain)
 |*|  * docCookies.hasItem(name)
 |*|  * docCookies.keys()
 \*/

var docCookies = {
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) {
            return false;
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
    }
};

/* Refactored */
/* Working */

var Fields = function() {
	
	function _populateFieldCommon(fieldElement, fieldValue) {
		try {
	        var nodeName = fieldElement.nodeName;
			if (fieldElement.id === 'map') {
				document.getElementById('map_address').innerHTML = fieldValue;
				Location.markOnMap(fieldValue);
			} else if (nodeName === "INPUT") {
	    		if (fieldElement.type === "checkbox") {
	    			fieldValue = (typeof fieldValue === "boolean" ? fieldValue : _applyConverter(fieldElement.id, fieldValue));
	    			_populateCheckboxHTML(fieldElement, fieldValue);
	    		} if (fieldElement.getAttribute('data-type') === 'date') {
	    			$(fieldElement).datepicker().datepicker("setDate", fieldValue);
	    		} else {
	    			fieldElement.value = fieldValue;
	    		}
	    	} else if (nodeName === "TEXTAREA") {
	            fieldElement.value = fieldValue;
	        } else if (nodeName === "DIV" || nodeName === "LABEL") {
	            fieldElement.innerHTML = fieldValue;
	        } else if (nodeName === "SELECT") {		// slider
	        	$(fieldElement).val(fieldValue).flipswitch('refresh');
	        } else if (nodeName === "IMG") {
	        	fieldElement.src = _applyConverter(fieldElement.id, fieldValue);
	        } else if (nodeName === "A") {
	        	if (fieldElement.href.indexOf("tel:") === 0) {
	        		fieldElement.innerHTML = fieldValue;
	        		fieldElement.href = "tel:" + fieldValue;
	        	} else { 	//link
	        		fieldElement.innerHTML = _applyConverter(fieldElement.id, fieldValue);
	        		fieldElement.href = fieldElement.innerHTML;
	        	}
	        }
	    } catch (e) {}
	}
	
	function _populateCheckboxHTML(fieldElement, fieldValue) {
		fieldElement.checked = ("" + fieldValue == "true");
		fieldElement.previousSibling.className = fieldElement.previousSibling.className.replace("ui-checkbox-on", "").replace("ui-checkbox-off", "");
		fieldElement.previousSibling.className += (fieldElement.checked ? "ui-checkbox-on" : "ui-checkbox-off");
	}

	function _applyConverter(fieldId, fieldValue) {
		var converter = window['convert_' + fieldId];
		return typeof converter === "function" ? converter(fieldValue) : fieldValue;
	}
	
	function collectInputElements() {
	    var result = new Array();

	    //all input elements
	    var inputArray = document.getElementsByTagName("input");
	    var disallowedInputs = ['submit', 'button', 'file'];

	    //get input fields of allowed types
	    for (var index = 0; index < inputArray.length; index++) {
	        if (disallowedInputs.indexOf(inputArray[index].type) == -1 && !/^_nostore_/.test(inputArray[index].id)) {
	            result.push(inputArray[index]);
	        }
	    }

	    //add select elements
	    var selectArray = document.getElementsByTagName("select");
	    for (var index = 0; index < selectArray.length; index++) {
	        result.push(selectArray[index]);
	    }
	    
	    //add dropdowns
	    var dropdowns = $('.dropdown-container > div');
	    for (var index = 0; index < dropdowns.length; index++) {
	    	result.push(dropdowns[index]);
	    };

	    return result;
	}
	
	
	return {
		clearAll: function() {
			$("input").val("");
			$(".output_value").val("");
			$(".output_value").text("");
			
		    var table = document.getElementById('tableOutput');		// clear output table
		    if (table != null) {
		        for (var i = table.rows.length - 1; i > 0; i--) {
		            table.deleteRow(i);
		        }
		    }
		},
		
		clear: function(fieldName) {
			if (fieldName === undefined) {
				Fields.clearAll();
				return;
			}
			var element = $("#" + fieldName);
			element.val("");
			element.text("");
		},
		
		clearByPrefix: function(prefix) {
			$("input[id^='" + prefix + "']").val("");
		},
		
		get: function(fieldName) {
			var value;
			var element = $("#" + fieldName);
			if (element.length > 0) {
				value = element.is("input") ? 
	    			(element[0].type === "checkbox" ? element[0].checked : element.val()) :
	    			element.text();
		    	if (value !== undefined) {
		    		return cleanValue(value);
		    	}
			}
			value = sessionStorage.getItem(fieldName);
			return value !== null ? value.trim() : undefined;
		},
		
		set: function(fieldName, value) {
		    var fieldElement = document.getElementById(fieldName);
		    if (typeof(value) !== "undefined") {
		    	_populateFieldCommon(fieldElement, value);
		    }
		},
		
		setAndStore: function(fieldName, value) {
			populateFieldHTML(fieldName, value);
		    try {
		        sessionStorage.setItem(fieldName, value);
		    } catch (e) {}
		},
		
		setDefaultValues: function() {
			if (typeof defaultValues == 'undefined' ) {
				return;
			}
		    for (var paramName in defaultValues) {
		    	var defaultValue = defaultValues[paramName];
		    	defaultValue = (typeof defaultValue === 'object' && defaultValue !== null && defaultValue.value !== undefined) ? defaultValue.value : defaultValue;		// backward compatibility
		    	
		    	// date picker init
		    	var element = $('#' + paramName);
		    	if (element.attr("data-type") === 'date') {	
		    		element.datepicker();
		    		element.datepicker("option", "dateFormat", defaultValue.format);
		    		defaultValue = defaultValue.dateValue;
		    	}
		    	
		    	Fields.set(paramName, defaultValue);
		    }
		},
		
		setFromStorage: function() {
			for (var i = 0; i < sessionStorage.length; i++) {
		    	var key = sessionStorage.key(i);
		    	var value = sessionStorage.getItem(key);
		        populateFieldHTML(key, (value === "null" ? "" : value));
		    }
		},
		
		storeAll: function() {
			inputElementsArray = collectInputElements();
		    
		    for (var index = 0; index < inputElementsArray.length; index++) {
		    	var inputElement = inputElementsArray[index];
		        var itemId = inputElement.id;
		        if (itemId == null || itemId.length == 0) {
		            continue;
		        }
		        var itemValue = inputElement.type === "checkbox" ? inputElement.checked :
		        				inputElement.nodeName.toUpperCase() === "DIV" ? inputElement.innerText :
		        				inputElement.value;
		        sessionStorage.setItem(itemId, itemValue)
		    }
		},
		
		validate: function() {
			if ($('#mainForm')[0] === undefined) {
				return;
			}
			if ($('#mainForm')[0].checkValidity()) {
		    	$('button').prop('disabled', false);  
			} else {
		    	$('button').prop('disabled', 'disabled');
			}
		}
	};
}();

function uploadNewFiles() {
	Spinner.start();
	var deferred = $.Deferred();
	var deferreds = [];
	
	$('input[type="file"]').each(function(index, field){
		if (field.attributes.uploaded !== undefined && field.attributes.uploaded.value !== "true") {
			store(field.id, '');
			if (field.files.length !== 0 || field.attributes.fileFromCamera !== undefined) {
				var file = field.attributes.fileFromCamera !== undefined ? dataURItoBlob(field.attributes.fileFromCamera.value) : field.files[0];
				var target = field.attributes['data-target'] !== undefined ? field.attributes['data-target'].value : '';
				
				var formData = new FormData();
				formData.append('path', target !== '' ? target : 'www/upload');
				formData.append('file', file);
				if (target !== '') {
					formData.append('absolute', true);
				}
	
				deferreds.push($.ajax({
					url: getServiceManagerHost() + '/ServiceManager/Macro/FileManager',
					data: formData,
					type: 'POST',
					contentType: false, // (requires jQuery 1.6+)
					processData: false,
					success: function(response) {
						store(field.id, response.data);
						field.setAttribute("uploaded", true);
					}, error: function(jqXHR, textStatus, errorMessage) {
						Spinner.stop();
						showInfoPopup('File upload failed', errorMessage);
					}
				 }));
			}
		}
	});
	
	$.when.all(deferreds).then(function(objects) {
		Spinner.stop();
	    deferred.resolve();
	});
	
	return deferred.promise();
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
}

if (typeof jQuery.when.all === 'undefined') {
    jQuery.when.all = function (deferreds) {
        return $.Deferred(function (def) {
            $.when.apply(jQuery, deferreds).then(
                function () {
                    def.resolveWith(this, [Array.prototype.slice.call(arguments)]);
                },
                function () {
                    def.rejectWith(this, [Array.prototype.slice.call(arguments)]);
                });
        });
    }
}

$(document).ready(function(){
	Router.Init();
    $("input[type=file]").click(function(){
        $(this).val("");
        document.getElementById(this.id + '_filename').innerHTML = '(No file)';
    });

    $("input[type=file]").change(function(){
        this.setAttribute("uploaded", false);
        this.removeAttribute("fileFromCamera");
        document.getElementById(this.id + '_filename').innerHTML = this.files[0].name;
    });
});

function executeHandler(handler) {
    if (handler == undefined) {
        return;
    }

    if (handler["preFunction"] != undefined) {
        executeCallFunctionHandler(handler["preFunction"], arguments);
    }
    
    if (/function$/.test(handler["action"])) {	//handler["action"].endsWith("function")
        executeCallFunctionHandler(handler['attr'], arguments);
        
    } else if (/webservice$/.test(handler["action"]) || handler["action"] == "onload") {
    	callWebServiceWithAllParams(handler['attr'], handler['initHandler'], handler['responseHandler'], handler['failureHandler'], true, true);

    } else if (/navigate$/.test(handler["action"])) {
        navigate(handler['attr']);
    }
}

function executeCallFunctionHandler(funcName, outerArguments) {
    if (window[funcName] == undefined) {
        alert("Undefined function: " + funcName);
    } else {
        window[funcName].apply(undefined,
            arguments.length > 1 ? Array.prototype.slice.call(outerArguments, 1) : undefined);
    }
}

function getHandlersByFilter(handlerMap, filter) {
    if (handlerMap == undefined) {
        return [];
    }

    return $(handlerMap).filter(function (index, handler) {
        return objFilter(handler, filter);
    });
}

//utility function, used by getHandlersByFilter
function objFilter(obj, filter) {
    var result = true;

    for (key in filter) {
        result &= obj[key] == filter[key];
    }

    return result;
}

function getServiceManagerHost() {
	return 	typeof app !== 'undefined' && app.serviceManagerHost != undefined && app.serviceManagerHost != null ?
			app.serviceManagerHost.trim().replace(/\/$/, '') :
			'';
}

var Router =  {
	app:{},
	Init: function() {
		this.app = $.sammy(function() {
			this.get('#/login/', function() {
				$('#content').load("templates/login.html", function(){

				})	
	   		});
			
			this.get('#/BillsList/', function() {
				$('#content').load("templates/BillsList.html", function(){
				})	
			});
		});
		this.app.run('#/login/');
	},
	navigate(location){
		var path = location.split('.')[0];
		//window.location.replace('#/'+ path + '/')
		//window.location('#/'+ path + '/');
		this.app.runRoute("get", '#/'+ path + '/');	
		//location.hash('#/'+ path + '/');
		//this.app.trigger('redirect', {to: '#/'+ path + '/'});
		//this.app.setLocation('#/'+ path + '/');
	}
}
/* Refactored */
/* Working */

//GLOBALS
var waitingForResponse = false;
var handlerMap;
var inputElementsArray = null;
var data = {};		//TODO unused?
window.lastFocusedElement = null;

var Init = function() {
	
	
	function initEventHandlers() {
		$(document).on("sendRequest", function () {
	        if (window["sendRequestHandler"] != undefined) {
	            window["sendRequestHandler"].call(this);
	        }
	    });

	    $(document).on("receiveResponse", function (event, response, serviceName, status, populateFields) {
	        if (window["receiveResponseHandler"] != undefined) {
	            window["receiveResponseHandler"].call(this, response, serviceName, status, populateFields);
	        }
	    });

	    $(document).on("pageInitialized", function () {
	        if (window["pageInitializedHandler"] != undefined) {
	            window["pageInitializedHandler"].call(this);
	        }
	    });
	}
	
	function executeOnLoadHandlers() {
		var onloadFunctions = [];
		$.merge(onloadFunctions, getHandlersByFilter(handlerMap, {"action": "onload"}));
		$.merge(onloadFunctions, getHandlersByFilter(handlerMap, {"action": "onload:navigate"}));
		$.merge(onloadFunctions, getHandlersByFilter(handlerMap, {"action": "onload:function"}));
		for (var i = 0; i < onloadFunctions.length; i++) {
			executeHandler(onloadFunctions[i]);
		}
		$(document).triggerHandler("pageInitialized");
	}
	
	function loadHandlersWithAjax() {
		var creationTimestamp = $('meta[name="Creation-Timestamp"]').attr("content");
	    if (creationTimestamp == undefined) {
	        alert("Error: Meta tag Creation-Timestamp is missing");
	    }
	    var jsonFile = 'handlerMap_' + creationTimestamp + '.json';
		
		$.ajax({
	        url: 'json/' + jsonFile,	// no need for getServiceManagerHost() since this is method is used only by old versions
	        //async: false,
	        dataType: 'text',
	        timeout: Services.getTimeout(),
	        success: function (response) {
	        	if (/^handlerMap=/.test(response)) {	// response.startsWith('handlerMap=')
	        		response = response.substring('handlerMap='.length, response.length - ';'.length);
	        	}
	        	handlerMap = JSON.parse(response);
	        	executeOnLoadHandlers();
	        },
	        error: function () {
	            alert("Error loading handler map " + jsonFile);
	        }
	    });
	}
	function SetListeners() {
		window.sendRequestHandler = function() {
			$("#tableOutput").hide();
			$("#listOutput").hide();
		}
		window.receiveResponseHandler = function(response, serviceName, status, populateFields) {
			if (typeof(populateFields) === 'undefined' || populateFields) {
				$("#tableOutput").show();
				$("#listOutput").show();
				Fields.validate();
			}
		}
		$("input[type='button']").on("click", function () {
	        var buttonId = $(this).attr('id');
	        var handlers = getHandlersByFilter(handlerMap, {"element": buttonId});

	        for (var i = 0; i < handlers.length; i++) {
	            executeHandler(handlers[i]);
	        }
	    });

	    //initialize on-click event for buttons
	    $("button").on("click", function () {
	        var buttonId = $(this).attr('id');
	        var handlers = getHandlersByFilter(handlerMap, {"element": buttonId});

	        for (var i = 0; i < handlers.length; i++) {
	            executeHandler(handlers[i]);
	        }
	    });

	    //initialize key-down event
	    $(document).keydown(function (e) {
	        var keyId = e.which;
	        window.lastFocusedElement = e.target;
	        var targetId = e.target.id;
	        var handlers = getHandlersByFilter(handlerMap, {"key": keyId});

	        for (var i = 0; i < handlers.length; i++) {
	            //element not specified, execute
	            if (handlers[i]["element"] == undefined ||
	                handlers[i]["element"] == "") {
	                executeHandler(handlers[i]);
	            }
	            //element matches rule, execute
	            else if (handlers[i]["element"] == targetId) {
	                executeHandler(handlers[i]);
	            }
	        }
	        
	        // do not propagate the event if the key was ENTER.
	        if (keyId === 13) {
	        	event.preventDefault();
	        	return false;
	        }
	    });
	
	}
	$(function () {
		//initialize on-click event for inputs of type button
	//     $("input[type='button']").on("click", function () {
	//         var buttonId = $(this).attr('id');
	//         var handlers = getHandlersByFilter(handlerMap, {"element": buttonId});

	//         for (var i = 0; i < handlers.length; i++) {
	//             executeHandler(handlers[i]);
	//         }
	//     });

	//     //initialize on-click event for buttons
	//     $("button").on("click", function () {
	//         var buttonId = $(this).attr('id');
	//         var handlers = getHandlersByFilter(handlerMap, {"element": buttonId});

	//         for (var i = 0; i < handlers.length; i++) {
	//             executeHandler(handlers[i]);
	//         }
	//     });

	//     //initialize key-down event
	//     $(document).keydown(function (e) {
	//         var keyId = e.which;
	//         window.lastFocusedElement = e.target;
	//         var targetId = e.target.id;
	//         var handlers = getHandlersByFilter(handlerMap, {"key": keyId});

	//         for (var i = 0; i < handlers.length; i++) {
	//             //element not specified, execute
	//             if (handlers[i]["element"] == undefined ||
	//                 handlers[i]["element"] == "") {
	//                 executeHandler(handlers[i]);
	//             }
	//             //element matches rule, execute
	//             else if (handlers[i]["element"] == targetId) {
	//                 executeHandler(handlers[i]);
	//             }
	//         }
	        
	//         // do not propagate the event if the key was ENTER.
	//         if (keyId === 13) {
	//         	event.preventDefault();
	//         	return false;
	//         }
	//     });
	});
	
	return {
		initData: function() {
			SetListeners()
			setUserDataValuesInFields();
		    initTableOrListFlags();
		    populateTableOrList(true);
		    addTableOrListClickListener();

		    //set fields from query string into user data
		    var qs = Page.parseQueryParams();
		    for (param in qs) {
		        populateField(param, qs[param]);
		    }

		    initEventHandlers();
		    
		    if (typeof window['handlerMap'] === "object") {
		    	executeOnLoadHandlers();
		    } else {
		    	loadHandlersWithAjax();		//backward compatibility
		    }
		}
	};
}();

function clearArrayKeysInSessionStorage(array) {
	for (var key in array[0]) {
		removeItem(key);
		
		var keyNameWoIndex = key.substr(0, getNameWoIndexLength(key));
		var i = 0,
			key = keyNameWoIndex + '_0';
		while (i === 0 || containsKey(key)) {
			removeItem(key);
			i++;
			key = keyNameWoIndex + '_' + i;
		}
	}
}

function populateArray(array) {		// populates to HTML to handle singular fields that are not part of a table/list
	if (array == null || !isArray(array)) {
		return;
	}
	
	clearArrayKeysInSessionStorage(array);
	
	for (var i = 0; i < array.length; i++) {
		var arrayRow = array[i]; 
        if (arrayRow == undefined) {
        	continue;
        }

        for (var key in arrayRow) {
            var indexedKey = key.substr(0, getNameWoIndexLength(key)) + '_' + i;
            populateField(indexedKey, arrayRow[key]);
            
            if (i === 0 && !/_0$/.test(key)) {	//!key.endsWith('_0')
            	populateField(key, arrayRow[key]);
            }
        }
    }
}

function getInputFieldsAsQueryString() {
    var dataArray = new Array();
    saveUserData();
    for (var i = 0; i < sessionStorage.length; i++) {
    	var key = sessionStorage.key(i);
        if (key.indexOf("ls.") === -1 &&
            key.indexOf("serviceManagerLocalStorage.") === -1 &&
            !/^_backup/.test(key)) {
        	
        		var value = sessionStorage.getItem(key);
        		value = (value !== null ? encodeURIComponent(value) : "");
            	dataArray.push(key + "=" + value);
        }
    }
    return dataArray.join("&");
}


function getResponseNodeValueByName(nodeName, response) {
    if (window.response == null && response == null) {
        return "";
    } else if (typeof response === 'undefined' || response == null) {
        response = window.response;
    }

    return findValues(response, nodeName)[0] || "";
}


function copyToNextAvailableIndex(paramName, startIndex) {
	var nameWoIndex = paramName.substr(0, getNameWoIndexLength(paramName));
	for (var i = startIndex;; i++) {
		var currentName = nameWoIndex + '_' + i;
		if (!sessionStorage.contains(currentName)) {
			sessionStorage[currentName] = sessionStorage[paramName];
			return;
		}
	}
}


/* Refactored */
/* resolveAddress requires Google Maps API key */

var Location = function(){
	var map, geocoder, marker;
	
	return {
		
		initMap: function() {
		    map = new google.maps.Map(document.getElementById('map'), {
		    	center: {lat: 40.7115648, lng: -74.0038266},
		    	zoom: 12,
		    	gestureHandling: "cooperative",
		    	fullscreenControl: false,
		    	streetViewControl: false
		    });
		    geocoder = new google.maps.Geocoder();
		    
		    var initialAddress = this.buildAddress();
		    if (!initialAddress || initialAddress.length == 0) {
		    	initialAddress = defaultValues['Map'];
		    	initialAddress = (typeof initialAddress === 'object' && initialAddress !== null && initialAddress.value !== undefined) ? initialAddress.value : initialAddress;		// backward compatibility
		    	document.getElementById('map_address').innerHTML = initialAddress;
			}
		    this.markOnMap(initialAddress);
		    
		    var that = this;
			document.getElementById('map_navigate_button').addEventListener('click', function() {
				var address = document.getElementById('map_address').innerHTML;
				var url = 'https://www.google.com/maps/search/?api=1&query=' + address.replace(' ', '+');
				window.open(url, '_blank');
			});
		    document.getElementById('map_locate_button').addEventListener('click', function() {
		    	that.markOnMap(that.buildAddress(), true);
			});
		},
		
		buildAddress: function() {
			var address = window['convert_map']();
			document.getElementById('map_address').innerHTML = address;
			return address.trim();
		},
		
		markOnMap: function(address, popupOnFailure) {
			if (marker !== undefined) {
				marker.setMap(null);
			}
			if (!address || address.length == 0) {
				return;
			}
			geocoder.geocode({'address': address}, function(results, status) {
				if (status === 'OK') {
					map.setCenter(results[0].geometry.location);
					marker = new google.maps.Marker({
						map: map,
						position: results[0].geometry.location
					});
				} else {
					if (popupOnFailure) {
						showInfoPopup('Map', 'Unable to resolve address: ' + status);
					}
				}
			});
		},
		
		getCurrentPosition: function(callback) {
			var options = {
		        enableHighAccuracy: true,
		        timeout: 5000,
		        maximumAge: 0
		    };

		    if (navigator.geolocation) {
		        navigator.geolocation.getCurrentPosition(callback, null, options);
		    } else {
		    	Popup.info('Location Error', 'Location unavailable on this device/browser.');
		    }
		},
		
		resolveAddress: function(callback, position) {
			var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&language=en&sensor=false";
		    jQuery.getJSON(url, function (json) {
		    	if (json.error_message !== undefined && json.error_message.length > 0) {
		    		Popup.info('Location Error', json.error_message);
		    		return;
		    	}
		    	
		        var res = {};
		        //normalize google repsponse
		        $.each(json['results'][0]['address_components'], function (i, elem) {
		            res[elem['types'][0]] = elem['long_name']
		        });

		        callback(res);
		    });
		}
	};
}();

function initMap() {	// must be kept for GoogleMaps API url callback function (which cannot have dot in it's name)
	Location.initMap();
}

var lov_elementIds = {};		// maps [serviceName] to [array with names of elementIds using the service]
var lov_labelItemPairs = {};		// maps [serviceName] to [array with labelItemPairs of service's autocomplete]
var fired_suggestions = [];
var suggestions_in_progress = [];

function fetchService(serviceName, responseHandler, failureHandler) {
    var fetchServiceUrl;

    serviceName = serviceName.trim();

    if (typeof serviceName === 'undefined' || serviceName === '') {
        return;
    }

    fetchServiceUrl = "/ServiceManager/Macro/Service/" + serviceName;

    $.ajax({
        url: getServiceManagerHost() + fetchServiceUrl,
        type: "GET",
        timeout: Services.getTimeout(),
        dataType: "json",
        async: true,
        success: responseHandler,
        error: failureHandler
    });
}

function highlightText(text, $node) {
	text = $.trim(text);
	if (text === '') {
		return;
	}
	var searchText = text.toLowerCase(), currentNode = $node.get(0).firstChild, matchIndex, newTextNode, newSpanNode;
	while ((matchIndex = currentNode.data.toLowerCase().indexOf(searchText)) >= 0) {
		newTextNode = currentNode.splitText(matchIndex);
		currentNode = newTextNode.splitText(searchText.length);
		newSpanNode = document.createElement("span");
		newSpanNode.className = "highlight";
		currentNode.parentNode.insertBefore(newSpanNode, currentNode);
		newSpanNode.appendChild(newTextNode);
	}
}

function invokeOnSelectCallback(elementId, serviceName, selectedItem) {
	var itemHandler = window[elementId + "_lov_item_handler"];
	if (typeof(itemHandler) === 'undefined') {
		return;
	}
	
	if (/^_static_lov_/.test(serviceName)) {		//serviceName.startsWith('_static_lov_')
		itemHandler(selectedItem.item, selectedItem.label);
	} else {
		fetchService(serviceName, function (serviceData) {
			if (typeof serviceData !== 'undefined') {
				var useLabelsAsKeys = serviceData.data.useLabelsAsKeys;
				itemHandler(selectedItem.item, useLabelsAsKeys);
				validateRequiredFields();
			} else {
				onSuggestionsError();
			}
		}, onSuggestionsError);
	}
}

function setAutocompleteSelectOnBlur(element, serviceName) {
	element.blur(function(event) {
		
		var autocomplete = $(this).data("ui-autocomplete");
        var suggestions = autocomplete.widget().children(".ui-menu-item");
        if (suggestions.length === 0 || $(this).val() === '') {
        	// careful: when there is NO match, length will be the count of ALL dropdown items.
        	// besides that, when there IS match, length will be the count of possible autocomplete suggestions.
        	$(this).val('');
        	return;
        }
        
        // we need to make sure that there is a match. see above comment in previous condition.
        var i;
        var matcher = new RegExp($.ui.autocomplete.escapeRegex($(this).val()), "i");
        for (i = 0; i < suggestions.length; i++) {
        	if (matcher.test(suggestions[i].innerText)) {
            	break;
            }
        }
        if (i === suggestions.length) {
        	$(this).val('');
        	return;
        }
		
        if (i === 0) {	// if match is on i >0, it means that blur was after the user clicked on entry on the lov dropdown - so callback was already invoked
        	invokeOnSelectCallback(element[0].id, serviceName, $(suggestions[0]).data().uiAutocompleteItem);
        }
    });
}

function setAutocomplete(elementId, serviceName, labelItemPairs, keepClosed) {
	lov_labelItemPairs.serviceName = labelItemPairs;
	
	var element = $("#" + elementId);
	if (element[0].nodeName === "DIV") {
		element = $(element[0].parentElement);
	}

	element.autocomplete({
		source: labelItemPairs,
		minLength: 0,
		selectFirst: true,
		select: function(event, ui) {
			invokeOnSelectCallback(elementId, serviceName, ui.item);
			return false;
		}
	})
	.click(function() {
		$(this).autocomplete("search", $(this).val());
	})
	.data("ui-autocomplete")._renderItem = function(ul, item) {
		var $a = $("<a></a>").text(item.label);
		highlightText(this.term, $a);
		return $("<li></li>").append($a).appendTo(ul);
	};
	
	if (element.data('closed-selection') !== undefined) {
		setAutocompleteSelectOnBlur(element, serviceName);
	}
	
	if (!keepClosed && labelItemPairs.length > 0) {
		//var element = $('#' + utocomplete_config[serviceName].elementId);
		element.autocomplete("search", element.val());
	}
}

function prepareAutocompleteRequestParams(elementId, serviceName) {
	var requestPreparer = window["prepare_" + serviceName + "_lov_request"];
	if (typeof requestPreparer === 'undefined') {	// backward compatibility
		requestPreparer = window["prepare_" + elementId + "_lov_request"];
	}
	
	if (typeof requestPreparer !== 'undefined') {
		var inputParams = requestPreparer();
		var inputParamArray = [];
		for (var paramName in inputParams) {
			if (inputParams.hasOwnProperty(paramName) && inputParams[paramName] !== undefined) {
				inputParamArray.push(paramName + "=" + encodeURIComponent(inputParams[paramName]));
			}
		}
		var sessionId = sessionStorage.getItem("sessionId");
		if (sessionId !== null) {
			inputParamArray.push("sessionId=" + sessionId);
		}
		return inputParamArray.join("&");
	} else {
		return "";
	}
}

function presentAutocompleteItems(serviceName, arrayItems) {
	fetchService(serviceName, function (serviceData) {
		var useLabelsAsKeys = typeof serviceData !== 'undefined' ? serviceData.data.useLabelsAsKeys : false;
		
		for (var i = 0; i < lov_elementIds[serviceName].length; i++) {
			var elementId = lov_elementIds[serviceName][i];
			var itemPresenter = window[elementId + "_lov_item_presenter"];
			if (typeof itemPresenter !== "undefined") {
				var autocompleteOptions = [];
				arrayItems.forEach(function(arrayItem) {
					autocompleteOptions.push({label: itemPresenter(arrayItem, useLabelsAsKeys), item: arrayItem});
				});
				setAutocomplete(elementId, serviceName, autocompleteOptions, i !== 0);
			}
		}
	}, onSuggestionsError);
}

function onSuggestionsSuccess(response, serviceName, arrayItems) {	
	console.log('Received ' + arrayItems.length + ' autocomplete suggesstions from service ' + serviceName);
	
	presentAutocompleteItems(serviceName, arrayItems);
	suggestions_in_progress.splice(suggestions_in_progress.indexOf(serviceName), 1);
	stopSmallSpinner();
}

function onSuggestionsError(response, serviceName) {
	var serviceErrorMsg = getResponseNodeValueByName("Error");
	if (serviceErrorMsg != undefined && serviceErrorMsg.length > 0) {
		setTimeout(function () {
	        Popup.serviceErrors(serviceErrorMsg, 200);
	    }, 1000);
	}
	
	suggestions_in_progress.splice(suggestions_in_progress.indexOf(serviceName), 1);
	stopSmallSpinner();
}

function getSuggestions(elementId, serviceName) {
	if (suggestions_in_progress.indexOf(serviceName) != -1) {
		console.log('Aborting: getSuggestions is already in progress!');
		return;
	}
	startSmallSpinner('Loading suggestions..');
	suggestions_in_progress.push(serviceName);
	
	lov_elementIds[serviceName].splice(lov_elementIds[serviceName].indexOf(elementId), 1);
	lov_elementIds[serviceName].unshift(elementId);
	
	callWebService(serviceName, prepareAutocompleteRequestParams(elementId, serviceName), undefined, onSuggestionsSuccess, onSuggestionsError, true, false, 'lov:' + elementId);
}

function initAutocompleteFocusTrigger(elementId, serviceName) {
	var handler = function() {
		if (fired_suggestions.indexOf(serviceName) != -1) {
			return;
		}
		getSuggestions(elementId, serviceName);
	    fired_suggestions.push(serviceName);
	};
	
	var field = $('#' + elementId);
	if (field[0].nodeName === 'DIV') {
		$(field[0].parentElement).click(handler);
	} else {
		field.focusin(handler);
	}
}

function initAutocompleteButton(elementId, serviceName) {
	$('#' + elementId + '_lov_trigger').click(function () {
		setAutocomplete(elementId, serviceName, []);
		deleteOfflineResponse(serviceName);
		getSuggestions(elementId, serviceName);
	});
}

function prepareLOV(elementId, serviceName) {
	var isStaticLov = (serviceName === '');
	if (isStaticLov) {
		serviceName = '_static_lov_' + elementId;
	}
	
	if (lov_elementIds[serviceName] === undefined) {
		lov_elementIds[serviceName] = [];
	}
	lov_elementIds[serviceName].push(elementId);
	
	if (isStaticLov) {
		var converter = 'convert_' + elementId;
		if (typeof window[converter] === 'function') {
			setAutocomplete(elementId, serviceName, window[converter](), true);
		} else {
			console.error('No converter seed function found for static lov: ' + id);
		}
	} else {
		initAutocompleteFocusTrigger(elementId, serviceName);
		initAutocompleteButton(elementId, serviceName);
	}
}

function prepareMobileLOV(options) {	// backward compatibility
	prepareLOV(options.elementId, options.webService);
}

/*********************************
 *** Is supported / get config ***
 *********************************/
var offlineRequestsTableData;

function checkOfflineSupport() {
	if (typeof(Storage) === "undefined") {
		showInfoPopup('Offline Support', 'LocalStorage is not supported by your browser, offline capabilities malfunction.');
	}
}

function getOfflineConfig(serviceName) {
	var allConfig = typeof(offlineConfig) !== "undefined" && offlineConfig instanceof Array ? offlineConfig : [];
	for (var i = 0; i < allConfig.length; i++) {
		if (allConfig[i].service === serviceName) {
			return allConfig[i];
		}
	}
	return {};
}

/*********************************
 *** Handler *********************
 *********************************/

function invokeOfflineHandler(serviceName, url, query) {
	var config = getOfflineConfig(serviceName);
	switch (config.action) {
	case 'ERROR':
		showInfoPopup('Offline', 'Please try again later.');
		break;
	case 'SYNC_LATER':
		storeOfflineRequest(getPageName(), serviceName, url, query);
		break;
	case 'STORAGE_THEN_LIVE':
		// will never get here
		break;
	case 'LIVE_THEN_STORAGE':
		
		break;
	default:
	}
}

function getPageName() {
	var $ = window.location.pathname.split("/").pop();
	return  $.indexOf('#') !== -1 ?	$ = $.substring(0, $.indexOf('#')) : $;
}

/*********************************
 *** Sync ************************
 *********************************/

function syncOfflineRequest(index) {
	alert('syncOfflineRequest' + index);
}

function syncAllOfflineRequests() {
	alert('syncAllOfflineRequests');
}

/*********************************
 *** Request *********************
 *********************************/

function getFirstOfflineReqIndex() {
	var index = localStorage['offlineReq_start'];
	return index !== undefined ? +index : 0;
}

function getLastOfflineReqIndex() {
	var index = localStorage['offlineReq_end'];
	return index !== undefined ? +index : -1;
}

function storeOfflineRequest(pageName, serviceName, url, query) {
	var nextIndex = getLastOfflineReqIndex() + 1;
	var now = new Date();
	localStorage['offlineReq_' + nextIndex + '_page'] = pageName;
	localStorage['offlineReq_' + nextIndex + '_service'] = serviceName;
	localStorage['offlineReq_' + nextIndex + '_time'] = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
	localStorage['offlineReq_' + nextIndex + '_url'] = url;
	localStorage['offlineReq_' + nextIndex + '_query'] = query;
	localStorage['offlineReq_end'] = nextIndex;
	showInfoPopup('Offline', 'Your action will be synced later.');
}

function deleteOfflineRequest(index) {
	localStorage.removeItem('offlineReq_' + index + '_page');
	localStorage.removeItem('offlineReq_' + index + '_service');
	localStorage.removeItem('offlineReq_' + index + '_time');
	localStorage.removeItem('offlineReq_' + index + '_url');
	localStorage.removeItem('offlineReq_' + index + '_query');
}

function getOfflineRequests() {
	var $ = [];
	var start = getFirstOfflineReqIndex();
	var end = getLastOfflineReqIndex();
	
	for (var i = start; i < end + 1; i++) {
		if (localStorage['offlineReq_' + i + '_service'] !== undefined) {
			$.push({
				index: 		i,
				page: 		localStorage['offlineReq_' + i + '_page'],
				service: 	localStorage['offlineReq_' + i + '_service'],
				time: 		localStorage['offlineReq_' + i + '_time'],
				url:		localStorage['offlineReq_' + i + '_url'],
				query:		localStorage['offlineReq_' + i + '_query']
			});
		}
	}
	showHideOfflineRequestsTable($);
	return $;
}

/*********************************
 *** Response ********************
 *********************************/

function loadCachedOfflineResponse(serviceName) {
	var offlineAction = getOfflineConfig(serviceName).action;
	if (offlineAction === 'STORAGE_THEN_LIVE') {
		var response = localStorage['offlineRes_' + serviceName];
		if (response !== undefined) {
			return JSON.parse(response);
		}
	}
	return undefined;
}

function deleteOfflineResponse(serviceName) {
	localStorage.removeItem('offlineRes_' + serviceName);
}

function deleteAllOfflineResponses() {
	Object.keys(localStorage).forEach(function(key) {
        if (/^offlineRes_/.test(key)) {
            localStorage.removeItem(key);
        }
    });
	Storage.removeBySubstring('');	//TODO suspecious(!)
}

function storeOfflineResponseIfNeeded(serviceName, response) {
	var offlineAction = getOfflineConfig(serviceName).action;
	if (offlineAction === 'STORAGE_THEN_LIVE' || offlineAction === 'LIVE_THEN_STORAGE') {
		localStorage['offlineRes_' + serviceName] = JSON.stringify(response);
	}
}

/*********************************
 *** UI **************************
 *********************************/

function showHideOfflineRequestsTable(offlineRequests) {
	if (offlineRequests.length !== 0) {
		document.getElementById('offlineRequestsContainer').style.display = 'block';
		document.getElementById('noOfflineRequestsContainer').style.display = 'none';
	} else {
		document.getElementById('offlineRequestsContainer').style.display = 'none';
		document.getElementById('noOfflineRequestsContainer').style.display = 'block';
	}
}

function populateOfflineRequestsTable(offlineRequests) {
	offlineRequestsTableData = offlineRequests;
	
	var tbody = document.getElementById('offlineRequestsTbody');
	if (tbody === null) {
		return;
	}
	while(tbody.rows.length > 0) {
		tbody.deleteRow(0);
	}
	for (var i = 0; i < offlineRequests.length; i++) {
		var row = tbody.insertRow(i);
		var cell;
		
		cell = document.createElement('td');
        row.appendChild(cell);
        cell.innerHTML = offlineRequests[i]['index'];
        
        cell = row.insertCell(-1);
        cell.innerHTML = offlineRequests[i]['page'];
        
        cell = row.insertCell(-1);
        cell.innerHTML = offlineRequests[i]['service'];
        
        cell = row.insertCell(-1);
        cell.innerHTML = offlineRequests[i]['time'];
        
        cell = row.insertCell(-1);
        cell.innerHTML = '<a title="Sync" href="#" onclick="syncOfflineRequest(' + i + ')"\r\n' +
						 'class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-refresh ui-btn-icon-notext"\r\n' +
						 'style="width: 40px !important; margin-right: 10px"></a>\r\n' +
						 '<a title="Delete" href="#" onclick="deleteTableOfflineRequest(' + i + ')"\r\n' +
						 'class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-minus ui-btn-icon-notext"\r\n' +
						 'style="width: 40px !important; margin-right: 0"></a>';
	}
}

function deleteTableOfflineRequest(index) {
	var rowData = offlineRequestsTableData[index];
	showConfirmPopup('Delete sync request #' + rowData.index, 'Are you sure you want to delete request for service ' + rowData.service + ' made from ' + rowData.page + '?', function() {
		offlineRequestsTableData.splice(index, 1);
		document.getElementById("offlineRequestsTbody").deleteRow(index);
		deleteOfflineRequest(rowData.index);
	});
}

/* Refactored */
/* Working */

var Page = function() {
	
	return {
		
		navigate: function(target) {
			target = (!/\.html$/.test(target) && target.indexOf('/') === -1 ? target + '.html' : target);		//target.endsWith(".html")
		    
		    var loginPage = this.getLoginPage();
			if (this.getCurrentPage() === loginPage) {
				sessionStorage.setItem('_is_logged_in', target !== undefined && target !== loginPage);
			}
		    
			saveUserData();
		    window.location = target;
		},
		
		parseQueryParams: function() {
			var url = window.location.search;
		    var result = {};
		    var searchIndex = url.indexOf("?");

		    if (searchIndex == -1) {
		        return result;
		    }

		    var sPageURL = url.substring(searchIndex + 1);
		    var sURLVariables = sPageURL.split('&');

		    for (var i = 0; i < sURLVariables.length; i++) {
		        var sParameterName = sURLVariables[i].split('=');
		        result[sParameterName[0]] = sParameterName[1];
		    }

		    return result;
		},
		
		getCurrentPage: function() {
			return window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
		},
		
		getLoginPage: function() {
			return 	typeof app !== 'undefined' && app.loginPage != undefined && app.loginPage != null ?
					app.loginPage.trim() :
					'';
		},
		
		validateLogin: function() {
			var isLoggedIn = sessionStorage.getItem('_is_logged_in') === 'true';
			var loginPage = this.getLoginPage();
			if (this.getCurrentPage() === loginPage) {
				sessionStorage.setItem('_is_logged_in', false);
				return;
			}
			if (!isLoggedIn && loginPage !== '') {
				window.location = loginPage;
			}
		}
	};
}();

/* Refactored */
/* Working */

var Popup = function() {
	
	var _okCallback = undefined;
	var _cancelCallback = undefined;

	$(function () {
	    $("#popupOkButton").on("click", function () {
	    	if (!$("#popupOkButton")[0].hasAttribute('data-rel')) {	// old versions already close the popup via data-rel="close"
				$("#popup").popup("close");
			}
	        if (_okCallback != undefined) {
	        	_okCallback();
	        }
	    });
	    $("#popupCancelButton").on("click", function () {
	    	if (!$("#popupCancelButton")[0].hasAttribute('data-rel')) {	// old versions already close the popup via data-rel="close"
				$("#popup").popup("close");
			}
	        if (_cancelCallback != undefined) {
	        	_cancelCallback();
	        }
	    });
	});
	
	function _injectVars(message) {
		var regex = /\${(.*?)}/g;
		return message.replace(regex, function(match, group) {
			return Storage.get(group);
		});
	}

	function _showPopupCommon(title, message) {
		$("#popupTitle").text(_injectVars(title));
	    $("#popupMessage").html(_injectVars(message));
	    
	    setTimeout(function() {
	    	$("#popup").popup();
	    	$("#popup").popup("open");
	    }, 200);
	}
	
	return {
		ok: function(title, message, okCallback) {
			$('#popupOkButton').text('OK');
			$("#popupCancelButton").hide();
			_okCallback = okCallback;
			
			_showPopupCommon(title, message);
		},
		
		okCancel: function(title, message, okCallback, cancelCallback) {
			$('#popupOkButton').text('OK');
			$('#popupCancelButton').text('Cancel');
			$("#popupCancelButton").show();
			
			_okCallback = okCallback;
			_cancelCallback = cancelCallback;
			
			_showPopupCommon(title, message);
		},
		
		custom: function(title, message, button1Label, button2Label, button1Callback, button2Callback) {
			$('#popupOkButton').text(button1Label);
			if (button2Label !== undefined) {
				$('#popupCancelButton').text(button2Label);
				$("#popupCancelButton").show();
			} else {
				$("#popupCancelButton").hide();
			}
			
			_okCallback = button1Callback;
			_cancelCallback = button2Callback;
			
			_showPopupCommon(title, message);
		},
		
		serviceErrors: function(serviceError, status) {
		    var errorAlert = "<div> Service failed with errors [status " + status + "]:<br />&#9658;";
		    
		    errorAlert += [].concat.apply([], serviceError.split("'").map(function(v,i){
		        return i % 2 ? "'" + v + "'" : v.split(';').join("<br />&#9658;")
			})).filter(Boolean).join("");

		    errorAlert += "<div/>";
		    this.info('Error', errorAlert);
		}
	};
}();

Popup.info = Popup.ok;
Popup.confirm = Popup.okCancel;

/* Refactored */
/* Working */

var Services = function() {
	
	/******************************/
	/***** Before service call ****/
	/******************************/
	
	function generatePartialPlaybackQueryTokens(serviceName) {
		var $ = '';
		
		if (typeof(partialPlayback) !== "undefined") {
			if (partialPlayback.keepAlive instanceof Array &&
				partialPlayback.keepAlive.indexOf(serviceName) !== -1) {
					$ += '&keepAlive=true'
			}
		}
		return $;
	}
	
	function generateMockFlag() {
		return typeof app !== 'undefined' && app.mock === true ? '&mock=true' : '';
	}
	
	/******************************/
	/***** After service call *****/
	/******************************/
	
	function onWebServiceAjaxSuccess(response, successHandler, failureHandler, serviceName, populateFields, context) {
	    window.response = response;
	    var serviceErrorMsg = getResponseNodeValueByName("Error");

	    if (serviceErrorMsg.toLowerCase().indexOf("service is disabled") !== -1) {
	        showInfoPopup('Service Error', serviceErrorMsg);
	        executeResponseHandler(failureHandler, undefined, serviceName, undefined);
	        $(document).triggerHandler("receiveResponse", [null, serviceName, "error", populateFields]);

	    } else if (typeof serviceErrorMsg !== 'undefined' && serviceErrorMsg !== null && serviceErrorMsg !== '') {
	        failureHandler = populateErrorsToHandler(failureHandler, serviceErrorMsg, 200);
	        analyzeJson(response, failureHandler, serviceName, populateFields, context);
	        $(document).triggerHandler("receiveResponse", [null, serviceName, "error", populateFields]);
	    } else {
	        analyzeJson(response, successHandler, serviceName, populateFields, context);
	        $(document).triggerHandler("receiveResponse", [response, serviceName, "success", populateFields]);
	    }
	}
	
	function onWebServiceAjaxFailure(response, status, failureHandler, serviceName, populateFields, context) {
	    var serviceErrorMsg = getResponseNodeValueByName("Error", response.responseJSON);

	    if (typeof serviceErrorMsg === 'undefined' || serviceErrorMsg == null || serviceErrorMsg === "") {
	    	if (response.status === 404) {
	            showInfoPopup('Service Error', 'Service has failed with status of 404 - Requested page not found');
	        } else if (response.status === 500) {
	            showInfoPopup('Service Error', 'Service has failed with status of 500 - Internal Server Error');
	        } else if (status === 'parsererror') {
	            showInfoPopup('Service Error', 'Requested url parse failed');
	        } else if (status === 'timeout') {
	            showInfoPopup('Service Error', 'Timeout reached, no response');
	        } else if (status === 'abort') {
	            showInfoPopup('Service Error', 'Ajax request aborted');
	        } else {
	            showInfoPopup('Service Error', 'Unexpected Error: \n' + response.responseText);
	        }
	        
	        if (!/^popupErrors:/.test(failureHandler)) {		//!failureHandler.startsWith('popupErrors:') || !popupLaunched
	        	executeResponseHandler(failureHandler, undefined, serviceName, undefined);
	        }

	    } else if (typeof serviceErrorMsg !== 'undefined' && serviceErrorMsg != null && serviceErrorMsg !== "") {
	        failureHandler = populateErrorsToHandler(failureHandler, serviceErrorMsg, response.status);
	        analyzeJson(response.responseJSON, failureHandler, serviceName, populateFields, context);
	    }

	    $(document).triggerHandler("receiveResponse", [null, serviceName, "error", populateFields]);
	}
	
	function analyzeJson(json, responseHandler, serviceName, populateFields, context) {
	    if (typeof json["Response"] === 'undefined') {
	        executeResponseHandler(responseHandler, json, serviceName);
	        return;
	    }

	    //Extract special output parameters
	    store('Error', json["Response"][serviceName + "Message"]["Error"]);
	    store('PopupMessages', json["Response"][serviceName + "Message"]["PopupMessages"]);
	    store('StatusBarMessages', json["Response"][serviceName + "Message"]["StatusBarMessages"]);
	    
	    var sessionId = json["Response"][serviceName + "Message"]["sessionId"];
	    if (sessionId !== undefined) {
	    	store('sessionId', sessionId);
	    }

	    //Handle Elements
	    var elements = json['Response'][serviceName + 'Elements'];

	    if (typeof elements === "object" && elements !== null) {
	        var nodeValue = "";
	        var nodeName = "";
	        for (var i in elements) {
	            nodeName = i;
	            nodeValue = elements[i];

	            //populate fields
	            if (typeof(populateFields) === "undefined" || populateFields) {
	                populateField(nodeName, nodeValue, "_output");
	            }
	        }
	    }

	    //Handle Array Items
	    var tableRows = null;
	    if (typeof json["Response"][serviceName + "TableArray"] !== 'undefined') {
	        tableRows = [].concat(json["Response"][serviceName + "TableArray"][serviceName + "ArrayItem"]);
	        if (!/^lov:/.test(context)) {	// !context.startsWith('lov:')
		    	populateArray(tableRows);
	        }
		    if (typeof(populateFields) === "undefined" || populateFields) {
		        populateTableOrList();
		    }
	    }

	    executeResponseHandler(responseHandler, json, serviceName, tableRows);
	    return true;
	}
	
	function populateErrorsToHandler(failureHandler, message, status) {
		if (isString(failureHandler) && /^popupPopupMessages:/.test(failureHandler)) {		//failureHandler.startsWith('popupPopupMessages:')
			var popupMessages = getResponseNodeValueByName("PopupMessages");
			return 	popupMessages.length !== 0 ?
					failureHandler + popupMessages + ";" + status :
					'popupErrors:' + message + ";" + status;	// in case that PopupMessages are empty, fallback to displaying errors
		}
		
		if (isString(failureHandler) && /^popupErrors:/.test(failureHandler)) {		//failureHandler.startsWith('popupErrors:')
			return failureHandler + message + ";" + status;
		}
		
		return failureHandler;
	}
	
	function executeResponseHandler(responseHandler, data, serviceName, tableRows) {
	    if (typeof responseHandler === 'undefined' || responseHandler === '') {
	        return;
	    }

	    //response handler is function
	    if (typeof responseHandler.indexOf === 'undefined' || responseHandler.indexOf(':') === -1) {
	        if (typeof responseHandler !== 'undefined' ||
	            (typeof window[responseHandler] !== 'undefined' && window[responseHandler] !== null)) {
	            if (typeof window[responseHandler] === 'function') {
	                window[responseHandler].call(this, data, serviceName, tableRows);
	            } else if (typeof responseHandler === 'function') {
	                responseHandler.call(this, data, serviceName, tableRows);
	            }
	        }
	        return;
	    }
	    
	    if (/^popupErrors:/.test(responseHandler)) {	//responseHandler.startsWith('popupErrors:')
	        var popupContents = responseHandler.substring(12);
	        var separatorPos = popupContents.lastIndexOf(';');
	        Popup.serviceErrors(popupContents.substring(0, separatorPos), popupContents.substring(separatorPos + 1));
	        return;
	    }
	    if (/^popupPopupMessages:/.test(responseHandler)) {	//responseHandler.startsWith('popupPopupMessages:')
	        var popupContents = responseHandler.substring(19);
	        var separatorPos = popupContents.lastIndexOf(';');
	        Popup.info('Error', popupContents.substring(0, separatorPos));
	        return;
	    }
	    if (/^popupAndNavigate:/.test(responseHandler)) {	//responseHandler.startsWith('popupAndNavigate:')
	    	var separatorPos = responseHandler.lastIndexOf(':');
	    	var popupText = responseHandler.substring(17, separatorPos);
	    	var targetPage = responseHandler.substring(separatorPos + 1);
	        Popup.info('', popupText, function() {
	    	    navigate(targetPage);
	    	});
	        return;
	    }
	    if (/^popup:/.test(responseHandler)) {	//responseHandler.startsWith('popup:')
	        var popupText = responseHandler.substring(6);
	        Popup.info('', popupText);
	        return;
	    }
	    if (/^navigate:/.test(responseHandler)) {	//responseHandler.startsWith('navigate:')
	        var targetPage = responseHandler.substring(9);
	        navigate(targetPage);
	        return;
	    }
	}
	
	/******************************/
	/***** Service call ***********/
	/******************************/
	
	function transformFailureHandler(failureHandler) {
		return (failureHandler === undefined ? 'popupErrors:' :
			    failureHandler === null ? undefined :
			    failureHandler);
	}
	
	function sendServiceRequest(serviceName, url, queryData, asyncFlag, responseHandler, failureHandler, populateFields, context) {
		waitingForResponse = true;
		$.ajax({
	        url: url,
	        type: "POST",
	        timeout: Services.getTimeout(),
	        dataType: "json", // expected format for response
	        data: queryData,
	        async: typeof asyncFlag === 'undefined' ? true : asyncFlag,
	        success: function (response, textStatus, xhr) {
	        	storeOfflineResponseIfNeeded(serviceName, response);
	        	waitingForResponse = false;
	        	Spinner.stop();
	            onWebServiceAjaxSuccess(response, responseHandler, failureHandler, serviceName, populateFields, context);
	        },
	        error: function (response, status, error) {
	        	waitingForResponse = false;
	        	Spinner.stop();
	        	if (response.status === 0 && !(status === 'timeout' && error === 'timeout')) {
	        		// offline status would usually be status==='error' && error='', but maybe there are more cases
	        		// status==='error' && error='' means ajax request timeout (reached Services.getTimeout())
	        		invokeOfflineHandler(serviceName, url, queryData);
	        	} else {
	        		onWebServiceAjaxFailure(response, status, failureHandler, serviceName, populateFields);
	        	}
	        }
	    });
	}
	
	return {
		getTimeout: function() {
			return typeof app !== 'undefined' && !isNaN(app.serviceCallTimeout) ? +app.serviceCallTimeout : 60 * 1000;
		},
		
		call: function(serviceName, successFunction, failureFunction) {
			failureFunction = transformFailureHandler(failureFunction);
			this.callWebServiceWithAllParams(serviceName, undefined, successFunction, failureFunction, true);
		},
		
		callSync: function(serviceName, failureFunction) {
			function successFunction(_response) {
				response = _response;
			}
			
			var response;
			this.callWebServiceWithAllParams(serviceName, undefined, successFunction, failureFunction, false);
			return response;
		},
		
		/**
		 *
		 * @param webService -     name of webservice
		 * @param params -         query string
		 * @param initHandler -    function to be run before call to webservice,
		 *                         return false to abort execution.
		 *                         initHandler(serviceName)
		 * @param asyncFlag -      call web service asynchronously
		 * @param populateFields - field populator callback
		 * @param failureHandler - function to be run after webservice call in case of a failure
		 * @param responseHandler - function to be run after webservice call,
		 *                            responseHandler(response, serviceName, status)
		 *            response - in json format.
		 *            serviceName - string
		 *            status - one of: "success","notfound","internal","parsererror","timeout","abort","unknown"
		 *
		 */
		callWebService: function (webService, params, initHandler, responseHandler, failureHandler, asyncFlag, populateFields, context) {
			if (waitingForResponse) {	//prevent calls to webservice while waiting for response
		        return;
		    }

		    webService = webService.trim();
		    if (typeof webService === 'undefined' || webService === '') {
		        return;
		    }
		    
		    var webServiceUrl;
		    if (webService.indexOf("/") === -1 && webService.indexOf(".") === -1 && webService.indexOf(":") === -1) {
		        webServiceUrl = "http://35.163.113.45/ServiceManager/Macro/ExecMacro/" + webService;	//if webService is not URL, assume it is local service
		    } else {
		        webServiceUrl = webService;		//webService is assumed to be URL
		    }
		    
		    var serviceName = webServiceUrl.substr(webServiceUrl.lastIndexOf('/') + 1);

		    var queryData = params + '&randomSeed=' + (Math.random() * 1000000) + '&json=true';
		    queryData += generatePartialPlaybackQueryTokens(serviceName);
		    queryData += generateMockFlag();
		    
		    //call init handler
		    if (typeof initHandler !== 'undefined') {
		        //get the function by calling window[errorHandler]
		        if (typeof window[initHandler] !== 'undefined' && window[initHandler] !== null) {
		            if (typeof(window[initHandler]) === 'function')
		                var initResult = window[initHandler].call(this, serviceName);
		            if (initResult === false) {
		                return; //abort execution
		            }
		        }
		    }
		    
		    if (!/^lov:/.test(context)) {	// !context.startsWith('lov:')
		    	Spinner.start();
		    }
		    $(document).triggerHandler("sendRequest");

		    var response = loadCachedOfflineResponse(serviceName);
		    if (response !== undefined) {
		    	onWebServiceAjaxSuccess(response, responseHandler, failureHandler, serviceName, populateFields, context);
		    } else {
		    	sendServiceRequest(serviceName, getServiceManagerHost() + webServiceUrl, queryData, asyncFlag, responseHandler, failureHandler, populateFields, context);
		    }
		},
		
		/**
		 *
		 * @param webService -    name of webservice
		 * @param initHandler - function to be run before call to webservice,
		 *                        return false to abort execution.
		 *                        initHandler(serviceName)
		 *
		 * @param responseHandler - function to be run after webservice call,
		 *                            responseHandler(response, serviceName, status)
		 *            response - in json format
		 *            serviceName - string
		 *            status - one of: "success","notfound","internal","parsererror","timeout","abort","unknown"
		 *
		 */
		callWebServiceWithAllParams: function(webService, initHandler, responseHandler, failureHandler, asyncFlag, populateFields) {
			var that = this;
			if (typeof window['uploadNewFiles'] === 'function') {
				uploadNewFiles().then(function() {
					var params = getInputFieldsAsQueryString();
					that.callWebService(webService, params, initHandler, responseHandler, failureHandler, asyncFlag, populateFields);
			    });
			} else {
				var params = getInputFieldsAsQueryString();
				that.callWebService(webService, params, initHandler, responseHandler, failureHandler, asyncFlag, populateFields);
			}
		},
		
		startSession: function() {
			store('keepAlive', true);
		},

		endSession: function () {
			store('keepAlive', false);
		},
		
		killSession: function(sessionId) {
			var sessionId = typeof(sessionId) !== "undefined" ?
							sessionId :
							sessionStorage.getItem('sessionId');
			if (sessionId === undefined || sessionId === null) {
				return;
			}
			
		    Spinner.start();
		    $.ajax({
		        url: getServiceManagerHost() + "/ServiceManager/Macro/Sessions/" + sessionId,
		        type: "DELETE",
		        timeout: Services.getTimeout(),
		        dataType: "json", // expected format for response
		        async: false,
		        success: function (response) {
		        	if (sessionStorage.getItem('sessionId') === sessionId) {
		        		sessionStorage.removeItem('sessionId');
		        		store('keepAlive', false);
		        	}
		        	Spinner.stop();
		        },
		        error: function (response, status, error) {
		        	Spinner.stop();
		        }
		    });
		}
	};
}();

/* Refactored */
/* Working */

var Spinner = function() {
	
	$(function () {
		if ($('#spinner').length === 0) {
			$('body').prepend('<div id="spinner-background"></div><div id="spinner"></div>');
		}
	});
	
	return {
		start: function() {
			document.getElementById("spinner").style.display = 'block';
    		document.getElementById("spinner-background").style.display = 'block';
		},
		
		stop: function() {
        	document.getElementById("spinner").style.display = 'none';
    		document.getElementById("spinner-background").style.display = 'none';
        },
        
        startMiniSpinner: function(text) {
        	$(document.body).append(
    			'<div id="small-spinner" class="ui-loader ui-corner-all ui-body-z ui-loader-verbose small-spinner">' +
    		   		'<span class="ui-icon-loading"><h1>' + text + '</h1></span>' + 
    		   	'</div>');
        },
        
        stopMiniSpinner: function() {
        	var spinner = document.getElementById('small-spinner');
        	if (spinner != undefined) {
        		spinner.parentNode.removeChild(spinner);
        	}
        }
	};
}();

/* Refactored */
/* Working */

var Storage = function() {
		
	return {
		
		clear: function() {
			sessionStorage.clear();
		},
		
		clearBackups: function() {
			this.clearByPrefix('_backup_');
		},
		
		contains: function(key) {
			return sessionStorage.getItem(key) !== null;
		},
		
		copyFromIndex: function(key, index) {
			var value = this.getFromIndex(key, index);
			this.set(key, value);
		},
		
		count: function(key) {
			var count = 0;
			var nameWoIndex = key.substr(0, getNameWoIndexLength(key)) + '_';
			Object.keys(sessionStorage).forEach(function(key) {
				if (key.indexOf(nameWoIndex) === 0 && !isNaN(key.substr(nameWoIndex.length))) {
					count++;
				}
			});
			return count;
		},
		
		backup: function(key) {
			var originalValue = sessionStorage.getItem(key);
			if (originalValue !== null) {
				store('_backup_' + key, originalValue);
			}
		},
		
		backupAndCopyFromIndex: function(key, index) {
			this.backup(key);
			this.copyFromIndex(key, index);
		},
		
		backupAndSet: function(key, value) {
			backupField(key);
			this.set(key, value);
		},
		
		deleteByPrefix: function(prefix) {
			var regex = new RegExp("^" + prefix);
			Object.keys(sessionStorage).forEach(function(key) {
				if (regex.test(key)) {
					sessionStorage.removeItem(key);
				}
			});
		},
		
		deleteAllIndices: function(paramName) {
			var nameWoIndex = paramName.substr(0, getNameWoIndexLength(paramName)) + '_';
			Object.keys(sessionStorage).forEach(function(key) {
				if (key.indexOf(nameWoIndex) === 0 && !isNaN(key.substr(nameWoIndex.length))) {
					sessionStorage.removeItem(key);
				}
			});
		},
		
		deleteBySubstring: function(substr) {
			Object.keys(sessionStorage).forEach(function(key) {
		        if (key.indexOf(substr) >= 0) {
		            sessionStorage.removeItem(key);
		        }
		    });
		},
		
		get: function(key) {
			var value = "";
		    try {
		        value = sessionStorage.getItem(key);
		    } catch (e) {}

		    return cleanValue(value);
		},
		
		getFromIndex: function(key, index) {
			var indexedKey = key.substr(0, getNameWoIndexLength(key)) + '_' + index;
			return this.get(indexedKey);
		},
		
		set: function(key, value) {
			sessionStorage.setItem(key, value);
		},
		
		restoreBackups: function() {
			Object.keys(sessionStorage).forEach(function(key) {
				if (/^_backup_/.test(key)) {
					sessionStorage.setItem(key.substr(8), sessionStorage.getItem(key));
					sessionStorage.removeItem(key);
				}
			});
		},
		
		remove: function(key) {
			sessionStorage.removeItem(key);
		}
	};
}();

// backward compatibility
Storage.removeBySubstring = Storage.deleteBySubstring;
Storage.clearByPrefix = Storage.deleteByPrefix;
Storage.clearAllIndices = Storage.deleteAllIndices;

/****************************
 *** Common *****************
 ****************************/

/**
 * Get the highest index existing for a parameter 
 * @param fieldName
 */
function getTableOrListStart(headElementId) {
	var head = document.getElementById(headElementId);
	if (head == null) {
		return 0;
	}
	var startIndex = head.getAttribute('start-index');
	return startIndex != null ? startIndex : 0;
}

function getHighestIndex(fieldName) {
	var $ = -1;
	var fieldNameWoIndex = fieldName.substr(0, getNameWoIndexLength(fieldName));
	
	for (var key in sessionStorage) {
        var keyWoIndex = key.substr(0, getNameWoIndexLength(key));
        
		if (keyWoIndex === fieldNameWoIndex) {
			var index = +key.substr(key.lastIndexOf('_') + 1);
			if (index > $) {
				$ = index;
			}
		}
	}
	return $;
} 

function executeTableOnClickHandlers(row, col, rowCells) {
	var onTableClickHandlers = [];
    $.merge(onTableClickHandlers, getHandlersByFilter(handlerMap, {"action": "tableClick:webservice"}));
    $.merge(onTableClickHandlers, getHandlersByFilter(handlerMap, {"action": "tableClick:navigate"}));
    $.merge(onTableClickHandlers, getHandlersByFilter(handlerMap, {"action": "tableClick:function"}));
    for (var i = 0; i < onTableClickHandlers.length; i++) {
        executeHandler(onTableClickHandlers[i], row, col, rowCells);
    }
}

function formatTableValue(displayFormat, value) {
	return  !!displayFormat && displayFormat.indexOf('%s') !== -1 ?
			displayFormat.replace('%s', value):
			value;
}

/****************************
 *** table-list selectors ***
 ****************************/

var hasTable, hasList;
var tableOutputBody, listOutput;

function populateTableOrList(isInit) {
	if (hasTable) {
		populateTable(tableOutputBody, isInit);
	} else if (hasList) {
		populateTableListLayout(listOutput, isInit);
	}
}

/****************************
 *** onLoad *****************
 ****************************/

function initTableOrListFlags() {
	tableOutputBody = document.getElementById("tableOutputBody");
	listOutput = document.getElementById("listOutput");
	
	hasTable = (tableOutputBody != null);
	hasList = (listOutput != null);
}

function addTableOrListClickListener() {
	if (hasTable) {
		initTableFilter();
		addTableClickListener();
	} else if (hasList) {
		addTableListLayoutClickListener();
	}
}

/**
 * Get array of the field IDs serving as columns.
 */
function getListColumnsMetadata() {
	var listOutputHead = document.getElementById("listOutputHead");
	if (listOutputHead == null) {
		return null;
	}
	
	var $ = [];
	var columnElements = listOutputHead.getElementsByTagName('div');
	for(var i = 0; i < columnElements.length; i++) {
		$.push({id: columnElements[i].id, displayFormat: columnElements[i].getAttribute('display-format')});
	}
	return $;
}

/**
 * Insert a new row to list, and populate it with values from local storage.
 * The fields index will be the row index.
 * Meaning, when populating parameter S_CUSTOMER_ID_0 for row number 4, the value
 * will be evaluated as sessionStorage[S_CUSTOMER_ID_4]. 
 * @param rowIndex number of row in table.
 */
function populateTableListLayoutRow(listOutput, columnsMetadata, rowIndex) {
	var rowColumnValues = "";
	
	for (var i in columnsMetadata) {
    	var cellName = columnsMetadata[i].id;
    	var cellNameWithIdx = cellName.substr(0, getNameWoIndexLength(cellName)) + '_' + rowIndex;
    	var cellValue = formatTableValue(columnsMetadata[i].displayFormat, sessionStorage[cellNameWithIdx]);
    	
    	var alphabeticalIndex = String.fromCharCode("a".charCodeAt(0) + (+i % 2));
    	rowColumnValues += 
    		"<div" + (+i >= 2 ? " style=\"font-weight:normal\"" : "") + " class=\"ui-block-" + alphabeticalIndex +"\">\n" + 
    		"	" + cellValue + "&nbsp;\n" +
    		"</div>\n";		// &nbsp; required so empty values will take space
	}
	
	var liClass = columnsMetadata.length == 1 ? "ui-grid-solo" : "ui-grid-a";
	listOutput.innerHTML += 
		"<li><a href=\"#\" class=\"ui-btn ui-btn-icon-right ui-icon-carat-r\">\n" +
		"	<div class=\"" + liClass + "\">\n" +
		"		" + rowColumnValues +
		"	\n</div>\n" +
		"</a></li>";
}

function clearAllTableListLayoutRows() {
	if (listOutput == null) {
		return;
	}
	
	var numOfDataChildren = listOutput.childElementCount - 1;
	for (var i = 0; i < numOfDataChildren; i++) {
		listOutput.removeChild(listOutput.lastElementChild);
	}
}

/**
 * Insert rows to list according to sessionStorage.
 */
function populateTableListLayout(listOutput, isInit) {
	if (listOutput == null) {
		return;
	}
	
	if (!isInit) {
		document.getElementById("listOutput").style.display = 'block';
	}
	
	var columnsMetadata = getListColumnsMetadata();
	if (columnsMetadata == null) {
		return;
	}
	
	clearAllTableListLayoutRows();
	
	var firstIndex = getTableOrListStart('listOutputHead');
	var lastIndex = getHighestIndex(columnsMetadata[0].id);
	for (var i = firstIndex; i <= lastIndex; i++) {
		populateTableListLayoutRow(listOutput, columnsMetadata, i);
	}
}

/****************************
 *** onLoad *****************
 ****************************/

function calculateIndexInParent(element){
    var i = 0;
    while ((element = element.previousElementSibling) != null) {
    	i++;
    }
    return i;
}

function addTableListLayoutClickListener() {
	$('#listOutput').on('click','li', function(e){
		var row = calculateIndexInParent(e.currentTarget) - 1;	//first row is the table header
		var col = 0;	//list doesn't have meaning to columns. 
		
		var rowCells = [];
		var domCells = e.currentTarget.children[0].children[0].children;
		for (var i = 0; i < domCells.length; i++) {
			rowCells.push(domCells[i].innerText);
		}
		
		executeTableOnClickHandlers(row, col, rowCells);
	});
}

/**
 * Get array of the field IDs serving as columns.
 */
function getTableColumnsMetadata() {
	var tableOutputHead = document.getElementById("tableOutputHead");
	if (tableOutputHead == null) {
		return null;
	}
	
	var $ = [];
	var tdElements = tableOutputHead.getElementsByTagName('th');
	for(var i = 0; i < tdElements.length; i++) {
		$.push({
			id: tdElements[i].id,
			type: tdElements[i].getAttribute('data-type'),
			displayFormat: tdElements[i].getAttribute('display-format')
		});
	}
	return $;
}

function generateHtmlValue(cellNameWithIdx, value, displayFormat, type) {
	if (type === 'text') {
		return '<input id="' + cellNameWithIdx + '" value="' + value + '">';
	} else if (type === 'checkbox') {
		cellNameWithIdx = '_nostore_' + cellNameWithIdx;
		var isChecked = (value.toUpperCase() === 'TRUE' || value.toUpperCase() === 'Y' || value.toUpperCase() === 'YES');
		return 	'<label for="' + cellNameWithIdx + '">&nbsp;</label>' +
				'<input id="' + cellNameWithIdx + '" name="' + cellNameWithIdx + '" type="checkbox" style="display: none"' + 
					(displayFormat === 'true' ? '' : ' disabled') + (isChecked ? ' checked' : '') + '>';
	} else {
		return value;
	}
}

/**
 * Insert a new row to table, and populate it with values from local storage.
 * The fields index will be the row index.
 * Meaning, when populating parameter S_CUSTOMER_ID_0 for row number 4, the value
 * will be evaluated as sessionStorage[S_CUSTOMER_ID_4]. 
 * @param rowIndex number of row in table.
 */
function populateTableRow(tableOutputBody, columnsMetadata, rowIndex) {
	var rowCount = tableOutputBody.rows.length;
	var row = tableOutputBody.insertRow(rowCount);
	
	for (var i in columnsMetadata) {
    	var cellName = columnsMetadata[i].id;
    	var cellNameWithIdx = cellName.substr(0, getNameWoIndexLength(cellName)) + '_' + rowIndex;
    	var displayFormat = columnsMetadata[i].displayFormat;
    	var value = formatTableValue(displayFormat, sessionStorage[cellNameWithIdx]);
    	var type = columnsMetadata[i].type !== undefined && columnsMetadata[i].type !== null && columnsMetadata[i].type.length > 0 ? columnsMetadata[i].type : 'read only';
    	
    	var cell;
    	if (row.cells.length == 0) {
            cell = document.createElement('td');
            row.appendChild(cell);
        } else {
            cell = row.insertCell(-1);
        }
    	cell.innerHTML = generateHtmlValue(cellNameWithIdx, value, displayFormat, type);
    	$(cell).enhanceWithin();
    }
}

/**
 * Insert rows to table according to sessionStorage.
 */
function populateTable(tableOutputBody, isInit) {
	if (tableOutputBody == null) {
		return;
	}
	
	if (!isInit) {
		document.getElementById("tableOutput").style.display = 'block';
	}
	
	var columnsMetadata = getTableColumnsMetadata();
	if (columnsMetadata == null) {
		return;
	}
	
	clearAllTableRows();
	
	var firstIndex = getTableOrListStart('tableOutputHead');
	var lastIndex = getHighestIndex(columnsMetadata[0].id);
	for (var i = firstIndex; i <= lastIndex; i++) {
		populateTableRow(tableOutputBody, columnsMetadata, i);
	}
	
	var tableFilter = document.getElementById('tableFilter');
	if (tableFilter !== null) {
		tableFilter.style.width = document.getElementById("tableOutputHead").offsetWidth + 'px';
	}
}

function clearAllTableRows() {
	if (tableOutputBody == null) {
		return;
	}
	
	while(tableOutputBody.rows.length > 0) {
		tableOutputBody.deleteRow(0);
	}
}

/****************************
 *** onLoad *****************
 ****************************/

function filterTable(event) {
	var trs = document.getElementById("tableOutputBody").getElementsByTagName("tr");
	for (var i = 0; i < trs.length; i++) {
		var isMatch = false;
		var tds = trs[i].childNodes;
		for (var j = 0; j < tds.length; j++) {
			if (tds[j].innerText.toUpperCase().indexOf(event.currentTarget.value.toUpperCase()) !== -1) {
				isMatch = true;
				break;
			}
		}
		trs[i].style.display = isMatch ? "" : "none";
	}
}

function initTableFilter() {
	$('#tableFilter').change(filterTable);
	$('#tableFilter').on('input', filterTable);
}

function addTableClickListener() {
	$('#tableOutput').on('click','td', function(e) {
		if ($(e.currentTarget).find('input').length > 0) { 	// no clickListener if cell (column) has an input
        	return;
		}
		
		var row = e.currentTarget.parentElement.rowIndex - 1;	//first row is the table header
		var col = e.currentTarget.cellIndex;
		
		var rowCells = [];
		var domCells = e.currentTarget.parentElement.cells;
		for (var i = 0; i < domCells.length; i++) {
			rowCells.push(domCells[i].innerText);
		}
		
		executeTableOnClickHandlers(row, col, rowCells);
	});
}

var Utils = function() {
	
	return {
		split: function(text, delimiter) {
			return text.replace(new RegExp(delimiter + '+$'), "").replace(new RegExp('^' + delimiter + '+'), "").split(':');
		}
	};
}();


function isEmpty(str) {
    return (!str || 0 === str.length);
}

function isArray(o) {
    if (o == undefined) return false;
    return Object.prototype.toString.call(o) === '[object Array]';
}

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function isString(object) {
	return Object.prototype.toString.call(object) === "[object String]";
}

function setValues(obj, key, value) {
    if (!obj) return;
    if (obj instanceof Array) {
        for (var i in obj) {
            setValues(obj[i], key, value);
        }
        return;
    }

    if (obj[key]) obj[key] = value;

    if ((typeof obj == "object") && (obj !== null)) {
        var children = Object.keys(obj);
        if (children.length > 0) {
            for (i = 0; i < children.length; i++) {
                setValues(obj[children[i]], key, value);
            }
        }
    }
}

function findValues(obj, key) {
    return findValuesHelper(obj, key, []);
}

function findValuesHelper(obj, key, list) {
    if (!obj) return list;
    if (obj instanceof Array) {
        for (var i in obj) {
            list = list.concat(findValuesHelper(obj[i], key, []));
        }
        return list;
    }
    if (obj[key]) list.push(obj[key]);

    if ((typeof obj == "object") && (obj !== null)) {
        var children = Object.keys(obj);
        if (children.length > 0) {
            for (i = 0; i < children.length; i++) {
                list = list.concat(findValuesHelper(obj[children[i]], key, []));
            }
        }
    }
    return list;
}

//if the value does not exist return empty string
//trim the white spaces from the value. trim
function cleanValue(val) {
	switch (typeof val) {
	case "string":
		return val.trim();
	case "boolean":
	case "number":
		return val;
	default:
		return "";
	}
}

function getNameWoIndexLength(fieldName) {
	var pos = fieldName.lastIndexOf('_');
	return  pos !== -1 && /^\d+$/.test(fieldName.substr(pos + 1)) ?
			pos : 
			fieldName.length;
}

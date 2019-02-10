/*** Parameter converters ***/
function convert_B0_USERID_0(value) {
    return value;
}
function convert_B0_PASSWORD_0(value) {
    return value;
}
/*** End of parameter converters ***/

$(function(){
    $("#B0_PASSWORD_0").keyup(function(){
      $(this).val( $(this).val().toUpperCase() );
    });    
})
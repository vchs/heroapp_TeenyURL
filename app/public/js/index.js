$('#expire_at').datetimepicker({minDate: 0});

$(document).ready(function(){
    $('#short_url').text(window.location.href + "KEY").attr("href", window.location.href);

    var flashVersion = swfobject.getFlashPlayerVersion();
    if (flashVersion.major >= 10) {
        var clip = new ZeroClipboard( $('#copy_button'), { moviePath: "js/ZeroClipboard.swf" } );
        clip.on( 'complete', function(client, args) {
            $('#alert_success').css("display", "block").text("Copy successfully!");
            $('#alert_success').delay(2 * 1000).fadeOut();
        } );
        $('#copy_button').attr("data-clipboard-text", window.location.href);
     } else {
        $('#copy_button').css("display", "none");
     }
});

$('#url_submit').click(function(){
    var dataObject = {
        originalUrl: $('#original_url').val()
    };
    var expireAtStr = $('#expire_at').val();
    if (expireAtStr) {
        dataObject.expireAt = new Date(expireAtStr).toISOString();
    }
    
    $.post("api/create", dataObject, function(data, status){
            if(data.result == "OK"){
                var shortUrl = window.location.href + data.key;
                $('#short_url').text(shortUrl).attr("href", shortUrl);
                $('#copy_button').attr("data-clipboard-text", shortUrl);
                $('#alert_error').css("display", "none");
            }else{
                $('#alert_error').css("display", "block").text(data.message);
            }
        }
    );
    return false;
});

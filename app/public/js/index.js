$('#expire_at').datetimepicker({minDate: 0});

$(document).ready(function(){
    var clip = new ZeroClipboard( $('#copy_button'), { moviePath: "js/ZeroClipboard.swf" } );

    clip.on( 'complete', function(client, args) {
        $('#alert_success').css("display", "block").text("Copy successfully!");
        $('#alert_success').delay(2 * 1000).fadeOut();
    } );

    $('#tiny_url').text(window.location.href + "KEY").attr("href", window.location.href);
    $('#copy_button').attr("data-clipboard-text", window.location.href);
});

$('#url_submit').click(function(){
    // TODO data validation
    var dataObject = {
        originalUrl: $('#original_url').val()
    };
    var expireAtStr = $('#expire_at').val();
    if (expireAtStr) {
        dataObject.expireAt = new Date(expireAtStr).toISOString();
    }
    
    $.post("api/create", dataObject, function(data, status){
            if(data.result == "OK"){
                var tinyUrl = window.location.href + data.key;
                $('#tiny_url').text(tinyUrl).attr("href", tinyUrl);
                $('#copy_button').attr("data-clipboard-text",tinyUrl);
            }else{
                $('#alert_error').css("display", "block").text(data.message);
            }
        }
    );
    return false;
});
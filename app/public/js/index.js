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
    $.post("api/create",
        {
            originalUrl: $('#original_url').val(),   // js validation
            expireAt: $('#expire_at').val()
        },
        function(data, status){
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
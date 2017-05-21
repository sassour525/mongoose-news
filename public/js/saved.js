$(document).ready(function() {
    $('.add-note-button').on('click', function() {
        var thisId = $(this).attr("data-value");
        $('.modal-title').text('Notes for article: ' + thisId);

        $.ajax({
            method: 'GET',
            url: '/articles/' + thisId
        }).done(function(data) {
            console.log(data);
        });

        $('#save-note-button').on('click', function(){
            $.ajax({
                method: 'POST',
                url: '/articles/' + thisId,
                data: {
                    body: $('#note-body').val()
                }
            }).done(function(data) {
                console.log(data);
                // $('#note-body').text('');
            });
        });
    });
});
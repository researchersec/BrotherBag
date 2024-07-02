$(document).ready(function() {
    $('#uploadForm').submit(function(e) {
        e.preventDefault();
        
        var formData = new FormData($(this)[0]);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                console.log('File uploaded successfully:', data);
                // Handle success (e.g., update the UI with the uploaded data)
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error uploading file:', jqXHR, textStatus, errorThrown);
                alert('Error uploading file: ' + errorThrown);
            }
        });
    });
});

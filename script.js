$(document).ready(function() {
    $('#upload-btn').on('click', function() {
        var fileInput = document.getElementById('lua-file-input');
        var file = fileInput.files[0];

        if (!file) {
            $('#upload-status').text('Please select a file.');
            return;
        }

        var formData = new FormData();
        formData.append('luaFile', file);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $('#upload-status').text('File uploaded successfully.');
            },
            error: function(err) {
                $('#upload-status').text('Error uploading file.');
                console.error('Error uploading file:', err);
            }
        });
    });
});

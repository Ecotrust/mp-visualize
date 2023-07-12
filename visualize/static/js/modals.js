document.getElementById('generic-password-form').addEventListener('keypress',function(event) {
    if(event.code === 'Enter') {
        app.viewModel.password.layer().requestProtectedLayerToken();
    }
});
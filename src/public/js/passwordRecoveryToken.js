document.querySelector('.form-container form').addEventListener('submit', function(event){
    event.preventDefault();

    const formData = new FormData(event.target);
    const urlParts = window.location.href.split('/');
    const token = urlParts[urlParts.length - 1];
    const jsonData = {
        token,
        newPassword: formData.get('newPassword'),
    };

    fetch('/api/recover',{
        method: 'PUT',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
        .then(response => {
            if(response.ok){
                window.location.href = '/passwordRecoverySuccess.html';
            } else {
                alert('Failed to change password');
            }
        })
        .catch(error => {
            console.error(error);
        });
})
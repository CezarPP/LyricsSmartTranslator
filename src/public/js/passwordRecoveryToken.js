document.querySelector('.form-container form').addEventListener('submit', function(event){
    event.preventDefault();

    const formData = new FormData(event.target);
    const urlParts = window.location.href.split('/');
    const token = urlParts[urlParts.length - 1];
    const jsonData = {
        token,
        newPassword: formData.get('newPassword'),
    };
    const loader = document.getElementById('preloader');
    loader.style.display = 'flex';

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
                return response.json();
            }
        })
        .then(data =>{
            loader.style.display = 'none';
            alert('Failed to change password: ' + data.message);
        })
        .catch(error => {
            console.error(error);
        });
})
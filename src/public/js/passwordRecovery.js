document.querySelector('.form-container form').addEventListener('submit', function(event){
   event.preventDefault();

   const formData = new FormData(event.target);
   const jsonData = {
       email: formData.get('email')
   };

   const loader = document.getElementById('preloader');
   loader.style.display = 'flex';
   fetch('/api/recover', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify(jsonData)
   })
       .then(response => {
           if(response.ok){
                window.location.href = "/passwordRecoveryRequest.html";
           }
           else{
               return response.json();
           }
       })
       .then(data => {
           loader.style.display = 'none';
           alert('Failed to make password recovery request: ' + data.message);
       })
       .catch(error => {
           console.error(error);
       });
});

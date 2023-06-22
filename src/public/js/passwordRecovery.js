document.querySelector('.form-container form').addEventListener('submit', function(event){
   event.preventDefault();

   const formData = new FormData(event.target);
   const jsonData = {
       email: formData.get('email')
   };

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
               alert('Failed to send recover password request');
           }
       })
       .catch(error => {
           console.error(error);
       });
});

async function getRecoveryRequests() {
    return await fetch('/api/recover', { method: 'GET' })
        .then(response => {
            console.log("Got response");
            if (!response.ok)
                throw new Error("Failed to load recovery requests");
            return response.json();
        })
        .catch(error => {
            console.error("Error: " + error);
            alert('Error getting recovery requests' + error);
        });
}

async function addRecoveryRequest(requestId, requestEmail, requestLink) {
    const container = document.getElementById('container');

    const recoveryRequest = document.createElement('div');
    recoveryRequest.className = 'annotation';

    const title = document.createElement('h2');
    title.textContent = "Recovery request";
    title.style.color = "black";

    recoveryRequest.appendChild(title);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';

    const emailAddressDiv = document.createElement('div');
    emailAddressDiv.className = 'annotated-text';

    const emailAddressHeader = document.createElement('p');
    emailAddressHeader.textContent = "Email address:";
    emailAddressDiv.appendChild(emailAddressHeader);

    const emailAddress = document.createElement('p');
    emailAddress.textContent = requestEmail;
    emailAddressDiv.appendChild(emailAddress);

    contentDiv.appendChild(emailAddressDiv);

    const recoveryLinkDiv = document.createElement('div');
    recoveryLinkDiv.className = 'annotation-text';

    const recoveryLinkHeader = document.createElement('p');
    recoveryLinkHeader.textContent = "Recovery link:";
    recoveryLinkDiv.appendChild(recoveryLinkHeader);

    const recoveryLink = document.createElement('p');
    recoveryLink.textContent = requestLink;
    recoveryLinkDiv.appendChild(recoveryLink);

    contentDiv.appendChild(recoveryLinkDiv);

    recoveryRequest.appendChild(contentDiv);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const sentButton = document.createElement('button');
    sentButton.className = 'accept';
    sentButton.style.display = 'none';
    buttons.appendChild(sentButton);

    const rejectButton = document.createElement('button');
    rejectButton.className = 'reject';
    rejectButton.textContent = 'Reject';
    rejectButton.onclick = function () {
        if (confirm('Are you sure that you want to reject this recovery request?')) {
            fetch(`/api/recover/${requestId}`, { method: 'DELETE' })
                .then(() => {
                    window.location.reload();
                })
                .catch(error => {
                    console.log("Error rejecting recovery request: " + error);
                });
        }
    };
    buttons.appendChild(rejectButton);

    recoveryRequest.appendChild(buttons);

    container.appendChild(recoveryRequest);
}

async function loadContent() {
    const data = await getRecoveryRequests();
    const id = [];
    const email = [];
    const link = [];

    data.forEach(recoveryRequest => {
        id.push(recoveryRequest.id);
        email.push(recoveryRequest.email);
        link.push('https://www.lyricssmarttranslator.com/api/recover/' + recoveryRequest.token);
    });

    for (let i = 0; i < email.length; i++) {
        await addRecoveryRequest(id[i], email[i], link[i]);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadContent();
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'none';
});

const showMoreButtonCommunity = document.querySelector('#community-container .show-more-button');
const communityList = document.querySelector('#community-container .community-list');

const users = []
const contrib = []

const getUsersData = async () => {
    await fetch('/api/stats/users', {method: 'GET'})
        .then(response => response.json())
        .then(data => {
            data.forEach(user => {
                users.push(user.username);
                contrib.push(user.password);
            });

        })
        .catch(err => console.log('Error getting most active users ' + err));
}
const addMoreCommunity = () => {
    for (let i = 1; i <= 4; i++) {
        const newItem = document.createElement('li');
        const index = communityList.children.length + 1;
        const user = users[index - 1];
        if (user === undefined) {
            showMoreButtonCommunity.style.display = "none";
            break;
        }
        newItem.innerHTML = `
      <span class="community-number">${index}</span>
      <span class="community-name"><a href="/profile/${users[index - 1]}" style="color:black">${users[index - 1]}</a></span>
      <span class="community-activity">${contrib[index - 1]}</span>
    `;
        communityList.appendChild(newItem);
        if (communityList.children.length > 20)
            showMoreButtonCommunity.style.display = "none";
    }
};

const addMoreFirstTime = async () => {
    await getUsersData();
    await addMoreCommunity();
}

showMoreButtonCommunity.addEventListener('click', addMoreCommunity);
addMoreFirstTime().then(() => console.log(users));
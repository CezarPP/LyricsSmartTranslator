const showMoreButtonCommunity = document.querySelector('#community-container .show-more-button');
const communityList = document.querySelector('#community-container .community-list');

const addMoreCommunity = () => {
    for (let i = 1; i <= 4; i++) {
        const newItem = document.createElement('li');
        newItem.innerHTML = `
      <span class="community-number">${communityList.children.length + 1}</span>
      <span class="community-name">John John ${communityList.children.length + 1}</span>
      <span class="community-activity">10${communityList.children.length + 1}</span>
    `;
        communityList.appendChild(newItem);
        if(communityList.children.length > 20)
            showMoreButtonCommunity.style.display = "none";
    }
};

showMoreButtonCommunity.addEventListener('click', addMoreCommunity);

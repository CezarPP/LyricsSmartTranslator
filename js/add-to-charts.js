const showMoreButton = document.querySelector('.charts-container .show-more-button');
const chartsList = document.querySelector('.charts-container .charts-list');

const addMoreItems = () => {
    for (let i = 1; i <= 5; i++) {
        const newItem = document.createElement('li');
        newItem.innerHTML = `
      <span class="song-number">${chartsList.children.length + 1}</span>
      <span class="song-title">Song Title ${chartsList.children.length + 1}</span>
      <span class="song-author">Author ${chartsList.children.length + 1}</span>
    `;
        chartsList.appendChild(newItem);
        if(chartsList.children.length > 20)
            showMoreButton.style.display = "none";
    }
};

showMoreButton.addEventListener('click', addMoreItems);

function autocomplete(input, possibilities){

    let focus;

    input.addEventListener("input", function(e){
        let addList, addItem;
        let value = this.value;


        closeList();
        if(!value){ return false; }

        focus = -1;
        addList = document.createElement("div");
        addList.setAttribute("id", this.id + "autocomplete-list");
        addList.setAttribute("class", "autocomplete-items");

        this.parentNode.appendChild(addList);

        for(let i = 0; i<possibilities.length; i++){
            if(possibilities[i].toUpperCase().startsWith(value.toUpperCase())) {
                addItem = document.createElement("div");
                addItem.innerHTML = possibilities[i];
                addItem.innerHTML += "<input type='hidden' value='" + possibilities[i] + "'>";
                addItem.addEventListener("click", function () {
                    input.value = this.getElementsByTagName("input")[0].value;
                    closeList();
                });
                addList.appendChild(addItem);
            }
        }
    });

    input.addEventListener("keydown", function(e){
        let element = document.getElementById(this.id + "autocomplete-list");
        if (element) element = element.getElementsByTagName("div");
        if(e.keyCode === 40) {
            focus++;
            addActive(element);
        }else if(e.keyCode === 38){
            focus--;
            addActive(element);
        } else if (e.keyCode === 13){
            e.preventDefault();
            if(focus > -1){
                if(element) element[focus].click();
            }
        }
    });

    function addActive(element) {
        if (!element) return false;
        removeActive(element);
        if (focus >= element.length) focus = 0;
        if (focus < 0) focus = element.length - 1;
        element[focus].classList.add("autocomplete-active");

        const listRect = element[0].parentNode.getBoundingClientRect();
        const itemRect = element[focus].getBoundingClientRect();
        if (itemRect.bottom > listRect.bottom) {
            element[0].parentNode.scrollTop += itemRect.bottom - listRect.bottom;
        } else if (itemRect.top < listRect.top) {
            element[0].parentNode.scrollTop -= listRect.top - itemRect.top;
        }
    }

    function removeActive(element){
        for(let i = 0; i < element.length; i++){
            element[i].classList.remove("autocomplete-active");
        }
    }
    function closeList(element){
        let list = document.getElementsByClassName("autocomplete-items");
        for(let i = 0; i < list.length; i++){
            if(element != list[i] && element != input){
                list[i].parentNode.removeChild(list[i]);
            }
        }
    }

    document.addEventListener("click", function(e){
        closeList(e.target);
    });
}

function getAllSongs() {
    return new Promise((resolve, reject) => {
        fetch('/api/song', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status === 401) {
                    console.log("Unauthorized");
                }
                return response.json();
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                console.error('Error in getAllSongs(): ', error);
                reject(error);
            });
    });
}

getAllSongs()
    .then(data => {
        const songTitles = data.map(song => song.title);
        autocomplete(document.getElementById("myInput"), songTitles);
    })
    .catch(error => {
        console.error('Error: ', error);
    });
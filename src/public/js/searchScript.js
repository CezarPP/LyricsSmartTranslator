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
        if(e.keyCode == 40) {
            focus++;
            addActive(element);
        }else if(e.keyCode == 38){
            focus--;
            addActive(element);
        } else if (e.keyCode == 13){
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

const songs = ["Stairway to Heaven", "Bohemian Rhapsody", "Hotel California", "Imagine", "Born to Run", "Thunder Road", "Purple Haze", "Layla", "God Save the Queen", "Like a Rolling Stone", "Smells Like Teen Spirit", "Good Vibrations", "Johnny B. Goode", "Hey Jude", "Billie Jean", "Purple Rain", "Respect", "Yesterday", "London Calling", "I Want to Hold Your Hand", "My Generation", "Superstition", "Bridge Over Troubled Water", "Let It Be", "Maybellene", "Every Breath You Take", "When Doves Cry", "Voodoo Child", "Another Brick in the Wall", "Whole Lotta Love", "When a Man Loves a Woman", "Everyday People", "Summertime Blues", "Boogie Woogie Bugle Boy", "All Along the Watchtower", "Sweet Home Alabama", "Kashmir", "Brown Eyed Girl", "Blowin in the Wind", "I Got You (I Feel Good)", "Dancing in the Street", "California Dreamin", "Respect Yourself", "Walk on By", "Stand by Me", "Dancing Queen", "I Will Survive", "The Twist", "The Weight", "Suspicious Minds", "Light My Fire", "Mississippi Goddam", "Soul Man", "My Girl", "A Change Is Gonna Come", "Born in the U.S.A.", "Good Times", "Jailhouse"]
autocomplete(document.getElementById("myInput"), songs);
const token = localStorage.getItem("token");

async function getWorks(filter) {
    document.querySelector(".gallery").innerHTML = '';
    document.querySelector(".gallery-modal").innerHTML = '';

    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();

        const worksToDisplay = filter
            ? json.filter((data) => data.categoryId === filter)
            : json;

        for (let i = 0; i < worksToDisplay.length; i++) {
            setFigure(worksToDisplay[i]);
        }

    } catch (error) {
        console.error(error.message);
    }
}
getWorks();

function setFigure(data) {
    // Galerie principale
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.title}">
        <figcaption>${data.title}</figcaption>
    `;
    document.querySelector(".gallery").append(figure);

    // Galerie modale
    const figureModal = document.createElement("figure");
    figureModal.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.title}">
        <figcaption>${data.title}</figcaption>
        <i data-id="${data.id}" class="fa-solid fa-trash-can delete-icon"></i>
    `;
    document.querySelector(".gallery-modal").append(figureModal);

    const trashIcon = figureModal.querySelector(".fa-trash-can");
    trashIcon.addEventListener("click", deleteWork);
}

async function getCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        for (let i = 0; i < json.length; i++) {
            setFilter(json[i]);
        }
    } catch (error) {
        console.error(error.message);
    }
}
getCategories();

function setFilter(data) {
    const div = document.createElement("div");
    div.className = data.id;
    div.innerHTML = `${data.name}`;
    div.addEventListener("click", () => getWorks(data.id));
    document.querySelector(".div-container").append(div);
}

document.querySelector(".tous").addEventListener("click", () => getWorks());

function displayAdminMode() {
    const token = sessionStorage.getItem("authToken");
    if (token) {
        const editBanner = document.createElement('div');
        editBanner.className = 'edit';
        editBanner.innerHTML =
            '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> Mode édition</a></p>';
        document.body.prepend(editBanner);

        const login = document.querySelector(".login");
        login.textContent = 'logout';
    }
}
displayAdminMode();

// Modale
let modal = null;
const focusableSelector = 'button, a, input, textarea';
let focusables = [];

const openModal = function (e) {
    e.preventDefault();
    modal = document.querySelector(e.target.getAttribute("href"));
    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    modal.style.display = 'flex';
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");

    const closeBtns = document.querySelectorAll('.js-modal-close');
closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

const stopBtn = document.querySelector('.js-modal-stop');
if (stopBtn) {
    stopBtn.addEventListener('click', stopPropagation);
}
};

const closeModal = function (e) {
    if (modal === null) return;
    e.preventDefault();
    modal.style.display = 'none';
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
};

const stopPropagation = function (e) {
    e.stopPropagation();
};

const focusInModal = function (e) {
    e.preventDefault();
    let index = focusables.findIndex(f => f === document.querySelector(':focus'));
    console.log(index);
};

window.addEventListener('keydown', function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
    if (e.key === 'Tab' && modal !== null && modal.style.display !== 'none') {
        focusInModal(e);
    }
});

document.querySelectorAll(".js-modal").forEach((a) => {
    a.addEventListener("click", openModal);
});

// DELETE
async function deleteWork(event) {
    const id = event.target.getAttribute("data-id");
    const deleteApi = "http://localhost:5678/api/works/";
    const token = sessionStorage.authToken;

    try {
        let response = await fetch(`${deleteApi}${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
            }
        });

        if (!response.ok) {
            const errorBox = document.createElement('div');
            errorBox.className = "error login";
            errorBox.innerHTML = "Une erreur est survenue lors de la suppression.";
            document.querySelector(".modal-button-container").prepend(errorBox);
        } else {
            getWorks(); // Recharger les œuvres après suppression
        }
    } catch (error) {
        console.error("Erreur lors de la requête DELETE :", error);
    }
}

// Toggle function
const addPhotoButton = document.querySelector(".add-photo-button")
addPhotoButton.addEventListener("click", toggleModal) // au click tu vas appeler la function toggleModal
const backButton = document.querySelector(".js-modal-back");
backButton.addEventListener("click",toggleModal);

function toggleModal() {
    const Modalgallery  = document.querySelector(".modal-gallery"); // 1er page
    const addModal = document.querySelector(".add-modal"); // 2ème page ajout photo

    const modalDisplay = window.getComputedStyle(Modalgallery).display;

    if (modalDisplay === "block") { // gallerie visible on affiche block
        Modalgallery.style.display = "none"; //on cache la gallerie
        addModal.style.display = "block"; // affiche form pour ajouter une photo
        
    } else { // si la gallerie n'est pas visible
        Modalgallery.style.display = "block"; // on montre la gallerie
        addModal.style.display = "none"; // on cache le formulaire d'ajout
    }
}

//Add photo input

document.querySelector('#file').style.display = "none";
document.getElementById('file').addEventListener("change", function(event){
const file = event.target.files[0];
  
    if (!file || !['image/jpeg', 'image/png'].includes(file.type) || file.size > 4e6) {
      alert("Image invalide (jpg/png, max 4 Mo)");
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt ="Uploaded Photo";
  
        const container = document.getElementById('photo-container');
        container.innerHTML = ''; // Vide l'ancien contenu s'il existe
        container.appendChild(img);
        document.querySelectorAll('.picture-loaded').forEach((e => e.style.display = "none"));
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Handle picture submit


const titleInput = document.getElementById('title');
let titleValue = '';

let selectValue = "objet" ;

document.getElementById("category"). addEventListener ('change', function (){
  selectValue = this.value;
  console.log('Catégorie sélectionné', selectValue);
});


titleInput.addEventListener('input', function() {
  titleValue = titleInput.value;
  console.log("Titre actuel:",titleValue); // Affiche la valeur actuelle pendant la saisie
});

  document
  .getElementById('picture-form')
  .addEventListener('submit', handleSubmit);

  async function handleSubmit(event) {
  event.preventDefault();

  const fileInput = document.querySelector('#image'); // input type="file"
  const imageFile = fileInput.files[0];
  const titleValue = document.querySelector('#title').value;
  const selectValue = document.querySelector('#category').value;

  // Vérification des champs
  if (!imageFile || !titleValue || !selectValue) {
    const errorBox = document.createElement("div");
    errorBox.className = "error-login";
    errorBox.innerHTML = "Veuillez remplir tous les champs";
    document.querySelector("form").prepend(errorBox);
    return;
  }

  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("title", titleValue);
  formData.append("category", selectValue);

  const token = sessionStorage.getItem("authToken");

  try {
    const response = await fetch('http://localhost:5678/api/works', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
        // PAS de Content-Type ici avec FormData
      },
      body: formData
    });

    if (!response.ok) {
      const errorBox = document.createElement("div");
      errorBox.className = "error-login";
      errorBox.innerHTML = "Une erreur est survenue lors de l'envoi.";
      document.querySelector("form").prepend(errorBox);
    } else {
      const result = await response.json();
      console.log("Image envoyée avec succès :", result);
      window.location.href = "./index.html";
    }

  } catch (error) {
    console.error("Erreur réseau :", error);
    const errorBox = document.createElement("div");
    errorBox.className = "error-login";
    errorBox.innerHTML = "Erreur de connexion au serveur.";
    document.querySelector("form").prepend(errorBox);
  }
}

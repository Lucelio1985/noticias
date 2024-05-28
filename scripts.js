document.addEventListener("DOMContentLoaded", function() {
    const loginButton = document.getElementById("loginButton");
    const loginModal = document.getElementById("loginModal");
    const closeButton = document.querySelector(".close-button");
    const submitLogin = document.getElementById("submitLogin");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const globalEditButton = document.getElementById("globalEditButton");
    const globalSaveButton = document.getElementById("globalSaveButton");

    const storedHashedPassword = "0192023a7bbd73250516f069df18b500";

    let quillEditors = [];

    function hashPassword(password) {
        return CryptoJS.MD5(password).toString();
    }

    function showEditableElements() {
        document.querySelectorAll(".editable-content, .banner").forEach(el => {
            el.contentEditable = true;
            el.style.border = "1px dashed #ccc";
        });
        addQuillEditors();
    }

    function hideEditableElements() {
        document.querySelectorAll(".editable-content, .banner").forEach(el => {
            el.contentEditable = false;
            el.style.border = "none";
        });
    }

    loginButton.addEventListener("click", function() {
        if (loginButton.textContent === "Logout") {
            hideEditableElements();
            document.body.classList.remove("logged-in");
            loginButton.textContent = "Login";
            window.location.reload();
        } else {
            loginModal.style.display = "block";
        }
    });

    closeButton.addEventListener("click", function() {
        loginModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    });

    submitLogin.addEventListener("click", function() {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === "administrador" && hashPassword(password) === storedHashedPassword) {
            document.body.classList.add("logged-in");
            loginButton.textContent = "Logout";
            loginModal.style.display = "none";
            alert("Login bem-sucedido!");
            showEditableElements();
            addBannerControls();
        } else {
            alert("Usuário ou senha incorretos.");
        }
    });

    globalEditButton.addEventListener("click", function() {
        showEditableElements();
    });

    globalSaveButton.addEventListener("click", function() {
        quillEditors.forEach(editor => {
            const contentHtml = editor.root.innerHTML;
            const editorId = editor.container.id;
            localStorage.setItem(editorId + "-content", contentHtml);
        });

        document.querySelectorAll(".banner").forEach((banner, index) => {
            const content = banner.innerHTML;
            localStorage.setItem(`banner-${index}`, content);
        });

        alert("Conteúdo salvo!");
        hideEditableElements();
    });

    function addQuillEditors() {
        document.querySelectorAll(".editable-content").forEach(content => {
            const editorId = content.id;
            const quill = new Quill(`#${editorId}`, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'image']
                    ]
                }
            });

            const imageInput = document.createElement('input');
            imageInput.type = 'file';
            imageInput.style.display = 'none';
            document.body.appendChild(imageInput);

            quill.getModule('toolbar').addHandler('image', () => {
                imageInput.click();
            });

            imageInput.addEventListener('change', function() {
                const file = imageInput.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', e.target.result);
                };
                reader.readAsDataURL(file);
            });

            const savedContent = localStorage.getItem(editorId + "-content");
            if (savedContent) {
                quill.root.innerHTML = savedContent;
            }

            quillEditors.push(quill);
        });
    }

    document.querySelectorAll(".news-item").forEach(newsItem => {
        const editorId = newsItem.querySelector(".editable-content").id;
        const savedContent = localStorage.getItem(editorId + "-content");

        if (savedContent) {
            newsItem.querySelector(".editable-content").innerHTML = savedContent;
        }
    });

    const banners = document.querySelectorAll(".banner-container .banner");
    banners.forEach((banner, index) => {
        const savedBanner = localStorage.getItem(`banner-${index}`);
        if (savedBanner) {
            banner.innerHTML = savedBanner;
        }
    });

    function addBannerControls() {
        const banners = document.querySelectorAll(".banner-container .banner");
        banners.forEach((banner, index) => {
            const chooseFileButton = document.createElement("input");
            chooseFileButton.type = "file";
            chooseFileButton.classList.add("choose-file-btn");

            const saveBannerButton = document.createElement("button");
            saveBannerButton.textContent = "Salvar Banner";
            saveBannerButton.classList.add("save-banner-btn");

            const previewImage = document.createElement("img");
            previewImage.style.display = "none";
            banner.appendChild(previewImage);

            banner.appendChild(chooseFileButton);
            banner.appendChild(saveBannerButton);

            chooseFileButton.addEventListener("change", function() {
                const file = chooseFileButton.files[0];
                const reader = new FileReader();

                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = "block";
                };

                reader.readAsDataURL(file);
            });

            saveBannerButton.addEventListener("click", function() {
                const content = previewImage.src ? `<img src="${previewImage.src}" class="news-img">` : '';
                localStorage.setItem(`banner-${index}`, content);
                banner.innerHTML = content;
                alert("Banner salvo!");
            });

            if (document.body.classList.contains("logged-in")) {
                chooseFileButton.style.display = "inline-block";
                saveBannerButton.style.display = "inline-block";
            } else {
                chooseFileButton.style.display = "none";
                saveBannerButton.style.display = "none";
            }
        });
    }

    if (document.body.classList.contains("logged-in")) {
        showEditableElements();
        addBannerControls();
    } else {
        hideEditableElements();
        document.querySelectorAll(".choose-file-btn, .save-banner-btn").forEach(btn => {
            btn.style.display = "none";
        });
    }
});

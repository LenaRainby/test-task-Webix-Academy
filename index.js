[].forEach.call(document.getElementsByClassName('tags-input'), function (el) {
    const hiddenInput = document.createElement('input');
    const mainInput = document.createElement('input');
    const inputElem = document.createElement('input');
    const labelElem = document.createElement('label');
    let tags = [];

    inputElem.setAttribute('type', 'checkbox');
    labelElem.appendChild(inputElem);

    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', el.getAttribute('data-name'));

    mainInput.setAttribute('type', 'text');
    mainInput.setAttribute('placeholder', 'Add a tag');
    mainInput.classList.add('main-input');

    mainInput.addEventListener('keyup', function (e) {
        let enteredTags = mainInput.value.split(',');

        if (enteredTags.length > 1 || e.key === 'Enter') {
            enteredTags.forEach(function (ft) {
                let filteredTag = filterTag(ft);
                if (filteredTag.length > 0) addTag(filteredTag);
            });
            mainInput.value = '';
        }
    });

    mainInput.addEventListener('keydown', function (e) {
        let keyCode = e.which || e.keyCode;

        if (keyCode === 8 && mainInput.value.length === 0 && tags.length > 0) {
            const tagsFromLocalStorage = JSON.parse(
                localStorage.getItem('tags')
            );
            removeTag(tagsFromLocalStorage.length - 1);
        }
    });

    el.appendChild(mainInput);
    el.appendChild(hiddenInput);
    el.prepend(inputElem);

    addTag('javascript');

    function addTag(text) {
        let tag = {
            text: text,
            element: document.createElement('span'),
        };

        tag.element.classList.add('tag');
        tag.element.textContent = tag.text;

        let closeBtn = document.createElement('span');

        closeBtn.classList.add('close');
        closeBtn.addEventListener('click', function () {
            removeTag(tags.indexOf(tag));
        });

        tag.element.appendChild(closeBtn);

        tags.push(tag);
        el.insertBefore(tag.element, mainInput);

        localStorage.setItem('tags', JSON.stringify(tags));

        refreshTags();
        showTags();
    }

    function removeTag(index) {
        if (!inputElem.checked) {
            let tag = tags[index];
            tags.splice(index, 1);
            el.removeChild(tag.element);

            localStorage.setItem('tags', JSON.stringify(tags));
            showTags();
            refreshTags();
        }
    }

    function refreshTags() {
        let tagsList = [];
        tags.forEach(function (tg) {
            tagsList.push(tg.text);
        });
        hiddenInput.value = tagsList.join(',');
    }

    function filterTag(tag) {
        return tag.replace(/[^\w -]/g, '').trim().replace(/\W+/g, '-');
    }

    function showTags() {
        const tagsInfo = document.querySelector('.hidden-tags-info');
        const tagsFromLocalStorage = JSON.parse(localStorage.getItem('tags'));

        tagsInfo.classList.add('shown');
        tagsInfo.innerText = '';

        for (let tag of tagsFromLocalStorage) {
            let listTag = document.createElement('div');
            listTag.innerText = tag.text;
            tagsInfo.appendChild(listTag);
        }
    }

    showTags();

    function uploadNewTags() {
        const uploadTagsBtn = document.querySelector('.new-tags-list');

        uploadTagsBtn.addEventListener('click', function () {
            fetch('https://api.github.com/users')
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    if (!inputElem.checked) {
                        const tagsArr = [];
                        for (let user of data) {
                            tagsArr.push(user.login);
                        }

                        for (let tag of tagsArr) {
                            addTag(tag);
                        }
                    }
                });
        });
    }

    uploadNewTags();

    function clearAllTags() {
        const clearTagsBtn = document.querySelector('.clear-tags');

        clearTagsBtn.addEventListener('click', function () {
            if (!inputElem.checked) {
                document.querySelectorAll('.tag').forEach((e) => e.remove());
                tags = [];
            }

            localStorage.clear();
            showTags();
        });
    }

    clearAllTags();

    function setReadOnly() {
        inputElem.addEventListener('click', function () {
            if (inputElem.checked) {
                mainInput.setAttribute('readonly', 'readonly');
            } else {
                inputElem.checked = '';
                mainInput.removeAttribute('readonly');
            }
        });
    }

    setReadOnly();
});

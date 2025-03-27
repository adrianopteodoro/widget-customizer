document.addEventListener("DOMContentLoaded", function () {
    const extraLanguageJson = urlParams.get("extraLanguageJson"); // Get extra language JSON URL from query string

    // Fetch both base and extra language JSON concurrently
    const fetchLanguages = Promise.all([
        fetch('languages.json').then(res => res.json()),
        extraLanguageJson ? fetch(extraLanguageJson).then(res => res.json()).catch(() => ({})) : Promise.resolve({})
    ]);

    fetchLanguages
        .then(([baseResources, extraResources]) => {
            console.log("Base Language Resources:", baseResources);
            console.log("Extra Language Resources:", extraResources);

            const mergedResources = mergeLanguageResources(baseResources, extraResources);
            console.log("Merged Language Resources:", mergedResources);

            initializeI18Next(mergedResources);
        })
        .catch(error => console.error('Error loading language resources:', error));
});

function mergeLanguageResources(baseResources, extraResources) {
    return Object.keys({ ...baseResources, ...extraResources }).reduce((acc, lang) => {
        acc[lang] = { ...baseResources[lang], ...(extraResources[lang] || {}) };
        return acc;
    }, {});
}

function initializeI18Next(mergedResources) {
    i18next.use(i18nextBrowserLanguageDetector).init(
        {
            supportedLngs: Object.keys(mergedResources),
            fallbackLng: 'en',
            detection: {
                order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
                caches: ['localStorage', 'cookie'],
            },
            resources: Object.fromEntries(
                Object.entries(mergedResources).map(([lang, resources]) => [lang, { translation: resources }])
            ),
        },
        function (err, t) {
            if (err) {
                console.error('Error initializing i18next:', err);
            } else {
                PopulateLanguageDropdown(mergedResources);
                InitializeLanguageDropdown();
                UpdateContent();
            }
        }
    );
}

function PopulateLanguageDropdown(resources) {
    const languageDropdown = document.getElementById("language-dropdown");
    Object.keys(resources).forEach(lang => {
        const option = document.createElement("option");
        option.value = lang;
        option.textContent = i18next.getFixedT(lang)("language_label") || lang.toUpperCase();
        languageDropdown.appendChild(option);
    });
}

function UpdateContent() {
    UpdateTextContent();
}

function ChangeLanguage() {
    const selectedLanguage = document.getElementById("language-dropdown").value;
    i18next.changeLanguage(selectedLanguage, UpdateContent);
}

function InitializeLanguageDropdown() {
    const languageDropdown = document.getElementById("language-dropdown");
    const detectedLanguage = i18next.language || i18next.options.fallbackLng;

    languageDropdown.value = detectedLanguage;
    languageDropdown.addEventListener("change", ChangeLanguage);
}

function UpdateTextContent(key) {
    if (key) {
        return i18next.t(key);
    }

    const staticElements = [
        { id: "title", key: "title" },
        { id: "language-dropdown-label", key: "language_dropdown" },
        { id: "widget-url-label", key: "widget_url" },
        { id: "save-settings", key: "copy_url" },
        { id: "member-widgets-button", key: "member_widgets" },
        { id: "load-settings-title", key: "load_settings" },
        { id: "cancel-settings", key: "cancel" },
        { id: "load-settings", key: "load" },
        { id: "copied-to-clipboard", key: "copiedToClipboard" },
        { id: "click-to-copy-url", key: "clickToCopyURL" },
    ];

    staticElements.forEach(({ id, key }) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = i18next.t(key);
        }
    });

    const dynamicGroups = document.querySelectorAll('.setting-group');
    dynamicGroups.forEach(group => {
        const groupHeader = group.querySelector('h2');
        if (groupHeader) {
            const groupKey = groupHeader.getAttribute('data-key');
            if (groupKey) {
                groupHeader.textContent = i18next.t(groupKey);
            }
        }

        const settingItems = group.querySelectorAll('.setting-item');
        settingItems.forEach(item => {
            const label = item.querySelector('label');
            if (label) {
                const labelKey = label.getAttribute('data-key');
                if (labelKey) {
                    label.textContent = i18next.t(labelKey);
                }
            }

            const description = item.querySelector('p');
            if (description) {
                const descriptionKey = description.getAttribute('data-key');
                if (descriptionKey) {
                    description.textContent = i18next.t(descriptionKey);
                }
            }

            const selectOptions = item.querySelectorAll('select option');
            selectOptions.forEach(option => {
                const optionKey = option.getAttribute('data-key');
                if (optionKey) {
                    option.textContent = i18next.t(optionKey);
                }
            });
        });
    });
}

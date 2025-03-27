document.addEventListener("DOMContentLoaded", function () {
    const extraLanguageJson = urlParams.get("extraLanguageJson"); // Get extra language JSON URL from query string

    const fetchLanguages = extraLanguageJson
        ? Promise.all([fetch('languages.json').then(res => res.json()), fetch(extraLanguageJson).then(res => res.json())])
        : fetch('languages.json').then(res => res.json().then(resources => [resources, {}])); // Ensure extraResources is an empty object

    fetchLanguages
        .then(([baseResources, extraResources]) => {
            console.log("Base Language Resources:", baseResources); // Log base language resources
            console.log("Extra Language Resources:", extraResources); // Log extra language resources

            const mergedResources = { ...baseResources, ...extraResources }; // Merge base and extra language resources
            i18next.use(i18nextBrowserLanguageDetector).init(
                {
                    supportedLngs: Object.keys(mergedResources),
                    fallbackLng: 'en',
                    detection: {
                        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
                        caches: ['localStorage', 'cookie'],
                    },
                    resources: mergedResources,
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
        })
        .catch(error => console.error('Error loading language resources:', error));

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
        document.title = i18next.t("title");
        document.getElementById("title").innerText = i18next.t("title");
        document.getElementById("language-dropdown-label").innerText =
            i18next.t("language_dropdown");
        document.getElementById("widget-url-label").innerText =
            i18next.t("widget_url");
        document.getElementById("save-settings").innerText = i18next.t("copy_url");
        document.getElementById("member-widgets-button").innerText =
            i18next.t("member_widgets");
        document.getElementById("load-settings-title").innerText =
            i18next.t("load_settings");
        document.getElementById("cancel-settings").innerText = i18next.t("cancel");
        document.getElementById("load-settings").innerText = i18next.t("load");
    }

    function ChangeLanguage() {
        const selectedLanguage = document.getElementById("language-dropdown").value;
        i18next.changeLanguage(selectedLanguage, UpdateContent);
    }

    function InitializeLanguageDropdown() {
        const languageDropdown = document.getElementById("language-dropdown");
        const detectedLanguage = i18next.language || i18next.options.fallbackLng;

        // Set the dropdown value to the detected language
        languageDropdown.value = detectedLanguage;

        // Add an event listener to handle language changes
        languageDropdown.addEventListener("change", ChangeLanguage);
    }
});

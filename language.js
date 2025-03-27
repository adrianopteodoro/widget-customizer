document.addEventListener("DOMContentLoaded", function () {
    const extraLanguageJson = urlParams.get("extraLanguageJson"); // Get extra language JSON URL from query string

    // Fetch both base and extra language JSON concurrently
    const fetchLanguages = Promise.all([
        fetch('languages.json').then(res => res.json()),
        extraLanguageJson ? fetch(extraLanguageJson).then(res => res.json()).catch(() => ({})) : Promise.resolve({})
    ]);

    fetchLanguages
        .then(([baseResources, extraResources]) => {
            console.log("Base Language Resources:", baseResources); // Log base language resources
            console.log("Extra Language Resources:", extraResources); // Log extra language resources

            // Deep merge base and extra language resources
            const mergedResources = Object.keys(baseResources).reduce((acc, lang) => {
                acc[lang] = { ...baseResources[lang], ...(extraResources[lang] || {}) };
                return acc;
            }, {});
            console.log("Merged Language Resources:", mergedResources); // Log merged language resources

            // Initialize i18next with merged resources
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
        })
        .catch(error => console.error('Error loading language resources:', error));

    function PopulateLanguageDropdown(resources) {
        const languageDropdown = document.getElementById("language-dropdown");
        Object.keys(resources).forEach(lang => {
            const option = document.createElement("option");
            option.value = lang;
            option.textContent = i18next.getFixedT(lang)("language_label") || lang.toUpperCase(); // Use i18next to get language_label
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

        // Set the dropdown value to the detected language
        languageDropdown.value = detectedLanguage;

        // Add an event listener to handle language changes
        languageDropdown.addEventListener("change", ChangeLanguage);
    }
});

function UpdateTextContent(key) {
    if (key) {
        return i18next.t(key); // Return the translated text for the given key
    }

    // Update static text content on the page
    document.title = i18next.t("title");
    document.getElementById("title").innerText = i18next.t("title");
    document.getElementById("language-dropdown-label").innerText = i18next.t("language_dropdown");
    document.getElementById("widget-url-label").innerText = i18next.t("widget_url");
    document.getElementById("save-settings").innerText = i18next.t("copy_url");
    document.getElementById("member-widgets-button").innerText = i18next.t("member_widgets");
    document.getElementById("load-settings-title").innerText = i18next.t("load_settings");
    document.getElementById("cancel-settings").innerText = i18next.t("cancel");
    document.getElementById("load-settings").innerText = i18next.t("load");
    document.getElementById("copied-to-clipboard").innerText = i18next.t("copiedToClipboard");
    document.getElementById("click-to-copy-url").innerText = i18next.t("clickToCopyURL");
}

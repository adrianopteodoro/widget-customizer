i18next.use(LanguageDetector).init(
    {
        supportedLngs: ['de', 'en', 'fr'],
        lng: "en",
        resources: {
            en: {
                translation: {
                    language_dropdown: "Select Language:",
                    widget_url: "Widget URL",
                    copy_url: "Click to copy URL",
                    member_widgets: "💎 Member Exclusive Widgets",
                    load_settings: "Load Settings From Widget URL",
                    cancel: "Cancel",
                    load: "Load Settings",
                },
            },
            pt: {
                translation: {
                    language_dropdown: "Selecione o Idioma:",
                    widget_url: "URL do Widget",
                    copy_url: "Clique para copiar a URL",
                    member_widgets: "💎 Widgets Exclusivos para Membros",
                    load_settings: "Carregar Configurações do URL do Widget",
                    cancel: "Cancelar",
                    load: "Carregar Configurações",
                },
            },
        },
    },
    function (err, t) {
        UpdateContent();
    }
);

function UpdateContent() {
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

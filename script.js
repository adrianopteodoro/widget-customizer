const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const settingsJson = urlParams.get("settingsJson") || "";

document.addEventListener('DOMContentLoaded', () => {
  const settingsContent = document.getElementById('settings-content');
  const saveButton = document.getElementById('save-settings');

  fetch(settingsJson)
    .then(response => response.json())
    .then(data => {
      const groupedSettings = {};

      // Group settings by their 'group' property
      data.settings.forEach(setting => {
        if (!groupedSettings[setting.group]) {
          groupedSettings[setting.group] = [];
        }
        groupedSettings[setting.group].push(setting);
      });

      // Render settings for each group
      renderSettings(groupedSettings, settingsContent, data);
    })
    .catch(error => console.error('Error loading settings:', error));
});

function renderSettings(groupedSettings, settingsContent, data) {
  for (const groupName in groupedSettings) {
    const groupDiv = createGroupDiv(groupName, groupedSettings[groupName], data);
    settingsContent.appendChild(groupDiv);
  }
  SendDateToParent(data);
}

function createGroupDiv(groupName, settings, data) {
  const groupDiv = document.createElement('div');
  groupDiv.classList.add('setting-group');

  const groupHeader = document.createElement('h2');
  groupHeader.textContent = UpdateTextContent(groupName);
  groupHeader.setAttribute('data-key', groupName);
  groupDiv.appendChild(groupHeader);

  settings.forEach(setting => {
    const settingItem = createSettingItem(setting, data);
    groupDiv.appendChild(settingItem);
  });

  return groupDiv;
}

function createSettingItem(setting, data) {
  const settingItem = document.createElement('div');
  settingItem.classList.add('setting-item');

  const labelDescriptionDiv = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = UpdateTextContent(setting.label);
  label.setAttribute('data-key', setting.label);
  labelDescriptionDiv.appendChild(label);

  if (setting.description) {
    const description = document.createElement('p');
    description.textContent = UpdateTextContent(setting.description);
    description.setAttribute('data-key', setting.description);
    labelDescriptionDiv.appendChild(description);
  }

  const settingItemContent = document.createElement('div');
  settingItemContent.classList.add('setting-item-content');
  const inputElement = createInputElement(setting, data);
  settingItemContent.appendChild(inputElement);

  settingItem.appendChild(labelDescriptionDiv);
  settingItem.appendChild(settingItemContent);

  return settingItem;
}

function createInputElement(setting, data) {
  let inputElement;
  switch (setting.type) {
    case 'text':
    case 'color':
    case 'number':
      inputElement = document.createElement('input');
      inputElement.type = setting.type;
      inputElement.id = setting.id;
      inputElement.value = setting.defaultValue;
      if (setting.type === 'number') {
        inputElement.min = setting.min;
        inputElement.max = setting.max;
        inputElement.step = setting.step;
      }
      break;
    case 'checkbox':
      inputElement = createCheckboxElement(setting, data); // Pass `data` explicitly
      break;
    case 'select':
      inputElement = createSelectElement(setting, data); // Pass `data` explicitly
      break;
    default:
      inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.id = setting.id;
      inputElement.value = setting.defaultValue;
  }
  inputElement.addEventListener('input', () => SendDateToParent(data)); // Pass `data` explicitly
  return inputElement;
}

function createCheckboxElement(setting, data) {
  const labelDiv = document.createElement('label');
  labelDiv.classList.add('switch');

  const checkBoxElement = document.createElement('input');
  checkBoxElement.type = 'checkbox';
  checkBoxElement.id = setting.id;
  checkBoxElement.checked = setting.defaultValue;
  labelDiv.appendChild(checkBoxElement);

  const slider = document.createElement('span');
  slider.classList.add('slider', 'round');
  labelDiv.appendChild(slider);

  labelDiv.addEventListener('click', () => {
    checkBoxElement.checked = !checkBoxElement.checked;
    SendDateToParent(data); // Pass `data` explicitly to ensure it is in scope
  });

  return labelDiv;
}

function createSelectElement(setting, data) {
  const selectElement = document.createElement('select');
  selectElement.id = setting.id;
  setting.options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = UpdateTextContent(`${setting.id}${option.value}`);
    optionElement.setAttribute('data-key', `${setting.id}${option.value}`);
    if (option.value === setting.defaultValue) {
      optionElement.selected = true;
    }
    selectElement.appendChild(optionElement);
  });

  selectElement.addEventListener('change', () => SendDateToParent(data)); // Pass `data` explicitly
  return selectElement;
}

// In the iframe's JavaScript:
function SendDateToParent(data) {
  const settings = {};
  data.settings.forEach(setting => {
    let inputElement = document.getElementById(setting.id);

    if (setting.type === 'checkbox') {
      settings[setting.id] = inputElement.checked;
    } else {
      settings[setting.id] = inputElement.value;
    }
  });

  // Generate parameter string
  const paramString = Object.entries(settings)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  console.log('Parameter String:', paramString);

  let widgetURLBox = document.getElementById('widget-url');
  widgetURLBox.value = GetWidgetURL() + "?" + paramString;
  window.parent.reloadWidget(paramString);
}


let saveButton = document.getElementById('save-settings');
let widgetURLBox = document.getElementById('widget-url');
let cancelSettingsButton = document.getElementById('cancel-settings');

saveButton.addEventListener('click', () => {
  navigator.clipboard.writeText(widgetURLBox.value);

  const defaultBackgroundColor = "#2e2e2e";
  const defaultTextColor = "white";

  saveButton.innerText = UpdateTextContent("copiedToClipboard");
  saveButton.style.backgroundColor = "#00dd63"
  saveButton.style.color = "#ffffff";

  setTimeout(() => {
    saveButton.innerText = UpdateTextContent("clickToCopyURL");
    saveButton.style.backgroundColor = defaultBackgroundColor;
    saveButton.style.color = defaultTextColor;
  }, 3000);
});

widgetURLBox.addEventListener('click', () => {
  let loadSettingsBox = document.getElementById('mommy-milkers');
  loadSettingsBox.style.visibility = 'visible';
  loadSettingsBox.style.opacity = 1;
});

function CloseSettings() {
  let loadSettingsBox = document.getElementById('mommy-milkers');
  loadSettingsBox.style.visibility = 'hidden';
  loadSettingsBox.style.opacity = 0;
};

function LoadSettings() {
  let loadURLBox = document.getElementById('load-url');
  const url = new URL(loadURLBox.value);
  
  url.searchParams.forEach((value, key) => {

    const inputElement = document.getElementById(key);
    if (inputElement != null)
    {
      if (inputElement.type == 'checkbox')
        inputElement.checked = value.toLocaleLowerCase() == 'true';
      else
        inputElement.value = value;
    }
  });

  loadURLBox.value = '';

  let loadSettingsBox = document.getElementById('mommy-milkers');
  loadSettingsBox.style.visibility = 'hidden';
  loadSettingsBox.style.opacity = 0;
}

function GetWidgetURL() {
  const parsedUrl = new URL(settingsJson);

  let result = parsedUrl.origin; // Base domain (protocol + hostname + port)

  const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment); // Split and remove empty segments

  if (pathSegments.length > 0) {
    result += '/' + pathSegments[0]; // Add the first path segment
  }

  return result;
}

function OpenMembershipPage() {
    window.open("https://nutty.gg/supporters/sign_in", '_blank').focus();
}

// Call UpdateTextContent from language.js to update all text content
UpdateTextContent();
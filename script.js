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
      for (const groupName in groupedSettings) {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('setting-group');

        const groupHeader = document.createElement('h2');
        groupHeader.textContent = groupName;
        groupDiv.appendChild(groupHeader);

        groupedSettings[groupName].forEach(setting => {
          const settingItem = document.createElement('div');
          settingItem.classList.add('setting-item');

          const labelDescriptionDiv = document.createElement('div');

          const label = document.createElement('label');
          label.textContent = setting.label;
          labelDescriptionDiv.appendChild(label);

          if (setting.description)
          {
            const description = document.createElement('p');
            description.textContent = setting.description;
            labelDescriptionDiv.appendChild(description);
          }

          const settingItemContent = document.createElement('div');
          settingItemContent.classList.add('setting-item-content');

          let inputElement;
          switch (setting.type) {
            case 'text':
              inputElement = document.createElement('input');
              inputElement.type = 'text';
              inputElement.id = setting.id; //Added setting ID
              inputElement.value = setting.defaultValue;
              break;
            case 'checkbox':
              const labelDiv = document.createElement('label');
              labelDiv.classList.add('switch');
              checkBoxElement = document.createElement('input');
              checkBoxElement.type = 'checkbox';
              checkBoxElement.id = setting.id;
              checkBoxElement.checked = setting.defaultValue;
              labelDiv.appendChild(checkBoxElement);

              const slider = document.createElement('span');
              slider.classList.add('slider');
              slider.classList.add('round');
              labelDiv.appendChild(slider);

              // Add event listener to the switchDiv
              labelDiv.addEventListener('click', () => {
                checkBoxElement.checked = !checkBoxElement.checked;
              });
              inputElement = labelDiv;
              break;
            case 'select':
              inputElement = document.createElement('select');
              inputElement.id = setting.id; //Added setting ID
              setting.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                if (option === setting.defaultValue) {
                  optionElement.selected = true;
                }
                inputElement.appendChild(optionElement);
              });
              break;
            case 'color':
              inputElement = document.createElement('input');
              inputElement.type = 'color';
              inputElement.id = setting.id; //Added setting ID
              inputElement.value = setting.defaultValue;
              break;
            case 'number':
              inputElement = document.createElement('input');
              inputElement.type = 'number';
              inputElement.id = setting.id; //Added setting ID
              inputElement.value = setting.defaultValue;
              inputElement.min = setting.min;
              inputElement.max = setting.max;
              break;
            default:
              inputElement = document.createElement('input');
              inputElement.type = 'text';
              inputElement.id = setting.id; //Added setting ID
              inputElement.value = setting.defaultValue;
          }

          inputElement.addEventListener('input', function(event) {
            // console.log('Input value changed:', event.target.value);
            // // Perform your desired actions here
            const settings = {};
            data.settings.forEach(setting => {
              let inputElement = document.getElementById(setting.id);
    
              if (setting.type === 'checkbox') {
                settings[setting.id] = inputElement.checked;
              } else {
                settings[setting.id] = inputElement.value;
              }
            });
            // You can save the settings to localStorage, send them to a server, etc.
            console.log('Saved settings:', settings);
            localStorage.setItem('userSettings', JSON.stringify(settings));
    
            // Generate parameter string
            const paramString = Object.entries(settings)
              .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
              .join('&');
    
            console.log('Parameter String:', paramString);
            //window.parent.postMessage(paramString, "http://127.0.0.1:3006/index.html");
            window.parent.reloadWidget(paramString);
          });

          settingItemContent.appendChild(inputElement);

          settingItem.appendChild(labelDescriptionDiv);
          settingItem.appendChild(settingItemContent);
          groupDiv.appendChild(settingItem);
        });

        settingsContent.appendChild(groupDiv);
      }

      // saveButton.addEventListener('click', () => {
      //   const settings = {};
      //   data.settings.forEach(setting => {
      //     let inputElement = document.getElementById(setting.id);

      //     if (setting.type === 'checkbox') {
      //       settings[setting.id] = inputElement.checked;
      //     } else {
      //       settings[setting.id] = inputElement.value;
      //     }
      //   });
      //   // You can save the settings to localStorage, send them to a server, etc.
      //   console.log('Saved settings:', settings);
      //   localStorage.setItem('userSettings', JSON.stringify(settings));

      //   // Generate parameter string
      //   const paramString = Object.entries(settings)
      //     .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      //     .join('&');

      //   // console.log('Parameter String:', paramString);
      //   window.parent.postMessage(paramString, "http://127.0.0.1:3006/index.html");
      // });
    })
    .catch(error => console.error('Error loading settings:', error));
});


// In the iframe's JavaScript:
function sendDataToParent(data) {
  // window.parent.postMessage(data, "*"); // Replace "*" with the parent's origin for security
  console.log("I got clicked!")
}
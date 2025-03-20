document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, starting script execution...');

  // Selectors with null checks
  const loader = document.querySelector('.loader');
  const main = document.querySelector('main');
  const modal = document.getElementById('booking-modal');
  const openButtons = document.querySelectorAll('[data-modal-open]');
  const closeButton = modal?.querySelector('.modal-close');
  const form = modal?.querySelector('.booking-form');
  const navLinks = document.querySelectorAll('.nav-links a');
  const settingsLink = document.getElementById('settingsLink');
  const settingsCard = document.getElementById('settingsCard');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const changeSheetBtn = document.getElementById('changeSheetBtn');
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const sheetLinkDiv = document.getElementById('sheetLink');
  const adminStatus = document.getElementById('adminStatus');

  // Exit early if critical elements are missing
  if (!loader || !main || !modal || !form || !closeButton) {
      console.error('Critical DOM elements missing, exiting early:', { loader, main, modal, form, closeButton });
      return;
  }

  // Initial setup: default password, phone, and sheet ID
  let businessPassword = localStorage.getItem('businessPassword') || 'grooming123';
  let businessPhone = localStorage.getItem('businessPhone') || '07845984597';
  const defaultSheetId = '1cqV3_MO1SFx4mqr2cnZJa59GS4OU37dmUih_Qfgh0dQ';
  const sheetId = localStorage.getItem('sheetId') || defaultSheetId;
  localStorage.setItem('sheetId', sheetId);
  localStorage.setItem('sheetUrl', localStorage.getItem('sheetUrl') || `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=0#gid=0`);

  // Loader
  setTimeout(() => {
      console.log('Hiding loader');
      loader.classList.add('hidden');
      setTimeout(() => {
          loader.style.display = 'none';
          main.removeAttribute('hidden');
      }, 500); // Match CSS transition duration
  }, 1500);

  // Modal Open
  openButtons.forEach(button => {
      button.addEventListener('click', () => {
          console.log('Opening modal');
          modal.showModal();
      });
  });

  // Modal Close handlers
  closeButton.addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => {
      if (e.target === modal) modal.close();
  });
  document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.open) modal.close();
  });

  // Navigation Scroll
  navLinks.forEach(link => {
      link.addEventListener('click', e => {
          e.preventDefault();
          const targetId = link.getAttribute('href')?.slice(1);
          const targetSection = targetId ? document.getElementById(targetId) : null;
          targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
  });

  // Settings Card Toggle
  if (settingsLink && settingsCard && closeSettingsBtn) {
      settingsLink.addEventListener('click', e => {
          e.preventDefault();
          settingsCard.classList.add('active');
          document.body.classList.add('settings-open');
      });
      closeSettingsBtn.addEventListener('click', () => {
          settingsCard.classList.remove('active');
          document.body.classList.remove('settings-open');
      });
  }

  // Load saved sheet URL if it exists
  if (sheetLinkDiv && localStorage.getItem('sheetUrl')) {
      sheetLinkDiv.innerHTML = `Your booking sheet: <a href="${localStorage.getItem('sheetUrl')}" target="_blank">View Sheet</a>`;
  }

  // Change Sheet Logic
  if (changeSheetBtn && sheetLinkDiv && adminStatus) {
      changeSheetBtn.addEventListener('click', () => {
          const enteredPassword = prompt('Enter the business owner password:')?.trim();
          if (enteredPassword === null) return; // User canceled prompt
          if (enteredPassword === businessPassword) {
              const newSheetId = prompt('Enter the new Sheet ID:')?.trim();
              if (newSheetId === null) return; // User canceled prompt
              if (newSheetId) {
                  const newSheetUrl = `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`;
                  localStorage.setItem('sheetId', newSheetId);
                  localStorage.setItem('sheetUrl', newSheetUrl);
                  sheetLinkDiv.innerHTML = `Your booking sheet: <a href="${newSheetUrl}" target="_blank">View Sheet</a>`;
                  adminStatus.textContent = 'Sheet changed successfully!';
                  setTimeout(() => adminStatus.textContent = '', 3000); // Clear message after 3s
              } else {
                  adminStatus.textContent = 'Sheet ID cannot be empty.';
              }
          } else {
              adminStatus.textContent = 'Incorrect password.';
          }
      });
  }

  // Change Password Logic
  if (changePasswordBtn && adminStatus) {
      changePasswordBtn.addEventListener('click', () => {
          const enteredPhone = prompt('Enter your phone number to verify:')?.trim();
          if (enteredPhone === null) return; // User canceled prompt
          if (enteredPhone === businessPhone) {
              const newPassword = prompt('Enter your new password:')?.trim();
              if (newPassword === null) return; // User canceled prompt
              if (newPassword) {
                  businessPassword = newPassword;
                  localStorage.setItem('businessPassword', newPassword);
                  adminStatus.textContent = 'Password updated successfully!';
                  setTimeout(() => adminStatus.textContent = '', 3000); // Clear message after 3s
              } else {
                  adminStatus.textContent = 'Password cannot be empty.';
              }
          } else {
              adminStatus.textContent = 'Incorrect phone number.';
          }
      });
  }

  // Form Submission to Google Sheets
  form.addEventListener('submit', async e => {
      e.preventDefault();
      console.log('Form submitted - Starting submission process');

      const nameInput = document.getElementById('name');
      const phoneInput = document.getElementById('phone');
      const dateInput = document.getElementById('date');
      const serviceInput = document.getElementById('service');

      if (!nameInput || !phoneInput || !dateInput || !serviceInput) {
          console.error('Form inputs missing:', { nameInput, phoneInput, dateInput, serviceInput });
          alert('Form is incomplete. Please try again.');
          return;
      }

      const nameValue = nameInput.value.trim();
      const phoneValue = phoneInput.value.trim();
      const dateValue = dateInput.value;
      const serviceValue = serviceInput.value;

      // Validation
      if (!nameValue) {
          console.log('Validation failed: No name');
          alert('Please enter your name.');
          nameInput.focus();
          return;
      }
      if (!phoneValue || !/^\d{10}$/.test(phoneValue)) {
          console.log('Validation failed: Invalid phone');
          alert('Phone number must be exactly 10 digits.');
          phoneInput.focus();
          return;
      }
      if (!dateValue) {
          console.log('Validation failed: No date');
          alert('Please select a date.');
          dateInput.focus();
          return;
      }
      if (!serviceValue) {
          console.log('Validation failed: No service');
          alert('Please select a service.');
          serviceInput.focus();
          return;
      }

      // Create and show loading circle above the modal
      console.log('Creating loading circle');
      const loadingCircle = document.createElement('div');
      loadingCircle.classList.add('loading-circle');
      loadingCircle.style.position = 'fixed';
      loadingCircle.style.top = '50%';
      loadingCircle.style.left = '50%';
      loadingCircle.style.transform = 'translate(-50%, -50%)';
      loadingCircle.style.width = '50px';
      loadingCircle.style.height = '50px';
      loadingCircle.style.border = '5px solid #f47e38';
      loadingCircle.style.borderTop = '5px solid transparent';
      loadingCircle.style.borderRadius = '50%';
      loadingCircle.style.animation = 'spin 1s linear infinite';
      loadingCircle.style.zIndex = '99999'; // Extremely high z-index to ensure it’s above modal
      loadingCircle.style.display = 'block';
      document.body.appendChild(loadingCircle);
      loadingCircle.offsetHeight; // Force repaint
      console.log('Loading circle added to DOM:', loadingCircle);

      const data = {
          sheetId,
          'Name': nameValue,
          'Phone No.': phoneValue,
          'Time': dateValue,
          'Service': serviceValue
      };

      console.log('Step 3: Data prepared:', data);
      const scriptURL = 'https://script.google.com/macros/s/AKfycbxMNrV0TsDKKmH09rjrJwpcO2kzyuGd9d5AIPhHVe1J9yuCJbxPj4oFGEamvwGAf2Cv3Q/exec';
      console.log('Step 4: Sending to:', scriptURL);

      try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Ensure visibility for 1 second
          const response = await fetch(scriptURL, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });

          console.log('Step 5: Fetch completed (opaque response due to no-cors)');
          console.log('Step 6: Check the sheet now:', `https://docs.google.com/spreadsheets/d/${sheetId}/edit`);

          console.log('Step 7: Removing loading circle');
          if (document.body.contains(loadingCircle)) {
              document.body.removeChild(loadingCircle);
          } else {
              console.warn('Loading circle not found in DOM for removal');
          }

          console.log('Step 8: Creating Done popup');
          const popup = document.createElement('div');
          popup.classList.add('popup');
          popup.textContent = 'Done';
          popup.style.position = 'fixed';
          popup.style.top = '50%';
          popup.style.left = '50%';
          popup.style.transform = 'translate(-50%, -50%)';
          popup.style.background = '#f47e38';
          popup.style.color = 'white';
          popup.style.padding = '1rem 2rem';
          popup.style.borderRadius = '8px';
          popup.style.fontSize = '1.5rem';
          popup.style.fontWeight = '600';
          popup.style.zIndex = '999999'; // Extremely high z-index to ensure it’s above modal
          popup.style.opacity = '0';
          popup.style.transition = 'opacity 0.5s ease';
          document.body.appendChild(popup);
          popup.offsetHeight; // Force repaint
          console.log('Step 9: Popup added to DOM:', popup);

          setTimeout(() => {
              popup.style.opacity = '1';
              console.log('Step 10: Popup shown');
          }, 10);

          setTimeout(() => {
              popup.style.opacity = '0';
              console.log('Step 11: Popup fading out');
              setTimeout(() => {
                  if (document.body.contains(popup)) {
                      document.body.removeChild(popup);
                  } else {
                      console.warn('Popup not found in DOM for removal');
                  }
                  modal.close();
                  form.reset();
                  const homeSection = document.getElementById('home');
                  if (homeSection) {
                      homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                      console.warn('Home section not found for scrolling');
                  }
                  console.log('Step 12: Form reset and scrolled to home');
              }, 500); // Match CSS transition duration
          }, 2000);
      } catch (error) {
          console.error('Step 5: Fetch failed:', error.message);
          if (document.body.contains(loadingCircle)) {
              document.body.removeChild(loadingCircle);
          }
          alert(`Submission failed: ${error.message}. Please try again or contact support.`);
      }
  });
});

document.addEventListener('DOMContentLoaded', () => {
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
      console.error('Critical DOM elements missing:', { loader, main, modal, form, closeButton });
      return;
  }

  // Initial setup: default password and phone number
  let businessPassword = localStorage.getItem('businessPassword') || 'grooming123';
  let businessPhone = localStorage.getItem('businessPhone') || '07845984597';

  // Loader
  setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => {
          loader.style.display = 'none';
          main.removeAttribute('hidden');
      }, 500);
  }, 1500);

  // Modal Open
  openButtons.forEach((button) => {
      button.addEventListener('click', () => modal.showModal());
  });

  // Modal Close
  closeButton.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
  });
  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.hasAttribute('open')) modal.close();
  });

  // Navigation Scroll
  navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href')?.substring(1);
          const targetSection = targetId ? document.getElementById(targetId) : null;
          targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
  });

  // Settings Card Toggle
  if (settingsLink && settingsCard && closeSettingsBtn) {
      settingsLink.addEventListener('click', (e) => {
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
          const enteredPassword = prompt('Enter the business owner password:');
          if (enteredPassword === businessPassword) {
              const choice = prompt('Type "new" to create a new sheet or enter an existing Sheet ID:');
              if (choice?.toLowerCase() === 'new') {
                  const iframe = document.createElement('iframe');
                  iframe.src = 'https://script.google.com/macros/s/AKfycbxnfJGEm0rXw7vnemZMwx9_cb-SlqExsyqRY21GUeWoNaKXDXTruWhWWM5n91gWgTjM-Q/exec';
                  iframe.style.cssText = 'width: 100%; height: 300px; border: none; margin-top: 1rem;';
                  sheetLinkDiv.innerHTML = '';
                  sheetLinkDiv.appendChild(iframe);
                  adminStatus.textContent = 'Access granted. Set up your new sheet above.';
              } else if (choice?.trim()) {
                  const newSheetId = choice.trim();
                  const newSheetUrl = `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`;
                  localStorage.setItem('sheetId', newSheetId);
                  localStorage.setItem('sheetUrl', newSheetUrl);
                  sheetLinkDiv.innerHTML = `Your booking sheet: <a href="${newSheetUrl}" target="_blank">View Sheet</a>`;
                  adminStatus.textContent = 'Sheet changed successfully!';
              } else {
                  adminStatus.textContent = 'Invalid input. Please enter "new" or a valid Sheet ID.';
              }
          } else {
              adminStatus.textContent = 'Incorrect password. Only the business owner can change the sheet.';
          }
      });
  }

  // Change Password Logic
  if (changePasswordBtn && adminStatus) {
      changePasswordBtn.addEventListener('click', () => {
          const enteredPhone = prompt('Enter your phone number to verify (e.g., 07845984597):');
          if (enteredPhone === businessPhone) {
              const newPassword = prompt('Enter your new password:');
              if (newPassword?.trim()) {
                  businessPassword = newPassword;
                  localStorage.setItem('businessPassword', businessPassword);
                  adminStatus.textContent = 'Password updated successfully!';
              } else {
                  adminStatus.textContent = 'Password cannot be empty.';
              }
          } else {
              adminStatus.textContent = 'Incorrect phone number. Only the business owner can change the password.';
          }
      });
  }

  // Listen for Sheet ID and URL from iframe
  window.addEventListener('message', (event) => {
      if (event.data?.sheetId && event.data?.sheetUrl && sheetLinkDiv && adminStatus) {
          localStorage.setItem('sheetId', event.data.sheetId);
          localStorage.setItem('sheetUrl', event.data.sheetUrl);
          sheetLinkDiv.innerHTML = `Your booking sheet: <a href="${event.data.sheetUrl}" target="_blank">View Sheet</a>`;
          adminStatus.textContent = 'Sheet setup complete!';
      } else {
          console.warn('Invalid message from iframe:', event.data);
      }
  });

  // Form Submission to Google Sheets
  form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const phoneInput = document.getElementById('phone');
      const phoneValue = phoneInput?.value.trim();
      const dateInput = document.getElementById('date');
      const timeInput = document.getElementById('time');

      if (!phoneInput || !/^\d{10}$/.test(phoneValue)) {
          alert('Phone number must be exactly 10 digits.');
          phoneInput?.focus();
          return;
      }

      if (!dateInput?.value) {
          alert('Please select a date.');
          dateInput?.focus();
          return;
      }

      if (timeInput && !timeInput.value) {
          alert('Please select a time.');
          timeInput.focus();
          return;
      }

      const formData = new FormData(form);
      const sheetId = localStorage.getItem('sheetId') || 'DEFAULT_SHEET_ID';
      formData.append('sheetId', sheetId);
      // Add client-side timestamp if not provided by form
      if (!formData.has('timestamp')) {
          formData.append('timestamp', new Date().toISOString());
      }

      const formEntries = Object.fromEntries(formData.entries());
      console.log('Form Data Submitted:', formEntries);

      const scriptURL = 'https://script.google.com/macros/s/AKfycbxnfJGEm0rXw7vnemZMwx9_cb-SlqExsyqRY21GUeWoNaKXDXTruWhWWM5n91gWgTjM-Q/exec';

      try {
          const response = await fetch(scriptURL, {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Network error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('Server Response:', data);

          if (data.status === 'success') {
              const popup = document.createElement('div');
              popup.classList.add('popup');
              const bookedDateTime = data.bookedDateTime || `${formEntries.date} ${formEntries.time || 'N/A'}`;
              popup.textContent = `Booked for: ${bookedDateTime}`;
              document.body.appendChild(popup);
              setTimeout(() => popup.classList.add('show'), 10);
              setTimeout(() => {
                  popup.classList.remove('show');
                  setTimeout(() => {
                      document.body.removeChild(popup);
                      modal.close();
                      form.reset();
                      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 500);
              }, 2000);
          } else {
              throw new Error(data.message || 'Submission failed');
          }
      } catch (error) {
          console.error('Submission Error:', error);
          alert(`An error occurred: ${error.message}`);
      }
  });
});

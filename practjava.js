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
    alert('Form setup is broken. Please contact support.');
    return;
  }

  const data = {
    sheetId: localStorage.getItem('sheetId') || defaultSheetId,
    'Name': nameInput.value.trim(),
    'Phone No.': phoneInput.value.trim(),
    'Time': dateInput.value,
    'Service': serviceInput.value
  };

  // Validation
  if (!data.Name) {
    alert('Please enter your name.');
    nameInput.focus();
    return;
  }
  if (!data['Phone No.'] || !/^\d{10}$/.test(data['Phone No.'])) {
    alert('Please enter a valid 10-digit phone number.');
    phoneInput.focus();
    return;
  }
  if (!data.Time) {
    alert('Please select a date.');
    dateInput.focus();
    return;
  }
  if (!data.Service) {
    alert('Please select a service.');
    serviceInput.focus();
    return;
  }

  // Show loading circle
  const loadingCircle = document.createElement('div');
  loadingCircle.classList.add('loading-circle');
  document.body.appendChild(loadingCircle);

  const scriptURL = 'https://script.google.com/macros/s/AKfycbxnfJGEm0rXw7vnemZMwx9_cb-SlqExsyqRY21GUeWoNaKXDXTruWhWWM5n91gWgTjM-Q/exec';
  console.log('Submitting to:', scriptURL, 'with data:', data);

  try {
    // Ensure loading circle is visible for at least 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script from GitHub Pages
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('Fetch completed (opaque response due to no-cors)');

    // Clean up loading circle
    if (document.body.contains(loadingCircle)) {
      document.body.removeChild(loadingCircle);
    }

    // Show success popup (assuming success since no-cors hides response)
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = 'Done';
    document.body.appendChild(popup);
    setTimeout(() => popup.style.opacity = '1', 10);
    setTimeout(() => {
      popup.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(popup)) {
          document.body.removeChild(popup);
        }
        modal.close();
        form.reset();
        const homeSection = document.getElementById('home');
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.warn('Home section not found for scrolling');
        }
      }, 500); // Match CSS transition duration
    }, 2000);

    console.log('Submission sent. Check the sheet for updates:', `https://docs.google.com/spreadsheets/d/${data.sheetId}/edit`);
  } catch (error) {
    console.error('Submission failed:', error.message);
    if (document.body.contains(loadingCircle)) {
      document.body.removeChild(loadingCircle);
    }
    alert('Failed to book appointment. Please check your connection and try again, or contact support.');
  }
});

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
        }, 500);
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
            if (enteredPassword === null) return;
            if (enteredPassword === businessPassword) {
                const newSheetId = prompt('Enter the new Sheet ID:')?.trim();
                if (newSheetId === null) return;
                if (newSheetId) {
                    const newSheetUrl = `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`;
                    localStorage.setItem('sheetId', newSheetId);
                    localStorage.setItem('sheetUrl', newSheetUrl);
                    sheetLinkDiv.innerHTML = `Your booking sheet: <a href="${newSheetUrl}" target="_blank">View Sheet</a>`;
                    adminStatus.textContent = 'Sheet changed successfully!';
                    setTimeout(() => adminStatus.textContent = '', 3000);
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
            if (enteredPhone === null) return;
            if (enteredPhone === businessPhone) {
                const newPassword = prompt('Enter your new password:')?.trim();
                if (newPassword === null) return;
                if (newPassword) {
                    businessPassword = newPassword;
                    localStorage.setItem('businessPassword', newPassword);
                    adminStatus.textContent = 'Password updated successfully!';
                    setTimeout(() => adminStatus.textContent = '', 3000);
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

        // Show loading circle
        const loadingCircle = document.createElement('div');
        loadingCircle.classList.add('loading-circle');
        document.body.appendChild(loadingCircle);
        console.log('Loading circle displayed');

        const data = {
            sheetId,
            'Name': nameValue,
            'Phone No.': phoneValue,
            'Time': dateValue,
            'Service': serviceValue
        };
        const scriptURL = 'https://script.google.com/macros/s/AKfycbxMNrV0TsDKKmH09rjrJwpcO2kzyuGd9d5AIPhHVe1J9yuCJbxPj4oFGEamvwGAf2Cv3Q/exec';

        try {
            console.log('Sending data to Google Sheets:', data);
            const response = await fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log('Fetch completed (opaque response due to no-cors)');

            // Remove loading circle
            document.body.removeChild(loadingCircle);
            console.log('Loading circle removed');

            // Close modal immediately to ensure popup is visible
            modal.close();
            console.log('Modal closed');

            // Create and show "Done" popup
            const popup = document.createElement('div');
            popup.classList.add('popup');
            popup.textContent = 'Done';
            document.body.appendChild(popup);
            console.log('Popup created and added to DOM');

            // Force reflow to ensure transition works
            popup.offsetHeight;
            popup.classList.add('show');
            console.log('Popup class "show" added, should be visible now');

            // Hide popup after 2 seconds
            setTimeout(() => {
                popup.classList.remove('show');
                console.log('Popup class "show" removed, fading out');
                setTimeout(() => {
                    if (document.body.contains(popup)) {
                        document.body.removeChild(popup);
                        console.log('Popup removed from DOM');
                    }
                    form.reset();
                    console.log('Form reset');
                    const homeSection = document.getElementById('home');
                    if (homeSection) {
                        homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        console.log('Scrolled to home');
                    }
                }, 500); // Match CSS transition duration
            }, 2000); // Display for 2 seconds
        } catch (error) {
            console.error('Submission failed:', error.message);
            if (document.body.contains(loadingCircle)) {
                document.body.removeChild(loadingCircle);
            }
            alert(`Submission failed: ${error.message}. Please try again or contact support.`);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    const main = document.querySelector('main');
    const modal = document.getElementById('booking-modal');
    const openButtons = document.querySelectorAll('[data-modal-open]');
    const closeButton = modal.querySelector('.modal-close');
    const form = modal.querySelector('.booking-form');
    const navLinks = document.querySelectorAll('.nav-links a');
  
    // Loader
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => {
        loader.style.display = 'none';
        main.removeAttribute('hidden');
      }, 500);
    }, 2500);
  
    // Modal Open
    openButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.showModal();
      });
    });
  
    // Modal Close
    closeButton.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.hasAttribute('open')) modal.close();
    });
  
    // Form Submission to Google Sheets
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      // Corrected Web App URL format (replace with your actual Google Apps Script URL)
      const scriptURL = 'https://script.google.com/macros/s/AKfycbxG4O5invbK6KuBD_jonB7uW0u9vDvUxL3XEyJ9aJzsAw_ZtX_ALsyWMWslADa9BrtvAA/exec ';
  
      fetch(scriptURL, {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (response.ok) {
            // Show "Done" pop-up
            const popup = document.createElement('div');
            popup.classList.add('popup');
            popup.textContent = 'Done';
            document.body.appendChild(popup);
  
            setTimeout(() => popup.classList.add('show'), 10);
  
            setTimeout(() => {
              popup.classList.remove('show');
              setTimeout(() => {
                document.body.removeChild(popup);
                modal.close(); // Close modal only after success
                form.reset();
                document.getElementById('home').scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 500);
            }, 2000);
          } else {
            return response.text().then(text => {
              console.error('Submission failed:', response.status, text);
              alert(`Failed to submit: ${text}`);
            });
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('An error occurred: ' + error.message);
        });
    });
  
    // Navigation Scroll
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
  
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });
  });
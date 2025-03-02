/**
 * Modal functionality for member, event, and directory details
 */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modals
  initializeModals();

  // Add global event listener for escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Close any open modal
      const openModals = document.querySelectorAll('.modal-container:not(.hidden)');
      openModals.forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('modal-active');
        document.body.classList.remove('overflow-hidden');
      });
    }
  });

  // Re-initialize modals after a short delay to catch any dynamically added modals
  setTimeout(function() {
    initializeModals();
  }, 500);
});

/**
 * Initialize all modals on the page
 */
function initializeModals() {
  // Handle click on any element with data-modal-toggle attribute
  document.addEventListener('click', function(e) {
    const toggleElement = e.target.closest('[data-modal-toggle]');
    if (toggleElement) {
      const modalId = toggleElement.getAttribute('data-modal-toggle');
      const modal = document.getElementById(modalId);
      
      if (modal) {
        // Determine modal type based on ID
        let type = 'generic';
        if (modalId.startsWith('member-modal-')) {
          type = 'member';
        } else if (modalId.startsWith('event-modal-')) {
          type = 'event';
        } else if (modalId.startsWith('directory-modal-')) {
          type = 'directory';
        }
        
        e.preventDefault();
        
        // Get the item ID from the modal ID
        const itemId = modalId.split('-').pop();
        
        setupModal(itemId, modal, type);
        
        // Show the modal
        modal.classList.remove('hidden');
        modal.classList.add('modal-active');
        document.body.classList.add('overflow-hidden');
        
        // Setup close button
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
          button.onclick = function() {
            modal.classList.add('hidden');
            modal.classList.remove('modal-active');
            document.body.classList.remove('overflow-hidden');
          };
        });
        
        // Also close when clicking outside the modal content
        modal.onclick = function(event) {
          // If clicked on the backdrop/container itself (not its children)
          if (event.target === modal || event.target.id === `overlay-${modalId}`) {
            modal.classList.add('hidden');
            modal.classList.remove('modal-active');
            document.body.classList.remove('overflow-hidden');
          }
        };
      }
    }
  });
  
  // Handle all modal close buttons
  document.querySelectorAll('.modal-close').forEach(closeButton => {
    closeButton.addEventListener('click', function() {
      const modal = this.closest('.modal-container');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('modal-active');
        document.body.classList.remove('overflow-hidden');
      }
    });
  });
}

/**
 * Set up modal content based on type and ID
 */
function setupModal(itemId, modal, type) {
  // This function can be extended to load additional data if needed
  // Currently, we're using server-side rendered content
  
  // Hide loading spinner and show content for all modal types
  const loadingElement = modal.querySelector(`#loading-${modal.id}`);
  const contentElement = modal.querySelector(`#content-${modal.id}`);
  
  if (loadingElement) {
    loadingElement.classList.add('hidden');
  }
  
  if (contentElement) {
    contentElement.classList.remove('hidden');
  }
  
  if (type === 'member') {
    // If needed, make API call to get additional member data
    console.log(`Member modal ${itemId} opened`);
  } else if (type === 'event') {
    // If needed, make API call to get additional event data
    console.log(`Event modal ${itemId} opened`);
  } else if (type === 'directory') {
    // If needed, make API call to get additional directory data
    console.log(`Directory modal ${itemId} opened`);
  }
} 
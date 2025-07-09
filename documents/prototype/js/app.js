/**
 * Project Document Management System
 * Main JavaScript file with all functionality
 */

// Sample project data (in a real app this would come from an API)
const sampleProjects = [
    {
        id: 1,
        title: "Website Redesign",
        status: "Active",
        description: "Redesigning the corporate website with new branding and improved user experience.",
        documentCount: 15,
        updatedTime: "2 days ago"
    },
    {
        id: 2,
        title: "Mobile App Development",
        status: "Active",
        description: "Creating a new mobile application for customer engagement and loyalty program.",
        documentCount: 23,
        updatedTime: "today"
    },
    {
        id: 3,
        title: "Q4 Marketing Campaign",
        status: "On Hold",
        description: "Planning and executing the Q4 marketing campaign across multiple channels.",
        documentCount: 8,
        updatedTime: "5 days ago"
    },
    {
        id: 4,
        title: "Product Launch",
        status: "Completed",
        description: "Product launch for the new premium subscription tier with enhanced features.",
        documentCount: 32,
        updatedTime: "1 month ago"
    }
];

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chatbot
    initChatbot();
    
    // Initialize breadcrumb
    updateBreadcrumb('projects');
    
    // Render projects
    renderProjects(sampleProjects);
    
    // Initialize ripple effect
    initRippleEffect();
});

/**
 * Update breadcrumb based on current page
 * @param {string} currentPage - Current page identifier
 */
function updateBreadcrumb(currentPage) {
    const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
    
    // Clear any additional items
    const breadcrumb = document.querySelector('.breadcrumb');
    while (breadcrumb.childNodes.length > 3) {
        breadcrumb.removeChild(breadcrumb.lastChild);
    }
    
    // Handle additional breadcrumb items
    switch(currentPage) {
        case 'project-details':
            // Get project name from URL or data
            const projectName = new URLSearchParams(window.location.search).get('name') || 'Project Details';
            
            // Add project-specific breadcrumb
            const separator = document.createTextNode(' / ');
            const projectSpan = document.createElement('span');
            projectSpan.classList.add('breadcrumb-item');
            projectSpan.dataset.page = 'project-details';
            projectSpan.textContent = projectName;
            
            breadcrumb.appendChild(separator);
            breadcrumb.appendChild(projectSpan);
            break;
            
        default:
            // Only update active state for default pages
            breadcrumbItems.forEach(item => {
                if (item.dataset.page === currentPage) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
    }
}

/**
 * Create a project card from the template
 * @param {Object} projectData - Data for the project card
 * @return {HTMLElement} - The created project card element
 */
function createProjectCard(projectData) {
    // Clone template
    const template = document.getElementById('project-card-template');
    const clone = document.importNode(template.content, true);
    
    // Get status class
    let statusClass = '';
    switch(projectData.status.toLowerCase()) {
        case 'active':
            statusClass = 'status-active';
            break;
        case 'on hold':
            statusClass = 'status-onhold';
            break;
        case 'completed':
            statusClass = 'status-completed';
            break;
        default:
            statusClass = 'status-active';
    }
    
    // Fill in data
    const card = clone.querySelector('.project-card');
    
    // Set data attributes for filtering/sorting
    card.dataset.projectId = projectData.id;
    card.dataset.status = projectData.status;
    
    // Set content
    clone.querySelector('.project-title').textContent = projectData.title;
    clone.querySelector('.project-status').textContent = projectData.status;
    clone.querySelector('.project-status').classList.add(statusClass);
    clone.querySelector('.project-desc').textContent = projectData.description;
    
    const metaElements = clone.querySelectorAll('.project-meta span');
    metaElements[0].textContent = `${projectData.documentCount} documents`;
    metaElements[1].textContent = `Updated ${projectData.updatedTime}`;
    
    // Add click handler
    card.addEventListener('click', () => {
        // Navigate to project details
        window.location.href = `project-details.html?id=${projectData.id}`;
    });
    
    return clone;
}

/**
 * Render project cards using the template and data
 * @param {Array} projects - Array of project data objects
 */
function renderProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');
    
    // Clear existing content
    projectsGrid.innerHTML = '';
    
    // Add each project card
    projects.forEach(project => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
    });
    
    // Initialize ripple effect for the new cards
    initRippleEffect();
}

/**
 * Chatbot component functionality
 */
function initChatbot() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotPanel = document.querySelector('.chatbot-panel');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatInput = document.querySelector('.chatbot-input fluent-text-field');
    const sendButton = document.querySelector('.chatbot-input fluent-button');
    const messagesContainer = document.querySelector('.chatbot-messages');

    if (!chatbotToggle || !chatbotPanel) return;

    // Toggle chatbot panel
    chatbotToggle.addEventListener('click', () => {
        chatbotPanel.style.display = 'flex';
        chatbotToggle.style.display = 'none';
        // Add small delay to allow display change before animation
        setTimeout(() => {
            chatbotPanel.classList.add('visible');
            if (chatInput) chatInput.focus();
        }, 10);
    });

    // Close chatbot panel
    if (chatbotClose) {
        chatbotClose.addEventListener('click', () => {
            chatbotPanel.classList.remove('visible');
            // Wait for animation to complete before hiding
            setTimeout(() => {
                chatbotPanel.style.display = 'none';
                chatbotToggle.style.display = 'flex';
            }, 250);
        });
    }

    // Handle message sending
    if (sendButton && chatInput) {
        // Send on button click
        sendButton.addEventListener('click', () => {
            sendMessage();
        });

        // Send on Enter key
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
                e.preventDefault();
            }
        });
    }

    /**
     * Send a new message and handle the response
     */
    function sendMessage() {
        const message = chatInput.value;
        if (!message.trim()) return;

        // Add user message to the chat
        addMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        
        // Simulate AI response (in a real app, this would call your backend)
        simulateResponse(message);
    }

    /**
     * Add a message to the chat
     * @param {string} text - Message text
     * @param {string} sender - 'user' or 'bot'
     */
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to the latest message
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Simulate AI response (replace with actual API call in production)
     * @param {string} userMessage - The user's message
     */
    function simulateResponse(userMessage) {
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot', 'typing');
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = 'Typing...';
        
        typingDiv.appendChild(contentDiv);
        messagesContainer.appendChild(typingDiv);
        
        // Simulate API delay
        setTimeout(() => {
            // Remove typing indicator
            messagesContainer.removeChild(typingDiv);
            
            // Simple response logic - in a real app this would come from your AI service
            let response;
            
            if (userMessage.toLowerCase().includes('help')) {
                response = "I can help you find documents, answer questions about projects, and more. What would you like to know?";
            } else if (userMessage.toLowerCase().includes('document')) {
                response = "I found several documents related to your query. The most relevant ones are:\n\n- Project Plan.docx\n- Requirements.pdf\n- Meeting Notes.docx";
            } else if (userMessage.toLowerCase().includes('project')) {
                response = "Currently there are 4 active projects in the system. Which one are you interested in?";
            } else {
                response = "I'll help you find the information you need. Could you provide more details about what you're looking for?";
            }
            
            // Add the response
            addMessage(response, 'bot');
        }, 1500);
    }
}

/**
 * Ripple effect for interactive elements
 */
function initRippleEffect() {
    // Add ripple effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.removeEventListener('click', createRippleEffect); // Remove any existing listener
        card.addEventListener('click', createRippleEffect);
    });
    
    // Add to other clickable elements as needed
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.removeEventListener('click', createRippleEffect); // Remove any existing listener
        item.addEventListener('click', createRippleEffect);
    });
}

/**
 * Create ripple effect on element click
 * @param {Event} e - Click event
 */
function createRippleEffect(e) {
    const element = this;
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    element.appendChild(ripple);
    
    // Position ripple
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size/2 + 'px';
    ripple.style.top = e.clientY - rect.top - size/2 + 'px';
    
    // Remove after animation
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
} 
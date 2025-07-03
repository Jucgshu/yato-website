// Configuration du proxy Google Apps Script
const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbzQE52CZiJodwWh3m6yfvIjKPOTIhiR_DsAUFUCKZ1Hz0mRy6BL8-BzIUF08A4e1v7X/exec';

// Configuration de secours Telegram
const TELEGRAM_BOT_TOKEN = 'VOTRE_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'VOTRE_CHAT_ID';

// Gestion du menu mobile
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });
}

// Animation de navigation fluide
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        // Fermer le menu mobile si nécessaire
        if (window.innerWidth <= 768 && mainNav) {
            mainNav.classList.remove('active');
        }
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        // Animation de défilement fluide
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
        
        // Mettre à jour le menu actif
        document.querySelectorAll('#main-nav a').forEach(link => {
            link.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// Lightbox pour photos et vidéos
const initGalleries = () => {
    const galleryPhotos = [];
    const galleryVideos = [];
    
    // Photos
    const photoItems = document.querySelectorAll('#photos .preview-item');
    photoItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            galleryPhotos.push({
                src: item.dataset.src,
                alt: img.alt,
                type: 'photo'
            });
        }
    });
    
    // Vidéos
    const videoItems = document.querySelectorAll('#videos .preview-item');
    videoItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            galleryVideos.push({
                src: item.dataset.src,
                alt: img.alt,
                type: 'video'
            });
        }
    });
    
    return { galleryPhotos, galleryVideos };
};

const setupLightbox = () => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    // ... (le reste du code lightbox reste inchangé)
};

// Animation des sections lors du défilement
const setupScrollAnimations = () => {
    const sections = document.querySelectorAll('.section');
    if (sections.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
};

// CORRECTION: Fonction pour organiser les concerts (version finale)
const organizeConcerts = () => {
    const upcomingContainer = document.getElementById('upcoming-tour-dates');
    const pastContainer = document.getElementById('past-tour-dates');
    
    if (!upcomingContainer || !pastContainer) {
        console.error('Conteneurs de concerts non trouvés');
        return;
    }
    
    // Tableau temporaire pour stocker les concerts passés avant inversion
    const pastConcertsTemp = [];
    
    const today = new Date(); // Date actuelle
    today.setHours(0, 0, 0, 0); // Pour ignorer l'heure
    const currentYear = today.getFullYear();
    
    // Mapping des mois en abrégé français
    const moisMapping = {
        '01': 'JANV', '02': 'FÉVR', '03': 'MARS', '04': 'AVR',
        '05': 'MAI', '06': 'JUIN', '07': 'JUIL', '08': 'AOÛT',
        '09': 'SEPT', '10': 'OCT', '11': 'NOV', '12': 'DÉC'
    };
    
    // Liste de tous les concerts avec seulement la date ISO
    // FORMAT SIMPLIFIÉ (suppression de day et month)
    const allConcerts = [
        {
            date: "2025-07-03",
            title: "Test date du jour",
            venue: "Chez Yato",
            city: "Colmar"
        },
        {
            date: "2025-05-10",
            title: "Bar Joe",
            venue: "28 Rue de la Gare",
            city: "Wihr-au-Val"
        },
        {
            date: "2025-05-17",
            title: "Kunheim",
            venue: "Hangar de la Ferme Obrecht Thomas, Chemin du Riedgraden",
            city: "Kunheim"
        },
        {
            date: "2025-06-21", // Passée
            title: "Fête de la musique",
            venue: "Place de l'Hôtel de Ville",
            city: "Ribeauvillé"
        },
        {
            date: "2025-06-29",
            title: "Foulées de la ligue",
            venue: "Parc Expo, Av. de la Foire aux Vins",
            city: "Colmar"
        },
        {
            date: "2025-07-12",
            title: "34ème course de côtes de motos anciennes",
            venue: "D310",
            city: "Gaschney, Muhlbach-sur-Munster"
        },
        {
            date: "2025-07-18",
            title: "Taal",
            venue: "4 Rue de Soultzbach",
            city: "Wihr-au-Val"
        },
        {
            date: "2025-10-18",
            title: "Bar Joe",
            venue: "28 Rue de la Gare",
            city: "Wihr-au-Val"
        },
    ];
    
    // Vider les conteneurs
    upcomingContainer.innerHTML = '';
    pastContainer.innerHTML = '';
    
    // Trier les concerts par date croissante (du plus ancien au plus récent)
    allConcerts.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Organiser les concerts dans les bons conteneurs
    allConcerts.forEach(concert => {
        const concertDate = new Date(concert.date);
        concertDate.setHours(0, 0, 0, 0); // Pour ignorer l'heure
        
        const isPast = concertDate < today;
        const concertYear = concertDate.getFullYear();
        
        // Générer automatiquement jour et mois
        const day = concertDate.getDate().toString().padStart(2, '0');
        const monthNum = (concertDate.getMonth() + 1).toString().padStart(2, '0');
        const month = moisMapping[monthNum] || monthNum;
        
        // Créer l'élément de concert
        const concertElement = document.createElement('div');
        concertElement.className = `tour-date ${isPast ? 'past-date' : ''}`;
        
        // Ajouter l'année systématiquement pour les concerts passés
        // Pour les concerts à venir, ajouter seulement si année différente
        const yearIndicator = isPast 
            ? `<span class="year-indicator">${concertYear}</span>`
            : (concertYear !== currentYear ? `<span class="year-indicator">${concertYear}</span>` : '');
        
        concertElement.innerHTML = `
            <div class="date">
                <div class="day">${day}</div>
                <div class="month">${month}</div>
            </div>
            <div class="date-info">
                <h3>${concert.title}</h3>
                <div class="venue">${concert.venue}</div>
                <div class="city">${concert.city} ${yearIndicator}</div>
            </div>
        `;
        
        if (isPast) {
            // Stocker dans un tableau temporaire pour inversion ultérieure
            pastConcertsTemp.push(concertElement);
        } else {
            // Ajouter directement dans l'ordre chronologique ascendant
            upcomingContainer.appendChild(concertElement);
        }
    });
    
    // Inverser l'ordre des concerts passés pour les afficher du plus récent au plus ancien
    pastConcertsTemp.reverse().forEach(element => {
        pastContainer.appendChild(element);
    });
};

// Fonction pour gérer les onglets concerts
const setupConcertTabs = () => {
    const concertTabs = document.querySelectorAll('.concert-tab');
    const upcomingContainer = document.getElementById('upcoming-tour-dates');
    const pastContainer = document.getElementById('past-tour-dates');
    
    if (!concertTabs.length || !upcomingContainer || !pastContainer) return;
    
    concertTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            concertTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabType = this.dataset.tab;
            if (tabType === 'upcoming') {
                upcomingContainer.style.display = 'block';
                pastContainer.style.display = 'none';
            } else {
                upcomingContainer.style.display = 'none';
                pastContainer.style.display = 'block';
            }
        });
    });
};

// Gestion du formulaire de contact
const setupContactForm = () => {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // ... (le reste du code du formulaire reste inchangé)
    });
};

// Initialisation principale
document.addEventListener('DOMContentLoaded', () => {
    setupLightbox();
    setupScrollAnimations();
    organizeConcerts(); // CORRECTION: Doit être appelée ici
    setupConcertTabs();
    setupContactForm();
    
    // Gestion du menu mobile
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
    
    // Gestion de la popup de nouvelles
    const newsPopup = document.getElementById('newsPopup');
    const closePopupBtn = document.getElementById('closePopup');
    
    if (newsPopup && closePopupBtn) {
        // Fonction pour afficher la popup
        function showNewsPopup() {
            const popupDismissed = localStorage.getItem('popupDismissed');
            if (!popupDismissed) {
                setTimeout(() => {
                    newsPopup.classList.add('visible');
                }, 2000);
            }
        }
        
        // Fonction pour fermer la popup
        function closeNewsPopup() {
            newsPopup.classList.remove('visible');
            localStorage.setItem('popupDismissed', 'true');
        }
        
        closePopupBtn.addEventListener('click', closeNewsPopup);
        showNewsPopup();
    }
});

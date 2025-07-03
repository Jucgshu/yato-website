// Configuration du proxy Google Apps Script
const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbzQE52CZiJodwWh3m6yfvIjKPOTIhiR_DsAUFUCKZ1Hz0mRy6BL8-BzIUF08A4e1v7X/exec';

// Configuration de secours Telegram
const TELEGRAM_BOT_TOKEN = 'VOTRE_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'VOTRE_CHAT_ID';

// Variables globales pour la lightbox
let galleryPhotos = [];
let galleryVideos = [];
let currentGallery = [];
let currentIndex = 0;
let currentType = '';
let currentVideoElement = null;

// Initialiser les galeries
function initGalleries() {
    galleryPhotos = [];
    galleryVideos = [];

    // Photos
    const photoItems = document.querySelectorAll('#photos .preview-item');
    photoItems.forEach(item => {
        const img = item.querySelector('img');
        galleryPhotos.push({
            src: item.dataset.src,
            alt: img.alt,
            type: 'photo'
        });
    });

    // Vidéos
    const videoItems = document.querySelectorAll('#videos .preview-item');
    videoItems.forEach(item => {
        const img = item.querySelector('img');
        galleryVideos.push({
            src: item.dataset.src,
            alt: img.alt,
            type: 'video'
        });
    });
}

// Ouvrir la lightbox
function openLightbox(type, index) {
    currentType = type;
    currentGallery = type === 'photos' ? galleryPhotos : galleryVideos;
    currentIndex = index;

    showMedia(currentGallery[currentIndex]);
    document.getElementById('lightbox').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Afficher le média
function showMedia(media) {
    const lightbox = document.getElementById('lightbox');
    const mediaContent = lightbox.querySelector('.media-content');
    const captionText = document.getElementById('caption');
    
    // Arrêter la vidéo précédente si elle existe
    if (currentVideoElement) {
        currentVideoElement.pause();
        currentVideoElement.currentTime = 0;
        currentVideoElement = null;
    }

    mediaContent.innerHTML = '';
    captionText.innerHTML = media.alt;

    if (media.type === 'photo') {
        const img = document.createElement('img');
        img.src = media.src;
        img.alt = media.alt;
        img.classList.add('lightbox-content');
        mediaContent.appendChild(img);
    } else if (media.type === 'video') {
        const video = document.createElement('video');
        video.src = media.src;
        video.controls = true;
        video.autoplay = true;
        video.classList.add('lightbox-video');
        mediaContent.appendChild(video);
        currentVideoElement = video;
    }
}

// Navigation dans la lightbox
function nextMedia() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    showMedia(currentGallery[currentIndex]);
}

function prevMedia() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    showMedia(currentGallery[currentIndex]);
}

// Fermer la lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    // Arrêter la vidéo en cours
    if (currentVideoElement) {
        currentVideoElement.pause();
        currentVideoElement.currentTime = 0;
        currentVideoElement = null;
    }

    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Configurer les événements de la lightbox
function setupLightboxEventListeners() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const prevBtn = lightbox.querySelector('.prev');
    const nextBtn = lightbox.querySelector('.next');
    const closeBtn = lightbox.querySelector('.close');

    // Photos
    document.querySelectorAll('#photos .preview-item').forEach((item, index) => {
        item.addEventListener('click', () => openLightbox('photos', index));
    });

    // Vidéos
    document.querySelectorAll('#videos .preview-item').forEach((item, index) => {
        item.addEventListener('click', () => openLightbox('videos', index));
    });

    // Navigation
    prevBtn.addEventListener('click', e => {
        e.stopPropagation();
        prevMedia();
    });

    nextBtn.addEventListener('click', e => {
        e.stopPropagation();
        nextMedia();
    });

    // Fermeture
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    // Clavier
    document.addEventListener('keydown', e => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextMedia();
            if (e.key === 'ArrowLeft') prevMedia();
        }
    });
}

// Initialisation de la lightbox
function initLightbox() {
    initGalleries();
    setupLightboxEventListeners();
}

// Gestion du menu mobile
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

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

// Animation des sections lors du défilement
function setupScrollAnimations() {
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

// Fonction pour organiser les concerts
function organizeConcerts() {
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
    const allConcerts = [
        {
            date: "2025-10-18",
            title: "Bar Joe",
            venue: "28 Rue de la Gare",
            city: "Wihr-au-Val"
        },
        {
            date: "2025-07-18",
            title: "Taal",
            venue: "4 Rue de Soultzbach",
            city: "Wihr-au-Val"
        },
        {
            date: "2025-07-12",
            title: "34ème course de côtes de motos anciennes",
            venue: "D310",
            city: "Gaschney, Muhlbach-sur-Munster"
        },
        {
            date: "2025-06-29",
            title: "Foulées de la ligue",
            venue: "Parc Expo, Av. de la Foire aux Vins",
            city: "Colmar"
        },
        {
            date: "2025-06-21",
            title: "Fête de la musique",
            venue: "Place de l'Hôtel de Ville",
            city: "Ribeauvillé"
        },
        {
            date: "2025-05-17",
            title: "Kunheim",
            venue: "Hangar de la Ferme Obrecht Thomas, Chemin du Riedgraden",
            city: "Kunheim"
        },
        {
            date: "2025-05-10",
            title: "Bar Joe",
            venue: "28 Rue de la Gare",
            city: "Wihr-au-Val"
        },
        {
            date: "2024-06-29",
            title: "34ème course de côtes de motos anciennes",
            venue: "D310",
            city: "Gaschney, Muhlbach-sur-Munster"
        },
        {
            date: "2024-06-22",
            title: "Fête de la musique",
            venue: "Place de l'Hôtel de Ville",
            city: "Ribeauvillé"
        },
        {
            date: "2024-06-21",
            title: "Fête de la musique",
            venue: "Parc du Bucheneck",
            city: "Soultz"
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
    
    // Ajouter un message si aucun concert à venir
    if (upcomingContainer.children.length === 0) {
        const noConcertsElement = document.createElement('div');
        noConcertsElement.className = 'tour-date no-concerts-msg';
        noConcertsElement.innerHTML = `
            <div class="date-info">
                <h3>Pas de concerts prévus pour l'instant</h3>
                <div class="message">Restez à l'écoute pour de nouvelles dates !</div>
            </div>
        `;
        upcomingContainer.appendChild(noConcertsElement);
    }
    
    // Déterminer quel onglet afficher par défaut
    const hasUpcoming = upcomingContainer.children.length > 0 && !upcomingContainer.querySelector('.no-concerts');
    const concertTabs = document.querySelectorAll('.concert-tab');
    
    if (!hasUpcoming) {
        // Activer l'onglet des concerts passés s'il n'y a pas de concerts à venir
        concertTabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector('.concert-tab[data-tab="past"]').classList.add('active');
        
        upcomingContainer.style.display = 'none';
        pastContainer.style.display = 'block';
    } else {
        // Par défaut, onglet "À venir" actif
        concertTabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector('.concert-tab[data-tab="upcoming"]').classList.add('active');
        
        upcomingContainer.style.display = 'block';
        pastContainer.style.display = 'none';
    }
}

// Fonction pour gérer les onglets concerts
function setupConcertTabs() {
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
}

// Gestion du formulaire de contact
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Récupération des valeurs
    const nom = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const sujet = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const feedback = document.getElementById('feedback');
    
    // Afficher l'indicateur de chargement
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    btnText.textContent = 'Envoi en cours...';
    btnSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // Préparer les données au format application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('nom', nom);
    formData.append('email', email);
    formData.append('sujet', sujet);
    formData.append('message', message);
    
    try {
        // Envoyer la requête
        const response = await fetch(googleScriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        // Gérer la réponse
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            throw new Error('Réponse invalide du serveur: ' + responseText);
        }
        
        if (data.success) {
            // Afficher un message de succès
            feedback.textContent = 'Message envoyé avec succès!';
            feedback.className = 'feedback success';
            feedback.style.display = 'block';
            
            // Réinitialiser le formulaire
            document.getElementById('contactForm').reset();
            
            // Masquer le feedback après 5 secondes
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
        } else {
            // Afficher l'erreur spécifique
            const errorMsg = data.error || 'Erreur lors de l\'envoi';
            feedback.textContent = errorMsg;
            feedback.className = 'feedback error';
            feedback.style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur avec Google Script:', error);
        
        // Solution de secours : Envoyer directement à Telegram
        try {
            const text = `📬 Message de contact (secours)!\n\n` +
                         `Nom: ${nom}\n` +
                         `Email: ${email}\n` +
                         `Sujet: ${sujet}\n\n` +
                         `Message:\n${message}`;
            
            const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: text
                })
            });
            
            if (response.ok) {
                feedback.textContent = 'Message envoyé via secours!';
                feedback.className = 'feedback success';
                feedback.style.display = 'block';
                document.getElementById('contactForm').reset();
            } else {
                throw new Error('Échec du secours Telegram');
            }
        } catch (fallbackError) {
            console.error('Erreur de secours:', fallbackError);
            feedback.textContent = 'Erreur grave. Contactez-nous par email.';
            feedback.className = 'feedback error';
            feedback.style.display = 'block';
        }
    } finally {
        // Réinitialiser le bouton
        btnText.textContent = 'Envoyer';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// Gestion de la popup de nouvelles
const newsPopup = document.getElementById('newsPopup');
const closePopupBtn = document.getElementById('closePopup');

// Fonction pour charger les dernières photos
function fetchLatestPhotos() {
    const previewItems = document.querySelectorAll('#photos .preview-item');
    if (previewItems.length === 0) return;
    
    // Créer le style pour l'indicateur de chargement
    const style = document.createElement('style');
    style.textContent = `
        .image-loader {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%23e62b1e" stroke-width="10" stroke-dasharray="180" stroke-dashoffset="90"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/></circle></svg>') center/50px no-repeat;
            z-index: 2;
            transition: opacity 0.3s;
        }
    `;
    document.head.appendChild(style);
    
    // Ajouter les indicateurs de chargement
    previewItems.forEach(item => {
        const loader = document.createElement('div');
        loader.className = 'image-loader';
        item.appendChild(loader);
    });
    
    // Charger les photos depuis photos.html
    fetch('photos.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Récupérer toutes les images de la galerie
            const galleryItems = doc.querySelectorAll('.gallery-item');
            const photos = [];
            
            // Extraire les chemins des images
            galleryItems.forEach(item => {
                const img = item.querySelector('img');
                if (img) {
                    photos.push({
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt'),
                        category: item.dataset.category
                    });
                }
            });
            
            // Trier par date (catégorie = année)
            photos.sort((a, b) => b.category.localeCompare(a.category));
            
            // Sélectionner les 4 premières photos
            const latestPhotos = photos.slice(0, 4);
            
            // Mettre à jour la section photos
            previewItems.forEach((item, index) => {
                if (latestPhotos[index]) {
                    const photo = latestPhotos[index];
                    item.dataset.src = photo.src;
                    const img = item.querySelector('img');
                    img.src = photo.src;
                    img.alt = photo.alt;
                }
                
                // Retirer l'indicateur de chargement
                const loader = item.querySelector('.image-loader');
                if (loader) loader.remove();
            });
            
            // Réinitialiser les galeries après mise à jour des images
            initGalleries();
        })
        .catch(error => {
            console.error('Erreur lors du chargement des photos:', error);
            
            // En cas d'erreur, retirer les indicateurs de chargement
            previewItems.forEach(item => {
                const loader = item.querySelector('.image-loader');
                if (loader) loader.remove();
            });
        });
}

// Initialisation principale
document.addEventListener('DOMContentLoaded', () => {
    // Menu mobile
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
    
    // Lightbox
    initLightbox();
    
    // Animations
    setupScrollAnimations();
    
    // Concerts
    organizeConcerts();
    setupConcertTabs();
    
    // Charger les dernières photos
    fetchLatestPhotos();
    
    // Popup
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

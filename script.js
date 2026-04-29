document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');

    // Preloader and text split logic
    window.addEventListener('load', () => {

        // Setup text animation wrapper
        const title = document.querySelector('.hero-content .title');
        if (title) {
            const text = title.textContent;
            title.innerHTML = text.split('').map((char, i) =>
                char === ' ' ? '&nbsp;' : `<span style="animation-delay: ${2.8 + (i * 0.12)}s">${char}</span>`
            ).join('');
        }

        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.classList.add('loaded');
                setTimeout(() => preloader.style.display = 'none', 1500); // Wait for transition out
            }
        }, 1500); // Play preloader animation for 1.5s
    });

    // Handle scroll event for navbar background change
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Parallax effect for collage items (combines Mouse Move + Scroll)
    const parallaxItems = document.querySelectorAll('.collage-item');
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        // Calculate mouse position relative to center of screen (-1 to 1)
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        updateParallax();
    });

    window.addEventListener('scroll', () => {
        updateParallax();
    });

    function updateParallax() {
        const scrolled = window.scrollY;

        parallaxItems.forEach(item => {
            // 1. SCROLL PHYSICS
            let scrollSpeed = 0.1;
            if (item.classList.contains('main-hat')) scrollSpeed = 0.05;
            else if (item.classList.contains('gold-silk')) scrollSpeed = 0.08;
            else if (item.classList.contains('green-silk')) scrollSpeed = 0.12;
            else if (item.classList.contains('feather')) scrollSpeed = 0.15;

            const yScrollOffset = scrolled * scrollSpeed;

            // 2. UNIFIED CAMERA PAN
            // Instead of scattering elements, we treat the screen like a camera. 
            // All elements drift slightly in the SAME direction (opposite mouse) to simulate a physical viewport lens
            let lensDrift = -10;
            if (item.classList.contains('main-hat')) lensDrift = -5; // Hat is central focal point, moves less
            else if (item.classList.contains('pin') || item.classList.contains('wire')) lensDrift = -15; // Floating foreground items move more

            const xMouseOffset = mouseX * lensDrift;
            const yMouseOffset = mouseY * lensDrift;

            // 3. DYNAMIC STUDIO LIGHTING (Drop Shadow Casting)
            // Simulates a physical spotlight following the cursor, casting dynamic shadows underneath all items
            const shadowX = mouseX * -25; // Shadow offsets opposite of the "light"
            const shadowY = Math.max(5, (mouseY * -25) + 15); // Maintain slight downward gravity to the shadow

            if (item.classList.contains('main-hat')) {
                // Section-jumping mathematics for the Hero hat
                const viewportHeight = window.innerHeight;
                // progress maps from 0 (at top) to 1 (scrolled 100vh)
                const progress = Math.min(1, Math.max(0, scrolled / viewportHeight));

                // Capped anchor ensures that once we scroll *past* the second section, the offset stops increasing.
                // This permanently pins the hat to the second section so it scrolls away naturally!
                const anchorOffsetY = Math.min(scrolled, viewportHeight);

                // Target offsets: Math matches landing at approx left:40vw, top: 45vh mapping from initial hero placement
                const easeCubic = 1 - Math.pow(1 - progress, 3); // smooth decelerated landing
                const deltaXvw = easeCubic * -15; // Slide left much less (reduced from -16 to -10)
                const deltaYvh = easeCubic * -30; // Slide up relative to the anchor structure to rest safely

                // Use new independent CSS properties (rotate/scale) perfectly bypassing the CSS 'forwards' animation lock
                // The baseline from the completed entrance animation is explicitly rotate(0deg) scale(1)
                const rotate = easeCubic * -28; // Rotates backwards more explicitly up to -28deg
                const scale = 1 + (easeCubic * 0.2);  // Scales up slightly from 1.0 to 1.2

                item.style.translate = `calc(${xMouseOffset}px + ${deltaXvw}vw) calc(${yMouseOffset}px + ${anchorOffsetY}px + ${deltaYvh}vh)`;
                item.style.rotate = `${rotate}deg`;
                item.style.scale = `${scale}`;
                item.style.transform = `translate(-50%, -50%)`; // Only assert the centering offset so we don't conflict

                // Dynamic shadow transitions
                let blur = 35 + (progress * 15);
                let opacity = 0.3 - (progress * 0.1);
                item.style.filter = `drop-shadow(${shadowX}px ${shadowY}px ${blur}px rgba(0, 0, 0, ${opacity}))`;

            } else if (item.classList.contains('gold-silk') || item.classList.contains('green-silk')) {
                let blur = 25;
                let opacity = 0.2;
                item.style.translate = `${xMouseOffset}px calc(${yScrollOffset}px + ${yMouseOffset}px)`;
                item.style.filter = `drop-shadow(${shadowX}px ${shadowY}px ${blur}px rgba(0, 0, 0, ${opacity}))`;
            } else {
                let blur = 15;
                let opacity = 0.15;
                item.style.translate = `${xMouseOffset}px calc(${yScrollOffset}px + ${yMouseOffset}px)`;
                item.style.filter = `drop-shadow(${shadowX}px ${shadowY}px ${blur}px rgba(0, 0, 0, ${opacity}))`;
            }
        });
    }

    // Discover Section Animation Observer
    const observerOptions = {
        threshold: 0.3 // Fire when 30% of the section is visible
    };

    const discoverObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Determine which section we are in and select the appropriate animatable elements
                const isDiscover = entry.target.classList.contains('discover-section');
                const isCurated = entry.target.classList.contains('curated-section');
                const isAbout = entry.target.classList.contains('about-section');
                
                let selectors = '.exp-anim';
                if (isDiscover) selectors = '.discover-word, .discover-black-hat';
                if (isCurated) selectors = '.curated-anim, .curated-box, .curated-silk-top';
                if (isAbout) selectors = '.about-anim';
                
                // Add the .in-view class to everything that needs to be animated
                const animatableElements = entry.target.querySelectorAll(selectors);
                animatableElements.forEach(el => el.classList.add('in-view'));
                
                // Stop observing once triggered
                discoverObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const discoverSection = document.querySelector('.discover-section');
    if (discoverSection) {
        discoverObserver.observe(discoverSection);
    }
    
    const experienceSection = document.querySelector('.experience-section');
    if (experienceSection) {
        discoverObserver.observe(experienceSection);
    }

    const curatedSection = document.querySelector('.curated-section');
    if (curatedSection) {
        discoverObserver.observe(curatedSection);
    }

    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        discoverObserver.observe(aboutSection);
    }

    // ==================== MODAL LOGIC ====================
    const bookingCta = document.getElementById('booking-cta');
    const modalOverlay = document.getElementById('booking-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (bookingCta && modalOverlay && closeModalBtn) {
        // Open Modal
        bookingCta.addEventListener('click', (e) => {
            e.preventDefault();
            modalOverlay.classList.add('modal-active');
            document.body.style.overflow = 'hidden'; // Lock background scrolling
        });

        // Close Modal via Button
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('modal-active');
            document.body.style.overflow = ''; // Unlock scrolling
        });

        // Close Modal via Backdrop Click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('modal-active');
                document.body.style.overflow = '';
            }
        });
    }

    // ==================== LAUNCH TIMER LOGIC ====================
    const timerElement = document.getElementById('launch-timer');
    if (timerElement) {
        // Target date 9 days, 18 hours, 18 mins from now
        let targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 9);
        targetDate.setHours(targetDate.getHours() + 18);
        targetDate.setMinutes(targetDate.getMinutes() + 18);

        setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) return;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const fDays = days.toString().padStart(2, '0');
            const fHours = hours.toString().padStart(2, '0');
            const fMins = minutes.toString().padStart(2, '0');
            const fSecs = seconds.toString().padStart(2, '0');
            
            timerElement.innerHTML = `${fDays} days, ${fHours} hrs, ${fMins} mins, ${fSecs} s`;
        }, 1000);
    }

    // ==================== WIZARD MODAL LOGIC ====================
    const wizardModalOverlay = document.getElementById('wizard-modal-overlay');
    const shopBoxesCta = document.getElementById('shop-boxes-cta');
    const closeWizardBtn = document.getElementById('close-wizard-btn');

    if (wizardModalOverlay && shopBoxesCta) {
        // Open Modal
        shopBoxesCta.addEventListener('click', (e) => {
            e.preventDefault();
            wizardModalOverlay.classList.add('modal-active');
            document.body.style.overflow = 'hidden';
            resetWizard();
        });

        // Close Modal via Button
        if (closeWizardBtn) {
            closeWizardBtn.addEventListener('click', () => {
                wizardModalOverlay.classList.remove('modal-active');
                document.body.style.overflow = '';
            });
        }

        // Close Modal via Backdrop Click
        wizardModalOverlay.addEventListener('click', (e) => {
            if (e.target === wizardModalOverlay) {
                wizardModalOverlay.classList.remove('modal-active');
                document.body.style.overflow = '';
            }
        });

        // Wizard Steps Logic
        const wizardSteps = document.querySelectorAll('.wizard-step');
        let currentStep = 1;

        // Step 1: Style Cards
        const styleCards = document.querySelectorAll('.wizard-card');
        const nextBtnStep1 = document.querySelector('#wizard-step-1 .next-btn');
        let selectedStyle = null;

        styleCards.forEach(card => {
            card.addEventListener('click', () => {
                styleCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedStyle = card.getAttribute('data-style');
                nextBtnStep1.removeAttribute('disabled');
            });
        });

        // Step 2: Color Swatches
        const colorSwatches = document.querySelectorAll('.color-swatch');
        const nextBtnStep2 = document.querySelector('#wizard-step-2 .next-btn');
        let selectedColor = null;

        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                colorSwatches.forEach(s => s.classList.remove('selected'));
                swatch.classList.add('selected');
                selectedColor = swatch.getAttribute('data-color');
                nextBtnStep2.removeAttribute('disabled');
            });
        });

        // Navigation
        const nextBtns = document.querySelectorAll('.next-btn');
        const backBtns = document.querySelectorAll('.back-btn');

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                goToStep(currentStep + 1);
            });
        });

        backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                goToStep(currentStep - 1);
            });
        });

        function goToStep(stepNumber) {
            if (stepNumber < 1 || stepNumber > wizardSteps.length) return;
            
            wizardSteps.forEach(step => step.classList.remove('active-step'));
            document.getElementById(`wizard-step-${stepNumber}`).classList.add('active-step');
            currentStep = stepNumber;
        }

        function resetWizard() {
            currentStep = 1;
            selectedStyle = null;
            selectedColor = null;
            
            styleCards.forEach(c => c.classList.remove('selected'));
            colorSwatches.forEach(s => s.classList.remove('selected'));
            
            if (nextBtnStep1) nextBtnStep1.setAttribute('disabled', 'true');
            if (nextBtnStep2) nextBtnStep2.setAttribute('disabled', 'true');
            
            wizardSteps.forEach(step => step.classList.remove('active-step'));
            const step1 = document.getElementById('wizard-step-1');
            if(step1) step1.classList.add('active-step');
            
            const reqInput = document.getElementById('wizard-requirements');
            if (reqInput) reqInput.value = '';
        }
        
        // Final Submit
        const wizardForm = document.querySelector('#wizard-step-4 form');
        if (wizardForm) {
            wizardForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert(`Order Confirmed!\nStyle: ${selectedStyle}\nColor: ${selectedColor}\nTotal: $260.00\nProceeding to payment gateway...`);
                wizardModalOverlay.classList.remove('modal-active');
                document.body.style.overflow = '';
            });
        }
    }
});

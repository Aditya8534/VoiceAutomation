document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. STATUS BAR TIME & HEADER SCROLL EFFECT
  // ==========================================
  const phoneTimeEl = document.getElementById('phone-time');
  function updatePhoneTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    if (phoneTimeEl) {
      phoneTimeEl.textContent = `${hours}:${minutes}`;
    }
  }
  updatePhoneTime();
  setInterval(updatePhoneTime, 1000);

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.padding = '0.75rem 2rem';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.padding = '1.25rem 2rem';
      navbar.style.boxShadow = 'none';
    }
  });

  // Highlight Active Link on Scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav ul li a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // 2. ORIGINAL SCREENSHOT CAROUSEL GALLERY
  // ==========================================
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  let currentSlide = 0;

  function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, idx) => {
      slide.classList.remove('active');
      dots[idx].classList.remove('active');
      if (idx === currentSlide) {
        slide.classList.add('active');
        dots[idx].classList.add('active');
      }
    });
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => showSlide(idx));
  });

  // Auto slide screenshots every 6 seconds
  let autoSlideTimer = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 6000);

  // Pause auto slide on hover or interaction
  const gallery = document.querySelector('.screenshot-gallery');
  if (gallery) {
    gallery.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
    gallery.addEventListener('mouseleave', () => {
      autoSlideTimer = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 6000);
    });
  }


  // ==========================================
  // 3. SMARTPHONE SIMULATOR CONTROLLER (STATE)
  // ==========================================
  const screenSplash = document.getElementById('screen-splash');
  const screenLogin = document.getElementById('screen-login');
  const screenRegister = document.getElementById('screen-register');
  const screenDashboard = document.getElementById('screen-dashboard');
  const screenVoiceWave = document.getElementById('screen-voice-wave');
  const screenCamera = document.getElementById('screen-camera-overlay');
  const screenMusic = document.getElementById('screen-music-overlay');
  const screenCall = document.getElementById('screen-call-overlay');
  const screenHistory = document.getElementById('screen-history-overlay');

  const backBtn = document.getElementById('phone-back-btn');
  const homeBtn = document.getElementById('phone-home-btn');
  const recentsBtn = document.getElementById('phone-recents-btn');
  const loginToast = document.getElementById('login-toast');

  let simulatorHistory = ['screen-splash'];
  let isLoggedIn = false;
  let bgProtocolActive = true;

  // Audit Logs database
  let auditLogs = [
    { command: 'SYSTEM BOOTSTRAP', time: 'Initial setup successful' },
    { command: 'BACKGROUND LISTENER', time: 'Hotword "Jarvis" initialized' }
  ];

  function addAuditLog(command, result) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    auditLogs.unshift({ command: command.toUpperCase(), time: `${result} - ${timestamp}` });
    updateAuditLogUI();
  }

  function updateAuditLogUI() {
    const container = document.getElementById('audit-log-container');
    if (!container) return;
    container.innerHTML = '';
    auditLogs.forEach(log => {
      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <span class="history-command">${log.command}</span>
        <span class="history-time">${log.time}</span>
      `;
      container.appendChild(card);
    });
  }

  function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.app-screen, .camera-overlay, .music-overlay, .call-overlay, .history-overlay');
    screens.forEach(s => s.classList.remove('active'));

    // Show selected screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
      
      // Update history stack if it's a new screen (and not going back)
      if (simulatorHistory[simulatorHistory.length - 1] !== screenId) {
        simulatorHistory.push(screenId);
      }
    }

    // Close menu when navigating
    document.getElementById('dashboard-menu').classList.remove('active');
    document.getElementById('dropdown-trigger').classList.remove('active');
  }

  // Auto transition Splash screen to Login after 2.5s
  setTimeout(() => {
    if (simulatorHistory.length === 1 && simulatorHistory[0] === 'screen-splash') {
      showScreen('screen-login');
      addAuditLog('Splash Screen Timeout', 'Navigated to login screen');
    }
  }, 2500);

  // Bezel Back Button Action
  backBtn.addEventListener('click', () => {
    if (simulatorHistory.length > 1) {
      // End camera stream if backing away from camera
      if (simulatorHistory[simulatorHistory.length - 1] === 'screen-camera-overlay') {
        stopCamera();
      }

      simulatorHistory.pop(); // Remove current screen
      const prevScreen = simulatorHistory[simulatorHistory.length - 1];
      
      // Hide all first
      const screens = document.querySelectorAll('.app-screen, .camera-overlay, .music-overlay, .call-overlay, .history-overlay');
      screens.forEach(s => s.classList.remove('active'));
      
      // Show previous screen
      document.getElementById(prevScreen).classList.add('active');
      
      // Close dropdowns
      document.getElementById('dashboard-menu').classList.remove('active');
      document.getElementById('dropdown-trigger').classList.remove('active');
      
      addAuditLog('Hardware Back Key', `Returned to ${prevScreen}`);
    }
  });

  // Bezel Home Button Action
  homeBtn.addEventListener('click', () => {
    stopCamera();
    if (isLoggedIn) {
      showScreen('screen-dashboard');
    } else {
      showScreen('screen-login');
    }
    addAuditLog('Hardware Home Key', 'Navigated to core launcher');
  });

  // Bezel Recents Button Action (just showing a toast for this demo)
  recentsBtn.addEventListener('click', () => {
    showToast('Background Protocol Listening');
  });

  // Helper to trigger mobile toast
  function showToast(text) {
    loginToast.querySelector('span').textContent = text;
    loginToast.classList.add('show');
    setTimeout(() => {
      loginToast.classList.remove('show');
    }, 2800);
  }

  // ==========================================
  // 4. AUTHENTICATION LOGIC
  // ==========================================
  const goToRegister = document.getElementById('go-to-register');
  const goToLogin = document.getElementById('go-to-login');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  goToRegister.addEventListener('click', () => showScreen('screen-register'));
  goToLogin.addEventListener('click', () => showScreen('screen-login'));

  // Mask/unmask password
  const togglePasses = document.querySelectorAll('.toggle-password');
  togglePasses.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const input = e.target.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
      } else {
        input.type = 'password';
      }
    });
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    isLoggedIn = true;
    showScreen('screen-dashboard');
    showToast('Login Successful');
    addAuditLog('User Login', 'Authenticated successfully as Sir');
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    alert(`Account created for ${name}! Please sign in.`);
    showScreen('screen-login');
    addAuditLog('Register Account', `New user "${name}" registered`);
  });


  // ==========================================
  // 5. SETTINGS DROPDOWN MENU
  // ==========================================
  const dropdownTrigger = document.getElementById('dropdown-trigger');
  const dashboardMenu = document.getElementById('dashboard-menu');
  const menuOptHistory = document.getElementById('menu-opt-history');
  const menuOptBg = document.getElementById('menu-opt-bg');
  const menuOptLogout = document.getElementById('menu-opt-logout');

  dropdownTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dashboardMenu.classList.toggle('active');
    dropdownTrigger.classList.toggle('active');
  });

  // Close dropdown on click outside
  document.addEventListener('click', () => {
    dashboardMenu.classList.remove('active');
    dropdownTrigger.classList.remove('active');
  });

  menuOptHistory.addEventListener('click', () => {
    showScreen('screen-history-overlay');
    addAuditLog('Menu Navigation', 'Opened History log');
  });

  menuOptBg.addEventListener('click', () => {
    bgProtocolActive = !bgProtocolActive;
    const state = bgProtocolActive ? 'ENABLED' : 'DISABLED';
    alert(`Background Wakeup Service: ${state}`);
    addAuditLog('Background Service Toggle', `Protocol set to ${state}`);
  });

  menuOptLogout.addEventListener('click', () => {
    isLoggedIn = false;
    showScreen('screen-login');
    addAuditLog('User Logout', 'Cleared local session');
  });

  // Close extra overlay screens buttons
  document.getElementById('btn-close-history').addEventListener('click', () => {
    showScreen('screen-dashboard');
  });


  // ==========================================
  // 6. QUICK SHORTCUTS DEMONSTRATION
  // ==========================================

  // --- A. CAMERA ---
  const shCamera = document.getElementById('shortcut-camera');
  const btnCloseCamera = document.getElementById('btn-close-camera');
  const btnCapture = document.getElementById('btn-camera-capture');
  const webcamStream = document.getElementById('webcam-stream');

  shCamera.addEventListener('click', () => {
    showScreen('screen-camera-overlay');
    startCamera();
  });

  btnCloseCamera.addEventListener('click', () => {
    stopCamera();
    showScreen('screen-dashboard');
  });

  btnCapture.addEventListener('click', () => {
    // Flash effect
    const screen = document.querySelector('.phone-screen');
    screen.style.opacity = '0.3';
    setTimeout(() => {
      screen.style.opacity = '1';
      showToast('Photo Saved to Gallery');
    }, 150);
    addAuditLog('Camera Action', 'Snapped photo segment');
  });

  function startCamera() {
    addAuditLog('Camera System Call', 'Requesting hardware webcam device');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 330, height: 500 } })
        .then(stream => {
          webcamStream.srcObject = stream;
          webcamStream.style.display = 'block';
          document.querySelector('.camera-placeholder').style.display = 'none';
        })
        .catch(err => {
          console.warn("Webcam access rejected or not available: ", err);
          webcamStream.style.display = 'none';
          document.querySelector('.camera-placeholder').style.display = 'flex';
        });
    } else {
      webcamStream.style.display = 'none';
      document.querySelector('.camera-placeholder').style.display = 'flex';
    }
  }

  function stopCamera() {
    if (webcamStream.srcObject) {
      const tracks = webcamStream.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      webcamStream.srcObject = null;
    }
  }

  // --- B. MUSIC PLAYER ---
  const shMusic = document.getElementById('shortcut-music');
  const btnCloseMusic = document.getElementById('btn-close-music');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const musicPlayIcon = document.getElementById('music-play-icon');
  const playerDisc = document.getElementById('player-disc');
  const playerProgressBar = document.getElementById('player-progress-bar');
  let isPlaying = false;
  let musicProgressInterval = null;
  let musicProgressVal = 45; // Default progress bar start percentage

  shMusic.addEventListener('click', () => {
    showScreen('screen-music-overlay');
  });

  btnCloseMusic.addEventListener('click', () => {
    showScreen('screen-dashboard');
  });

  btnMusicToggle.addEventListener('click', () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });

  function playMusic() {
    isPlaying = true;
    playerDisc.classList.add('playing');
    musicPlayIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`; // pause icon SVG representation
    addAuditLog('Music Player Action', 'Resumed track "Cybernetic Resonance"');
    
    // Simulate music progress bar updating
    musicProgressInterval = setInterval(() => {
      musicProgressVal += 0.5;
      if (musicProgressVal >= 100) {
        musicProgressVal = 0;
      }
      playerProgressBar.style.width = `${musicProgressVal}%`;
    }, 200);
  }

  function pauseMusic() {
    isPlaying = false;
    playerDisc.classList.remove('playing');
    musicPlayIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`; // play icon SVG representation
    clearInterval(musicProgressInterval);
    addAuditLog('Music Player Action', 'Paused track');
  }

  // --- C. TELEPHONY CALLS ---
  const shCall = document.getElementById('shortcut-call');
  const btnCloseCall = document.getElementById('btn-close-call');
  const callStatusTimer = document.getElementById('call-status-timer');
  let callTimer = null;
  let callSeconds = 0;

  shCall.addEventListener('click', () => {
    showScreen('screen-call-overlay');
    startMockCall("Tony Stark");
  });

  btnCloseCall.addEventListener('click', () => {
    endMockCall();
    showScreen('screen-dashboard');
  });

  function startMockCall(name) {
    document.getElementById('call-target-name').textContent = name;
    callSeconds = 0;
    callStatusTimer.textContent = 'Calling...';
    addAuditLog('Telephony Call Out', `Dialing ${name}`);
    
    setTimeout(() => {
      callStatusTimer.textContent = '00:00';
      callTimer = setInterval(() => {
        callSeconds++;
        let min = Math.floor(callSeconds / 60);
        let sec = callSeconds % 60;
        min = min < 10 ? '0' + min : min;
        sec = sec < 10 ? '0' + sec : sec;
        callStatusTimer.textContent = `${min}:${sec}`;
      }, 1000);
      addAuditLog('Telephony Connection', 'Call connected');
    }, 2200);
  }

  function endMockCall() {
    clearInterval(callTimer);
    addAuditLog('Telephony Call End', 'Connection terminated');
  }


  // ==========================================
  // 7. SPEECH AND VOICE ASSISTANT SIMULATION
  // ==========================================
  const micBtn = document.getElementById('mic-activation-btn');
  const voiceWaveScreen = document.getElementById('screen-voice-wave');
  const transcriptText = document.getElementById('voice-transcript-text');
  const btnCancelVoice = document.getElementById('btn-cancel-voice');
  const assistantStatusText = document.getElementById('assistant-status-text');

  // Add click-bubble helper choices in the voice screen, so users can test even if mic blocks
  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 2rem;
    padding: 0 1rem;
    z-index: 1000;
  `;
  bubbleWrapper.innerHTML = `
    <button class="auth-btn" style="padding:0.4rem 0.75rem; font-size:0.72rem; background:rgba(33,150,243,0.15); border:1px solid var(--jarvis-blue); text-transform:none; margin:0;" onclick="window.triggerMockCommand('open camera')">"open camera"</button>
    <button class="auth-btn" style="padding:0.4rem 0.75rem; font-size:0.72rem; background:rgba(33,150,243,0.15); border:1px solid var(--jarvis-blue); text-transform:none; margin:0;" onclick="window.triggerMockCommand('play music')">"play music"</button>
    <button class="auth-btn" style="padding:0.4rem 0.75rem; font-size:0.72rem; background:rgba(33,150,243,0.15); border:1px solid var(--jarvis-blue); text-transform:none; margin:0;" onclick="window.triggerMockCommand('call Tony Stark')">"call Tony Stark"</button>
    <button class="auth-btn" style="padding:0.4rem 0.75rem; font-size:0.72rem; background:rgba(33,150,243,0.15); border:1px solid var(--jarvis-blue); text-transform:none; margin:0;" onclick="window.triggerMockCommand('history')">"show history"</button>
  `;
  
  // Insert before the cancel button
  voiceWaveScreen.insertBefore(bubbleWrapper, btnCancelVoice);

  let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let speechTimeout = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      transcriptText.textContent = "Listening for commands...";
      addAuditLog('Microphone Recognition', 'Speech input sensor initialized');
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error: ", event.error);
      // Fallback silently to mock command sequence if blocked/denied
      if (event.error === 'not-allowed') {
        transcriptText.innerHTML = "Microphone blocked.<br>Use the text triggers below to simulate voice commands!";
      } else {
        transcriptText.textContent = "Microphone error. Tap a quick command bubble.";
      }
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      processVoiceCommand(command);
    };

    recognition.onend = () => {
      // Auto return if nothing was parsed
      speechTimeout = setTimeout(() => {
        if (voiceWaveScreen.classList.contains('active')) {
          showScreen('screen-dashboard');
        }
      }, 5000);
    };
  }

  micBtn.addEventListener('click', () => {
    showScreen('screen-voice-wave');
    clearTimeout(speechTimeout);
    
    if (recognition) {
      try {
        recognition.start();
      } catch (err) {
        // Recognition already running or failed
        transcriptText.textContent = "Listening... Tap a trigger bubble.";
      }
    } else {
      transcriptText.innerHTML = "Web Speech API not supported.<br>Tap a bubble to simulate commands!";
    }
  });

  btnCancelVoice.addEventListener('click', () => {
    if (recognition) {
      try { recognition.stop(); } catch(e){}
    }
    showScreen('screen-dashboard');
    addAuditLog('Microphone Action', 'Speech input cancelled');
  });

  // Global trigger for the simulated command buttons
  window.triggerMockCommand = (cmdText) => {
    if (recognition) {
      try { recognition.stop(); } catch(e){}
    }
    processVoiceCommand(cmdText);
  };

  // Process the verbal commands
  function processVoiceCommand(commandText) {
    transcriptText.innerHTML = `Spoken: <span style="color:var(--jarvis-blue); font-weight:700;">"${commandText}"</span>`;
    addAuditLog('Speech Recognizer Result', `Heard: "${commandText}"`);
    
    setTimeout(() => {
      const cleanCmd = commandText.toLowerCase().trim();
      
      if (cleanCmd.includes('camera') || cleanCmd.includes('photo') || cleanCmd.includes('snap')) {
        assistantStatusText.textContent = "Launching camera, Sir.";
        speakText("Launching camera, Sir.");
        addAuditLog('Command Parser Execute', 'Route action to Camera module');
        setTimeout(() => {
          showScreen('screen-camera-overlay');
          startCamera();
        }, 1200);

      } else if (cleanCmd.includes('music') || cleanCmd.includes('song') || cleanCmd.includes('player')) {
        assistantStatusText.textContent = "Opening media player, Sir.";
        speakText("Opening media player, Sir.");
        addAuditLog('Command Parser Execute', 'Route action to Music player');
        setTimeout(() => {
          showScreen('screen-music-overlay');
          playMusic();
        }, 1200);

      } else if (cleanCmd.includes('call') || cleanCmd.includes('phone') || cleanCmd.includes('dial')) {
        let name = "Tony Stark";
        if (cleanCmd.includes('stark')) name = "Tony Stark";
        else if (cleanCmd.includes('pepper')) name = "Pepper Potts";
        else if (cleanCmd.includes('happy')) name = "Happy Hogan";
        
        assistantStatusText.textContent = `Connecting phone line to ${name}, Sir.`;
        speakText(`Connecting phone line to ${name}, Sir.`);
        addAuditLog('Command Parser Execute', `Route action to phone dialer: ${name}`);
        setTimeout(() => {
          showScreen('screen-call-overlay');
          startMockCall(name);
        }, 1200);

      } else if (cleanCmd.includes('history') || cleanCmd.includes('log') || cleanCmd.includes('audit')) {
        assistantStatusText.textContent = "Opening system logs, Sir.";
        speakText("Opening system logs, Sir.");
        addAuditLog('Command Parser Execute', 'Route action to Audit logging overlay');
        setTimeout(() => {
          showScreen('screen-history-overlay');
        }, 1200);

      } else if (cleanCmd.includes('hello') || cleanCmd.includes('hi') || cleanCmd.includes('assistant') || cleanCmd.includes('jarvis')) {
        assistantStatusText.textContent = "How can I help you, Sir?";
        speakText("Hello Sir. How can I assist you today?");
        addAuditLog('Command Parser Execute', 'Executed Greeting protocol');
        setTimeout(() => {
          showScreen('screen-dashboard');
        }, 1500);

      } else {
        assistantStatusText.textContent = "Command not recognized, Sir.";
        speakText("Command not recognized, Sir.");
        addAuditLog('Command Parser Error', `Unknown intent for: "${commandText}"`);
        setTimeout(() => {
          showScreen('screen-dashboard');
        }, 1500);
      }
    }, 1200);
  }

  // Speak response out loud using Web Speech Synthesis if available
  function speakText(text) {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel any running voice first
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.9; // Slightly deep masculine voice for Jarvis feel
      
      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.includes('en-US') && v.name.toLowerCase().includes('male'));
      if (engVoice) {
        utterance.voice = engVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  // Pre-load synthesis voices (browser async requirement sometimes)
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }

  // Update initial logs layout
  updateAuditLogUI();
});

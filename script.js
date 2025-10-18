// ====== FIREBASE SETUP ======
const firebaseConfig = {
  apiKey: "AIzaSyB3Cefg6WC13vzApcXV2bQHGafPWI5U6OE",
  authDomain: "sumpahpemudagenerator.firebaseapp.com",
  projectId: "sumpahpemudagenerator",
  storageBucket: "sumpahpemudagenerator.firebasestorage.app",
  messagingSenderId: "683978479123",
  appId: "1:683978479123:web:0929071ada382f168fd1e6",
  measurementId: "G-1KH65QSCP3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ====== DATA & FUNGSI PEMUATAN ======
const fallbackQuotes = [
  { text: "Beri aku 10 pemuda, niscaya akan kuguncangkan dunia.", author: "Soekarno" }
];
let quotesData = []; // Cache untuk semua kutipan gabungan

async function loadAllQuotes() {
  let localQuotes = []; let firebaseQuotes = [];
  try {
    const response = await fetch('pahlawan.json');
    const data = await response.json();
    localQuotes = data.flatMap(hero => hero.quotes.map(q => ({ text: q, author: hero.name })));
  } catch (error) { console.error("Gagal memuat pahlawan.json:", error); }
  try {
    const snapshot = await db.collection('quotes').get();
    if (!snapshot.empty) { firebaseQuotes = snapshot.docs.map(doc => doc.data()); }
  } catch (error) { console.error("Gagal mengambil dari Firebase:", error); }
  quotesData = [...localQuotes, ...firebaseQuotes];
}

async function getQuote() {
  if (quotesData.length === 0) { await loadAllQuotes(); }
  const sourceData = quotesData.length > 0 ? quotesData : fallbackQuotes;
  const randomData = sourceData[Math.floor(Math.random() * sourceData.length)];
  return `"${randomData.text}" - ${randomData.author}`;
}

// ====== VARIABEL DOM GLOBAL ======
const nameInput = document.getElementById("name"), cityInput = document.getElementById("city"),
      quoteEl = document.getElementById("quote"), buttonEl = document.querySelector("button"),
      copyButtonEl = document.getElementById("copyButton"), errorMessageEl = document.getElementById("error-message"),
      shareButtonsContainer = document.querySelector(".share-buttons"), shareTwitter = document.getElementById("share-twitter"),
      shareWhatsapp = document.getElementById("share-whatsapp"), downloadButtonEl = document.getElementById("downloadButton"),
      bgUploadInput = document.getElementById("bg-upload"), loaderEl = document.getElementById("loader"),
      resetBgBtn = document.getElementById("reset-bg"), qualitySelectEl = document.getElementById("quality-select"),
      quoteCardFlipper = document.getElementById("quote-card-flipper"), cardBackEl = document.querySelector(".card-back");
let finalMessageText = '';

// ====== FUNGSI UTAMA ======
async function generateQuote() {
  const name = nameInput.value.trim(), city = cityInput.value.trim();
  if (!name || !city) { errorMessageEl.textContent = "Isi nama dan kota dulu, bro!"; anime({ targets: !name ? nameInput : cityInput, translateX: [ { value: -10, duration: 50 }, { value: 10, duration: 100 }, { value: -10, duration: 100 }, { value: 10, duration: 100 }, { value: 0, duration: 50 } ] }); setTimeout(() => { errorMessageEl.textContent = ""; }, 3000); return; }
  localStorage.setItem('userName', name); localStorage.setItem('userCity', city);
  errorMessageEl.textContent = ""; buttonEl.disabled = true; buttonEl.textContent = "Mencari inspirasi...";
  quoteCardFlipper.classList.remove('is-flipped');
  setTimeout(async () => {
    const randomQuote = await getQuote();
    buttonEl.textContent = "Bangkitkan Semangat!"; buttonEl.disabled = false;
    const message = `${randomQuote}<br><br><strong>${name}</strong> dari <strong>${city}</strong> ikut bersumpah untuk berkarya bagi Indonesia 🇮🇩`;
    finalMessageText = `${randomQuote}\n\n${name} dari ${city} ikut bersumpah untuk berkarya bagi Indonesia 🇮🇩`;
    const encodedText = encodeURIComponent(finalMessageText);
    if(shareTwitter) shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodedText}`;
    if(shareWhatsapp) shareWhatsapp.href = `https://api.whatsapp.com/send?text=${encodedText}`;
    quoteEl.innerHTML = message;
    copyButtonEl.style.display = 'inline-block';
    if (shareButtonsContainer) { shareButtonsContainer.style.display = 'block'; }
    downloadButtonEl.style.display = 'inline-block'; qualitySelectEl.style.display = 'inline-block';
    quoteCardFlipper.classList.add('is-flipped'); document.title = `${randomQuote.substring(1, 30)}..." - Sumpah Pemuda Gen`;
  }, 400);
}

// ====== PENGATURAN EVENT LISTENER ======
document.addEventListener('DOMContentLoaded', () => {
    buttonEl.addEventListener('click', generateQuote);
    copyButtonEl.addEventListener('click', () => { navigator.clipboard.writeText(finalMessageText).then(() => { copyButtonEl.textContent = 'Berhasil disalin!'; setTimeout(() => { copyButtonEl.textContent = 'Salin Teks'; }, 2000); }).catch(err => { console.error('Gagal menyalin teks: ', err); alert('Gagal menyalin.'); }); });
    function handleEnterKey(event) { if (event.key === 'Enter') generateQuote(); }
    nameInput.addEventListener('keyup', handleEnterKey); cityInput.addEventListener('keyup', handleEnterKey);

    downloadButtonEl.addEventListener('click', () => {
      loaderEl.style.display = 'flex'; const scale = qualitySelectEl.value;
      quoteCardFlipper.classList.add('prepare-download');
      setTimeout(() => {
        html2canvas(cardBackEl, { scale: scale, useCORS: true, backgroundColor: null }).then(canvas => {
          const link = document.createElement('a');
          link.download = 'Sumpah-Pemudaku.png'; link.href = canvas.toDataURL("image/png"); link.click();
        }).finally(() => {
          quoteCardFlipper.classList.remove('prepare-download'); loaderEl.style.display = 'none';
        });
      }, 100);
    });

    bgUploadInput.addEventListener('change', (event) => {
      const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
      reader.onload = (e) => {
        cardBackEl.style.backgroundImage = `url('${e.target.result}')`; cardBackEl.style.backgroundSize = 'cover';
        cardBackEl.style.backgroundPosition = 'center'; quoteEl.style.color = '#FFFFFF';
        quoteEl.style.textShadow = '2px 2px 4px #000000'; resetBgBtn.style.display = 'inline';
      };
      reader.readAsDataURL(file);
    });

    resetBgBtn.addEventListener('click', () => {
      cardBackEl.style.backgroundImage = ''; cardBackEl.style.color = ''; cardBackEl.style.textShadow = '';
      bgUploadInput.value = ''; resetBgBtn.style.display = 'none';
    });

    const templateButtons = document.querySelectorAll('.template-btn');
    templateButtons.forEach(button => {
      button.addEventListener('click', () => {
        templateButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active');
        cardBackEl.className = 'card-face card-back';
        if (button.dataset.template !== 'default') { cardBackEl.classList.add(button.dataset.template); }
      });
    });

    const quoteTextInput = document.getElementById('quote-text'), quoteAuthorInput = document.getElementById('quote-author'),
          submitQuoteBtn = document.getElementById('submit-quote'), submitStatusEl = document.getElementById('submit-status');
    if (submitQuoteBtn) {
      submitQuoteBtn.addEventListener('click', async () => {
        const text = quoteTextInput.value.trim(), author = quoteAuthorInput.value.trim();
        if (!text || !author) { alert("Isi kutipan dan nama pahlawan dulu, bro!"); return; }
        submitQuoteBtn.disabled = true; submitStatusEl.textContent = "Mengirim...";
        try {
          await db.collection('quotes').add({ text: text, author: author, submittedAt: new Date() });
          submitStatusEl.textContent = "Terima kasih! Kutipanmu berhasil dikirim.";
          quoteTextInput.value = ''; quoteAuthorInput.value = ''; quotesData = [];
        } catch (error) { console.error("Gagal mengirim kutipan:", error); submitStatusEl.textContent = "Gagal mengirim."; }
        finally { submitQuoteBtn.disabled = false; }
      });
    }

    const feedbackTextInput = document.getElementById('feedback-text'), submitFeedbackBtn = document.getElementById('submit-feedback'),
          feedbackStatusEl = document.getElementById('feedback-status');
    if (submitFeedbackBtn) {
      submitFeedbackBtn.addEventListener('click', async () => {
        const feedback = feedbackTextInput.value.trim(); if (!feedback) { alert("Tulis saran dulu, bro!"); return; }
        submitFeedbackBtn.disabled = true; feedbackStatusEl.textContent = "Mengirim...";
        try {
          await db.collection('feedback').add({ text: feedback, submittedAt: new Date(), userAgent: navigator.userAgent });
          feedbackStatusEl.textContent = "Terima kasih atas masukannya!"; feedbackTextInput.value = '';
        } catch (error) { console.error("Gagal mengirim feedback:", error); feedbackStatusEl.textContent = "Gagal mengirim."; }
        finally { submitFeedbackBtn.disabled = false; }
      });
    }
});
/* AKHIR FILE JAVASCRIPT */
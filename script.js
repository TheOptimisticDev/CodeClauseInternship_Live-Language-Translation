document.addEventListener('DOMContentLoaded', function () {
    // Load the Google Cloud Translation API client library
    gapi.load('client', initTranslate);

    function initTranslate() {
        // Initialize the Google Cloud Translation API client
        gapi.client.init({
            apiKey: 'TRANSLATE_API_KEY',
            discoveryDocs: ['https://www.'],
        });
    }

    let mediaRecorder;
    let recordedChunks = [];

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(blob);

                    // Clear the recorded chunks for the next recording
                    recordedChunks = [];

                    // Translate the recorded text
                    translateAudio(blob);
                };

                mediaRecorder.start();
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
            });
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    }

    function translateAudio(audioBlob) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const base64Data = reader.result.split(',')[1];

            // Use the Google Cloud Speech-to-Text API for language detection
            const apiKey = 'GOOGLE_SPEECH_API_KEY';
            const apiUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio: {
                        content: base64Data,
                    },
                    config: {
                        encoding: 'LINEAR16',
                        sampleRateHertz: 16000,
                    },
                }),
            })
                .then(response => response.json())
                .then(data => {
                    const detectedLanguage = data.results[0].languageCode;

                    // detectedLanguage for translation
                    translateText(reader.result, detectedLanguage);
                })
                .catch(error => {
                    console.error('Error detecting language:', error);
                });
        };

        reader.readAsDataURL(audioBlob);
    }

    function translateText(textToTranslate, sourceLanguage) {
        // Google Cloud Translation API for translation
        gapi.client.translate.translations.list({
            q: textToTranslate,
            source: sourceLanguage,
            target: 'es', // Change this to the target language code
        }).then(response => {
            const translatedText = response.result.translations[0].translatedText;

            // Output the translated text
            document.getElementById('outputText').value = translatedText;

            // Read back the response using text-to-speech
            chatbotResponse(translatedText);
        }).catch(error => {
            console.error('Error translating text:', error);
        });
    }

    function chatbotResponse(translatedText) {
        // Simple chatbot
        const botResponse = getBotResponse(translatedText);

        // Read back the response using text-to-speech
        responsiveVoice.speak(botResponse, 'UK English Male', { rate: 0.8 });
    }

    function getBotResponse(userInput) {
        return `You said: ${userInput}. This is a simple chatbot response.`;
    }

    function toggleContactForm() {
        const contactForm = document.getElementById('contactForm');
        contactForm.style.display = (contactForm.style.display === 'block') ? 'none' : 'block';
    }    

    // Event listener for the help button
    document.getElementById('helpButton').addEventListener('click', toggleContactForm);

    // Event listener for the help form submission
    document.getElementById('helpForm').addEventListener('submit', function (event) {
        event.preventDefault();
    
        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
        };
    
        // Generate the mailto link
        const mailtoLink = `mailto:mabunda.wealth@gmail.com?subject=${encodeURIComponent('Contact Form Submission')}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`)}`;
    
        // Open the user's default email client
        window.location.href = mailtoLink;
    
        // Close the contact form after triggering the email client
        document.getElementById('contactForm').style.display = 'none';
    });    
});

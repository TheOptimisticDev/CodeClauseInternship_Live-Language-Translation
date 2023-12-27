document.addEventListener("DOMContentLoaded", function () {
    // Microsoft Translator API subscription key
    const subscriptionKey = "YOUR_MICROSOFT_TRANSLATOR_API_KEY";

    // Microsoft Translator API endpoint
    const endpoint = "https://api.cognitive.microsofttranslator.com/translate";

    // DOM elements
    const inputLanguageSelector = document.getElementById("input-language");
    const outputLanguageSelector = document.getElementById("output-language");
    const inputText = document.getElementById("input-text");
    const outputText = document.getElementById("output-text");
    const swapButton = document.querySelector(".swap-position");
    const inputCharsCount = document.getElementById("input-chars");

    // Event listeners
    inputText.addEventListener("input", updateCharsCount);
    swapButton.addEventListener("click", swapLanguages);
    inputLanguageSelector.addEventListener("click", toggleLanguageSelector);
    outputLanguageSelector.addEventListener("click", toggleLanguageSelector);

    // Fetch supported languages and populate selectors
    fetchLanguages();

    async function fetchLanguages() {
        try {
            // Fetch supported languages
            const response = await axios.get(
                "https://api.cognitive.microsofttranslator.com/languages?api-version=3.0"
            );

            // Extract language data
            const languages = response.data.translation;

            // Populate input language selector
            populateSelector(inputLanguageSelector, languages);

            // Populate output language selector
            populateSelector(outputLanguageSelector, languages);
        } catch (error) {
            console.error("Error fetching languages:", error);
        }
    }

    function populateSelector(selector, languages) {
        const optionsContainer = selector.querySelector(".options-container");
        Object.keys(languages).forEach(function (languageCode) {
            const language = languages[languageCode];
            const option = document.createElement("button");
            option.classList.add("option");
            option.textContent = language.name;
            option.setAttribute("data-value", languageCode);
            optionsContainer.appendChild(option);
        });
    }

    async function translateText() {
        const inputLanguage = inputLanguageSelector.querySelector(".selected").dataset.value;
        const outputLanguage = outputLanguageSelector.querySelector(".selected").dataset.value;
        const textToTranslate = inputText.value;

        try {
            // Perform translation
            const response = await axios.post(
                endpoint,
                [
                    {
                        text: textToTranslate,
                    },
                ],
                {
                    headers: {
                        "Ocp-Apim-Subscription-Key": subscriptionKey,
                        "Ocp-Apim-Subscription-Region": "your-region", // Replace with your Azure region
                        "Content-type": "application/json",
                    },
                    params: {
                        to: outputLanguage,
                    },
                }
            );

            // Update output text
            const translatedText = response.data[0].translations[0].text;
            outputText.value = translatedText;
        } catch (error) {
            console.error("Error translating text:", error);
        }
    }

    function updateCharsCount() {
        inputCharsCount.textContent = inputText.value.length;
    }

    function swapLanguages() {
        const inputSelected = inputLanguageSelector.querySelector(".selected");
        const outputSelected = outputLanguageSelector.querySelector(".selected");

        // Swap data-value attributes
        const tempValue = inputSelected.dataset.value;
        inputSelected.dataset.value = outputSelected.dataset.value;
        outputSelected.dataset.value = tempValue;

        // Swap display text
        const tempText = inputSelected.textContent;
        inputSelected.textContent = outputSelected.textContent;
        outputSelected.textContent = tempText;

        // Trigger translation with the updated languages
        translateText();
    }

    function toggleLanguageSelector(event) {
        const selector = event.currentTarget;
        const optionsContainer = selector.querySelector(".options-container");

        // Check if the optionsContainer exists before accessing its classList
        if (optionsContainer) {
            optionsContainer.classList.toggle("show-options");
        }
    }
});

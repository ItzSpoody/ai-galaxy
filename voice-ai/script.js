
const API_URL = "https://galaxy-voice-apii.master-raghav09.workers.dev/";

const scriptInput = document.getElementById("scriptInput");
const voiceSelect = document.getElementById("voiceSelect");
const styleSelect = document.getElementById("styleSelect");
const generateBtn = document.getElementById("generateBtn");
const statusMessage = document.getElementById("statusMessage");
const audioSection = document.getElementById("audioSection");
const audioPlayer = document.getElementById("audioPlayer");
const downloadBtn = document.getElementById("downloadBtn");

let currentAudioUrl = null;

generateBtn.addEventListener("click", async () => {
    const text = scriptInput.value.trim();

    if (!text) {
        statusMessage.textContent = "Please enter your script first!";
        return;
    }

    if (text.length > 5000) {
        statusMessage.textContent = "Maximum 5000 characters allowed.";
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    statusMessage.textContent = "Galaxy AI is creating your voiceover...";

    audioSection.hidden = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                voice: voiceSelect.value,
                style: styleSelect.value
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Voice generation failed.");
        }

        const audioBlob = await response.blob();

        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
        }

        currentAudioUrl = URL.createObjectURL(audioBlob);

        audioPlayer.src = currentAudioUrl;
        downloadBtn.href = currentAudioUrl;
        downloadBtn.download = "galaxy-voiceover.wav";

        audioSection.hidden = false;
        statusMessage.textContent = "Your voiceover is ready!";

    } catch (error) {
        console.error(error);
        statusMessage.textContent =
            "Error: " + error.message;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Voiceover";
    }
});

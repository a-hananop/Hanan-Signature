/**
 * voice.js — Hanan Signature ✦
 * Voice input using Web Speech API.
 */
"use strict";

const Voice = (() => {

  var recognition = null;
  var isListening = false;
  var voiceBtn    = null;

  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function setupRecognition() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous      = false;
    recognition.interimResults  = true;
    recognition.lang            = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      isListening = true;
      setListeningState(true);
      App.showToast("🎤 Listening… speak now");
    };
    recognition.onend = function () {
      isListening = false;
      setListeningState(false);
    };
    recognition.onerror = function (e) {
      isListening = false;
      setListeningState(false);
      var msgs = {
        "no-speech":           "No speech detected. Please try again.",
        "not-allowed":         "Microphone permission denied.",
        "network":             "Network error during voice recognition.",
        "audio-capture":       "No microphone found.",
        "service-not-allowed": "Voice recognition blocked by browser.",
      };
      App.showToast("🎤 " + (msgs[e.error] || "Voice error: " + e.error), "error");
    };
    recognition.onresult = function (e) {
      var inputEl = document.getElementById("chatInput");
      var interim = "", final = "";
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (inputEl) {
        inputEl.value = final || interim;
        inputEl.style.height = "auto";
        inputEl.style.height = Math.min(inputEl.scrollHeight, 130) + "px";
      }
      if (final.trim()) {
        setTimeout(function () { Chat.sendMsg(final.trim()); }, 150);
      }
    };
  }

  function toggle() {
    if (!isSupported()) {
      App.showToast("🎤 Voice not supported in this browser.", "error");
      return;
    }
    if (!recognition) setupRecognition();
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        recognition.abort();
        setTimeout(function () { recognition.start(); }, 100);
      }
    }
  }

  function setListeningState(active) {
    if (!voiceBtn) return;
    voiceBtn.classList.toggle("listening", active);
    voiceBtn.title     = active ? "Stop listening" : "Voice input";
    voiceBtn.innerHTML = active ? "🔴" : "🎤";
    voiceBtn.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function init() {
    var row = document.querySelector(".chat-input-row");
    if (!row) return;

    voiceBtn = document.createElement("button");
    voiceBtn.type      = "button";
    voiceBtn.className = "voice-btn";
    voiceBtn.title     = "Voice input";
    voiceBtn.innerHTML = "🎤";
    voiceBtn.setAttribute("aria-label", "Toggle voice input");
    voiceBtn.setAttribute("aria-pressed", "false");
    voiceBtn.addEventListener("click", toggle);

    var sendBtn = document.getElementById("sendBtn");
    if (sendBtn) row.insertBefore(voiceBtn, sendBtn);
    else row.appendChild(voiceBtn);

    if (!isSupported()) voiceBtn.style.display = "none";
  }

  return { init, toggle, isSupported };

})();

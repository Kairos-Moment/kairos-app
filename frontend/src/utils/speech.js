// frontend/src/utils/speech.js

// This function makes the browser speak a given text
export const speak = (text) => {
  if ('speechSynthesis' in window) {
    // 1. Cancel any currently speaking audio to avoid overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 2. Force the language to English to ensure consistency
    utterance.lang = 'en-US'; 
    
    // 3. Set standard rate/pitch (no variations)
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 

    // Note: We removed the "getVoices" logic. 
    // This forces the browser to use its single default system voice.

    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Speech synthesis is not supported in this browser.");
  }
};

// This function processes the user's command
export const processCommand = (command, insightData) => {
  if (!command) return;
  const lowerCaseCommand = command.toLowerCase();

  // --- GREETING ---
  if (lowerCaseCommand.includes('hello') || lowerCaseCommand.includes('hi')) {
    speak("Greetings. I am ready to assist.");
    return;
  }

  // --- READ INSIGHTS ---
  if (lowerCaseCommand.includes('read') && (lowerCaseCommand.includes('insight') || lowerCaseCommand.includes('message'))) {
    if (insightData && insightData.message) {
      speak(insightData.message);
    } else {
      speak("I am currently analyzing the flow of time. Please wait a moment.");
    }
    return;
  }

  // --- CHECK URGENCY (Specific Check) ---
  if (lowerCaseCommand.includes('urgent') || lowerCaseCommand.includes('alert')) {
    if (!insightData || !insightData.tasks) {
      speak("I cannot see your tasks right now.");
      return;
    }

    const urgentTasks = insightData.tasks.filter(t => t.is_urgent);

    if (urgentTasks.length > 0) {
      speak(`You have ${urgentTasks.length} urgent task${urgentTasks.length > 1 ? 's' : ''}. The first one is: ${urgentTasks[0].text}.`);
    } else {
      speak("You have no urgent alerts. Your schedule is under control.");
    }
    return;
  }

  // --- TOP PRIORITY ---
  if (lowerCaseCommand.includes('what') && (lowerCaseCommand.includes('priority') || lowerCaseCommand.includes('first task') || lowerCaseCommand.includes('do next'))) {
    if (insightData && insightData.tasks && insightData.tasks.length > 0) {
      const topTask = insightData.tasks[0];
      
      if (topTask.is_urgent) {
        speak(`Attention required. Your most urgent task is: ${topTask.text}. It is marked as ${topTask.due}.`);
      } else {
        speak(`Your current focus is: ${topTask.text}. It is ${topTask.due}.`);
      }
    } else {
      speak("Your horizon is clear. No high-priority tasks are pending.");
    }
    return;
  }

  // --- SUMMARY / COUNT ---
  if (lowerCaseCommand.includes('how many') && lowerCaseCommand.includes('task')) {
    if (insightData && insightData.tasks) {
      const count = insightData.tasks.length;
      if (count > 0) {
        speak(`I have identified ${count} high priority items for you.`);
      } else {
        speak("You have no high priority items pending.");
      }
    }
    return;
  }
  
  // Default fallback
  speak("I'm sorry, I didn't catch that.");
};
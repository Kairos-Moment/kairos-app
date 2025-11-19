// This function makes the browser speak a given text
export const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Adjust speed
      utterance.pitch = 1.1; // Adjust pitch
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis is not supported in this browser.");
    }
  };
  
  // This function processes the user's command
  export const processCommand = (command, insightData) => {
    const lowerCaseCommand = command.toLowerCase();
  
    if (lowerCaseCommand.includes('hello') || lowerCaseCommand.includes('hi')) {
      speak("Hello! How can I help you today?");
      return;
    }
  
    if (lowerCaseCommand.includes('read') && lowerCaseCommand.includes('insight')) {
      if (insightData && insightData.message) {
        speak(insightData.message);
      } else {
        speak("I don't have any insights for you right now.");
      }
      return;
    }
  
    if (lowerCaseCommand.includes('what') && (lowerCaseCommand.includes('top priority') || lowerCaseCommand.includes('first task'))) {
      if (insightData && insightData.tasks && insightData.tasks.length > 0) {
        const firstTask = insightData.tasks[0].text;
        speak(`Your top priority seems to be: ${firstTask}.`);
      } else {
        speak("Your schedule looks clear. A great time to plan ahead!");
      }
      return;
    }
    
    // Default fallback
    speak("I'm sorry, I didn't understand that command. Please try again.");
  };
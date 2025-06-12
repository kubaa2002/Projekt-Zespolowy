export default function getColor(communityName){
    const colors = [
        "#007BF5", "#A2B1BF", "#1A5591", "#153452", 
        "#5DADE2", "#3498DB", "#2E86C1", "#2874A6",
        "#1B4F72", "#85C1E9", "#AED6F1", "#D6EAF8",
        "#85929E", "#5D6D7E", "#34495E", "#2C3E50",
        "#7FB3D5", "#2980B9", "#2471A3", "#1F618D",
        "#1A5276", "#154360", "#B0C4DE", "#4682B4",
        "#6CA6CD", "#4169E1"
      ];

      if (!communityName || typeof communityName !== "string" || communityName.length === 0) {
        return colors[0]; 
      }
    
      const firstLetter = communityName[0].toUpperCase();
      const alphabetIndex = firstLetter.charCodeAt(0) - 65; 
    
      if (alphabetIndex < 0 || alphabetIndex >= 26) {
        return colors[0];
      }
    
      return colors[alphabetIndex];
}
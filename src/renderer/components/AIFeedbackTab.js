class AIFeedbackTab {
  constructor() {
    this.feedbackDisplay = document.getElementById('ai-feedback-display');
    this.progressIndicator = document.getElementById('ai-feedback-progress');
  }

  showProgress() {
    this.progressIndicator.style.display = 'block';
    this.feedbackDisplay.style.display = 'none';
  }

  hideProgress() {
    this.progressIndicator.style.display = 'none';
    this.feedbackDisplay.style.display = 'block';
  }

  updateFeedback(feedback) {
    this.feedbackDisplay.textContent = feedback;
  }
}

module.exports = AIFeedbackTab; 
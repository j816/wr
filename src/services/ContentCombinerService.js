const { CONTENT_COMBINER_CONFIG } = require('../config/contentCombinerConfig');

class ContentCombinerService {
  static combineContent(originalPrompt, userSubmission, evaluationCriteria) {
    const { separator, prefixes } = CONTENT_COMBINER_CONFIG;

    return (
      `${prefixes.originalPrompt}${originalPrompt}${separator}` +
      `${prefixes.userSubmission}${userSubmission}${separator}` +
      `${prefixes.evaluationCriteria}${evaluationCriteria}${separator}`
    );
  }
}

module.exports = ContentCombinerService; 
const { insert } = require("../database/mongodbhelper");

const submitInterviewTranscript = async (transcriptData) => {
  try {
    // Basic validation
    if (!transcriptData || typeof transcriptData !== 'object') {
      return {
        success: false,
        error: 'Invalid transcript data format'
      };
    }

    // Validate required fields
    const requiredFields = ['transcript'];
    for (const field of requiredFields) {
      if (!transcriptData[field]) {
        return {
          success: false,
          error: `Missing required field: ${field}`
        };
      }
    }

    const submission = {
      ...transcriptData,
      createdAt: new Date(),
      type: 'interviewTranscript'
    };

    const result = await insert(submission, 'Interview');
    
    if (result.error) {
      return {
        success: false,
        error: 'Failed to submit interview transcript: ' + (result.error.message || 'Database error')
      };
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to submit interview transcript: ' + error.message
    };
  }
};

const submitInterviewFeedback = async (feedbackData) => {
  try {
    // Basic validation
    if (!feedbackData || typeof feedbackData !== 'object') {
      return {
        success: false,
        error: 'Invalid feedback data format'
      };
    }

    // Validate required fields
    const requiredFields = ['feedback'];
    for (const field of requiredFields) {
      if (!feedbackData[field]) {
        return {
          success: false,
          error: `Missing required field: ${field}`
        };
      }
    }

    const submission = {
      ...feedbackData,
      createdAt: new Date(),
      type: 'interviewFeedback'
    };

    const result = await insert(submission, 'InterviewFeedback');
    
    if (result.error) {
      return {
        success: false,
        error: 'Failed to submit interview feedback: ' + (result.error.message || 'Database error')
      };
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to submit interview feedback: ' + error.message
    };
  }
};

module.exports = {
  submitInterviewTranscript,
  submitInterviewFeedback
};


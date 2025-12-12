const OpenAI = require('openai');

// Lazy initialization of OpenAI client to ensure env vars are loaded
let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: apiKey
    });
  }
  return openai;
};

const generateNextQuestion = async (requestBody) => {
    try {
        const { systemPrompt, assistantPrompt, context } = requestBody;
    
        // Validate required fields
        if (!systemPrompt || !assistantPrompt) {
          return {
            question: null,
            error: "Missing required fields: systemPrompt and assistantPrompt are required"
          };
        }
    
        console.log("🔵 Backend: Calling LLM for QUESTION generation...");
        console.log("Context:", context);
    
        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini", // cost-efficient, high quality for short text
          messages: [
            { role: "system", content: systemPrompt },
            { role: "assistant", content: assistantPrompt }
          ],
          temperature: 0.2, // keep questions stable and deterministic
          max_tokens: 60 // one sentence only
        });
    
        const question = response.choices[0].message.content.trim();
    
        console.log("🟢 Backend: LLM Question Output:", question);
    
        // Return the question string (frontend expects string or null)
        return { question };
    
      } catch (error) {
        console.error("🔴 Backend: LLM QUESTION GENERATION ERROR:", error);
        
        // Return null to match frontend expectation
        return { 
          question: null,
          error: error.message || "Failed to generate question"
        };
      }
}

const validateAnswer = async (requestBody) => {
    try {
        const { systemPrompt, validationPrompt, userAnswer, context } = requestBody;
    
        // Validate required fields
        if (!systemPrompt || !validationPrompt || !userAnswer) {
          return {
            isValidAnswer: false,
            error: "Missing required fields: systemPrompt, validationPrompt, and userAnswer are required"
          };
        }
    
        console.log("🔵 Backend: Calling LLM for ANSWER VALIDATION...");
    
        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" }, // CRITICAL - ensures JSON response
          messages: [
            { role: "system", content: systemPrompt },
            { role: "assistant", content: validationPrompt },
            { role: "user", content: userAnswer }
          ],
          temperature: 0.0 // classification → MUST be deterministic
        });
    
        const json = JSON.parse(response.choices[0].message.content);
    
        console.log("🟢 Backend: Validation result:", json);
    
        // Return the validation result object
        return json;
    
      } catch (error) {
        console.error("🔴 Backend: LLM ANSWER VALIDATION ERROR:", error);
        
        // Return error response matching frontend expectation
        return {
          isValidAnswer: false,
          reason: "LLM validation failed",
          followUpQuestion: null,
          error: error.message
        };
      }
}

const generateEvaluation = async (requestBody) => {
    try {
        const { evaluationPrompt, context } = requestBody;
    
        // Validate required fields
        if (!evaluationPrompt) {
          return {
            evaluation: null,
            error: "Missing required field: evaluationPrompt is required"
          };
        }
    
        console.log("🔵 Backend: Calling LLM for FINAL EVALUATION...");
    
        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: evaluationPrompt }
          ],
          temperature: 0.35, // light creativity allowed for writing tone
          max_tokens: 800 // enough for a detailed evaluation
        });
    
        const evaluation = response.choices[0].message.content.trim();
        
        console.log("🟢 Backend: Evaluation Generated");
    
        // Return the evaluation text string
        return { evaluation };
    
      } catch (error) {
        console.error("🔴 Backend: LLM EVALUATION ERROR:", error);
        
        return {
          evaluation: "Evaluation unavailable due to system error.",
          error: error.message
        };
      }
}

module.exports = {
    generateNextQuestion,
    validateAnswer,
    generateEvaluation
}
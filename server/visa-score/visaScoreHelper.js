const { insert, findById } = require("../database/mongodbhelper");

const submitVisaScore = async (scoreData) => {
  try {
    // Calculate visa score first
    const visaScoreResult = calculateVisaScore(scoreData);
    
    // Create freemium response with only nationality and travel scores
    const freemiumResponse = {
      total: visaScoreResult.total,
      breakdown: {
        nationality: visaScoreResult.breakdown.nationality,
        travel: visaScoreResult.breakdown.travel
      },
      isFreemium: true,
      message: "Complete your payment to see detailed breakdown and personalized recommendations"
    };
    
    const submission = {
      ...scoreData,
      visaScore: visaScoreResult, // Store full score internally
      freemiumScore: freemiumResponse, // Store freemium version
      createdAt: new Date(),
      type: 'visaScore'
    };

    const result = await insert(submission, 'VisaScores');
    return {
      success: true,
      data: result,
      visaScore: freemiumResponse // Return freemium version to user
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to submit visa score: ' + error.message
    };
  }
};

// Country tiers definition
const countryTiers = {
    Tier1: [
      "Australia", "Austria", "Belgium", "Canada", "Czech Republic", "Denmark", "Estonia",
      "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Italy", "Japan",
      "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "New Zealand", "Norway",
      "Poland", "Portugal", "Singapore", "Slovakia", "Slovenia", "Korea, South", "Spain",
      "Sweden", "Switzerland", "United Kingdom", "United States"
    ],
    Tier2: [
      "Argentina", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Chile", "Croatia", "Cyprus",
      "Georgia", "Indonesia", "Malaysia", "Mauritius", "Mexico", "Montenegro", "Qatar", "Romania",
      "Serbia", "South Africa", "Thailand", "Turkey", "United Arab Emirates", "Vietnam"
    ],
    Tier3: [
      "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Armenia",
      // ... rest of Tier3 countries
    ]
  };
  
  // Generate nationality scores based on tiers
  const nationalityScores = {};
  
  // Tier 1 countries (15 points)
  countryTiers.Tier1.forEach(country => {
    nationalityScores[country] = 15;
  });
  
  // Tier 2 countries (10 points)
  countryTiers.Tier2.forEach(country => {
    nationalityScores[country] = 10;
  });
  
  // Tier 3 countries (5 points)
  countryTiers.Tier3.forEach(country => {
    nationalityScores[country] = 5;
  });
  
  // Visa difficulty deductions
  const visaDifficultyDeductions = {
    // Very High Difficulty (-10 points)
    "United States": 10,
    "United Kingdom": 10,
    "Canada": 10,
  
    // High Difficulty (-6 points)
    "Australia": 6,
    "New Zealand": 6,
  
    // Medium Difficulty (-3 points)
    "Japan": 3,
    "Korea, South": 3, // Changed from "South Korea" to match our country list
    "China": 3,
    "Qatar": 3,
    "United Arab Emirates": 3,
    "Saudi Arabia": 3,
    "Singapore": 3, // Added Singapore to medium difficulty
  };
  
  // For Schengen Area countries (-6 points)
  const schengenCountries = [
    "Austria", "Belgium", "Czech Republic", "Denmark", "Estonia",
    "Finland", "France", "Germany", "Greece", "Hungary", "Iceland",
    "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
    "Netherlands", "Norway", "Poland", "Portugal", "Slovakia",
    "Slovenia", "Spain", "Sweden", "Switzerland"
  ];
  
  const calculateVisaScore = (data) => {
    let totalScore = 0;
    
    // 1. Nationality Score (Max 15 Points)
    const nationalityScore = nationalityScores[data.nationality] || 5;
    
    // 2. Travel History (Max 20 Points)
    const travelScore = (() => {
      let score = 0;
      // Calculate points based on country tiers
      data.countriesVisited.forEach(country => {
        if (countryTiers.Tier1.includes(country)) {
          score += 5; // 5 points for Tier 1 countries
        } else if (countryTiers.Tier2.includes(country)) {
          score += 2; // 2 points for Tier 2 countries
        } else if (countryTiers.Tier3.includes(country)) {
          score += 1; // 1 point for Tier 3 countries
        }
      });
      return Math.min(score, 20); // Cap at 20 points
    })();
  
    // 3. Financial Strength (Max 25 Points)
    const financialScore = (() => {
      let score = 0;
      
      if (data.visitPurpose === 'tourism') {
        // Monthly Income (7 points)
        switch (data.monthlyIncome) {
          case 'high':
            score += 7;
            break;
          case 'medium':
            score += 5;
            break;
          case 'low':
            score += 2;
            break;
          default:
            break;
        }
        // Bank Savings (6 points)
        switch (data.savings) {
          case 'high':
            score += 6;
            break;
          case 'medium':
            score += 4;
            break;
          case 'low':
            score += 2;
            break;
          default:
            break;
        }
        // Stable Employment (5 points) - Not applicable for retired persons
        if (data.hasStableEmployment === 'yes' && parseInt(data.age) <= 65) score += 5;
        // Sponsor Letter (3 points)
        if (data.hasSponsorLetter === 'yes') score += 3;
        // Assets (4 points)
        if (data.hasAssets === 'yes') score += 4;
        
        // Additional points for retired persons with strong financial profile
        if (parseInt(data.age) > 55 && data.monthlyIncome === 'high' && data.savings === 'high') {
          score += 5; // Bonus points for retired persons with strong finances
        }
      }
      else if (data.visitPurpose === 'study') {
        // Tuition Coverage (8 points)
        if (data.hasTuitionCovered === 'yes') {
          score += 8; // Full tuition paid
        } else if (data.hasTuitionCovered === 'partial') {
          score += 4; // Partial scholarship
        } else if (data.hasTuitionCovered === 'no') {
          score += 0; // No tuition coverage
        }

        // Source of Funding for Living Expenses (6 points)
        switch (data.hasSponsorIncome) {
          case 'self':
            score += 6; // Self-funded shows strong financial capability
            break;
          case 'family':
            score += 4; // Family support is good
            break;
          case 'scholarship':
            score += 5; // Scholarship is excellent
            break;
          case 'loan':
            score += 3; // Education loan is acceptable
            break;
        }

        // Available Funds (5 points)
        switch (data.hasEducationFunds) {
          case 'high':
            score += 5; // More than required amount
            break;
          case 'sufficient':
            score += 4; // Sufficient amount
            break;
          case 'minimum':
            score += 2; // Minimum required amount
            break;
          case 'low':
            score += 0; // Less than required amount
            break;
        }

        // Bank Statement (4 points)
        if (data.hasFamilyAssets === 'yes') {
          score += 4; // Shows proof of funds
        }

        // Additional Financial Support (4 points)
        const additionalSupport = data.hasScholarship || [];
        if (additionalSupport.includes('property')) score += 2;
        if (additionalSupport.includes('investments')) score += 1;
        if (additionalSupport.includes('sponsor')) score += 1;

        // Bonus points for strong overall financial profile (3 points)
        if (data.hasTuitionCovered === 'yes' && 
            (data.hasSponsorIncome === 'self' || data.hasSponsorIncome === 'scholarship') && 
            data.hasEducationFunds === 'high' && 
            data.hasFamilyAssets === 'yes') {
          score += 3; // Bonus for complete financial documentation
        }
      }
      else if (data.visitPurpose === 'business') {
        // Business Ownership/Income (8 points)
        if (data.hasBusinessProof === 'yes') score += 8;
        // Invitation Letter (5 points)
        if (data.hasBusinessInvitation === 'yes') score += 5;
        // Tax Returns/Finances (5 points)
        if (data.hasTaxReturns === 'yes') score += 5;
        // Personal Savings (4 points)
        switch (data.businessSavings) {
          case 'high':
            score += 4;
            break;
          case 'medium':
            score += 2;
            break;
          case 'low':
            score += 1;
            break;
          default:
            break;
        }
        // Insurance and Assets (3 points)
        if (data.hasInsuranceAndAssets === 'yes') score += 3;
        
        // Additional points for strong business profile
        if (data.hasBusinessProof === 'yes' && 
            data.hasBusinessInvitation === 'yes' && 
            data.hasTaxReturns === 'yes' && 
            data.businessSavings === 'high' && 
            data.hasInsuranceAndAssets === 'yes') {
          score += 5; // Bonus for complete business documentation
        }
      }
      else if (data.visitPurpose === 'work') {
        // Job Offer Letter (10 points)
        if (data.hasJobOffer === 'yes') score += 10;
        // Previous Employment (5 points)
        if (data.hasPreviousEmployment === 'yes') score += 5;
        // Relocation Funds (5 points)
        switch (data.relocationFunds) {
          case 'high':
            score += 5;
            break;
          case 'medium':
            score += 3;
            break;
          case 'low':
            score += 1;
            break;
          default:
            break;
        }
        // Assets/Family Backup (3 points)
        if (data.hasWorkAssets === 'yes') score += 3;
        // Sponsor Letter (2 points)
        if (data.hasWorkSponsor === 'yes') score += 2;
      }
  
      return Math.min(score, 25);
    })();
  
    // 4. Ties to Home Country (Max 15 Points)
    const tiesScore = (() => {
      let score = 0;
      // Family Ties (5 points)
      if (data.hasImmediateFamily === 'yes') score += 5;
      // Employment/Business Ties (5 points)
      if (data.hasJobOffer === 'yes') score += 5;
      // Long-term Commitments (5 points)
      if (data.hasLongTermCommitments === 'yes') score += 5;
      return Math.min(score, 15);
    })();
  
    // 5. Purpose & Documents Preparedness (Max 15 Points)
    const documentScore = (() => {
      let score = 0;
      // Clear Purpose (5 points)
      if (data.visitPurpose && data.visitPurpose !== '' && data.visitPurpose !== 'other') score += 5;
      
      // Document scoring (10 points total)
      if (data.documents.includes('bankStatements')) score += 4;
      if (data.documents.includes('coverLetter')) score += 4;
      if (data.documents.includes('reservations')) score += 2;
      
      return Math.min(score, 15);
    })();
  
    // 6. Risk Factors (Max 10 Points)
    const riskScore = (() => {
      let score = 0;
      
      // Age and Gender Risk Assessment
      const age = parseInt(data.age);
      const isTier4or5Country = nationalityScores[data.nationality] <= 5;
      
      // Student-specific scoring
      if (data.visitPurpose === 'study') {
        // Strong student profile with all financial requirements
        if (data.hasTuitionCovered === 'yes' && 
            data.hasSponsorIncome === 'yes' && 
            data.hasEducationFunds === 'yes' && 
            data.hasScholarship === 'yes') {
          score += 10;
        }
        // Good student profile with most requirements
        else if (data.hasTuitionCovered === 'yes' && 
                 data.hasSponsorIncome === 'yes' && 
                 (data.hasEducationFunds === 'yes' || data.hasScholarship === 'yes')) {
          score += 8;
        }
        // Basic student profile
        else if (data.hasTuitionCovered === 'yes' || data.hasSponsorIncome === 'yes') {
          score += 5;
        }
      }
      // Non-student scoring
      else {
        // Age-based scoring
        if (age >= 25 && age <= 45 && 
            (data.occupation === 'employed' || data.occupation === 'self-employed')) {
          score += 10;
        } else if (age >= 46 && age <= 55) {
          score += 8;
        } else if (age >= 18 && age <= 24) {
          // Check for strong documentation and ties
          const hasStrongDocs = data.documents.length >= 4;
          const hasStrongTies = data.hasImmediateFamily === 'yes' && data.hasLongTermCommitments === 'yes';
          if (hasStrongDocs && hasStrongTies) {
            score += 7;
          }
        } else if (age > 55) {
          // Retired with stable finances
          const hasStableFinances = data.monthlyIncome === 'high' && data.savings === 'high';
          const hasStrongTies = data.hasImmediateFamily === 'yes' && data.hasLongTermCommitments === 'yes';
          const hasAssets = data.hasAssets === 'yes';
          
          if (hasStableFinances && hasStrongTies && hasAssets) {
            score += 10; // Maximum points for retired persons with strong profile
          } else if (hasStableFinances && (hasStrongTies || hasAssets)) {
            score += 8; // Good points for retired persons with partial strong profile
          } else if (hasStableFinances) {
            score += 6; // Basic points for retired persons with stable finances
          }
        } else if (age < 18) {
          // Under 18 without family support
          if (data.hasImmediateFamily !== 'yes') {
            score += 2;
          } else {
            score += 4;
          }
        }
  
        // Additional points for business travelers with strong profile
        if (data.visitPurpose === 'business' && 
            data.hasBusinessProof === 'yes' && 
            data.hasBusinessInvitation === 'yes' && 
            data.hasTaxReturns === 'yes' && 
            data.businessSavings === 'high' && 
            data.hasInsuranceAndAssets === 'yes') {
          score += 8; // Points for strong business profile
        }
      }
  
      // Single male under 30 from Tier 4-5 countries
      if (data.gender === 'male' && age < 30 && isTier4or5Country) {
        const hasStrongProfile = data.savings === 'above20000' && 
                               data.hasJobOffer === 'yes' && 
                               data.hasAssets === 'yes';
        if (!hasStrongProfile) {
          score += 2;
        } else {
          score += 5; // More points if they have strong financial profile
        }
      }
  
      // Standard risk factors
      if (data.hasVisaDenialHistory === 'yes') score -= 5;
      if (data.hasConfirmedAccommodation === 'no') score -= 2;
      if (data.hasTravelItinerary === 'no') score -= 1;
  
      return Math.min(score, 10);
    })();
  
    // Calculate total score before visiting country deduction
    totalScore = nationalityScore + travelScore + financialScore + 
                tiesScore + documentScore + riskScore;
  
    // 7. Visiting Country Difficulty Deduction
    const visitingCountryScore = (() => {
      let deduction = 0;
      
      // Check for direct matches in visaDifficultyDeductions
      if (visaDifficultyDeductions.hasOwnProperty(data.visitingCountry)) {
        deduction = visaDifficultyDeductions[data.visitingCountry];
      }
      // Check for Schengen Area countries
      else if (schengenCountries.includes(data.visitingCountry)) {
        deduction = 6; // High Difficulty for Schengen Area
      }
  
      // Apply the deduction
      return -deduction;
    })();
  
    // Apply visiting country deduction to total score
    totalScore += visitingCountryScore;
    
    // Ensure total score doesn't go below 0
    totalScore = Math.min(Math.max(totalScore, 0), 100);
  
    return {
      total: totalScore,
      breakdown: {
        nationality: nationalityScore,
        travel: travelScore,
        financial: financialScore,
        ties: tiesScore,
        documents: documentScore,
        risk: riskScore,
        visitingCountry: visitingCountryScore
      }
    };
  };

const generateReport = (scoreData, formData = {}) => {
  const { breakdown } = scoreData;
  const suggestions = [];

  // Travel History (Max 20)
  if (breakdown.travel < 10) {
      suggestions.push({
          title: "Improve Your Travel History",
          text: "Your travel history score is low. Visiting more countries, especially well-regarded ones (like in Europe, North America, or Australia), can significantly strengthen your profile. Even trips to nearby countries can help."
      });
  }

  // Financial Strength (Max 25)
  if (breakdown.financial < 15) {
      let text = "Your financial score could be improved. Ensure you provide clear evidence of sufficient funds for your trip. Based on your purpose of travel, consider the following: <ul>";
      if (scoreData.visitPurpose === 'tourism') {
          text += "<li>Provide bank statements for the last 6 months showing a healthy and stable balance.</li>";
          if (!scoreData.hasStableEmployment || scoreData.hasStableEmployment === 'no') text += "<li>If employed, a letter from your employer confirming your position and salary.</li>";
          if (!scoreData.hasAssets || scoreData.hasAssets === 'no') text += "<li>Documents showing ownership of assets (property, car, investments).</li>";
          if (!scoreData.hasSponsorLetter || scoreData.hasSponsorLetter === 'no') text += "<li>If sponsored, a formal sponsor letter and the sponsor's financial documents.</li>";
      } else if (scoreData.visitPurpose === 'study') {
          text += "<li>Proof that tuition fees are fully paid is a significant plus.</li>";
          if (scoreData.hasTuitionCovered !== 'yes') text += "<li>If you have a partial scholarship, provide the award letter.</li>";
          text += "<li>Your sponsor's financial documents must be strong and clearly show their ability to support you.</li>";
          text += "<li>Show evidence of sufficient funds for your entire planned stay.</li>";
      } else if (scoreData.visitPurpose === 'business') {
          text += "<li>Provide strong company financial statements and tax returns for the last 1-2 years.</li>";
          if (!scoreData.hasBusinessInvitation || scoreData.hasBusinessInvitation === 'no') text += "<li>A formal invitation letter from the business partner in the destination country is crucial.</li>";
          text += "<li>Show proof of personal savings and assets as a backup.</li>";
      } else if (scoreData.visitPurpose === 'work') {
          if (!scoreData.hasJobOffer || scoreData.hasJobOffer === 'no') text += "<li>A valid job offer from a reputable company is the most important document.</li>";
          text += "<li>Provide evidence of sufficient funds to cover relocation and initial living costs until you receive your first salary.</li>";
          text += "<li>Show proof of personal assets or financial backup from family.</li>";
      } else {
           text += "<li>Provide bank statements showing a stable and sufficient balance.</li>";
           text += "<li>Show proof of a stable income or source of funds.</li>";
      }
      text += "</ul>";
      suggestions.push({
          title: "Strengthen Your Financial Profile",
          text: text
      });
  }

  // Ties to Home Country (Max 15)
  if (breakdown.ties < 10) {
      suggestions.push({
          title: "Demonstrate Stronger Ties to Your Home Country",
          text: "It's critical to convince the visa officer that you will return home after your visit. Strengthen this area by providing: <ul><li>Evidence of immediate family (spouse, children) residing in your home country (e.g., birth/marriage certificates).</li><li>A letter from your employer stating you have a job to return to.</li><li>Proof of property ownership or significant long-term investments at home.</li></ul>"
      });
  }

  // Documents Preparedness (Max 15)
  if (breakdown.documents < 10) {
      suggestions.push({
          title: "Improve Your Document Preparedness",
          text: "A complete and well-organized application makes a strong impression. Make sure you include: <ul><li>A detailed, well-written cover letter explaining your purpose of travel and itinerary.</li><li>Bank statements for the last 3-6 months.</li><li>Flight and hotel reservations (you can get these without payment).</li></ul>"
      });
  }

  // Risk Factors (Max 10)
  if (breakdown.risk < 7) {
      suggestions.push({
          title: "Address Potential Risk Factors",
          text: "Your profile may have elements that visa officers perceive as high-risk (this can be related to age, marital status, or previous visa denials). To mitigate this, it's essential to make other parts of your application exceptionally strong, especially your financial standing and ties to your home country."
      });
  }
  
  // Visiting Country Difficulty
  if (breakdown.visitingCountry < -6) { // e.g. -10 for US
       suggestions.push({
          title: "Acknowledge the High Visa Difficulty",
          text: `The country you are visiting has very strict visa policies, which has deducted ${Math.abs(breakdown.visitingCountry)} points from your score. This means your application must be impeccable. Double-check every single requirement and provide as much supporting evidence as you can for all your claims.`
      });
  }

  if (suggestions.length === 0) {
      return `
          <div class="improvements">
              <h3>Congratulations on a Strong Profile!</h3>
              <p>Your visa profile appears to be very strong. Based on our assessment, you have a high chance of success. Ensure all your documents are genuine, well-organized, and you present your case clearly and confidently to the visa officer. Good luck!</p>
          </div>
      `;
  }

  let html = `
      <div class="improvements">
        <h2>How to Improve Your Score</h2>
        <p>Based on your profile, here are some suggestions to strengthen your visa application:</p>
  `;
  suggestions.forEach(suggestion => {
      html += `
          <div class="suggestion-item">
              <h3>${suggestion.title}</h3>
              <div>${suggestion.text}</div>
          </div>
      `;
  });
  html += '</div>';

  return html;
};

module.exports = {
  calculateVisaScore,
  submitVisaScore,
  generateReport
}; 

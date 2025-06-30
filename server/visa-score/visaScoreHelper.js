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
      type: 'visaScore',
      isPaid: false
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

function renderDestinationAdvice(destination) {
  const destinationAdvice = {
    "Schengen": {
      riskLevel: "high",
      rejectionCauses: [
        "fake or unverifiable hotel/flight bookings",
        "insufficient bank balance",
        "unclear itinerary or travel purpose"
      ],
      tips: [
        "Book travel insurance with at least €30,000 coverage.",
        "Create a day-by-day itinerary that matches your bookings.",
        "Bank statements should reflect enough funds to cover €60–100/day."
      ]
    },
    "United States": {
      riskLevel: "very_high",
      rejectionCauses: [
        "weak home country ties",
        "vague or suspicious trip purpose",
        "inconsistencies in previous applications or interviews"
      ],
      tips: [
        "Clearly explain your visit in the DS-160 form.",
        "Prepare for a short interview with truthful answers.",
        "Show job, family, or property ties to your home country."
      ]
    },
    "United Kingdom": {
      riskLevel: "high",
      rejectionCauses: [
        "insufficient proof of income or funds",
        "unclear travel itinerary",
        "lack of home country obligations"
      ],
      tips: [
        "Provide recent bank statements showing funds well above your expected expenses.",
        "If studying, include CAS, TB test, and tuition payment proof.",
        "Include a strong cover letter outlining your itinerary and intent to return.",
        "Employment letters and property ownership documents strengthen your ties."
      ]
    },
    "Canada": {
      riskLevel: "high",
      rejectionCauses: [
        "insufficient funds (especially for study)",
        "weak home ties",
        "vague or inconsistent study or work plans"
      ],
      tips: [
        "For student visas, provide proof of tuition payment and GIC.",
        "Include a Statement of Purpose clearly explaining your study plan.",
        "If visiting family, include an invitation letter and their status documents.",
        "Highlight ties to your home country, such as job offers or family obligations."
      ]
    },
    "Australia": {
      riskLevel: "high",
      rejectionCauses: [
        "low financial capability",
        "unverifiable documents",
        "no compelling reason to return"
      ],
      tips: [
        "Submit evidence of strong income, savings, or financial sponsorship.",
        "If on a tourist visa, provide a solid trip plan and hotel bookings.",
        "Your employment and assets in your home country support your case.",
        "Avoid vague purposes — be clear and specific in your cover letter."
      ]
    },
    "Japan": {
      riskLevel: "medium",
      rejectionCauses: [
        "insufficient itinerary details",
        "missing financial proof",
        "unverified bookings"
      ], 
      tips: [
        "Your itinerary should include exact travel dates and locations.",
        "Include hotel and flight confirmations (even temporary bookings).",
        "Provide recent bank statements showing sufficient funds.",
        "For group or family travel, submit documents for all travelers together."
      ]
    },
    "South Korea": {
      riskLevel: "medium",
      rejectionCauses: [
        "unclear travel purpose",
        "incomplete bank documentation",
        "lack of home country ties"
      ], 
      tips: [
        "Submit a full itinerary, even if short.",
        "Ensure your bank documents match your declared employment or business.",
        "Traveling with family or coworkers? Submit all documents together.",
        "Employment or academic certificates help boost credibility."
      ]
    },
    "United Arab Emirates": {
      riskLevel: "medium",
      rejectionCauses: [
        "fake hotel bookings",
        "unclear purpose",
        "prior overstays"
      ], 
      tips: [
        "Use an agent or official website for visa issuance if required.",
        "Submit valid hotel and flight bookings.",
        "A clear purpose (business/tourism/family visit) helps avoid rejection.",
        "Avoid last-minute applications to prevent suspicion."
      ]
    },
    "Saudi Arabia": {
      riskLevel: "medium",
      rejectionCauses: [
        "lack of travel history",
        "religious or family status ambiguity",
        "unclear travel intent"
      ], 
      tips: [
        "Apply through the official portal and upload all supporting documents.",
        "If applying for Umrah, include travel agent booking and sponsor letter (if needed).",
        "Avoid inconsistencies in passport or travel history.",
        "Show ties to home country, even for short visits."
      ]
    },
    "Turkey": {
      riskLevel: "medium",
      rejectionCauses: [
        "low financial capability",
        "unrealistic travel plan",
        "prior visa denials"
      ], 
      tips: [
        "Provide proof of hotel bookings and return flights.",
        "Make sure you have bank balance to cover ~$50/day.",
        "Avoid applying if recently denied by Schengen/US/UK — wait and improve your profile.",
        "State your travel companions and planned duration clearly."
      ]
    }
};
  const advice = destinationAdvice[destination];
  if (!advice) return '';

  let html = `
    <div class="destination-advice warning">
      <h2>Important notes about ${destination}</h2>
      <p><strong>Risk Level:</strong> ${advice.riskLevel.replace('_', ' ').toUpperCase()}</p>
      <p><strong>Common Rejection Reasons:</strong></p>
      <ul>`;
  advice.rejectionCauses.forEach(reason => {
    html += `<li>${reason}</li>`;
  });
  html += `</ul><p><strong>Tips to Improve Your Application:</strong></p><ul>`;
  advice.tips.forEach(tip => {
    html += `<li>${tip}</li>`;
  });
  html += `</ul></div>`;

  return html;
}


const generateReport = (scoreData) => {
  const { breakdown } = scoreData.visaScore;
  const suggestions = [];

  const getComment = (score, category) => {
    const bands = {
      travel: [
        [15, 20, "You have an excellent travel history, which strongly supports your application. Visits to stable, visa-friendly countries are a big plus."],
        [10, 14, "Your travel history is decent. Adding more travel to countries with strong visa reputations can further improve your profile."],
        [0, 9, "Your travel history is limited. This may raise concerns about your global mobility experience."]
      ],
      financial: [
        [20, 25, "You appear financially strong and well-prepared to support your trip."],
        [15, 19, "Your finances are adequate but could be improved to enhance confidence in your ability to fund your travel."],
        [0, 14, "Your financial documentation may be insufficient. Visa officers could question your ability to afford your trip."]
      ],
      ties: [
        [12, 15, "You have demonstrated strong ties to your home country, reducing perceived overstay risk."],
        [8, 11, "Your home ties are moderate. Additional proof of obligations at home can boost your case."],
        [0, 7, "Limited ties to home country could make your application riskier in the eyes of the visa officer."]
      ],
      documents: [
        [12, 15, "Your documents appear complete and well-organized."],
        [8, 11, "Some key documents are in place, but consider adding more proof to improve clarity."],
        [0, 7, "Your documentation is lacking or incomplete. Strengthen this area with a full set of supporting files."]
      ],
      risk: [
        [8, 10, "No major red flags detected in your profile."],
        [5, 7, "There are some moderate concerns in your profile. Mitigating them with strong evidence is advised."],
        [0, 4, "Multiple risk factors may affect your application's success."]
      ],
      visitingCountry: [
        [-10, -7, "The country you are visiting has very strict visa requirements. Make sure all aspects of your application are very strong."],
        [-6, -3, "You are applying for a visa to a moderately difficult country. Pay close attention to documentation."],
        [-2, 0, "The destination country's visa requirements are relatively lenient. Still, ensure your application is thorough."]
      ]
    };

    for (const [min, max, msg] of bands[category]) {
      if (score >= min && score <= max) return msg;
    }
    return '';
  };

  
  

  // ----------------------------
  // Build "How You Scored"
  // ----------------------------
  let scoreHtml = `<div class="improvements recommendation">
    <h2>How You Scored</h2>`;
  
  const categoryMaxPoints = {
    travel: 20,
    financial: 25,
    ties: 15,
    documents: 15,
    risk: 10,
    visitingCountry: 0 // This can be negative, so we'll handle it specially
  };
  
  ['travel', 'financial', 'ties', 'documents', 'risk', 'visitingCountry'].forEach((category) => {
    const score = breakdown[category];
    const maxPoints = categoryMaxPoints[category];
    const label = {
      travel: "Travel History",
      financial: "Financial Strength",
      ties: "Ties to Home Country",
      documents: "Documentation",
      risk: "Risk Factors",
      visitingCountry: "Visiting Country Difficulty"
    }[category];

    // Special handling for visitingCountry since it can be negative
    let pointsDisplay;
    if (category === 'visitingCountry') {
      pointsDisplay = `${score} points (deduction)`;
    } else {
      pointsDisplay = `${score}/${maxPoints} points`;
    }

    scoreHtml += `
      <div class="suggestion-item">
        <h3>${label} (${pointsDisplay})</h3>
        <div>${getComment(score, category)}</div>
      </div>`;
  });
  scoreHtml += `</div>`;

  // ----------------------------
  // Build Suggestions (if needed)
  // ----------------------------

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
      if (scoreData.hasStableEmployment !== 'yes') text += "<li>Include a letter from your employer confirming your position and salary.</li>";
      if (scoreData.hasAssets !== 'yes') text += "<li>Show ownership of assets like property, vehicles, or investments.</li>";
      if (scoreData.hasSponsorLetter !== 'yes') text += "<li>If sponsored, include a sponsor letter and their financials.</li>";
    } else if (scoreData.visitPurpose === 'study') {
      text += "<li>Proof of tuition fee payment is essential.</li>";
      if (scoreData.hasTuitionCovered !== 'yes') text += "<li>Include a scholarship award letter if applicable.</li>";
      text += "<li>Your sponsor's financial documents must clearly show sufficient funding.</li>";
    } else if (scoreData.visitPurpose === 'business') {
      text += "<li>Include business financial statements and tax returns.</li>";
      if (scoreData.hasBusinessInvitation !== 'yes') text += "<li>An invitation letter from your business partner is essential.</li>";
    } else if (scoreData.visitPurpose === 'work') {
      if (scoreData.hasJobOffer !== 'yes') text += "<li>Include a valid job offer from a reputable company.</li>";
      text += "<li>Provide proof of funds for relocation and initial living expenses.</li>";
    }
    text += "</ul>";
    suggestions.push({ title: "Strengthen Your Financial Profile", text });
  }

  // Ties to Home Country (Max 15)
  if (breakdown.ties < 10) {
    suggestions.push({
      title: "Demonstrate Stronger Ties to Your Home Country",
      text: "It's critical to convince the visa officer that you will return home after your visit. Provide: <ul><li>Proof of family (spouse/children) in your home country.</li><li>A job letter showing ongoing employment.</li><li>Property or investment ownership documents.</li></ul>"
    });
  }

  // Documents Preparedness (Max 15)
  if (breakdown.documents < 10) {
    suggestions.push({
      title: "Improve Your Document Preparedness",
      text: "Make sure you include: <ul><li>Cover letter explaining your trip purpose.</li><li>Recent bank statements (3–6 months).</li><li>Flight and hotel reservations (provisional bookings accepted).</li></ul>"
    });
  }

  // Risk Factors (Max 10)
  if (breakdown.risk < 7) {
    suggestions.push({
      title: "Address Potential Risk Factors",
      text: "Your profile may have elements that visa officers perceive as risky. Make other parts of your application exceptionally strong — especially finances and home ties."
    });
  }

  // Visiting Country Difficulty
  if (breakdown.visitingCountry < -6) {
    suggestions.push({
      title: "Acknowledge the High Visa Difficulty",
      text: `The country you are visiting has very strict visa policies, which deducted ${Math.abs(breakdown.visitingCountry)} points. Make your application bulletproof.`
    });
  }

  // ----------------------------
  // Final HTML Output
  // ----------------------------
  if (suggestions.length === 0) {
    return `
      ${scoreHtml}
      <div class="improvements success">
        <h3>Congratulations on a Strong Profile!</h3>
        <p>Your visa profile appears to be very strong. Based on our assessment, you have a high chance of success. Ensure all your documents are genuine, well-organized, and you present your case clearly and confidently to the visa officer.</p>
      </div>
    `;
  }

  let suggestionsHtml = `
    <div class="improvements recommendation">
      <h2>How to Improve Your Score</h2>
      <p>Here are suggestions to strengthen your application:</p>`;
  suggestions.forEach(suggestion => {
    suggestionsHtml += `
      <div class="suggestion-item">
        <h3>${suggestion.title}</h3>
        <div>${suggestion.text}</div>
      </div>`;
  });
  suggestionsHtml += `</div>`;
  
  const destinationAdviceHtml = renderDestinationAdvice(scoreData.visitingCountry);
  // Append it to the final report
  return scoreHtml + suggestionsHtml + destinationAdviceHtml;
  
};


module.exports = {
  calculateVisaScore,
  submitVisaScore,
  generateReport
}; 

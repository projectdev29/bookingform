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
      nationality: [
        [
          15, 15,
          "You hold a passport from a Tier 1 country, which is highly trusted by visa authorities. This significantly strengthens your application and reduces perceived risk."
        ],
        [
          10, 10,
          "You are from a Tier 2 country. While not among the highest-trust nationalities, it is generally well-regarded and poses a moderate risk profile to visa officers."
        ],
        [
          5, 5,
          "You are from a Tier 3 country. Applications from these nationalities may face closer scrutiny, so it's important to ensure that other aspects of your application are especially strong."
        ]
      ],
      travel: [
        [
          15, 20,
          "You have a strong travel history, especially to countries with strict visa policies. This demonstrates good travel compliance and enhances trust in your application."
        ],
        [
          10, 14,
          "You have a fair travel record. Visiting countries with strong visa reputations in the future can further strengthen your profile."
        ],
        [
          0, 9,
          "Your travel history is limited, which may raise concerns about your experience with international travel. Consider building this over time with shorter trips."
        ]
      ],
      
      financial: [
        [
          20, 25,
          "Your financial profile appears strong, indicating sufficient funds to support your travel and return. This reduces financial risk in the eyes of the visa officer."
        ],
        [
          15, 19,
          "You demonstrate reasonable financial readiness. Increasing savings or showcasing more supporting documents could further boost confidence."
        ],
        [
          0, 14,
          "Your current financial information may raise concerns about your ability to fund your trip. Consider providing clearer or stronger financial proof."
        ]
      ],      
      ties: [
        [
          12, 15,
          "You have established strong ties to your home country, which helps assure the visa officer of your intent to return after your visit."
        ],
        [
          8, 11,
          "Your ties are moderately convincing. Consider providing more evidence of obligations or long-term connections at home."
        ],
        [
          0, 7,
          "Limited ties to your home country could raise overstay concerns. Strengthening this area is recommended."
        ]
      ],
      documents: [
        [
          12, 15,
          "Your documentation is well-prepared and appears complete. This contributes positively to your application's credibility."
        ],
        [
          8, 11,
          "You have submitted most of the required documents. Consider including additional evidence to add clarity and completeness."
        ],
        [
          0, 7,
          "Missing or unclear documents may weaken your case. Aim to provide a comprehensive and well-organized set of materials."
        ]
      ],
      
      risk: [
        [
          8, 10,
          "No major risk indicators are present in your profile. This supports a favorable assessment by visa authorities."
        ],
        [
          5, 7,
          "Some moderate concerns exist, such as gaps in documentation or profile inconsistencies. Addressing these proactively is advisable."
        ],
        [
          -10, 4,
          "Multiple red flags may reduce your application's chances. Strengthening all possible areas and providing strong evidence is critical."
        ]
      ],
      
      visitingCountry: [
        [
          -10, -7,
          "Your chosen destination has strict visa requirements. Ensure every part of your application is exceptionally strong and well-documented."
        ],
        [
          -6, -3,
          "You are applying to a country with moderate visa difficulty. Careful attention to detail and thorough documentation are still important."
        ],
        [
          -2, 0,
          "The destination is generally lenient in visa approvals. However, a complete and accurate application remains essential."
        ]
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
    nationality: 15,
    travel: 20,
    financial: 25,
    ties: 15,
    documents: 15,
    risk: 10,
    visitingCountry: 0 // This can be negative, so we'll handle it specially
  };
  
  ['nationality', 'travel', 'financial', 'ties', 'documents', 'risk', 'visitingCountry'].forEach((category) => {
    const score = breakdown[category];
    const maxPoints = categoryMaxPoints[category];
    const label = {
      nationality: "Nationality",
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
  if (breakdown.travel < 9) {
    suggestions.push({
      title: "Improve Your Travel History",
      text: `
        Your travel history is currently limited, which may prompt additional scrutiny from visa officers. A strong travel record helps demonstrate that you're likely to respect visa rules and return on time.
    
        <ul>
          <li>Consider taking trips to countries with straightforward visa processes to build credibility.</li>
          <li>Maintain complete documentation for each trip, including entry/exit stamps, visas, and travel itineraries.</li>
          <li>When possible, highlight past trips with valid returns and no overstays.</li>
        </ul>
    
        If you're applying for a visa to a stricter country, ensure that other parts of your application — especially finances, home ties, and documents — are particularly strong.
      `
    });    
  } else if (breakdown.travel < 15) {
    suggestions.push({
      title: "Strengthen Your Travel Record",
      text: `
        You have some travel experience, which helps, but your profile could benefit from a more extensive or diverse history. Visa officers often look for consistency and reliability in travel patterns.
    
        <ul>
          <li>Continue traveling to well-regarded or stable countries and keeping records of your trips.</li>
          <li>Demonstrate past visa compliance — no overstays, timely returns, and complete documents.</li>
          <li>Include any work-related or educational trips in your record, if relevant.</li>
        </ul>
    
        A stronger travel history can provide confidence in your reliability as a traveler, especially when applying to destinations with tighter scrutiny.
      `
    });    
  } else {
    scoreComments.push({
      title: "Strong Travel History",
      text: `
        Your travel history is excellent. It reflects consistency, responsible travel behavior, and compliance with past visa requirements. This strengthens your overall application profile.
    
        <ul>
          <li>Continue maintaining detailed documentation of each trip.</li>
          <li>If applying for a more scrutinized destination, reference past successful visas in your cover letter.</li>
        </ul>
      `
    });
    
  }

  // Financial Strength (Max 25)
  if (breakdown.financial < 15) {
    
    suggestions.push({
      title: "Strengthen Your Financial Profile",
      text: `
        Your financial documentation currently appears insufficient, which could raise doubts about your ability to fund your travel. Visa officers often rely on financial proof to assess whether an applicant can afford the trip and is likely to return.
    
        <p>To improve your financial credibility, we recommend the following:</p>
        <ul>
          <li>Submit 6 months of recent bank statements showing a stable and healthy balance.</li>
          <li>Include salary slips or a letter from your employer confirming your role and income.</li>
          <li>Add proof of owned assets such as property, investments, or vehicles.</li>
          <li>If sponsored, attach a formal sponsor letter and their financial documents.</li>
        </ul>
    
        ${
          scoreData.visitPurpose === 'tourism'
            ? `<p>For tourist visas, demonstrating personal financial independence is especially important.</p>`
            : scoreData.visitPurpose === 'study'
            ? `<p>For study visas, include tuition payment receipts or scholarship letters, and ensure the sponsor's income meets the cost of living requirements in the destination country.</p>`
            : scoreData.visitPurpose === 'work'
            ? `<p>For work visas, submit a valid job offer and evidence of funds to cover relocation and the first few months of expenses.</p>`
            : scoreData.visitPurpose === 'business'
            ? `<p>For business visas, include business tax returns, financial statements, and a formal business invitation letter if available.</p>`
            : ''
        }
    
        <p>Strong financial documentation not only proves your ability to afford the trip but also strengthens your overall reliability in the eyes of the visa officer.</p>
      `
    });
    
  } else if (breakdown.financial < 20) {
    suggestions.push({
      title: "Enhance Your Financial Readiness",
      text: `
        Your financial situation appears acceptable, but improvements could increase confidence in your application. Visa officers may expect a higher level of detail depending on your travel purpose and destination.
    
        <ul>
          <li>Ensure your bank statements reflect a consistent and sufficient balance.</li>
          <li>If employed, include a salary certificate or employment letter.</li>
          <li>Add documentation for any assets or passive income.</li>
          <li>If someone else is funding your trip, provide their financials and a formal sponsorship letter.</li>
        </ul>
    
        ${
          scoreData.visitPurpose === 'tourism'
            ? `<p>For tourism, higher balances and longer banking history can reduce risk concerns.</p>`
            : scoreData.visitPurpose === 'study'
            ? `<p>For study visas, financial coverage for tuition and living expenses should be clearly demonstrated.</p>`
            : scoreData.visitPurpose === 'work'
            ? `<p>For work visas, showing enough funds to cover your transition period adds strength to your case.</p>`
            : scoreData.visitPurpose === 'business'
            ? `<p>For business travel, include business financials and any revenue or partnership documentation.</p>`
            : ''
        }
    
        <p>While your finances are not a red flag, enhancing your documentation will improve your chances.</p>
      `
    });
    
  } else {
    scoreComments.push({
      title: "Strong Financial Profile",
      text: `
        Your financial profile is well-documented and demonstrates your ability to fund your travel independently and responsibly. This is a key strength in your application.
    
        <ul>
          <li>Bank statements and assets are sufficient and clearly presented.</li>
          <li>If sponsored, your supporting documents show a reliable and capable sponsor.</li>
        </ul>
    
        ${
          scoreData.visitPurpose === 'study'
            ? `<p>Your funding plan for tuition and living expenses appears complete. Be sure to submit receipts and scholarship letters where relevant.</p>`
            : scoreData.visitPurpose === 'work'
            ? `<p>Your job offer and transition finances make your relocation plan credible and low-risk.</p>`
            : ''
        }
    
        Keep your documents consistent, up to date, and aligned with the purpose of your visit.
      `
    });
    
  }

  // Ties to Home Country (Max 15)
  if (breakdown.ties < 8) {
    suggestions.push({
      title: "Demonstrate Stronger Ties to Your Home Country",
      text: `
        Visa officers need confidence that applicants will return to their home country after the trip. Right now, your profile shows limited evidence of such ties, which can raise concerns about overstay risk.
    
        <p>To improve this area, consider submitting:</p>
        <ul>
          <li><strongEmployment Proof:</strong> A letter from your current employer stating your position, salary, and expected return date.</li>
          <li><strong>Family Ties:</strong> Marriage certificate, children's birth certificates, or dependent documents proving immediate family remains in your home country.</li>
          <li><strong>Property or Investments:</strong> Documents showing ownership of real estate, land, or significant long-term financial investments.</li>
          <li><strong>Educational Commitments:</strong> If studying, include an enrollment letter and exam schedule or academic plan.</li>
        </ul>
    
        <p>Establishing strong and verifiable ties will significantly enhance your application's credibility.</p>
      `
    });
  } else if (breakdown.ties < 12) {
    suggestions.push({
      title: "Reinforce Your Home Country Commitments",
      text: `
        Your application shows some connection to your home country, but additional documentation could further reduce perceived risk.
    
        <p>Consider the following enhancements:</p>
        <ul>
          <li>Attach a job letter confirming your current employment and expected return.</li>
          <li>Include documents showing family living with or dependent on you in your home country.</li>
          <li>If you own property, provide legal documents such as title deeds or utility bills in your name.</li>
        </ul>
    
        <p>The stronger your visible ties, the lower the perceived overstay risk—especially for tourist or temporary visit visas.</p>
      `
    });
  } else {
    scoreComments.push({
      title: "Strong Home Country Ties",
      text: `
        Your profile shows solid connections to your home country, which is a major positive in your visa application. This significantly reduces overstay concerns for the reviewing officer.
    
        <ul>
          <li>Your employment, family, or property ties are clearly documented and verifiable.</li>
          <li>Make sure all submitted documents remain current and are easy to cross-check (e.g., employment verification, lease deeds, or utility bills).</li>
        </ul>
    
        Maintaining and accurately presenting these ties will continue to work in your favor.
      `
    });    
    
  }

  // Documents Preparedness (Max 15)
  if (breakdown.documents < 10) {
    suggestions.push({
      title: "Significantly Improve Your Document Preparation",
      text: `
        Your submitted documentation appears incomplete or insufficient, which may weaken your application. Visa officers place high importance on a well-organized and thorough application file.
    
        <p>Ensure you include the following essential items:</p>
        <ul>
          <li><strong>Cover Letter:</strong> A well-written letter outlining your travel purpose, itinerary, and funding sources.</li>
          <li><strong>Bank Statements:</strong> 3–6 months of recent financial records showing sufficient and consistent funds.</li>
          <li><strong>Travel Itinerary:</strong> Day-by-day schedule that matches your bookings and trip purpose.</li>
          <li><strong>Flight and Hotel Reservations:</strong> Confirmed or provisional bookings (even without full payment).</li>
          <li><strong>Insurance:</strong> Travel or medical insurance with coverage as required by the destination country.</li>
        </ul>
    
        <p>Organize these documents clearly, use consistent names across all files, and avoid any ambiguity or missing information.</p>
      `
    });
    
  } else if (breakdown.documents < 12) {
    suggestions.push({
      title: "Enhance Document Clarity and Completeness",
      text: `
        Your application includes many of the required documents, but there's room for improvement in clarity, consistency, or supporting detail.
    
        <p>To strengthen your case, we recommend:</p>
        <ul>
          <li>Revising your <strong>cover letter</strong> to clearly explain your purpose of travel, who is funding the trip, and return plans.</li>
          <li>Ensuring <strong>bank statements</strong> are up-to-date, in your name, and free of large unexplained deposits.</li>
          <li>Aligning your <strong>itinerary</strong> with actual flight and hotel reservations.</li>
          <li>Adding any <strong>optional documents</strong> like employment letters, school enrollment, or sponsor affidavits.</li>
        </ul>
    
        <p>Clear, verifiable, and well-presented documentation can significantly reduce doubts in a visa officer's mind.</p>
      `
    });
    
    
  } else {
    scoreComments.push({
      title: "Well-Prepared Documentation",
      text: `
        Your submitted documents appear complete, well-organized, and aligned with your travel purpose. This adds credibility to your application and helps the visa officer make a quick, favorable assessment.
    
        <ul>
          <li>Ensure all files remain consistent in name, date, and purpose.</li>
          <li>Keep physical and digital copies readily accessible in case of further review or interview.</li>
        </ul>
    
        Good documentation is a strong foundation of any successful visa application.
      `
    });
    
  }

  // Risk Factors (Max 10)
  if (breakdown.risk < 5) {
    suggestions.push({
      title: "Address Serious Risk Factors in Your Profile",
      text: `
        Your profile contains several risk indicators that could negatively impact your visa application. These risks may include factors such as:
        <ul>
          <li>Lack of travel history or previous visa rejections</li>
          <li>Young, single applicants without stable income or assets</li>
          <li>Overstays or immigration violations in the past</li>
        </ul>
    
        <p>To improve your chances:</p>
        <ul>
          <li>Ensure your documentation is complete, truthful, and verifiable</li>
          <li>Strengthen ties to your home country through job letters, property ownership, or family obligations</li>
          <li>Demonstrate clear intent to return with a compelling cover letter</li>
          <li>If possible, show progress since any previous visa refusal (e.g., stronger finances, more travel)</li>
        </ul>
    
        <p>While risk cannot be fully eliminated, reinforcing other areas of your profile can help offset it.</p>
      `
    });
    
  } else if (breakdown.risk < 8) {
    suggestions.push({
      title: "Mitigate Moderate Risk Indicators",
      text: `
        Your profile shows some risk factors that could raise questions during the visa evaluation process. These may include a short travel history, limited financial history, or unclear intent.
    
        <p>To strengthen your application:</p>
        <ul>
          <li>Double-check all documentation for consistency and completeness</li>
          <li>Include strong supporting documents for employment, family, or property</li>
          <li>Use your cover letter to proactively address any unusual circumstances (e.g., gaps in employment, previous visa refusals)</li>
        </ul>
    
        <p>Visa officers are trained to look for red flags — a proactive and transparent approach can improve your credibility.</p>
      `
    });
    
  } else {
    scoreComments.push({
      title: "Low-Risk Applicant Profile",
      text: `
        Your profile appears stable and low-risk from a visa officer's perspective. There are no major red flags that stand out, which is a positive sign for your application.
    
        <ul>
          <li>Continue to maintain consistency across your documentation</li>
          <li>Avoid last-minute changes to your itinerary or supporting documents</li>
        </ul>
    
        A low-risk profile, combined with strong financials and ties to home, gives your application a solid foundation.
      `
    });
     
  }

  // Visiting Country Difficulty
  if (breakdown.visitingCountry < -6) {
    suggestions.push({
      title: "Navigating a Strict Visa Destination",
      text: `
        The country you're applying to has very stringent visa requirements and a high rejection rate. This means your application will be reviewed closely, and any inconsistencies may lead to a denial.
    
        <p>To improve your chances:</p>
        <ul>
          <li>Ensure all documents are genuine, well-organized, and consistent</li>
          <li>Include a clear, concise cover letter explaining your travel purpose and plans</li>
          <li>Support every claim with evidence — for example, if employed, include a letter from your employer</li>
          <li>Anticipate questions a visa officer might have and preemptively address them in your application</li>
        </ul>
    
        <p>While the destination is known for being selective, a thoroughly prepared and transparent application can still succeed.</p>
      `
    });
    
  } else if (breakdown.visitingCountry < -2) {
    suggestions.push({
      title: "Prepare Thoroughly for a Moderately Challenging Visa",
      text: `
        The country you're applying to has moderately strict visa policies. Applications are approved if the documentation is strong and your intent is clearly stated.
    
        <p>To enhance your application:</p>
        <ul>
          <li>Ensure your travel plans are well-documented (flights, hotel, itinerary)</li>
          <li>Include proof of sufficient financial resources and ties to your home country</li>
          <li>Demonstrate clarity and consistency in your reason for visiting</li>
        </ul>
    
        A well-prepared application that addresses potential concerns directly can lead to a positive outcome.
      `
    });

  } else {
    scoreComments.push({
      title: "Favorable Destination Choice",
      text: `
        You're applying to a destination that generally has a more accessible visa process. This works in your favor, provided your application is complete and truthful.
    
        <ul>
          <li>Don’t let the leniency lead to carelessness — strong documentation is still essential</li>
          <li>Clearly outline your plans and support them with reliable evidence</li>
        </ul>
    
        With a solid application, your choice of destination increases your likelihood of visa success.
      `
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

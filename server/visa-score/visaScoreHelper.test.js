const { calculateVisaScore } = require('./visaScoreHelper');

describe('Visa Score Calculator Tests', () => {
  // Test Case 1: Strong Professional from Tier 1 Country
  test('Strong Professional from UK applying to Australia', () => {
    const applicant1 = {
      email: 'john.smith@email.com',
      fullName: 'John Smith',
      age: '35',
      gender: 'male',
      nationality: 'United Kingdom',
      visitPurpose: 'work',
      visitingCountry: 'Australia',
      countriesVisited: ['United States', 'Canada', 'Japan', 'Singapore'],
      hasJobOffer: 'yes',
      hasPreviousEmployment: 'yes',
      relocationFunds: 'high',
      hasWorkAssets: 'yes',
      hasWorkSponsor: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant1);
    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBe(-6); // High difficulty
  });

  // Test Case 2: Young Student from Tier 2 Country
  test('Student from Brazil applying to Canada', () => {
    const applicant2 = {
      email: 'maria.silva@email.com',
      fullName: 'Maria Silva',
      age: '22',
      gender: 'female',
      nationality: 'Brazil',
      visitPurpose: 'study',
      visitingCountry: 'Canada',
      countriesVisited: ['Argentina', 'Chile'],
      hasTuitionCovered: 'yes',
      hasSponsorIncome: 'yes',
      hasEducationFunds: 'yes',
      hasFamilyAssets: 'yes',
      hasScholarship: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant2);
    expect(result.total).toBeGreaterThanOrEqual(64);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-10); // Very high difficulty
  });

  // Test Case 3: Tourist from Tier 3 Country with Weak Profile
  test('Tourist from India with weak profile applying to UK', () => {
    const applicant3 = {
      email: 'raj.kumar@email.com',
      fullName: 'Raj Kumar',
      age: '28',
      gender: 'male',
      nationality: 'India',
      visitPurpose: 'tourism',
      visitingCountry: 'United Kingdom',
      countriesVisited: [],
      monthlyIncome: 'low',
      savings: 'low',
      hasStableEmployment: 'no',
      hasSponsorLetter: 'no',
      hasAssets: 'no',
      hasImmediateFamily: 'no',
      hasLongTermCommitments: 'no',
      documents: ['reservations'],
      hasConfirmedAccommodation: 'no',
      hasTravelItinerary: 'no',
      hasVisaDenialHistory: 'yes'
    };

    const result = calculateVisaScore(applicant3);
    expect(result.total).toBeLessThan(50);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-10); // Very high difficulty
  });

  // Test Case 4: Business Professional from UAE
  test('Business Professional from UAE applying to Schengen Area', () => {
    const applicant4 = {
      email: 'ahmed.hassan@email.com',
      fullName: 'Ahmed Hassan',
      age: '45',
      gender: 'male',
      nationality: 'United Arab Emirates',
      visitPurpose: 'business',
      visitingCountry: 'Germany',
      countriesVisited: ['United States', 'United Kingdom', 'France', 'China'],
      hasBusinessProof: 'yes',
      hasBusinessInvitation: 'yes',
      hasTaxReturns: 'yes',
      businessSavings: 'high',
      hasInsuranceAndAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant4);
    expect(result.total).toBeGreaterThanOrEqual(75);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-6); // High difficulty (Schengen)
  });

  // Test Case 5: Retired Person from Japan
  test('Retired person from Japan applying to US', () => {
    const applicant5 = {
      email: 'tanaka.yuki@email.com',
      fullName: 'Tanaka Yuki',
      age: '68',
      gender: 'female',
      nationality: 'Japan',
      visitPurpose: 'tourism',
      visitingCountry: 'United States',
      countriesVisited: ['China', 'Korea, South', 'Thailand', 'Singapore'],
      monthlyIncome: 'high',
      savings: 'high',
      hasStableEmployment: 'no',
      hasSponsorLetter: 'no',
      hasAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant5);
    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBe(-10); // Very high difficulty
  });

  // Test Case 6: Young Professional from Singapore
  test('Young Professional from Singapore applying to Japan', () => {
    const applicant6 = {
      email: 'li.wei@email.com',
      fullName: 'Li Wei',
      age: '29',
      gender: 'female',
      nationality: 'Singapore',
      visitPurpose: 'work',
      visitingCountry: 'Japan',
      countriesVisited: ['Australia', 'New Zealand', 'Korea, South'],
      hasJobOffer: 'yes',
      hasPreviousEmployment: 'yes',
      relocationFunds: 'high',
      hasWorkAssets: 'yes',
      hasWorkSponsor: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant6);
    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBe(-3); // Medium difficulty
  });

  // Test Case 7: Student from China
  test('Student from China applying to Australia', () => {
    const applicant7 = {
      email: 'zhang.wei@email.com',
      fullName: 'Zhang Wei',
      age: '24',
      gender: 'male',
      nationality: 'China',
      visitPurpose: 'study',
      visitingCountry: 'Australia',
      countriesVisited: ['Japan', 'Korea, South'],
      hasTuitionCovered: 'yes',
      hasSponsorIncome: 'yes',
      hasEducationFunds: 'yes',
      hasFamilyAssets: 'no',
      hasScholarship: 'no',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant7);
    expect(result.total).toBeGreaterThanOrEqual(60);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-6); // High difficulty
  });

  // Test Case 8: Business Person from Germany
  test('Business Person from Germany applying to UAE', () => {
    const applicant8 = {
      email: 'klaus.mueller@email.com',
      fullName: 'Klaus Mueller',
      age: '52',
      gender: 'male',
      nationality: 'Germany',
      visitPurpose: 'business',
      visitingCountry: 'United Arab Emirates',
      countriesVisited: ['United States', 'China', 'Saudi Arabia', 'Qatar'],
      hasBusinessProof: 'yes',
      hasBusinessInvitation: 'yes',
      hasTaxReturns: 'yes',
      businessSavings: 'high',
      hasInsuranceAndAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant8);
    expect(result.total).toBeGreaterThanOrEqual(75);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBe(-3); // Medium difficulty
  });

  // Test Case 9: Tourist from Mexico with Previous Denial
  test('Tourist from Mexico with previous visa denial applying to Canada', () => {
    const applicant9 = {
      email: 'carlos.garcia@email.com',
      fullName: 'Carlos Garcia',
      age: '32',
      gender: 'male',
      nationality: 'Mexico',
      visitPurpose: 'tourism',
      visitingCountry: 'Canada',
      countriesVisited: ['United States'],
      monthlyIncome: 'medium',
      savings: 'medium',
      hasStableEmployment: 'yes',
      hasSponsorLetter: 'no',
      hasAssets: 'no',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'yes'
    };

    const result = calculateVisaScore(applicant9);
    expect(result.total).toBeLessThan(70);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-10); // Very high difficulty
  });

  // Test Case 10: Young Professional from Australia
  test('Young Professional from Australia applying to UK', () => {
    const applicant10 = {
      email: 'sarah.wilson@email.com',
      fullName: 'Sarah Wilson',
      age: '27',
      gender: 'female',
      nationality: 'Australia',
      visitPurpose: 'work',
      visitingCountry: 'United Kingdom',
      countriesVisited: ['United States', 'Canada', 'New Zealand', 'Singapore'],
      hasJobOffer: 'yes',
      hasPreviousEmployment: 'yes',
      relocationFunds: 'high',
      hasWorkAssets: 'yes',
      hasWorkSponsor: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant10);
    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBe(-10); // Very high difficulty
  });

  // Test Case 11: Young Professional from South Korea applying to Singapore
  test('Young Professional from South Korea applying to Singapore', () => {
    const applicant11 = {
      email: 'kim.minji@email.com',
      fullName: 'Kim Minji',
      age: '28',
      gender: 'female',
      nationality: 'Korea, South',
      visitPurpose: 'work',
      visitingCountry: 'Singapore',
      countriesVisited: ['Japan', 'Australia', 'United States'],
      hasJobOffer: 'yes',
      hasPreviousEmployment: 'yes',
      relocationFunds: 'high',
      hasWorkAssets: 'yes',
      hasWorkSponsor: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant11);
    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBe(-3); // Medium difficulty
  });

  // Test Case 12: Student from Thailand applying to New Zealand
  test('Student from Thailand applying to New Zealand', () => {
    const applicant12 = {
      email: 'somchai.wong@email.com',
      fullName: 'Somchai Wong',
      age: '20',
      gender: 'male',
      nationality: 'Thailand',
      visitPurpose: 'study',
      visitingCountry: 'New Zealand',
      countriesVisited: ['Malaysia', 'Singapore'],
      hasTuitionCovered: 'yes',
      hasSponsorIncome: 'yes',
      hasEducationFunds: 'yes',
      hasFamilyAssets: 'yes',
      hasScholarship: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant12);
    expect(result.total).toBeGreaterThanOrEqual(65);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-6); // High difficulty
  });

  // Test Case 13: Business Person from Turkey applying to Japan
  test('Business Person from Turkey applying to Japan', () => {
    const applicant13 = {
      email: 'ahmet.yilmaz@email.com',
      fullName: 'Ahmet Yilmaz',
      age: '45',
      gender: 'male',
      nationality: 'Turkey',
      visitPurpose: 'business',
      visitingCountry: 'Japan',
      countriesVisited: ['Germany', 'France', 'United Arab Emirates'],
      hasBusinessProof: 'yes',
      hasBusinessInvitation: 'yes',
      hasTaxReturns: 'yes',
      businessSavings: 'high',
      hasInsuranceAndAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant13);
    expect(result.total).toBeGreaterThanOrEqual(75);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-3); // Medium difficulty
  });

  // Test Case 14: Tourist from Malaysia with Previous Denial
  test('Tourist from Malaysia with previous visa denial applying to Australia', () => {
    const applicant14 = {
      email: 'lim.wei@email.com',
      fullName: 'Lim Wei',
      age: '35',
      gender: 'male',
      nationality: 'Malaysia',
      visitPurpose: 'tourism',
      visitingCountry: 'Australia',
      countriesVisited: ['Singapore', 'Thailand', 'Indonesia'],
      monthlyIncome: 'high',
      savings: 'high',
      hasStableEmployment: 'yes',
      hasSponsorLetter: 'no',
      hasAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'yes'
    };

    const result = calculateVisaScore(applicant14);
    expect(result.total).toBeGreaterThanOrEqual(50);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-6); // High difficulty
  });

  // Test Case 15: Young Professional from India applying to Canada
  test('Young Professional from India applying to Canada', () => {
    const applicant15 = {
      email: 'priya.sharma@email.com',
      fullName: 'Priya Sharma',
      age: '27',
      gender: 'female',
      nationality: 'India',
      visitPurpose: 'work',
      visitingCountry: 'Canada',
      countriesVisited: ['United States', 'United Kingdom', 'Singapore'],
      hasJobOffer: 'yes',
      hasPreviousEmployment: 'yes',
      relocationFunds: 'high',
      hasWorkAssets: 'yes',
      hasWorkSponsor: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant15);
    expect(result.total).toBeGreaterThanOrEqual(60);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-10); // Very high difficulty
  });

  // Test Case 16: Student from Vietnam applying to France
  test('Student from Vietnam applying to France', () => {
    const applicant16 = {
      email: 'nguyen.hoa@email.com',
      fullName: 'Nguyen Hoa',
      age: '22',
      gender: 'female',
      nationality: 'Vietnam',
      visitPurpose: 'study',
      visitingCountry: 'France',
      countriesVisited: ['Thailand', 'Malaysia'],
      hasTuitionCovered: 'yes',
      hasSponsorIncome: 'yes',
      hasEducationFunds: 'yes',
      hasFamilyAssets: 'yes',
      hasScholarship: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant16);
    expect(result.total).toBeGreaterThanOrEqual(65);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-6); // High difficulty (Schengen)
  });

  // Test Case 17: Business Person from South Africa applying to China
  test('Business Person from South Africa applying to China', () => {
    const applicant17 = {
      email: 'john.smith@email.com',
      fullName: 'John Smith',
      age: '48',
      gender: 'male',
      nationality: 'South Africa',
      visitPurpose: 'business',
      visitingCountry: 'China',
      countriesVisited: ['United Kingdom', 'United Arab Emirates', 'Singapore'],
      hasBusinessProof: 'yes',
      hasBusinessInvitation: 'yes',
      hasTaxReturns: 'yes',
      businessSavings: 'high',
      hasInsuranceAndAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant17);
    expect(result.total).toBeGreaterThanOrEqual(75);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-3); // Medium difficulty
  });

  // Test Case 18: Tourist from Indonesia with Weak Profile
  test('Tourist from Indonesia with weak profile applying to Japan', () => {
    const applicant18 = {
      email: 'budi.wijaya@email.com',
      fullName: 'Budi Wijaya',
      age: '25',
      gender: 'male',
      nationality: 'Indonesia',
      visitPurpose: 'tourism',
      visitingCountry: 'Japan',
      countriesVisited: ['Malaysia'],
      monthlyIncome: 'low',
      savings: 'low',
      hasStableEmployment: 'no',
      hasSponsorLetter: 'no',
      hasAssets: 'no',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'no',
      documents: ['reservations'],
      hasConfirmedAccommodation: 'no',
      hasTravelItinerary: 'no',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant18);
    expect(result.total).toBeLessThan(50);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-3); // Medium difficulty
  });

  // Test Case 19: Young Professional from Philippines applying to UK
  test('Young Professional from Philippines applying to UK', () => {
    const applicant19 = {
      email: 'maria.santos@email.com',
      fullName: 'Maria Santos',
      age: '29',
      gender: 'female',
      nationality: 'Philippines',
      visitPurpose: 'work',
      visitingCountry: 'United Kingdom',
      countriesVisited: ['Singapore', 'Hong Kong', 'Japan'],
      hasJobOffer: 'yes',
      hasPreviousEmployment: 'yes',
      relocationFunds: 'high',
      hasWorkAssets: 'yes',
      hasWorkSponsor: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant19);
    expect(result.total).toBeGreaterThanOrEqual(60);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-10); // Very high difficulty
  });

  // Test Case 20: Student from Pakistan applying to Germany
  test('Student from Pakistan applying to Germany', () => {
    const applicant20 = {
      email: 'ali.khan@email.com',
      fullName: 'Ali Khan',
      age: '23',
      gender: 'male',
      nationality: 'Pakistan',
      visitPurpose: 'study',
      visitingCountry: 'Germany',
      countriesVisited: ['United Arab Emirates', 'Malaysia'],
      hasTuitionCovered: 'yes',
      hasSponsorIncome: 'yes',
      hasEducationFunds: 'yes',
      hasFamilyAssets: 'yes',
      hasScholarship: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };

    const result = calculateVisaScore(applicant20);
    expect(result.total).toBeGreaterThanOrEqual(60);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-6); // High difficulty (Schengen)
  });

  // Test Case 21: Elderly tourist from Nigeria with strong finances applying to United States
  test('Elderly tourist from Nigeria with strong finances applying to United States', () => {
    const applicant21 = {
      email: 'oluwatobi.ade@email.com',
      fullName: 'Oluwatobi Ade',
      age: '70',
      gender: 'male',
      nationality: 'Nigeria',
      visitPurpose: 'tourism',
      visitingCountry: 'United States',
      countriesVisited: ['United Kingdom', 'France', 'South Africa'],
      monthlyIncome: 'high',
      savings: 'high',
      hasStableEmployment: 'no',
      hasSponsorLetter: 'no',
      hasAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant21);
    expect(result.total).toBeGreaterThanOrEqual(60);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-10);
  });

  // Test Case 22: Young male from Afghanistan with weak profile applying to Germany
  test('Young male from Afghanistan with weak profile applying to Germany', () => {
    const applicant22 = {
      email: 'ahmad.karimi@email.com',
      fullName: 'Ahmad Karimi',
      age: '19',
      gender: 'male',
      nationality: 'Afghanistan',
      visitPurpose: 'tourism',
      visitingCountry: 'Germany',
      countriesVisited: [],
      monthlyIncome: 'low',
      savings: 'low',
      hasStableEmployment: 'no',
      hasSponsorLetter: 'no',
      hasAssets: 'no',
      hasImmediateFamily: 'no',
      hasLongTermCommitments: 'no',
      documents: ['reservations'],
      hasConfirmedAccommodation: 'no',
      hasTravelItinerary: 'no',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant22);
    expect(result.total).toBeLessThan(40);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-6);
  });

  // Test Case 23: Middle-aged businesswoman from Brazil applying to Australia
  test('Middle-aged businesswoman from Brazil applying to Australia', () => {
    const applicant23 = {
      email: 'ana.souza@email.com',
      fullName: 'Ana Souza',
      age: '44',
      gender: 'female',
      nationality: 'Brazil',
      visitPurpose: 'business',
      visitingCountry: 'Australia',
      countriesVisited: ['United States', 'Argentina', 'Chile'],
      hasBusinessProof: 'yes',
      hasBusinessInvitation: 'yes',
      hasTaxReturns: 'yes',
      businessSavings: 'medium',
      hasInsuranceAndAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant23);
    expect(result.total).toBeGreaterThanOrEqual(60);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-6);
  });

  // Test Case 24: Student from United States applying to Malaysia
  test('Student from United States applying to Malaysia', () => {
    const applicant24 = {
      email: 'jane.doe@email.com',
      fullName: 'Jane Doe',
      age: '21',
      gender: 'female',
      nationality: 'United States',
      visitPurpose: 'study',
      visitingCountry: 'Malaysia',
      countriesVisited: ['Canada', 'United Kingdom'],
      hasTuitionCovered: 'yes',
      hasSponsorIncome: 'yes',
      hasEducationFunds: 'yes',
      hasFamilyAssets: 'no',
      hasScholarship: 'no',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant24);
    expect(result.total).toBeGreaterThanOrEqual(65);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBeCloseTo(0);
  });

  // Test Case 25: Retired person from Turkey with weak ties applying to United Kingdom
  test('Retired person from Turkey with weak ties applying to United Kingdom', () => {
    const applicant25 = {
      email: 'mehmet.demir@email.com',
      fullName: 'Mehmet Demir',
      age: '67',
      gender: 'male',
      nationality: 'Turkey',
      visitPurpose: 'tourism',
      visitingCountry: 'United Kingdom',
      countriesVisited: ['France', 'Germany'],
      monthlyIncome: 'medium',
      savings: 'medium',
      hasStableEmployment: 'no',
      hasSponsorLetter: 'no',
      hasAssets: 'no',
      hasImmediateFamily: 'no',
      hasLongTermCommitments: 'no',
      documents: ['bankStatements', 'coverLetter'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant25);
    expect(result.total).toBeLessThan(60);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-10);
  });

  // Test Case 26: Young professional from Canada with no travel history applying to Qatar
  test('Young professional from Canada with no travel history applying to Qatar', () => {
    const applicant26 = {
      email: 'lucas.brown@email.com',
      fullName: 'Lucas Brown',
      age: '26',
      gender: 'male',
      nationality: 'Canada',
      visitPurpose: 'work',
      visitingCountry: 'Qatar',
      countriesVisited: [],
      hasJobOffer: 'yes',
      hasPreviousEmployment: 'yes',
      relocationFunds: 'high',
      hasWorkAssets: 'yes',
      hasWorkSponsor: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant26);
    expect(result.total).toBeGreaterThanOrEqual(65);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBe(-3);
  });

  // Test Case 27: Businessman from Bangladesh with perfect documentation applying to UAE
  test('Businessman from Bangladesh with perfect documentation applying to UAE', () => {
    const applicant27 = {
      email: 'rahim.uddin@email.com',
      fullName: 'Rahim Uddin',
      age: '50',
      gender: 'male',
      nationality: 'Bangladesh',
      visitPurpose: 'business',
      visitingCountry: 'United Arab Emirates',
      countriesVisited: ['India', 'Singapore', 'Malaysia'],
      hasBusinessProof: 'yes',
      hasBusinessInvitation: 'yes',
      hasTaxReturns: 'yes',
      businessSavings: 'high',
      hasInsuranceAndAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant27);
    expect(result.total).toBeGreaterThanOrEqual(69);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-3);
  });

  // Test Case 28: Female student from Indonesia with partial financials applying to Canada
  test('Female student from Indonesia with partial financials applying to Canada', () => {
    const applicant28 = {
      email: 'siti.rahayu@email.com',
      fullName: 'Siti Rahayu',
      age: '23',
      gender: 'female',
      nationality: 'Indonesia',
      visitPurpose: 'study',
      visitingCountry: 'Canada',
      countriesVisited: ['Malaysia', 'Singapore'],
      hasTuitionCovered: 'yes',
      hasSponsorIncome: 'no',
      hasEducationFunds: 'yes',
      hasFamilyAssets: 'no',
      hasScholarship: 'no',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant28);
    expect(result.total).toBeGreaterThanOrEqual(50);
    expect(result.breakdown.nationality).toBe(10);
    expect(result.breakdown.visitingCountry).toBe(-10);
  });

  // Test Case 29: Tourist from France with previous visa denial applying to Japan
  test('Tourist from France with previous visa denial applying to Japan', () => {
    const applicant29 = {
      email: 'pierre.dupont@email.com',
      fullName: 'Pierre Dupont',
      age: '38',
      gender: 'male',
      nationality: 'France',
      visitPurpose: 'tourism',
      visitingCountry: 'Japan',
      countriesVisited: ['United Kingdom', 'Germany', 'Italy'],
      monthlyIncome: 'high',
      savings: 'high',
      hasStableEmployment: 'yes',
      hasSponsorLetter: 'no',
      hasAssets: 'yes',
      hasImmediateFamily: 'yes',
      hasLongTermCommitments: 'yes',
      documents: ['bankStatements', 'coverLetter', 'reservations'],
      hasConfirmedAccommodation: 'yes',
      hasTravelItinerary: 'yes',
      hasVisaDenialHistory: 'yes'
    };
    const result = calculateVisaScore(applicant29);
    expect(result.total).toBeGreaterThanOrEqual(60);
    expect(result.breakdown.nationality).toBe(15);
    expect(result.breakdown.visitingCountry).toBe(-3);
  });

  // Test Case 30: Young orphan from Somalia applying to United Kingdom
  test('Young orphan from Somalia applying to United Kingdom', () => {
    const applicant30 = {
      email: 'abdi.mohamed@email.com',
      fullName: 'Abdi Mohamed',
      age: '16',
      gender: 'male',
      nationality: 'Somalia',
      visitPurpose: 'study',
      visitingCountry: 'United Kingdom',
      countriesVisited: [],
      hasTuitionCovered: 'no',
      hasSponsorIncome: 'no',
      hasEducationFunds: 'no',
      hasFamilyAssets: 'no',
      hasScholarship: 'no',
      hasImmediateFamily: 'no',
      hasLongTermCommitments: 'no',
      documents: ['reservations'],
      hasConfirmedAccommodation: 'no',
      hasTravelItinerary: 'no',
      hasVisaDenialHistory: 'no'
    };
    const result = calculateVisaScore(applicant30);
    expect(result.total).toBeLessThan(30);
    expect(result.breakdown.nationality).toBe(5);
    expect(result.breakdown.visitingCountry).toBe(-10);
  });
}); 
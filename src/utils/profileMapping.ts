// Mapping functions for profile data between frontend and backend

// College-based program organization
export const COLLEGE_PROGRAMS = {
  'CoET': {
    name: 'College of Engineering and Technology',
    programs: {
      'CHEMICAL': 'BSc in Chemical and Process Engineering',
      'CIVIL': 'BSc in Civil Engineering',
      'ELECTRICAL': 'BSc in Electrical Engineering',
      'MECHANICAL': 'BSc in Mechanical Engineering',
      'INDUSTRIAL': 'BSc in Industrial Engineering',
      'TEXTILE_DESIGN': 'BSc in Textile Design and Technology',
      'TEXTILE_ENGINEERING': 'BSc in Textile Engineering',
      'ARCHITECTURE': 'Bachelor of Architecture (5-year programme)',
      'QUANTITY_SURVEYING': 'BSc in Quantity Surveying',
      'GEOMATIC': 'BSc in Geomatics',
    }
  },
  'CoICT': {
    name: 'College of Information and Communication Technologies',
    programs: {
      'COMPUTER': 'BSc in Computer Science',
      'ELECTRONIC_SCIENCE': 'BSc in Electronic Science and Communication',
      'COMPUTER_ENGINEERING': 'BSc in Computer Engineering and Information Technology',
      'TELECOMMUNICATIONS': 'BSc in Telecommunications Engineering',
      'BUSINESS_IT': 'BSc in Business Information Technology',
      'ELECTRONIC_ENGINEERING': 'BSc in Electronic Engineering',
    }
  },
  'SoMG': {
    name: 'School of Mines and Geosciences',
    programs: {
      'GEOPHYSICS': 'BSc in Geophysics',
      'GEOLOGY_GEOTHERMAL': 'BSc in Geology and Geothermal Resources',
      'PETROLEUM_GEOLOGY': 'BSc in Petroleum Geology',
      'GEOLOGY': 'BSc in Geology',
      'GEOLOGY_WITH': 'BSc with Geology',
      'ENGINEERING_GEOLOGY': 'BSc in Engineering Geology',
      'METALLURGY_MINERAL': 'BSc in Metallurgy and Mineral Processing Engineering',
      'MINING': 'BSc in Mining Engineering',
      'PETROLEUM': 'BSc in Petroleum Engineering',
    }
  }
};

// Program mapping (maintained for backward compatibility)
export const PROGRAM_MAPPING = {
  // CoET Programs
  'BSc in Chemical and Process Engineering': 'CHEMICAL',
  'BSc in Civil Engineering': 'CIVIL',
  'BSc in Electrical Engineering': 'ELECTRICAL',
  'BSc in Mechanical Engineering': 'MECHANICAL',
  'BSc in Industrial Engineering': 'INDUSTRIAL',
  'BSc in Textile Design and Technology': 'TEXTILE_DESIGN',
  'BSc in Textile Engineering': 'TEXTILE_ENGINEERING',
  'Bachelor of Architecture (5-year programme)': 'ARCHITECTURE',
  'BSc in Quantity Surveying': 'QUANTITY_SURVEYING',
  'BSc in Geomatics': 'GEOMATIC',
  
  // CoICT Programs
  'BSc in Computer Science': 'COMPUTER',
  'BSc in Electronic Science and Communication': 'ELECTRONIC_SCIENCE',
  'BSc in Computer Engineering and Information Technology': 'COMPUTER_ENGINEERING',
  'BSc in Telecommunications Engineering': 'TELECOMMUNICATIONS',
  'BSc in Business Information Technology': 'BUSINESS_IT',
  'BSc in Electronic Engineering': 'ELECTRONIC_ENGINEERING',
  
  // SoMG Programs
  'BSc in Geophysics': 'GEOPHYSICS',
  'BSc in Geology and Geothermal Resources': 'GEOLOGY_GEOTHERMAL',
  'BSc in Petroleum Geology': 'PETROLEUM_GEOLOGY',
  'BSc in Geology': 'GEOLOGY',
  'BSc with Geology': 'GEOLOGY_WITH',
  'BSc in Engineering Geology': 'ENGINEERING_GEOLOGY',
  'BSc in Metallurgy and Mineral Processing Engineering': 'METALLURGY_MINERAL',
  'BSc in Mining Engineering': 'MINING',
  'BSc in Petroleum Engineering': 'PETROLEUM',
  
  // Reverse mapping for display
  'CHEMICAL': 'BSc in Chemical and Process Engineering',
  'CIVIL': 'BSc in Civil Engineering',
  'ELECTRICAL': 'BSc in Electrical Engineering',
  'MECHANICAL': 'BSc in Mechanical Engineering',
  'INDUSTRIAL': 'BSc in Industrial Engineering',
  'TEXTILE_DESIGN': 'BSc in Textile Design and Technology',
  'TEXTILE_ENGINEERING': 'BSc in Textile Engineering',
  'ARCHITECTURE': 'Bachelor of Architecture (5-year programme)',
  'QUANTITY_SURVEYING': 'BSc in Quantity Surveying',
  'GEOMATIC': 'BSc in Geomatics',
  'COMPUTER': 'BSc in Computer Science',
  'ELECTRONIC_SCIENCE': 'BSc in Electronic Science and Communication',
  'COMPUTER_ENGINEERING': 'BSc in Computer Engineering and Information Technology',
  'TELECOMMUNICATIONS': 'BSc in Telecommunications Engineering',
  'BUSINESS_IT': 'BSc in Business Information Technology',
  'ELECTRONIC_ENGINEERING': 'BSc in Electronic Engineering',
  'GEOPHYSICS': 'BSc in Geophysics',
  'GEOLOGY_GEOTHERMAL': 'BSc in Geology and Geothermal Resources',
  'PETROLEUM_GEOLOGY': 'BSc in Petroleum Geology',
  'GEOLOGY': 'BSc in Geology',
  'GEOLOGY_WITH': 'BSc with Geology',
  'ENGINEERING_GEOLOGY': 'BSc in Engineering Geology',
  'METALLURGY_MINERAL': 'BSc in Metallurgy and Mineral Processing Engineering',
  'MINING': 'BSc in Mining Engineering',
  'PETROLEUM': 'BSc in Petroleum Engineering',
};

// PT Phase mapping
export const PT_PHASE_MAPPING = {
  'Practical Training 1': 'PT1',
  'Practical Training 2': 'PT2',
  'Practical Training 3': 'PT3',
  // Reverse mapping for display
  'PT1': 'Practical Training 1',
  'PT2': 'Practical Training 2',
  'PT3': 'Practical Training 3',
};

// Function to map frontend program text to backend enum
export const mapProgramToBackend = (program: string): string => {
  if (!program) return '';
  
  // Try exact match first
  if (PROGRAM_MAPPING[program as keyof typeof PROGRAM_MAPPING]) {
    return PROGRAM_MAPPING[program as keyof typeof PROGRAM_MAPPING];
  }
  
  // Try partial matching
  const upperProgram = program.toUpperCase();
  if (upperProgram.includes('MECHANICAL')) return 'MECHANICAL';
  if (upperProgram.includes('ELECTRICAL')) return 'ELECTRICAL';
  if (upperProgram.includes('CIVIL')) return 'CIVIL';
  if (upperProgram.includes('CHEMICAL')) return 'CHEMICAL';
  if (upperProgram.includes('TEXTILE_DESIGN')) return 'TEXTILE_DESIGN';
  if (upperProgram.includes('TEXTILE_ENGINEERING')) return 'TEXTILE_ENGINEERING';
  if (upperProgram.includes('INDUSTRIAL')) return 'INDUSTRIAL';
  if (upperProgram.includes('GEOMATIC')) return 'GEOMATIC';
  if (upperProgram.includes('ARCHITECTURE')) return 'ARCHITECTURE';
  if (upperProgram.includes('QUANTITY_SURVEYING')) return 'QUANTITY_SURVEYING';
  if (upperProgram.includes('COMPUTER')) return 'COMPUTER';
  if (upperProgram.includes('ELECTRONIC_SCIENCE')) return 'ELECTRONIC_SCIENCE';
  if (upperProgram.includes('COMPUTER_ENGINEERING')) return 'COMPUTER_ENGINEERING';
  if (upperProgram.includes('TELECOMMUNICATIONS')) return 'TELECOMMUNICATIONS';
  if (upperProgram.includes('BUSINESS_IT')) return 'BUSINESS_IT';
  if (upperProgram.includes('ELECTRONIC_ENGINEERING')) return 'ELECTRONIC_ENGINEERING';
  if (upperProgram.includes('GEOPHYSICS')) return 'GEOPHYSICS';
  if (upperProgram.includes('GEOLOGY_GEOTHERMAL')) return 'GEOLOGY_GEOTHERMAL';
  if (upperProgram.includes('PETROLEUM_GEOLOGY')) return 'PETROLEUM_GEOLOGY';
  if (upperProgram.includes('GEOLOGY')) return 'GEOLOGY';
  if (upperProgram.includes('ENGINEERING_GEOLOGY')) return 'ENGINEERING_GEOLOGY';
  if (upperProgram.includes('METALLURGY_MINERAL')) return 'METALLURGY_MINERAL';
  if (upperProgram.includes('MINING')) return 'MINING';
  if (upperProgram.includes('PETROLEUM')) return 'PETROLEUM';
  
  // Default to the original value if no match found
  return program;
};

// Function to map frontend PT phase text to backend enum
export const mapPTPhaseToBackend = (ptPhase: string): string => {
  if (!ptPhase) return '';
  
  // Try exact match first
  if (PT_PHASE_MAPPING[ptPhase as keyof typeof PT_PHASE_MAPPING]) {
    return PT_PHASE_MAPPING[ptPhase as keyof typeof PT_PHASE_MAPPING];
  }
  
  // Try partial matching
  const upperPhase = ptPhase.toUpperCase();
  if (upperPhase.includes('1') || upperPhase.includes('PT1')) return 'PT1';
  if (upperPhase.includes('2') || upperPhase.includes('PT2')) return 'PT2';
  if (upperPhase.includes('3') || upperPhase.includes('PT3')) return 'PT3';
  
  // Default to the original value if no match found
  return ptPhase;
};

// Function to map backend enum to frontend display text
export const mapProgramToFrontend = (program: string): string => {
  if (!program) return '';
  return PROGRAM_MAPPING[program as keyof typeof PROGRAM_MAPPING] || program;
};

export const mapPTPhaseToFrontend = (ptPhase: string): string => {
  if (!ptPhase) return '';
  return PT_PHASE_MAPPING[ptPhase as keyof typeof PT_PHASE_MAPPING] || ptPhase;
};

// Function to automatically determine department based on program
export const getDepartmentFromProgram = (program: string): string => {
  if (!program) return '';
  
  const programUpper = program.toUpperCase();
  
  // CoET Departments
  if (programUpper.includes('MECHANICAL')) {
    return 'Mechanical and Industrial Engineering Department';
  } else if (programUpper.includes('ELECTRICAL')) {
    return 'Electrical Engineering Department';
  } else if (programUpper.includes('CIVIL')) {
    return 'Civil Engineering Department';
  } else if (programUpper.includes('CHEMICAL')) {
    return 'Chemical Engineering Department';
  } else if (programUpper.includes('TEXTILE_DESIGN')) {
    return 'Mechanical and Industrial Engineering Department';
  } else if (programUpper.includes('TEXTILE_ENGINEERING')) {
    return 'Mechanical and Industrial Engineering Department';
  } else if (programUpper.includes('INDUSTRIAL')) {
    return 'Mechanical and Industrial Engineering Department';
  } else if (programUpper.includes('GEOMATIC')) {
    return 'Transportation and Geotechnical Engineering Department';
  } else if (programUpper.includes('ARCHITECTURE')) {
    return 'Departments of Structural and Construction Engineering';
  } else if (programUpper.includes('QUANTITY_SURVEYING')) {
    return 'Departments of Structural and Construction Engineering';
  }
  // CoICT Departments
  else if (programUpper.includes('COMPUTER')) {
    return 'Computer Science Department';
  } else if (programUpper.includes('ELECTRONIC_SCIENCE')) {
    return 'Electronic Science and Communication Department';
  } else if (programUpper.includes('COMPUTER_ENGINEERING')) {
    return 'Computer Engineering and Information Technology Department';
  } else if (programUpper.includes('TELECOMMUNICATIONS')) {
    return 'Telecommunications Engineering Department';
  } else if (programUpper.includes('BUSINESS_IT')) {
    return 'Business Information Technology Department';
  } else if (programUpper.includes('ELECTRONIC_ENGINEERING')) {
    return 'Electronic Engineering Department';
  }
  // SoMG Departments
  else if (programUpper.includes('GEOPHYSICS')) {
    return 'Geophysics Department';
  } else if (programUpper.includes('GEOLOGY') || programUpper.includes('MINING') || programUpper.includes('PETROLEUM')) {
    return 'Geology and Mining Department';
  } else if (programUpper.includes('METALLURGY')) {
    return 'Metallurgy and Mineral Processing Department';
  }
  
  return '';
};

// Function to clean and validate profile data before sending to backend
export const cleanProfileData = (data: any) => {
  const cleaned = { ...data };
  
  // Map program and pt_phase to backend format
  if (cleaned.program) {
    cleaned.program = mapProgramToBackend(cleaned.program);
  }
  
  if (cleaned.pt_phase) {
    cleaned.pt_phase = mapPTPhaseToBackend(cleaned.pt_phase);
  }
  
  // Automatically determine department from program if not provided
  if (!cleaned.department && cleaned.program) {
    cleaned.department = getDepartmentFromProgram(cleaned.program);
  }
  
  // Convert year_of_study to number if it's a string
  if (cleaned.year_of_study && typeof cleaned.year_of_study === 'string') {
    const year = parseInt(cleaned.year_of_study);
    if (!isNaN(year) && year >= 1 && year <= 6) {
      cleaned.year_of_study = year;
    } else {
      cleaned.year_of_study = null;
    }
  }
  
  // Remove empty strings and convert to null for optional fields
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === '' || cleaned[key] === 'null' || cleaned[key] === null) {
      if (['student_id', 'department', 'supervisor_name', 'supervisor_email', 'phone_number'].includes(key)) {
        cleaned[key] = '';
      } else {
        cleaned[key] = null;
      }
    }
  });
  
  return cleaned;
}; 
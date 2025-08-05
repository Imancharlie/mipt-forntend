// Mapping functions for profile data between frontend and backend

// Program mapping
export const PROGRAM_MAPPING = {
    'BSc. Mechanical Engineering': 'MECHANICAL',
  'BSc. Electrical Engineering': 'ELECTRICAL',
  'BSc. Civil Engineering': 'CIVIL',
 
  'BSc. Chemical Engineering': 'CHEMICAL',
  'BSc. Textile Design': 'TEXTILE_DESIGN',
  'BSc. Textile Engineering': 'TEXTILE_ENGINEERING',
  'BSc. Industrial Engineering': 'INDUSTRIAL',
  'BSc. Geomatic Engineering': 'GEOMATIC',
  'Bachelor of Architecture': 'ARCHITECTURE',
  'Bachelor of Science in Quantity Surveying': 'QUANTITY_SURVEYING',
  // Reverse mapping for display
  'MECHANICAL': 'BSc. Mechanical Engineering',
  'ELECTRICAL': 'BSc. Electrical Engineering',
  'CIVIL': 'BSc. Civil Engineering',
 
  'CHEMICAL': 'BSc. Chemical Engineering',
  'TEXTILE_DESIGN': 'BSc. Textile Design',
  'TEXTILE_ENGINEERING': 'BSc. Textile Engineering',
  'INDUSTRIAL': 'BSc. Industrial Engineering',
  'GEOMATIC': 'BSc. Geomatic Engineering',
  'ARCHITECTURE': 'Bachelor of Architecture',
  'QUANTITY_SURVEYING': 'Bachelor of Science in Quantity Surveying',
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
  
  if (programUpper.includes('MECHANICAL')) {
    return 'Mechanical and Industrial Engineering Department';
  } else if (programUpper.includes('ELECTRICAL')) {
    return 'Electrical Engineering Department';
  } else if (programUpper.includes('CIVIL')) {
    return 'Civil Engineering Departments';
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
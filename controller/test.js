import fs from 'fs';

// const createCSV = async (data, filePath) => {
//   try {
//     let csvContent = '';

//     // Extracting the header fields from the data
//     const headerFields = ['dob','gender','contactno'];
// const headerData=[
//     {
//         dob:'30/08/2001',
//         gender:'Male',
//         contactno:'8302888090'
//   }]
//     // Constructing the CSV header line
//     const headerLine = headerFields.join(',');

//     // Appending the header line to the CSV content
//     csvContent += headerLine + '\n';

//     // Constructing the CSV data lines
//     headerData.forEach((row) => {
//       const rowValues = headerFields.map((field) => row[field]);
//       const rowLine = rowValues.join(',');
//       csvContent += rowLine + '\n';
//     });

//     // Writing the CSV content to the file
//     fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' });

//     console.log('CSV file created successfully.');

//   } catch (error) {
//     console.error('Error creating CSV file:', error);
//   }
// };
const createCSV = async (data, filePath) => {
    try {
      let csvContent = '';
  
      // Extracting the header fields and their corresponding names from the data
      const headerFields = ['dob', 'gender', 'contactno', 'personalDetails.fathersName', 'academicDetails','name'];
      const headerFieldNames = ['Date of Birth', 'Gender', 'Contact Number', 'Father\'s Name', 'Academic Details','Name'];
  
      const headerData = [
        {
          dob: '30/08/2001',
          gender: 'Male',
          contactno: '8302888090',
          personalDetails: {
            fathersName: 'John Doe'
          },
          academicDetails: [
            {
              result: {
                option: 'CGPA',
                value: 8.15
              },
              degree: 'B.Tech',
              specialization: 'Computer Science And Engineering',
              institute: 'College Of Technology And Engineering',
              yearOfPassing: 2023,
              board: 'MPUAT',
              numberOfSemesters: 8,
              backlogSubjects: null,
              _id: '647344b3c130458811ac84ab'
            },
            {
                result: {
                  option: 'CGPA',
                  value: 8.15
                },
                degree: 'B.Tech',
                specialization: 'Computer Science And Engineering',
                institute: 'College Of Technology And Engineering',
                yearOfPassing: 2023,
                board: 'MPUAT',
                numberOfSemesters: 8,
                backlogSubjects: null,
                _id: '647344b3c130458811ac84ab'
              },
              {
                result: {
                  option: 'CGPA',
                  value: 8.15
                },
                degree: 'B.Tech',
                specialization: 'Computer Science And Engineering',
                institute: 'College Of Technology And Engineering',
                yearOfPassing: 2023,
                board: 'MPUAT',
                numberOfSemesters: 8,
                backlogSubjects: null,
                _id: '647344b3c130458811ac84ab'
              }
          ],
          name:"Harsh Chandravanshi"
        }
      ];
  
      // Constructing the CSV header line
      const headerLine = headerFieldNames.join(',');
  
      // Appending the header line to the CSV content
      csvContent += headerLine + '\n';
  
      // Constructing the CSV data lines
      headerData.forEach((row) => {
        const rowValues = headerFields.map((field, index) => {
          // Handle nested fields
          if (field.includes('.')) {
            const nestedFields = field.split('.');
            let nestedValue = row;
            for (let i = 0; i < nestedFields.length; i++) {
              nestedValue = nestedValue[nestedFields[i]];
              if (nestedValue === undefined) break;
            }
            return nestedValue;
          }
  
          return row[field];
        });
  
        // Stringify array data if needed
        const rowLine = rowValues.map((value) => {
            if (Array.isArray(value)) {
              return JSON.stringify(value);
            }
            return value;
          }).join('');
    
          csvContent += rowLine + '\n';
        });
  
      // Writing the CSV content to the file
      fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' });
  
      console.log('CSV file created successfully.');
  
    } catch (error) {
      console.error('Error creating CSV file:', error);
    }
  };
  const createCSV1 = async (data, filePath) => {
    try {
      let csvContent = '';
      let headerFields = [];
      let headerFieldNames = [];
  
      // Recursive function to generate header fields and names
      const generateHeader = (data, prefix = '') => {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            // Handle array data
            const arrayItem = data[key][0];
            if (typeof arrayItem === 'object') {
              generateHeader(arrayItem, `${prefix}${key}.`);
            } else {
              headerFields.push(`${prefix}${key}`);
              headerFieldNames.push(`${prefix}${key}`);
            }
          } else if (typeof data[key] === 'object') {
            // Handle nested objects
            generateHeader(data[key], `${prefix}${key}.`);
          } else {
            // Handle simple fields
            headerFields.push(`${prefix}${key}`);
            headerFieldNames.push(`${prefix}${key}`);
          }
        }
      };
  
      // Generate the header fields and names
      generateHeader(data[0]);
  
      // Constructing the CSV header line
      const headerLine = headerFieldNames.map((name) => `"${name}"`).join(',');
  
      // Appending the header line to the CSV content
      csvContent += headerLine + '\n';
  
      // Constructing the CSV data lines
      data.forEach((row) => {
        const rowValues = headerFields.map((field, index) => {
          // Handle nested fields
          if (field.includes('.')) {
            const nestedFields = field.split('.');
            let nestedValue = row;
            for (let i = 0; i < nestedFields.length; i++) {
              nestedValue = nestedValue[nestedFields[i]];
              if (nestedValue === undefined) break;
            }
            return nestedValue;
          }
          return row[field];
        });
  
        // Stringify array data if needed
        const rowLine = rowValues.map((value) => {
          if (Array.isArray(value)) {
            // Join array values with a separator (e.g., '|') for better readability in Excel
            return value.map((item) => JSON.stringify(item)).join('|');
          }
          return value;
        }).map((value) => {
          if (typeof value === 'string') {
            return `"${value}"`; // Enclose string values in double quotes
          }
          return value;
        }).join(',');
  
        csvContent += rowLine + '\n';
      });
  
      // Writing the CSV content to the file
      fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' });
  
      console.log('CSV file created successfully.');
  
    } catch (error) {
      console.error('Error creating CSV file:', error);
    }
  };
  
  const createCSV2 = async (data, filePath) => {
    try {
      let csvContent = '';
      let headerFields = [];
      let headerFieldNames = [];
  
      // Recursive function to generate header fields and names
      const generateHeader = (data, prefix = '') => {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            // Handle array data
            const arrayItem = data[key][0];
            if (typeof arrayItem === 'object') {
              generateHeader(arrayItem, `${prefix}${key}.`);
            } else {
              headerFields.push(`${prefix}${key}`);
              headerFieldNames.push(`${prefix}${key}`);
            }
          } else if (typeof data[key] === 'object' && data[key] !== null) {
            // Handle nested objects
            generateHeader(data[key], `${prefix}${key}.`);
          } else {
            // Handle simple fields
            headerFields.push(`${prefix}${key}`);
            headerFieldNames.push(`${prefix}${key}`);
          }
        }
      };
  
      // Generate the header fields and names
      generateHeader(data[0]);
  
      // Constructing the CSV header line
      const headerLine = headerFieldNames.map((name) => `"${name}"`).join(',');
  
      // Appending the header line to the CSV content
      csvContent += headerLine + '\n';
  
      // Recursive function to extract nested values
      const extractNestedValue = (row, field) => {
        const nestedFields = field.split('.');
        let nestedValue = row;
        for (let i = 0; i < nestedFields.length; i++) {
          nestedValue = nestedValue[nestedFields[i]];
          if (nestedValue === undefined) break;
        }
        return nestedValue;
      };
  
      // Constructing the CSV data lines
      data.forEach((row) => {
        const rowValues = headerFields.map((field, index) => {
          // Handle nested fields
          if (field.includes('.')) {
            return extractNestedValue(row, field);
          }
          return row[field];
        });
  
        // Stringify array data if needed
        const rowLine = rowValues.map((value) => {
          if (Array.isArray(value)) {
            // Join array values with a separator (e.g., '|') for better readability in Excel
            return value.map((item) => JSON.stringify(item)).join('|');
          }
          return value;
        }).map((value) => {
          if (typeof value === 'string') {
            return `"${value}"`; // Enclose string values in double quotes
          }
          return value;
        }).join(',');
  
        csvContent += rowLine + '\n';
      });
  
      // Writing the CSV content to the file
      fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' });
  
      console.log('CSV file created successfully.');
  
    } catch (error) {
      console.error('Error creating CSV file:', error);
    }
  };
  const createCSV4 = async (data, filePath) => {
  try {
    let csvContent = '';
    let headerFields = [];
    let headerFieldNames = [];

    // Recursive function to generate header fields and names
    const generateHeader = (data, prefix = '') => {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          // Handle array data
          headerFields.push(`${prefix}${key}`);
          headerFieldNames.push(`${prefix}${key}`);
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          // Handle nested objects
          generateHeader(data[key], `${prefix}${key}.`);
        } else {
          // Handle simple fields
          headerFields.push(`${prefix}${key}`);
          headerFieldNames.push(`${prefix}${key}`);
        }
      }
    };

    // Generate the header fields and names
    generateHeader(data[0]);

    // Constructing the CSV header line
    const headerLine = headerFieldNames.map((name) => `"${name}"`).join(',');

    // Appending the header line to the CSV content
    csvContent += headerLine + '\n';

    // Recursive function to extract nested values and stringify them
    const extractNestedValue = (row, field) => {
      const nestedFields = field.split('.');
      let nestedValue = row;
      for (let i = 0; i < nestedFields.length; i++) {
        nestedValue = nestedValue[nestedFields[i]];
        if (nestedValue === undefined) break;
      }
      if (typeof nestedValue === 'object' && nestedValue !== null) {
        return JSON.stringify(nestedValue);
      }
      return nestedValue;
    };

    // Constructing the CSV data lines
    data.forEach((row) => {
      const rowValues = headerFields.map((field, index) => {
        // Handle nested fields
        if (field.includes('.')) {
          return extractNestedValue(row, field);
        }
        return row[field];
      });

      const rowLine = rowValues.map((value) => {
        if (typeof value === 'string') {
          return `"${value}"`; // Enclose string values in double quotes
        }
        return value;
      }).join(',');

      csvContent += rowLine + '\n';
    });

    // Writing the CSV content to the file
    fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' });

    console.log('CSV file created successfully.');

  } catch (error) {
    console.error('Error creating CSV file:', error);
  }
};
const createCSV3 = async (data, filePath) => {
    try {
      let csvContent = '';
      let headerFields = [];
      let headerFieldNames = [];
  
      // Recursive function to generate header fields and names
      const generateHeader = (data, prefix = '') => {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            // Handle array data
            headerFields.push(`${prefix}${key}`);
            headerFieldNames.push(`${prefix}${key}`);
          } else if (typeof data[key] === 'object' && data[key] !== null) {
            // Handle nested objects
            generateHeader(data[key], `${prefix}${key}.`);
          } else {
            // Handle simple fields
            headerFields.push(`${prefix}${key}`);
            headerFieldNames.push(`${prefix}${key}`);
          }
        }
      };
  
      // Generate the header fields and names
      generateHeader(data[0]);
  
      // Constructing the CSV header line
      const headerLine = headerFieldNames.map((name) => `"${name}"`).join(',');
  
      // Appending the header line to the CSV content
      csvContent += headerLine + '\n';
  
      // Recursive function to extract nested values and stringify them
      const extractNestedValue = (row, field) => {
        const nestedFields = field.split('.');
        let nestedValue = row;
        for (let i = 0; i < nestedFields.length; i++) {
          nestedValue = nestedValue[nestedFields[i]];
          if (nestedValue === undefined) break;
        }
        if (typeof nestedValue === 'object' && nestedValue !== null) {
          return JSON.stringify(nestedValue);
        }
        return nestedValue;
      };
  
      // Constructing the CSV data lines
      data.forEach((row) => {
        const rowValues = headerFields.map((field, index) => {
          // Handle nested fields
          if (field.includes('.')) {
            return extractNestedValue(row, field);
          }
          return row[field];
        });
  
        const rowLine = rowValues.map((value) => {
          if (typeof value === 'string') {
            return `"${value}"`; // Enclose string values in double quotes
          }
          return value;
        }).join(',');
  
        csvContent += rowLine + '\n';
      });
  
      // Writing the CSV content to the file
      fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' });
  
      console.log('CSV file created successfully.');
  
    } catch (error) {
      console.error('Error creating CSV file:', error);
    }
  };
  




  const createCSVFinal = async (data, filePath) => {
    try {
      let csvContent = '';
      let headerFields = [];
      let headerFieldNames = [];
  
      // Recursive function to generate header fields and names
      const generateHeader = (data, prefix = '') => {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            // Handle array data
            headerFields.push(`${prefix}${key}`);
            headerFieldNames.push(`${prefix}${key}`);
          } else if (typeof data[key] === 'object' && data[key] !== null) {
            // Handle nested objects
            generateHeader(data[key], `${prefix}${key}.`);
          } else {
            // Handle simple fields
            headerFields.push(`${prefix}${key}`);
            headerFieldNames.push(`${prefix}${key}`);
          }
        }
      };
  
      // Generate the header fields and names
      generateHeader(data[0]);
  
      // Constructing the CSV header line
      const headerLine = headerFieldNames.map((name) => `"${name}"`).join(',');
  
      // Appending the header line to the CSV content
      csvContent += headerLine + '\n';
  
      // Recursive function to extract nested values and stringify them
      const extractNestedValue = (row, field) => {
        const nestedFields = field.split('.');
        let nestedValue = row;
        for (let i = 0; i < nestedFields.length; i++) {
          nestedValue = nestedValue[nestedFields[i]];
          if (nestedValue === undefined) break;
        }
        if (typeof nestedValue === 'object' && nestedValue !== null) {
          return `"${serializeNestedValue(nestedValue)}"`;
        }
        return `"${nestedValue}"`;
      };
      
      const serializeNestedValue = (value) => {
        if (Array.isArray(value)) {
          return value.map((item) => serializeNestedValue(item)).join(', ');
        } else if (typeof value === 'object') {
          return Object.keys(value)
            .map((key) => `${key}: ${serializeNestedValue(value[key])}`)
            .join(', ');
        }
        return value;
      };
      
      
      // Constructing the CSV data lines
      data.forEach((row) => {
        const rowValues = headerFields.map((field, index) => {
          // Handle nested fields
          if (field.includes('.')) {
            return extractNestedValue(row, field);
          }
          return `"${row[field]}"`;
        });
  
        const rowLine = rowValues.join(',');
  
        csvContent += rowLine + '\n';
      });
  
      // Writing the CSV content to the file
      fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' });
  
      console.log('CSV file created successfully.');
  
    } catch (error) {
      console.error('Error creating CSV file:', error);
    }
  };
   
// Example data
const students = [
    {
            "placementDetails": {
                "applied": false,
                "selected": false,
                "appliedIn": [
                    "6472e55f442788365934df49"
                ],
                "rejectedFrom": [
                    "6472e4d7442788365934df34"
                ]
            },
            "personalDetails": {
                "profileImage": "https://firebasestorage.googleapis.com/v0/b/campusplacementportal-c267c.appspot.com/o/image%2F6472e627442788365934dfc4%2Fharshpic.png-1685276170896?alt=media&token=4b0e5b82-9d2a-4a2a-8aef-e8876d638fcf",
                "dob": "2001-08-30T00:00:00.000Z",
                "gender": "Male",
                "contactNo": "8302888090",
                "aadharNo": "838423054276",
                "program": "B.Tech",
                "stream": "Computer Science",
                "collegeName": "College Of Technology And Enginering And Udaipur",
                "universityName": "Maharana Pratap University Of Agriculture And Engineering",
                "fatherName": "Suresh Kumar Chandravanshi",
                "motherName": "Sunita Devi",
                "currentAddress": "9-A-5 New Patel Nagar",
                "permanentAddress": "9-A-5 New Patel Nagar",
                "pincode": "311001",
                "homeCity": "Bhilwara",
                "homeState": "Rajasthan",
                "homeCountry": "India"
            },
            "professionalDetails": {
                "experiences": [
                    {
                        "companyName": "Piclet",
                        "designation": "Full Stack Developer",
                        "duration": 10,
                        "location": "Udaipur",
                        "jobDescription": "• Led agile development of a web portal for photographers, resulting in\n25% traffic increase and 15% higher customer satisfaction.\n• Created REST API endpoints and a SPA upon MVC architecture,\nresulting in 40% faster page loading and 20% higher user\nengagement.\n• Implemented transactional emails, AWS S3 integration, and image\nsize reduction algorithm, resulting in 30% fewer email bounces and\n25% faster image upload.\n• Tech Used:ReactJs,Redux,ExpressJs,MongoDB,S3(AWS),SendGrid",
                        "from": "2021-10-27T00:00:00.000Z",
                        "to": "2022-08-28T00:00:00.000Z",
                        "_id": "64734515c130458811ac84ba"
                    },
                    {
                        "companyName": "Loosleeaf",
                        "designation": "Frontend Developer",
                        "duration": 2,
                        "location": "WFH",
                        "jobDescription": " Developed a Learning Management System’s Student Side, resulting\nin 25% improved student engagement and performance.\n• Improved web app speed by up to 80%, resulting in 20% more page\nviews and 15% fewer bounces..\n• Fabricated 40+ reusable components for maximum performance\nacross devices and browsers, reducing code complexity by 30% and\nimproving site reliability by 25%.\n• Transformed Figma designs with 95% accuracy, cutting design to\ndevelopment time by 40% and development costs by 35%.\n• Tech Used: ReactJs,CSS,Git,Figma\n",
                        "from": "2021-05-01T00:00:00.000Z",
                        "to": "2021-06-30T00:00:00.000Z",
                        "_id": "6473454bc130458811ac84c4"
                    }
                ],
                "projects": [
                    {
                        "projectName": "ANSHYATI",
                        "projectDescription": "Developed a web app that simplifies bill splitting for users.\n• Designed an efficient database to handle expense splitting and\nsettlement.\n• Implemented the greedy algorithm for bill splitting.\n• Resulted in 30% reduction in time spent splitting bills and 25%\nincrease in user satisfaction.\n• Tech Stack: ReactJs, Firebase\n",
                        "sourceCodeLink": "https://github.com/harsh0620/anshyati",
                        "liveLink": "https://www.anshyati.harshchandravanshi.live/",
                        "_id": "6473459bc130458811ac84db"
                    },
                    {
                        "projectName": "DEVBOARD",
                        "projectDescription": "Developed a web app that boosts user productivity.\n• Implemented a three-layer architecture (Client-Server-Database) and\nREST API to improve security.\n• Resulted in a 20% increase in user productivity and 50% reduction in\ntime spent switching between multiple apps.\n• Tech Stack: ReactJs, NodeJs, ExpressJs, MongoDB, JWT\n",
                        "sourceCodeLink": "https://github.com/harsh0620/devboard",
                        "liveLink": "https://devboard.onrender.com/",
                        "_id": "6473459bc130458811ac84dc"
                    }
                ],
                "skills": [
                    "C++",
                    "C",
                    "Reactjs",
                    "Expressjs",
                    "Nodejs",
                    "MongoDB",
                    "Firebase"
                ],
                "certifications": [],
                "links": [
                    "https://www.harshchandravanshi.live/",
                    "https://github.com/harsh0620"
                ]
            },
            "documents": {
                "resume": "https://firebasestorage.googleapis.com/v0/b/campusplacementportal-c267c.appspot.com/o/pdf%2F6472e627442788365934dfc4%2FHARSH_CHANDRAVANSHI_RESUME_MAY.pdf-1685276150572?alt=media&token=7fa85dbc-08e1-461a-aceb-dd9a34a98342",
                "photo": "https://firebasestorage.googleapis.com/v0/b/campusplacementportal-c267c.appspot.com/o/image%2F6472e627442788365934dfc4%2Fharshpic.png-1685276170896?alt=media&token=4b0e5b82-9d2a-4a2a-8aef-e8876d638fcf",
                "aadhar": "https://firebasestorage.googleapis.com/v0/b/campusplacementportal-c267c.appspot.com/o/pdf%2F6472e627442788365934dfc4%2FHARSH_CHANDRAVANSHI_RESUME.pdf-1685276206432?alt=media&token=5cccc2de-f5ac-4c74-b0b6-149157a7ff02"
            },
            "_id": "6472e627442788365934dfc4",
            "role": "student",
            "applicationStatus": "unverified",
            "enrollmentNo": "2019/CTAE/145",
            "name": "Harsh Chandravanshi",
            "email": "harsh@gmail.com",
            "academicDetails": [
                {
                    "result": {
                        "option": "CGPA",
                        "value": 8.15
                    },
                    "degree": "B.Tech",
                    "specialization": "Computer Science And Engineering",
                    "institute": "College Of Technology And Engineering",
                    "yearOfPassing": 2023,
                    "board": "MPUAT",
                    "numberOfSemesters": 8,
                    "backlogSubjects": null,
                    "_id": "647344b3c130458811ac84ab"
                }
            ],
            "__v": 0,
            "about": "Hi, I am a MERN Stack Developer, and an undergraduate student of Computer Science in the College of Technology and Engineering who is highly passionate about problem-solving and building creative web applications.\n\nRight now my expertise is developing a web application using MERN Stack and I've been working to enhance my skills.I love to explore everything and ready to learn from every opportunity that I come across. My fuel is the dream that boosts me to achieve my goals."
        }
];

// File path for the CSV file
const filePath = 'students.csv';

// Create the CSV file with the provided data
createCSVFinal(students, filePath);


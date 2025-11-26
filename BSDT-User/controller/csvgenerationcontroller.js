const supabase = require("../db");
const { Parser } = require("json2csv");

function formatCsvCell(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value
      .filter(item => item !== null && item !== undefined)
      .map(item => formatCsvCell(item))
      .join('; '); // Semicolon join prevents comma-splitting issues within a cell
  } else if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
}

// Main function to generate and send CSV file
exports.getCSV = async (req, res) => {
  try {
    const surveyId = req.params.surveyId;
    const user_id = req.jwt?.id;

    // Check if user is authenticated
    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated." });
    }

    // Fetch survey responses from Supabase database
    const { data: rawResponseEntries, error: fetchError } = await supabase
      .from("response")
      .select("response_data")
      .eq("survey_id", surveyId);

    // Handle database fetch errors
    if (fetchError) {
      console.error("Error fetching response data:", fetchError.message);
      return res.status(500).json({ error: "Failed to fetch survey responses" });
    }

    // Check if any responses exist
    if (!rawResponseEntries || rawResponseEntries.length === 0) {
      return res.status(404).json({ message: "No responses found for this survey" });
    }

    // Initialize structures to track questions and their types
    const questionStructures = new Map();
    const orderedBaseQuestionTexts = [];

    // Process each response entry to identify question types and structures
    rawResponseEntries.forEach(entry => {
      if (entry.response_data && Array.isArray(entry.response_data)) {
        entry.response_data.forEach(response => {
          if (!response || typeof response.questionText !== 'string') return;

          const qText = response.questionText;
          const uResponse = response.userResponse;

          // If question isn't already tracked, determine its type
          if (!questionStructures.has(qText)) {
            orderedBaseQuestionTexts.push(qText);

            // Check if response is a matrix (array of objects with row/column)
            if (Array.isArray(uResponse) && 
                uResponse.length > 0 && 
                typeof uResponse[0] === 'object' && 
                uResponse[0] !== null && 
                'row' in uResponse[0] && 
                'column' in uResponse[0]) {
              questionStructures.set(qText, { type: 'matrix', rows: new Set() });
            } else {
              questionStructures.set(qText, { type: 'normal' });
            }
          }

          // For matrix questions, collect unique row labels
          const structure = questionStructures.get(qText);
          if (structure.type === 'matrix' && Array.isArray(uResponse)) {
            uResponse.forEach(item => {
              if (item && typeof item.row === 'string') {
                structure.rows.add(item.row); // Add row label to set
              }
            });
          }
        });
      }
    });

    // Generate CSV headers based on question structures
    const fieldsConfig = [];
    orderedBaseQuestionTexts.forEach(qText => {
      const structure = questionStructures.get(qText);
      if (!structure) return;

      if (structure.type === 'matrix') {
        const sortedRows = Array.from(structure.rows).sort();
        sortedRows.forEach(rowText => {
          const columnLabel = `${qText} - ${rowText}`; 
          fieldsConfig.push({
            label: columnLabel, // The text seen in the CSV header (keeps Bangla)
            // Use Base64 encoding for the internal key. 
            // This ensures uniqueness even if the text contains special characters.
            value: Buffer.from(columnLabel).toString('base64') 
          });
        });
      } else {
        fieldsConfig.push({
          label: qText, // The text seen in the CSV header (keeps Bangla)
          // Use Base64 encoding for the internal key
          value: Buffer.from(qText).toString('base64') 
        });
      }
    });

    // Check if any valid headers were generated
    if (fieldsConfig.length === 0) {
      return res.status(404).json({ message: "No valid questions found to generate CSV headers" });
    }

    // Transform response data into CSV rows
    const csvData = rawResponseEntries.map(entry => {
      const rowOutput = {};
      // Initialize all columns to null using the Base64 keys
      fieldsConfig.forEach(fc => { rowOutput[fc.value] = null; });

      if (!entry.response_data || !Array.isArray(entry.response_data)) {
        return rowOutput;
      }

      const processedData = {};
      entry.response_data.forEach(response => {
        if (!response || typeof response.questionText !== 'string') return;

        const qText = response.questionText;
        const uResponse = response.userResponse;
        const structure = questionStructures.get(qText);

        if (!structure) return;

        // Handle matrix responses
        if (structure.type === 'matrix' && Array.isArray(uResponse)) {
          uResponse.forEach(item => {
            if (item && typeof item === 'object' && typeof item.row === 'string' && 'column' in item) {
              // Re-generate the Base64 key to match the header
              const rawKey = `${qText} - ${item.row}`;
              const dataKey = Buffer.from(rawKey).toString('base64');
              
              const columnValue = Array.isArray(item.column) ? item.column.join('; ') : item.column;
              
              if (!processedData[dataKey]) {
                processedData[dataKey] = columnValue;
              } else {
                processedData[dataKey] += `; ${columnValue}`;
              }
            }
          });
        } else {
          // Re-generate the Base64 key to match the header
          const dataKey = Buffer.from(qText).toString('base64');
          processedData[dataKey] = uResponse;
        }
      });

      // Format processed data for CSV
      for (const key in processedData) {
        if (rowOutput.hasOwnProperty(key)) {
          rowOutput[key] = formatCsvCell(processedData[key]);
        }
      }
      return rowOutput;
    });

    // Convert data to CSV format
    const json2csvParser = new Parser({
      fields: fieldsConfig,
      excelStrings: true, // Forces Excel to treat fields as strings (helps with "00123")
      quote: '"',         // Wraps fields in quotes to prevent comma splitting
      escape: '"',        // Escapes quotes inside data
      withBOM: true       // CRITICAL: Adds Byte Order Mark for Excel to recognize Bangla/UTF-8
    });
    
    // Note: older versions of json2csv might ignore `withBOM` in options. 
    // We append manually below just to be 100% safe.
    const csv = json2csvParser.parse(csvData);

    // Send CSV as response
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`survey_${surveyId}_responses.csv`);
    
    // Send with BOM (\uFEFF) to ensure Excel opens UTF-8 correctly
    return res.status(200).send('\uFEFF' + csv);

  } catch (err) {
    // Handle unexpected errors
    console.error("Error generating CSV:", err.message, err.stack);
    return res.status(500).json({ error: "Internal server error during CSV generation" });
  }
};
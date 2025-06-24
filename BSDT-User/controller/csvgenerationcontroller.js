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
      .join('; ');
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
            label: columnLabel, 
            value: columnLabel.replace(/[^a-zA-Z0-9\s-]/g, '_') 
          });
        });
      } else {
        fieldsConfig.push({
          label: qText, 
          value: qText.replace(/[^a-zA-Z0-9\s]/g, '_') 
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
              const dataKey = `${qText} - ${item.row}`.replace(/[^a-zA-Z0-9\s-]/g, '_');
              const columnValue = Array.isArray(item.column) ? item.column.join('; ') : item.column;
              if (!processedData[dataKey]) {
                processedData[dataKey] = columnValue;
              } else {
                processedData[dataKey] += `; ${columnValue}`;
              }
            }
          });
        } else {
          const dataKey = qText.replace(/[^a-zA-Z0-9\s]/g, '_');
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
      excelStrings: true,
      quote: '"',
      escape: '"',
    });
    const csv = json2csvParser.parse(csvData); // Generate CSV string

    // Send CSV as response
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`survey_${surveyId}_responses.csv`);
    return res.status(200).send(csv);

  } catch (err) {
    // Handle unexpected errors
    console.error("Error generating CSV:", err.message, err.stack);
    return res.status(500).json({ error: "Internal server error during CSV generation" });
  }
};
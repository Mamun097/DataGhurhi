const supabase = require("../db");
const { Parser } = require("json2csv");

/**
 * Formats a value for a CSV cell.
 * - Joins arrays with a semicolon and space.
 * - Stringifies objects if they are not null.
 * @param {*} value The value to format.
 * @returns {string|*} The formatted value.
 */
function formatCsvCell(value) {
  if (value === null || value === undefined) {
    return ''; // Return empty string for null/undefined
  }
  if (Array.isArray(value)) {
    // Filter out null/undefined, format each item, and then join.
    return value
      .filter(item => item !== null && item !== undefined)
      .map(item => formatCsvCell(item)) // Recursively format items in array
      .join('; ');
  } else if (typeof value === 'object') {
    return JSON.stringify(value); // Stringify objects
  }
  return value;
}

exports.getCSV = async (req, res) => {
  try {
    const surveyId = req.params.surveyId;
    const user_id = req.jwt?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated." });
    }

    const { data: rawResponseEntries, error: fetchError } = await supabase
      .from("response")
      .select("response_data")
      .eq("survey_id", surveyId);

    if (fetchError) {
      console.error("Error fetching response data from Supabase:", fetchError.message);
      return res.status(500).json({ error: "Failed to fetch survey responses" });
    }

    if (!rawResponseEntries || rawResponseEntries.length === 0) {
      return res.status(404).json({ message: "No responses found for this survey" });
    }

    // --- Header and Field Discovery Logic ---
    // This part dynamically discovers all questions and their structures from the responses.
    const ARRAY_TO_COLUMNS_CONFIG = {
      "Select the frameworks used for developing the survey tool": { numCols: 2 }
    };

    const questionStructures = new Map();
    const orderedBaseQuestionTexts = [];

    rawResponseEntries.forEach(entry => {
      if (entry.response_data && Array.isArray(entry.response_data)) {
        entry.response_data.forEach(response => {
          if (!response || typeof response.questionText !== 'string') return;

          const qText = response.questionText;
          const uResponse = response.userResponse;

          if (!questionStructures.has(qText)) {
            orderedBaseQuestionTexts.push(qText);

            if (ARRAY_TO_COLUMNS_CONFIG[qText]) {
              // Configured to split an array into a fixed number of columns
              questionStructures.set(qText, { type: 'array_to_columns', numCols: ARRAY_TO_COLUMNS_CONFIG[qText].numCols });
            } else if (
              Array.isArray(uResponse) &&
              uResponse.length > 0 &&
              typeof uResponse[0] === 'object' &&
              uResponse[0] !== null &&
              uResponse[0].hasOwnProperty('row') &&
              uResponse[0].hasOwnProperty('column')
            ) {
              // This is a matrix-style question (e.g., radio grid, checkbox grid)
              questionStructures.set(qText, { type: 'row_column', rows: new Set() });
            } else {
              // This is a standard question with a direct response (string, number, or a simple array)
              questionStructures.set(qText, { type: 'normal' });
            }
          }

          // For matrix questions, collect all unique row texts to build headers
          const structure = questionStructures.get(qText);
          if (structure.type === 'row_column' && Array.isArray(uResponse)) {
            uResponse.forEach(item => {
              if (item && typeof item === 'object' && typeof item.row === 'string') {
                structure.rows.add(item.row);
              }
            });
          }
        });
      }
    });

    // --- Field (Column Header) Generation ---
    // Creates the final list of column headers for the CSV file.
    const fieldsConfig = [];
    orderedBaseQuestionTexts.forEach(baseQText => {
      const structure = questionStructures.get(baseQText);
      if (!structure) return;

      if (structure.type === 'array_to_columns') {
        // Create a numbered column for each expected item
        for (let i = 1; i <= structure.numCols; i++) {
          fieldsConfig.push({
            label: `${baseQText} #${i}`, // Make header unique
            value: `${baseQText}_${i}`
          });
        }
      } else if (structure.type === 'row_column') {
        // Create a column for each row in the matrix question
        const sortedRows = Array.from(structure.rows).sort();
        sortedRows.forEach(rowText => {
          const columnLabelAndValue = `${baseQText} - ${rowText}`;
          fieldsConfig.push({
            label: columnLabelAndValue,
            value: columnLabelAndValue
          });
        });
      } else {
        // A single column for a normal question
        fieldsConfig.push({
          label: baseQText,
          value: baseQText
        });
      }
    });

    if (fieldsConfig.length === 0) {
        console.warn(`Survey ${surveyId}: No headers generated for CSV.`);
        return res.status(404).json({ message: "No questions found in responses to generate CSV headers." });
    }

    // This section transforms each response entry into a CSV row.
    const csvData = rawResponseEntries.map(entry => {
      const rowOutput = {};
      fieldsConfig.forEach(fc => { rowOutput[fc.value] = null; }); // Initialize row with nulls

      if (!entry.response_data || !Array.isArray(entry.response_data)) {
        return rowOutput;
      }

      // Intermediate object to collect and aggregate values before final formatting.
      const processedData = {};

      entry.response_data.forEach(response => {
        if (!response || typeof response.questionText !== 'string') return;

        const qText = response.questionText;
        const uResponse = response.userResponse;
        const structure = questionStructures.get(qText);

        if (!structure) return;

        if (structure.type === 'array_to_columns' && Array.isArray(uResponse)) {
          for (let i = 0; i < structure.numCols; i++) {
            const dataKey = `${qText}_${i + 1}`;
            processedData[dataKey] = uResponse[i];
          }
        } else if (structure.type === 'row_column' && Array.isArray(uResponse)) {
          uResponse.forEach(item => {
            if (item && typeof item === 'object' && typeof item.row === 'string' && item.hasOwnProperty('column')) {
              const dataKey = `${qText} - ${item.row}`;
              if (!processedData[dataKey]) {
                processedData[dataKey] = [];
              }
              // Handle both single string and array of strings for the 'column' value
              if (Array.isArray(item.column)) {
                processedData[dataKey].push(...item.column); // Add all items from the array
              } else {
                processedData[dataKey].push(item.column); // Add the single item
              }
            }
          });
        } else if (structure.type === 'normal') {
          processedData[qText] = uResponse;
        }
      });

      // Format the collected data and place it into the final row object for the CSV parser.
      for (const key in processedData) {
        if (rowOutput.hasOwnProperty(key)) {
            let value = processedData[key];
            // If an aggregated array has only one item, just use that item directly.
            if(Array.isArray(value) && value.length === 1) {
                value = value[0];
            }
            rowOutput[key] = formatCsvCell(value);
        }
      }
      return rowOutput;
    });

    const json2csvParser = new Parser({ fields: fieldsConfig, excelStrings: true });
    const csv = json2csvParser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment(`survey_${surveyId}_responses.csv`);
    return res.status(200).send(csv);

  } catch (err) {
    console.error("Error generating CSV:", err.message, err.stack);
    res.status(500).json({ error: "Internal server error during CSV generation" });
  }
};

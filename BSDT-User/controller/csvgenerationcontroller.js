const supabase = require("../db");
const { Parser } = require("json2csv");


function formatCsvCell(value) {
  if (Array.isArray(value)) {
    return value.join('; ');
  } else if (typeof value === 'object' && value !== null) {
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

    const ARRAY_TO_COLUMNS_CONFIG = {
      "Enter your question here": { numCols: 2 },
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
              questionStructures.set(qText, { type: 'array_to_columns', numCols: ARRAY_TO_COLUMNS_CONFIG[qText].numCols });
            } else if (
              Array.isArray(uResponse) &&
              uResponse.length > 0 &&
              typeof uResponse[0] === 'object' &&
              uResponse[0] !== null &&
              uResponse[0].hasOwnProperty('row') &&
              uResponse[0].hasOwnProperty('column')
            ) {
              questionStructures.set(qText, { type: 'row_column', rows: new Set() });
            } else {
              questionStructures.set(qText, { type: 'normal' });
            }
          }

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

    const fieldsConfig = [];
    orderedBaseQuestionTexts.forEach(baseQText => {
      const structure = questionStructures.get(baseQText);
      if (!structure) return;

      if (structure.type === 'array_to_columns') {
        for (let i = 1; i <= structure.numCols; i++) {
          fieldsConfig.push({
            label: baseQText, 
            value: `${baseQText}_${i}` 
          });
        }
      } else if (structure.type === 'row_column') {
        const sortedRows = Array.from(structure.rows).sort();
        sortedRows.forEach(rowText => {
          const columnLabelAndValue = `${baseQText} - ${rowText}`;
          fieldsConfig.push({
            label: columnLabelAndValue,
            value: columnLabelAndValue
          });
        });
      } else { 
        fieldsConfig.push({
          label: baseQText,
          value: baseQText
        });
      }
    });

    const csvData = rawResponseEntries.map(entry => {
      const rowOutput = {};
      fieldsConfig.forEach(fc => { rowOutput[fc.value] = null; });

      if (entry.response_data && Array.isArray(entry.response_data)) {
        entry.response_data.forEach(response => {
          if (!response || typeof response.questionText !== 'string') return;

          const qText = response.questionText;
          const uResponse = response.userResponse;
          const structure = questionStructures.get(qText);

          if (!structure) return;

          if (structure.type === 'array_to_columns' && Array.isArray(uResponse)) {
            for (let i = 0; i < structure.numCols; i++) {
              const dataKey = `${qText}_${i + 1}`;
              rowOutput[dataKey] = uResponse[i] !== undefined ? formatCsvCell(uResponse[i]) : null;
            }
          } else if (structure.type === 'row_column' && Array.isArray(uResponse)) {
            uResponse.forEach(item => {
              if (item && typeof item === 'object' && typeof item.row === 'string' && item.hasOwnProperty('column')) {
                const dataKey = `${qText} - ${item.row}`;
                if (rowOutput.hasOwnProperty(dataKey)) {
                  rowOutput[dataKey] = formatCsvCell(item.column);
                }
              }
            });
          } else if (structure.type === 'normal') {
            if (rowOutput.hasOwnProperty(qText)) {
              rowOutput[qText] = formatCsvCell(uResponse);
            }
          }
        });
      }
      return rowOutput;
    });

    if (fieldsConfig.length === 0) {
        console.warn(`Survey ${surveyId}: No headers generated for CSV. Response data might be empty or malformed.`);
        return res.status(404).json({ message: "No questions found in responses to generate CSV headers." });
    }

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
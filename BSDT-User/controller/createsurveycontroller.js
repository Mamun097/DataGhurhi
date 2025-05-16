const supabase = require('../db');

exports.getsavedtemplate = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('template')
            .select('*');

        if (error) {
            console.error('Error fetching saved templates:', error);
            return res.status(500).json({ error: 'Failed to fetch saved templates' });
        }

        if (data.length === 0) {
            return res.status(404).json({ message: 'No saved templates found' });
        }

        // Return the array of templates
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error in getsavedtemplate:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
const supabase = require('../db');

// Fetch all FAQs (no user_id or privacy filter needed)
const getAllFaqs = async () => {
    try {
        const { data, error } = await supabase
            .from('faq')
            .select('id, topic, question, answer, link');
        if (error) {
            console.error('Error fetching FAQs:', error);
            return { error: 'Error fetching FAQs' };
        }
        return { data };
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return { error: 'Internal server error' };
    }
};

// Create a new FAQ entry
const createFaq = async (req) => {
    try {
        const { topic, question, answer, link } = req.body;
        const { data, error } = await supabase
            .from('faq')
            .insert({ id, topic, question, answer, link })
            .select();
        if (error) {
            console.error('Error creating FAQ:', error);
            return { error: 'Error creating FAQ' };
        }
        return { data };
    } catch (error) {
        console.error('Error creating FAQ:', error);
        return { error: 'Internal server error' };
    }
};

module.exports = {
    getAllFaqs,
    createFaq
};

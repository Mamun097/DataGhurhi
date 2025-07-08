const Faq = require('../model/faq');

// Get all visible FAQs for the logged-in user
exports.getAllFaqs = async (req, res) => {
    try {
        const { data, error } = await Faq.getAllFaqs(req);
        if (error) {
            console.error('FAQ fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch FAQs' });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No FAQs found' });
        }
        return res.status(200).json({ faqs: data });
    } catch (err) {
        console.error('Internal error in getAllFaqs:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new FAQ entry
exports.createFaq = async (req, res) => {
    try {
        const { data, error } = await Faq.createFaq(req);
        if (error) {
            console.error('FAQ creation error:', error);
            return res.status(400).json({ error: 'Failed to create FAQ' });
        }
        return res.status(201).json({ message: 'FAQ created successfully', data });
    } catch (err) {
        console.error('Internal error in createFaq:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

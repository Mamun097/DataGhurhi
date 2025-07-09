const Search = require('../model/search');

exports.performSearch = async (req, res) => {
    try {
        const { query, filter } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        const { data, error } = await Search.searchAll(query, filter);

        if (error) {
            console.error('Search error:', error);
            return res.status(500).json({ error: "Search failed" });
        }

        if (!data || data.length === 0) {
            return res.status(200).json({ results: [] });
        }

        return res.status(200).json({ results: data });
    } catch (err) {
        console.error("Internal error in performSearch:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

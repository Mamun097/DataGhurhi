import React, { useEffect, useState } from 'react';
import apiClient from '../api';

export default function FaqList() {
  const [groupedFaqs, setGroupedFaqs] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await apiClient.get('/api/faq');
        const faqs = response.data.faqs || [];

        // Group FAQs by topic
        const grouped = faqs.reduce((acc, faq) => {
          if (!acc[faq.topic]) acc[faq.topic] = [];
          acc[faq.topic].push(faq);
          return acc;
        }, {});
        setGroupedFaqs(grouped);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs. Please try again later.');
      }
    };

    fetchFaqs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>

      {error && <p className="text-red-500">{error}</p>}

      {Object.keys(groupedFaqs).length === 0 && !error ? (
        <p className="text-gray-500">No FAQs found.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFaqs).map(([topic, faqs]) => (
            <div key={topic}>
              <h2 className="text-xl font-bold text-blue-800 mb-4">{topic}</h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border p-4 rounded bg-gray-50 shadow-sm">
                    <p className="font-semibold text-gray-900">{faq.question}</p>
                    <p className="text-gray-700 mt-1">{faq.answer}</p>
                    {faq.link && (
                      <a
                        href={faq.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline mt-1 inline-block"
                      >
                        Learn more
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

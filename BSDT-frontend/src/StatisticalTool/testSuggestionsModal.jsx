const TestSuggestionsModal = ({ setIsSuggestionModalOpen , language }) => {


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
            <button
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                onClick={() => setIsSuggestionModalOpen(false)}
            >
                ✖
            </button>
            <h2 className="text-xl font-semibold mb-4 text-purple-600">
                {language === 'bn' ? 'পরীক্ষার পরামর্শ' : 'Test Suggestions'}
            </h2>

            <ul className="list-disc pl-5 text-gray-700 text-sm space-y-2">
                <li>
                {language === 'bn'
                    ? 'ডেটা স্বাভাবিক না হলে Kruskal বা Mann-Whitney ব্যবহার করুন।'
                    : 'Use Kruskal or Mann-Whitney for non-normal data.'}
                </li>
                <li>
                {language === 'bn'
                    ? 'দুটি ভেরিয়েবলের সম্পর্ক জানতে Pearson বা Spearman ব্যবহার করুন।'
                    : 'Use Pearson or Spearman to test correlation between two variables.'}
                </li>
                <li>
                {language === 'bn'
                    ? 'তিন বা ততোধিক গ্রুপ তুলনা করতে ANOVA ব্যবহার করুন।'
                    : 'Use ANOVA for comparing 3 or more groups.'}
                </li>
                
            </ul>
            </div>
        </div>
    );
};

export default TestSuggestionsModal;

from django import forms

class AnalysisForm(forms.Form):
    excel_file = forms.FileField(label='Upload Excel File')
    column1 = forms.ChoiceField(label='Primary Column', choices=[], required=True)
    column2 = forms.ChoiceField(label='Secondary Column', choices=[], required=False)
    column3 = forms.ChoiceField(label='Covariate Column (for ANCOVA)', choices=[], required=False)
    column4 = forms.ChoiceField(label='Third Column (for 4x4)', choices=[], required=False)
    column5 = forms.ChoiceField(label='Fourth Column (for 4x4)', choices=[], required=False)

    heatmap_size = forms.ChoiceField(
        choices=[('2x2', '2x2 Heatmap'), ('4x4', '4x4 Heatmap')],
        label='Heatmap Size',
        required=False
    )

    test_type = forms.ChoiceField(
        choices=[
            ('kruskal', 'Kruskal-Wallis'),
            ('mannwhitney', 'Mann-Whitney U'),
            ('spearman', 'Spearman Rank Correlation'),
            ('pearson', 'Pearson Correlation'),
            ('wilcoxon', 'Wilcoxon Signed-Rank'),
            ('shapiro', 'Shapiro-Wilk Normality Test'),
            ('ttest_ind', 'Independent t-test'),
            ('ttest_paired', 'Paired t-test'),
            ('ttest_onesample', 'One-Sample t-test'),
            ('linear_regression', 'Linear Regression'),
            ('anova', 'ANOVA'),
            ('ancova', 'ANCOVA'),
            ('ztest', 'Z-Test (Difference in Means)'),
            ('ftest', 'F-Test (Difference in Variance)'),
            ('chi_square', 'Chi-Square Test'),
            ('cramers_heatmap', 'Cramér\'s V Heatmap'),
            ('network_graph', 'Network Graph (Significant Associations)'),
        ],
        label='Statistical Test'
    )
    reference_value = forms.FloatField(
        label='Reference Value (for one-sample t-test)',
        required=False,
        initial=0
    )

    def __init__(self, *args, **kwargs):
        columns = kwargs.pop('columns', [])
        super().__init__(*args, **kwargs)
        column_choices = [(col, col) for col in columns]
        self.fields['column1'].choices = column_choices
        self.fields['column2'].choices = column_choices
        self.fields['column3'].choices = column_choices
        self.fields['column4'].choices = column_choices
        self.fields['column5'].choices = column_choices
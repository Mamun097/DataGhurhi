export const handleSubmit = ({file, setErrorMessage, testType, setIsAnalyzing, language, heatmapSize, fileName, userId, column1, column2
    , column3, column4, imageFormat, useDefaultSettings, labelFontSize, tickFontSize, 
    imageQuality, imageSize, colorPalette, barWidth, boxWidth, violinWidth, histogramBins, barColor, 
    lineColor, lineStyle, legendFontSize, dotWidth, lineWidth, dotColor, boxColor, medianColor, fCurveColor, 
    fLineColor, zCurveColor, zLineColor, tCurveColor, tLineColor, hist1Color, hist2Color, extraColumns = [], 
    histColor, kdeColor, distColor, swarmColor, barChartType = "vertical", selectedColumns = [], setResults, django_base_url,
    t,
}) => (e) => {
    e.preventDefault();

    if (!file || !column1) {
      setErrorMessage(t.uploadError);
      return;
    }
    if (!column1 && testType !== "network_graph") {
      setErrorMessage(t.columnError || t.columnError);
      return;
    }

    if (testType === "linear_regression" && !column2) {
      setErrorMessage(
        t.column2Error || "Please select a second column for regression."
      );
      return;
    }

    if (testType === "ancova" && (!column1 || !column2 || !column3)) {
      setErrorMessage(
        t.column3Error ||
          "Please select group, covariate, and dependent columns for ANCOVA."
      );
      return;
    }

    setIsAnalyzing(true);
    const langCode = language === "বাংলা" ? "bn" : "en";
    const isHeatmap4x4 = heatmapSize === "4x4";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_name", fileName);
    formData.append("userID", userId);
    formData.append("Fileurl", sessionStorage.getItem("fileURL") || "");
    formData.append("test_type", testType);
    formData.append("column1", column1);
    formData.append("column2", column2);
    formData.append("language", langCode);
    formData.append("heatmapSize", heatmapSize);
    /////
    if (testType === "ancova") {
      formData.append("primary_col", column1);
      formData.append("secondary_col", column2);
      formData.append("dependent_col", column3);
    } else if (testType === "kolmogorov" || testType === "anderson") {
      formData.append("column", column1);
    } else if (testType === "fzt") {
      formData.append("primary_col", column1);
      formData.append("secondary_col", column2);
    } else if (testType === "eda_distribution" || testType === "eda_pie") {
      formData.append("column", column1);
    } else if (testType === "eda_swarm") {
      formData.append("cat_column", column1);
      formData.append("num_column", column2);
    } else if (testType === "similarity") {
      formData.append("column1", column1);
      formData.append("column2", column2);
    } else if (testType === "eda_basics") {
        return;
    } else if (testType === "network_graph") {
        return;
    } else if (testType === "bar_chart") {
      // New Code for Bar Chart
      formData.append("column1", column1); //  Only one column
      formData.append("orientation", barChartType); //  Vertical / Horizontal choice
    } else {
      formData.append("column1", column1);
      formData.append("column2", column2);
    }

    if ((testType === "pearson" || testType === "spearman") && isHeatmap4x4) {
      if (column3 && column4) {
        formData.append("column3", column3);
        formData.append("column4", column4);
      } else {
        setErrorMessage("Please select 4 columns for 4x4 heatmap.");
        setIsAnalyzing(false);
        return;
      }
    }
    if (
      [
        "kruskal",
        "mannwhitney",
        "wilcoxon",
        "pearson",
        "spearman",
        "shapiro",
        "linear_regression",
        "anova",
        "ancova",
        "kolmogorov",
        "anderson",
        "fzt",
        "eda_distribution",
        "eda_swarm",
        "bar_chart",
        "eda_pie",
        "eda_basics",
        "chi_square",
        "cramers_heatmap",
        "cross_tabulation",
        "network_graph",
      ].includes(testType)
    ) {
      formData.append("format", imageFormat);
      formData.append("use_default", useDefaultSettings ? "true" : "false");

      if (!useDefaultSettings) {
        formData.append("label_font_size", labelFontSize.toString());
        formData.append("tick_font_size", tickFontSize.toString());
        formData.append("image_quality", imageQuality.toString());
        formData.append("image_size", imageSize);
        formData.append("palette", colorPalette);
        formData.append("bar_width", barWidth.toString());

        if (["kruskal", "mannwhitney"].includes(testType)) {
          formData.append("box_width", boxWidth.toString());
          formData.append("violin_width", violinWidth.toString());
        }

        if (testType === "shapiro") {
          formData.append("bins", histogramBins.toString());
          formData.append("bar_color", barColor);
          formData.append("line_color", lineColor);
          formData.append("line_style", lineStyle);
        }

        if (testType === "linear_regression") {
          formData.append("legend_font_size", legendFontSize.toString());
          formData.append("line_color", lineColor);
          formData.append("line_style", lineStyle);
          formData.append("dot_width", dotWidth.toString());
          formData.append("line_width", lineWidth.toString());
          formData.append("dot_color", dotColor);
        }

        if (testType === "anova") {
          formData.append("box_color", boxColor);
          formData.append("median_color", medianColor);
        }

        if (testType === "ancova") {
          formData.append("box_color", boxColor);
          formData.append("line_color", lineColor);
          formData.append("line_style", lineStyle);
          formData.append("dot_color", dotColor);
          formData.append("dot_width", dotWidth.toString());
          formData.append("line_width", lineWidth.toString());
        }

        if (testType === "kolmogorov") {
          formData.append("label_font_size", labelFontSize.toString());
          formData.append("tick_font_size", tickFontSize.toString());
          formData.append("image_quality", imageQuality.toString());
          formData.append("image_width", imageSize.split("x")[0]);
          formData.append("image_height", imageSize.split("x")[1]);
          formData.append("ecdf_color", dotColor);
          formData.append("cdf_color", lineColor);
          formData.append("line_style", lineStyle);
        }

        if (testType === "anderson") {
          formData.append("scatter_color", dotColor);
          formData.append("line_color", lineColor);
          formData.append("line_style", lineStyle);
        }

        if (testType === "fzt") {
          formData.append("line_width", lineWidth.toString());
          formData.append("line_style", lineStyle);
          formData.append("f_curve_color", fCurveColor);
          formData.append("f_line_color", fLineColor);
          formData.append("z_curve_color", zCurveColor);
          formData.append("z_line_color", zLineColor);
          formData.append("t_curve_color", tCurveColor);
          formData.append("t_line_color", tLineColor);
          formData.append("hist1_color", hist1Color);
          formData.append("hist2_color", hist2Color);
        }

        if (testType === "cross_tabulation") {
          formData.append("column1", column1);
          formData.append("column2", column2);
          extraColumns.forEach((col, idx) => {
            formData.append(`column${idx + 3}`, col);
          });
        }

        if (testType === "eda_distribution") {
          formData.append("hist_color", histColor);
          formData.append("kde_color", kdeColor);
          formData.append("dist_color", distColor);
        }

        if (testType === "eda_swarm") {
          formData.append("swarm_color", swarmColor);
        }
        if (testType === "bar_chart") {
          formData.append("orientation", barChartType); // "vertical" | "horizontal"
        }
      }

      if (
        [
          "pearson",
          "spearman",
          "cross_tabulation",
          "cramers_heatmap",
          "chi_square",
          "network_graph",
        ].includes(testType)
      ) {
        formData.append("heatmapSize", heatmapSize);

        selectedColumns.forEach((col, idx) => {
          formData.append(`column${idx + 1}`, col);
        });
      }
    }

    // Debug output
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    fetch(`${django_base_url}/api/analyze/`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setIsAnalyzing(false);
      })
      .catch((err) => {
        setErrorMessage("Error analyzing: " + err);
        setIsAnalyzing(false);
      });
  };
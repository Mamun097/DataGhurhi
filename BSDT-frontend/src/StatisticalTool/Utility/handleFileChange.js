export const handleFileChange = async ({ e, setFile, setFileName, setUploadStatus, userId, setErrorMessage, fetchcolumn, django_base_url }) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      sessionStorage.setItem("file_name", selectedFile.name);
      setFileName(selectedFile.name);
      setUploadStatus("loading");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userID", userId);
      console.log("File selected:", selectedFile);

      fetch(`${django_base_url}/api/upload-file/`, {
        method: "POST",

        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setUploadStatus("success");
            const fixedUrl = data.fileURL.replace(/\\/g, "/");
            console.log("ee", fixedUrl);
            sessionStorage.setItem("fileURL", fixedUrl);
            console.log(
              "File uploaded successfully. URL:",
              sessionStorage.getItem("fileURL")
            );
            fetchcolumn();
          } else {
            setErrorMessage(data.error);
            setUploadStatus("error");
          }
        })
        .catch((error) => {
          setErrorMessage("Error processing file: " + error);
          setUploadStatus("error");
        });
    }
  };
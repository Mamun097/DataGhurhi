import google.generativeai as genai

genai.configure(api_key="AIzaSyCRPUdpHKf9DC_4VdyfSmUAqFZAgVXXY6k")

model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")


prompt = "Translate this English sentence into Bengali (only in Bengali script, no transliteration): 'how many hours per day use social media?'"


response = model.generate_content(prompt)
bengali_text = response.text.strip()


html_content = f"""<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Bengali Translation</title>
</head>
<body>
    <p style="font-size:24px;">{bengali_text}</p>
</body>
</html>"""

with open("translated_bengali.html", "w", encoding="utf-8") as file:
    file.write(html_content)

print("Translation saved to translated_bengali.html")

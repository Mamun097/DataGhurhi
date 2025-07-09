import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./AboutPage.css";
import TeamImage from "../assets/images/about1.jpeg";
import NavbarHome from "../Homepage/navbarhome";
import NavbarAcholder from "../ProfileManagement/NavbarAccountHolder";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
  try {
    const inputText = Array.isArray(textArray) ? textArray : [textArray];
    const translatedTexts = [];

    for (let text of inputText) {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`, // Corrected with backticks
        {
          q: text,
          target: targetLang,
          format: "text",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.translations
      ) {
        translatedTexts.push(response.data.data.translations[0].translatedText);
      } else {
        translatedTexts.push(text);
      }
    }

    return translatedTexts;
  } catch (error) {
    console.error("Translation error:", error);
    return textArray;
  }
};

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const isLoggedIn = !!localStorage.getItem("token");
  const formRef = useRef(null);
  const [status, setStatus] = useState({ success: false, error: false });

  const baseLabels = {
    heading: "About Us",
    description:
      "Our platform empowers users to create surveys, share with others efficiently, analyze all answers, and generate insightful reports — all in native languages, primarily in Bengali. We aim to bridge the gap in digital accessibility, ensuring that language is not a barrier to effective communication and data collection.",
    nameLabel: "Name",
    emailLabel: "Email",
    subjectLabel: "Subject",
    messageLabel: "Message",
    buttonText: "Send Message",
    caption: "A picture of our innovators",
    contactHeading: "Contact Us",
    thankYou: "Thank you for your message!",
    errorMsg: "There was an error sending your message.",
    namePlaceholder: "Your Name",
    emailPlaceholder: "Your Email",
    subjectPlaceholder: "Subject",
    messagePlaceholder: "Message",
    fundingHeading: "Funding Acknowledgment",
    fundingBody:
      "We would like to sincerely thank the Research and Innovation Center (RIC) under the EDGE project for their generous support in funding our Bangla-based quantitative data analysis tool. This support has enabled us to develop a bilingual platform that facilitates survey creation and data analysis in both Bangla and English. We are honored to contribute to RIC’s vision of enhancing research, innovation, and digital skill development in Bangladesh.",
    teamHeading: "Initial Development Team",
    teamMembers: [
      {
        name: "Dr. A. B. M. Alim Al Islam",
        role: "Team Lead/PI",
        affiliation: "Professor, Department of CSE, BUET",
      },
      {
        name: "Dr. Sadia Sharmin",
        role: "Mentor",
        affiliation:
          "Associate Professor and Associate DSW, Department of CSE, BUET",
      },
      {
        name: "Tamanna Haque Nipa",
        role: "Co-Team Lead/PI-1",
        affiliation: "PhD student, Department of CSE, BUET",
      },
      {
        name: "Dr. Jannatun Noor",
        role: "Co-Team Lead/CO-PI-2",
        affiliation: "Associate Professor, Department of CSE, UIU",
      },
      {
        name: "Ishrat Jahan",
        role: "Co-Team Lead/CO-PI-3",
        affiliation: "Lecturer in the Department of CSE, BUET",
      },
      {
        name: "Ishika Tarin",
        role: "Research Assistant-1",
        affiliation: "BSc in CSE, BUET",
      },
      {
        name: "Bijoy Ahmed Saiem",
        role: "Research Assistant-2",
        affiliation: "Lecturer, BSc in CSE, BRAC University",
      },
      {
        name: "Mamun Munshi",
        role: "Research Assistant-3",
        affiliation: "BSc in CSE, BUET",
      },
      {
        name: "Swarnali Saha",
        role: "Research Assistant-4",
        affiliation: "BSc in CSE, BUET",
      },
      {
        name: "Md. Farhadul Islam",
        role: "Research Assistant-5",
        affiliation: "BSc in CSE, BRAC University",
      },
      {
        name: "Md Mahmud Hasan",
        role: "Research Assistant-6",
        affiliation:
          "Undergraduate Student (Level 3, Term 1), Department of CSE, BUET",
      },
      {
        name: "Mirza Tawhid Umar",
        role: "Research Assistant-7",
        affiliation:
          "Undergraduate Student (Level 3, Term 1), Department of CSE, BUET",
      },
      {
        name: "Ahanaf Ferdous",
        role: "Research Assistant-8",
        affiliation: "BSc in CSE, BRAC University",
      },
    ],
  };

  const [uiLabels, setUiLabels] = useState(baseLabels);

  useEffect(() => {
    const translateUiLabels = async () => {
      if (language === "English") {
        setUiLabels(baseLabels);
      } else {
        const keys = Object.keys(baseLabels);
        const values = Object.values(baseLabels);
        const translated = await translateText(values, "bn");
        const mapped = {};
        keys.forEach((k, i) => {
          mapped[k] = translated[i];
        });

        // Now translate team member info individually
        const translatedTeamMembers = await Promise.all(
          baseLabels.teamMembers.map(async (member) => {
            const memberDetails = await translateText(
              [member.name, member.role, member.affiliation],
              "bn"
            );
            return {
              name: memberDetails[0],
              role: memberDetails[1],
              affiliation: memberDetails[2],
            };
          })
        );

        setUiLabels({ ...mapped, teamMembers: translatedTeamMembers });
      }
    };
    translateUiLabels();
  }, [language]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = formRef.current;
    const formData = new FormData(form);

    setStatus({ success: false, error: false });

    try {
      const response = await fetch("https://formspree.io/f/xblrgble", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setStatus({ success: true, error: false });
        form.reset();
      } else {
        setStatus({ success: false, error: true });
      }
    } catch (error) {
      console.error("Form submit error:", error);
      setStatus({ success: false, error: true });
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <div>
      {isLoggedIn ? (
        <NavbarAcholder
          language={language}
          setLanguage={handleLanguageChange}
        />
      ) : (
        <NavbarHome language={language} setLanguage={handleLanguageChange} />
      )}

      <div className="about-container">
        <section>
          <h2 className="about-heading">{uiLabels.heading}</h2>

          <div className="photo-grid">
            <div className="photo-card">
              <img src={TeamImage} alt="Team" className="photo-image" />
              <p className="photo-caption">{uiLabels.caption}</p>
            </div>
            <p className="about-description">{uiLabels.description}</p>
          </div>
        </section>

        <section className="funding-section">
          <h2>{uiLabels.fundingHeading}</h2>
          <p>{uiLabels.fundingBody}</p>
        </section>

        <section className="team-section">
          <h2>{uiLabels.teamHeading}</h2>
          {uiLabels.teamMembers &&
            uiLabels.teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <strong>{member.name}</strong> – {member.role}
                <br />
                {member.affiliation}
              </div>
            ))}
        </section>

        <section className="contact-section">
          <h2 className="contact-heading">{uiLabels.contactHeading}</h2>
          <form
            ref={formRef}
            className="php-email-form"
            onSubmit={handleSubmit}
            method="POST"
          >
            <div className="form-row">
              <div className="form-group half">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder={uiLabels.namePlaceholder}
                  required
                />
              </div>
              <div className="form-group half">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder={uiLabels.emailPlaceholder}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="subject"
                className="form-control"
                placeholder={uiLabels.subjectPlaceholder}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                name="message"
                rows="6"
                className="form-control"
                placeholder={uiLabels.messagePlaceholder}
                required
              ></textarea>
            </div>

            <div className="my-3">
              {status.error && (
                <div className="error-message">{uiLabels.errorMsg}</div>
              )}
              {status.success && (
                <div className="thank-you-message">{uiLabels.thankYou}</div>
              )}
            </div>

            <div className="text-center">
              <button type="submit" className="submit-button">
                {uiLabels.buttonText}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

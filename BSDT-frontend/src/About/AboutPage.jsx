import React, { useState, useRef } from "react";
import "./AboutPage.css";
import TeamImage from "../assets/images/about1.jpeg";
import NavbarHome from "../Homepage/navbarhome";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import { FaPhone } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";

const baseLabels = {
  English: {
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
        name: "A. B. M. Alim Al Islam",
        role: "Team Lead/PI",
        affiliation: "Professor, Department of CSE, BUET",
        phone: "+880 1817533953, +880 1402250466",
        email: "alim_razi@cse.buet.ac.bd",
      },
      {
        name: "Dr. Sadia Sharmin",
        role: "Mentor",
        affiliation:
          "Associate Professor and Associate DSW, Department of CSE, BUET",
        phone: "+880 1817108555",
        email: "sadiasharmin@cse.buet.ac.bd",
      },
      {
        name: "Tamanna Haque Nipa",
        role: "Co-Team Lead/PI-1",
        affiliation: "PhD student, Department of CSE, BUET",
        phone: "+880 1840994895",
        email: "tamanna.haque8@gmail.com",
      },
      {
        name: "Dr. Jannatun Noor",
        role: "Co-Team Lead/CO-PI-2",
        affiliation: "Associate Professor, Department of CSE, UIU",
        phone: "+880 1834608800",
        email: "jannatun@cse.uiu.ac.bd",
      },
      {
        name: "Ishrat Jahan",
        role: "Co-Team Lead/CO-PI-3",
        affiliation: "Lecturer in the Department of CSE, BUET",
        phone: "+880 1676610771",
        email: "ishrat@cse.buet.ac.bd",
      },
      {
        name: "Ishika Tarin",
        role: "Research Assistant-1",
        affiliation: "BSc in CSE, BUET",
        phone: "+880 1521581865",
        email: "ishikaime6561@gmail.com",
      },
      {
        name: "Bijoy Ahmed Saiem",
        role: "Research Assistant-2",
        affiliation: "Lecturer, BSc in CSE, BRAC University",
        phone: "+880 1711259264",
        email: "bijoysaeem@gmail.com",
      },
      {
        name: "Mamun Munshi",
        role: "Research Assistant-3",
        affiliation: "BSc in CSE, BUET",
        phone: "+880 1649706805",
        email: "mamunmunshi055@gmail.com",
      },
      {
        name: "Swarnali Saha",
        role: "Research Assistant-4",
        affiliation: "BSc in CSE, BUET",
        phone: "+880 1601819956",
        email: "swarnalisaha311220@gmail.com",
      },
      {
        name: "Md. Farhadul Islam",
        role: "Research Assistant-5",
        affiliation: "BSc in CSE, BRAC University",
        phone: "+880 1918051324",
        email: "farhadulfuad324@gmail.com",
      },
      {
        name: "Md Mahmud Hasan",
        role: "Research Assistant-6",
        affiliation:
          "Undergraduate Student (Level 3, Term 1), Department of CSE, BUET",
        // phone: "+880 1785392941",
        // email: "hasanaranna3@gmail.com",
      },
      {
        name: "Mirza Tawhid Umar",
        role: "Research Assistant-7",
        affiliation:
          "Undergraduate Student (Level 3, Term 1), Department of CSE, BUET",
        phone: "+880 174128685",
        email: "tawhidumar.21@protonmail.com",
      },
      {
        name: "Ahanaf Ferdous",
        role: "Research Assistant-8",
        affiliation: "BSc in CSE, BRAC University",
        phone: "+880 1779000952",
        email: "ahanaf.ferdous@g.bracu.ac.bd",
      },
    ],
  },
  বাংলা: {
    heading: "আমাদের সম্পর্কে",
    description:
      "আমাদের প্ল্যাটফর্ম ব্যবহারকারীদের সহজে সার্ভে তৈরি করতে, অন্যদের সাথে শেয়ার করতে, সমস্ত উত্তর বিশ্লেষণ করতে এবং অন্তর্দৃষ্টিপূর্ণ রিপোর্ট তৈরি করতে সহায়ক। আমরা ডিজিটাল অ্যাক্সেসিবিলিটিতে সেতুবন্ধন তৈরি করতে চাই, যেখানে ভাষা একটি বাধা নয় কার্যকর যোগাযোগ এবং ডেটা সংগ্রহের জন্য।",
    nameLabel: "নাম",
    emailLabel: "ইমেল",
    subjectLabel: "বিষয়",
    messageLabel: "বার্তা",
    buttonText: "বার্তা পাঠান",
    caption: "আমাদের উদ্ভাবকদের ছবি",
    contactHeading: "যোগাযোগ করুন",
    thankYou: "আপনার বার্তার জন্য ধন্যবাদ!",
    errorMsg: "আপনার বার্তা পাঠাতে একটি ত্রুটি ঘটেছে।",
    namePlaceholder: "আপনার নাম",
    emailPlaceholder: "আপনার ইমেল",
    subjectPlaceholder: "বিষয়",
    messagePlaceholder: "বার্তা",
    fundingHeading: "অর্থায়ন স্বীকৃতি",
    fundingBody:
      "আমরা EDGE প্রকল্পের অধীনে রিসার্চ এবং ইনোভেশন সেন্টার (RIC) কে আন্তরিক ধন্যবাদ জানাই তাদের উদার সমর্থনের জন্য, যা আমাদের বাংলা ভিত্তিক পরিমাণগত ডেটা বিশ্লেষণ টুল তৈরি করতে সহায়ক হয়েছে। এই সমর্থন আমাদেরকে বাংলা এবং ইংরেজি উভয় ভাষায় সার্ভে তৈরি এবং ডেটা বিশ্লেষণ করার জন্য একটি দ্বিভাষিক প্ল্যাটফর্ম তৈরি করতে সক্ষম করেছে। আমরা RIC-এর গবেষণা, উদ্ভাবন এবং ডিজিটাল দক্ষতা উন্নয়নের জন্য বাংলাদেশের জন্য তাদের দৃষ্টিভঙ্গিতে অবদান রাখতে পেরে গর্বিত।",
    teamHeading: "ইনিশিয়াল ডেভেলপমেন্ট টিম",
    teamMembers: [
      {
        name: "এ. বি. এম. আলিম আল ইসলাম",
        role: "টিম লিড/পিআই",
        affiliation: "প্রফেসর, সিএসই বিভাগ, বুয়েট",
        phone: "+880 1817533953, +880 1402250466",
        email: "alim_razi@cse.buet.ac.bd",
      },
      {
        name: "ড. সাদিয়া শারমিন",
        role: "মেন্টর",
        affiliation: "সহযোগী অধ্যাপক এবং সহযোগী DSW, সিএসই বিভাগ, বুয়েট",
        phone: "+880 1817108555",
        email: "sadiasharmin@cse.buet.ac.bd",
      },
      {
        name: "তামান্না হক নিপা",
        role: "সহ-টিম লিড/কো-পিআই-১",
        affiliation: "পিএইচডি ছাত্র, সিএসই বিভাগ, বুয়েট",
        phone: "+880 1840994895",
        email: "tamanna.haque8@gmail.com",
      },
      {
        name: "ড. জান্নাতুন নূর",
        role: "সহ-টিম লিড/কো-পিআই-২",
        affiliation: "সহযোগী অধ্যাপক, সিএসই বিভাগ, ইউআইইউ",
        phone: "+880 1834608800",
        email: "jannatun@cse.uiu.ac.bd",
      },
      {
        name: "ইশরাত জাহান",
        role: "সহ-টিম লিড/কো-পিআই-৩",
        affiliation: "লেকচারার, সিএসই বিভাগ, বুয়েট",
        phone: "+880 1676610771",
        email: "ishrat@cse.buet.ac.bd",
      },
      {
        name: "ইশিকা তারিন",
        role: "রিসার্চ এসিস্ট্যান্ট-১",
        affiliation: "বিএসসি ইন সিএসই, বুয়েট",
        phone: "+880 1521581865",
        email: "ishikaime6561@gmail.com",
      },
      {
        name: "বিজয় আহমেদ সাঈম",
        role: "রিসার্চ এসিস্ট্যান্ট-২",
        affiliation: "লেকচারার, বিএসসি ইন সিএসই, ব্র্যাক ইউনিভার্সিটি",
        phone: "+880 1711259264",
        email: "bijoysaeem@gmail.com",
      },
      {
        name: "মামুন মুনসি",
        role: "রিসার্চ এসিস্ট্যান্ট-৩",
        affiliation: "বিএসসি ইন সিএসই, বুয়েট",
        phone: "+880 1649706805",
        email: "mamunmunshi055@gmail.com",
      },
      {
        name: "স্বর্ণালী সাহা",
        role: "রিসার্চ এসিস্ট্যান্ট-৪",
        affiliation: "বিএসসি ইন সিএসই, বুয়েট",
        phone: "+880 1601819956",
        email: "swarnalisaha311220@gmail.com",
      },
      {
        name: "মো. ফরহাদুল ইসলাম",
        role: "রিসার্চ এসিস্ট্যান্ট-৫",
        affiliation: "বিএসসি ইন সিএসই, ব্র্যাক ইউনিভার্সিটি",
        phone: "+880 1918051324",
        email: "farhadulfuad324@gmail.com",
      },
      {
        name: "মোঃ মাহমুদ হাসান",
        role: "রিসার্চ এসিস্ট্যান্ট-৬",
        affiliation: "স্নাতক ছাত্র (লেভেল ৩, টার্ম ১), সিএসই বিভাগ, বুয়েট",
        // phone: "+880 1785392941",
        // email: "hasanaranna3@gmail.com",
      },
      {
        name: "মির্জা তাওহিদ উমর",
        role: "রিসার্চ এসিস্ট্যান্ট-৭",
        affiliation: "স্নাতক ছাত্র (লেভেল ৩, টার্ম ১), সিএসই বিভাগ, বুয়েট",
        phone: "+880 174128685",
        email: "tawhidumar.21@protonmail.com",
      },
      {
        name: "আহানাফ ফেরদৌস",
        role: "রিসার্চ এসিস্ট্যান্ট-৮",
        affiliation: "বিএসসি ইন সিএসই, ব্র্যাক ইউনিভার্সিটি",
        phone: "+880 1779000952",
        email: "ahanaf.ferdous@g.bracu.ac.bd",
      },
    ],
  },
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

  const [uiLabels, setUiLabels] = useState(baseLabels[language]);

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
      const response = await fetch("https://formspree.io/f/xqabolen", {
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
    setUiLabels(baseLabels[newLang]);
  };

  return (
    <div>
      {console.log("Language:", language)}
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
                <br />
                {member.phone && (
                  <span>
                    <FaPhone /> {member.phone}
                  </span>
                )}
                {member.email && (
                  <span>
                    <FaEnvelope />{" "}
                    <a href={`mailto:${member.email}`}>{member.email}</a>
                  </span>
                )}
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

import { Observable, Dialogs, Utils, ApplicationSettings } from '@nativescript/core';
import { getCurrentLocation } from '@nativescript/geolocation';

export function createViewModel() {
    const viewModel = new Observable();

    // Language system
    const translations = {
        en: {
            appTitle: "Safe Calculator",
            rakshaTitle: "Raksha App",
            setupTitle: "Setup Security Code",
            setupMessage: "Enter a 3-4 digit security code to access emergency features:",
            confirmCode: "Confirm your security code:",
            codesDontMatch: "Codes don't match. Please try again.",
            setupComplete: "Security code set successfully!",
            sosTitle: "Help is on the way",
            sosMessage: "Emergency contacts have been notified with your location.",
            ok: "OK",
            back: "Back",
            emergencyContacts: "Emergency Contacts",
            nearestShelters: "Nearest Shelters",
            legalHelp: "Legal Help",
            counselingServices: "Counseling Services",
            quickExit: "Quick Exit",
            emergencySOS: "Emergency SOS",
            selectService: "Select Service",
            selectContact: "Select Contact",
            selectShelter: "Select Shelter",
            language: "Language",
            settings: "Settings"
        },
        hi: {
            appTitle: "सेफ कैलकुलेटर",
            rakshaTitle: "रक्षा ऐप",
            setupTitle: "सुरक्षा कोड सेटअप",
            setupMessage: "आपातकालीन सुविधाओं तक पहुंचने के लिए 3-4 अंकों का सुरक्षा कोड दर्ज करें:",
            confirmCode: "अपने सुरक्षा कोड की पुष्टि करें:",
            codesDontMatch: "कोड मेल नहीं खाते। कृपया पुनः प्रयास करें।",
            setupComplete: "सुरक्षा कोड सफलतापूर्वक सेट किया गया!",
            sosTitle: "सहायता मार्ग में है",
            sosMessage: "आपातकालीन संपर्कों को आपके स्थान के साथ सूचित कर दिया गया है।",
            ok: "ठीक है",
            back: "वापस",
            emergencyContacts: "आपातकालीन संपर्क",
            nearestShelters: "निकटतम आश्रय",
            legalHelp: "कानूनी सहायता",
            counselingServices: "परामर्श सेवाएं",
            quickExit: "त्वरित बाहर निकलें",
            emergencySOS: "आपातकालीन SOS",
            selectService: "सेवा का चयन करें",
            selectContact: "संपर्क चुनें",
            selectShelter: "आश्रय का चयन करें",
            language: "भाषा",
            settings: "सेटिंग्स"
        }
    };

    // Initialize language
    viewModel.currentLanguage = ApplicationSettings.getString("language", "en");
    viewModel.t = translations[viewModel.currentLanguage];

    // Calculator state
    viewModel.display = "0";
    viewModel.expression = "";
    viewModel.currentValue = "";
    viewModel.previousValue = "";
    viewModel.operator = "";
    viewModel.newNumber = true;
    viewModel.showHelp = false;
    viewModel.showSettings = false;
    viewModel.isRakshaMode = false;

    // Secret code system
    viewModel.secretCode = ApplicationSettings.getString("secretCode", "");
    viewModel.isFirstLaunch = !viewModel.secretCode;
    let enteredCode = "";
    let equalPressCount = 0;
    let equalPressTimer = null;

    // Emergency contacts for India
    const emergencyContacts = [
        { name: "National Emergency Number", nameHi: "राष्ट्रीय आपातकालीन नंबर", number: "112" },
        { name: "Women Helpline", nameHi: "महिला हेल्पलाइन", number: "1091" },
        { name: "Women Helpline - Domestic Abuse", nameHi: "महिला हेल्पलाइन - घरेलू हिंसा", number: "181" },
        { name: "Police", nameHi: "पुलिस", number: "100" },
        { name: "Ambulance", nameHi: "एम्बुलेंस", number: "108" },
        { name: "Child Helpline", nameHi: "बाल हेल्पलाइन", number: "1098" },
        { name: "Senior Citizen Helpline", nameHi: "वरिष्ठ नागरिक हेल्पलाइन", number: "14567" }
    ];

    // Shelters by state/city
    const shelters = {
        "Delhi": [
            "Shakti Shalini - 24x7 Shelter (011-24373737)",
            "YWCA - Working Women's Hostel (011-23368321)",
            "Shakti Shalini Crisis Center (011-47615555)",
            "Nari Niketan (011-23389305)"
        ],
        "Mumbai": [
            "Urja Trust Women's Shelter (022-26770137)",
            "Special Cell for Women & Children (022-22621679)",
            "Swadhar Greh Scheme Center (022-26662394)",
            "Apnalaya Women's Center (022-25563291)"
        ],
        "Bangalore": [
            "Parihar Family Counselling Centre (080-22943225)",
            "Vanitha Sahayavani (080-22943225)",
            "Abhayashrama Women's Shelter (080-23321301)",
            "Vimochana Women's Center (080-25492781)"
        ],
        "Chennai": [
            "International Foundation for Crime Prevention (044-23452365)",
            "Aruwe Women's Shelter (044-26426421)",
            "Tamil Nadu Women's Commission (044-28592750)",
            "YWCA Chennai (044-28336294)"
        ],
        "Kolkata": [
            "Swayam Women's Center (033-24799842)",
            "Parichiti Women's Shelter (033-24637692)",
            "Joint Women's Programme (033-24637692)"
        ],
        "Hyderabad": [
            "Bharosa Support Center (040-27852340)",
            "Sakhi Women's Resource Center (040-27852340)",
            "Telangana Women's Commission (040-23312349)"
        ]
    };

    // Legal help services
    const legalServices = {
        en: [
            "Free Legal Aid (NALSA) - 15100",
            "Women's Commission",
            "Police Assistance",
            "Domestic Violence Act Support",
            "District Legal Services Authority",
            "High Court Legal Aid",
            "Supreme Court Legal Aid"
        ],
        hi: [
            "नि:शुल्क कानूनी सहायता (NALSA) - 15100",
            "महिला आयोग",
            "पुलिस सहायता",
            "घरेलू हिंसा अधिनियम सहायता",
            "जिला कानूनी सेवा प्राधिकरण",
            "उच्च न्यायालय कानूनी सहायता",
            "सर्वोच्च न्यायालय कानूनी सहायता"
        ]
    };

    const counselingServices = {
        en: [
            "24x7 Crisis Helpline - 9152987821",
            "Online Chat Support",
            "Find Local Counselor",
            "Support Groups",
            "Mental Health Support - 14416",
            "Vandrevala Foundation - 9999666555",
            "iCall Psychosocial Helpline - 9152987821"
        ],
        hi: [
            "24x7 संकट हेल्पलाइन - 9152987821",
            "ऑनलाइन चैट सहायता",
            "स्थानीय काउंसलर खोजें",
            "सहायता समूह",
            "मानसिक स्वास्थ्य सहायता - 14416",
            "वंद्रेवाला फाउंडेशन - 9999666555",
            "iCall मनोसामाजिक हेल्पलाइन - 9152987821"
        ]
    };

    // Initialize app
    if (viewModel.isFirstLaunch) {
        setTimeout(() => {
            setupSecretCode();
        }, 1000);
    }

    // Setup secret code on first launch
    async function setupSecretCode() {
        try {
            const result = await Dialogs.prompt({
                title: viewModel.t.setupTitle,
                message: viewModel.t.setupMessage,
                inputType: "number",
                defaultText: "",
                okButtonText: viewModel.t.ok,
                cancelButtonText: viewModel.t.back
            });

            if (result.result && result.text && result.text.length >= 3) {
                const confirmResult = await Dialogs.prompt({
                    title: viewModel.t.setupTitle,
                    message: viewModel.t.confirmCode,
                    inputType: "number",
                    defaultText: "",
                    okButtonText: viewModel.t.ok,
                    cancelButtonText: viewModel.t.back
                });

                if (confirmResult.result && confirmResult.text === result.text) {
                    ApplicationSettings.setString("secretCode", result.text);
                    viewModel.secretCode = result.text;
                    viewModel.isFirstLaunch = false;
                    
                    await Dialogs.alert({
                        title: viewModel.t.setupTitle,
                        message: viewModel.t.setupComplete,
                        okButtonText: viewModel.t.ok
                    });
                } else {
                    await Dialogs.alert({
                        title: viewModel.t.setupTitle,
                        message: viewModel.t.codesDontMatch,
                        okButtonText: viewModel.t.ok
                    });
                    setupSecretCode();
                }
            } else {
                setupSecretCode();
            }
        } catch (error) {
            console.error("Setup error:", error);
        }
    }

    // Language switching
    viewModel.switchLanguage = () => {
        const newLang = viewModel.currentLanguage === "en" ? "hi" : "en";
        viewModel.currentLanguage = newLang;
        viewModel.t = translations[newLang];
        ApplicationSettings.setString("language", newLang);
        
        // Update observable properties
        viewModel.notifyPropertyChange("t", viewModel.t);
        viewModel.notifyPropertyChange("currentLanguage", newLang);
    };

    // Calculator functions - optimized for performance
    viewModel.onNumber = (args) => {
        const number = args.object.text;
        
        // Track entered code for secret activation
        if (!viewModel.isRakshaMode) {
            enteredCode += number;
        }
        
        // Calculator logic
        if (viewModel.newNumber) {
            viewModel.set("display", number);
            viewModel.set("expression", number);
            viewModel.newNumber = false;
        } else {
            const newDisplay = viewModel.display === "0" ? number : viewModel.display + number;
            viewModel.set("display", newDisplay);
            viewModel.set("expression", viewModel.expression + number);
        }
        viewModel.currentValue = viewModel.display;
    };

    viewModel.onOperator = (args) => {
        const operator = args.object.text;
        
        if (viewModel.currentValue) {
            if (viewModel.previousValue && viewModel.operator && !viewModel.newNumber) {
                calculateResult();
            }
            viewModel.operator = operator;
            viewModel.previousValue = viewModel.display;
            viewModel.set("expression", viewModel.expression + " " + operator + " ");
            viewModel.newNumber = true;
        }
        
        // Reset code tracking
        enteredCode = "";
        equalPressCount = 0;
    };

    viewModel.onEqual = () => {
        // Check for secret code activation
        if (!viewModel.isRakshaMode && enteredCode === viewModel.secretCode) {
            equalPressCount++;
            
            if (equalPressCount === 1) {
                if (equalPressTimer) clearTimeout(equalPressTimer);
                equalPressTimer = setTimeout(() => {
                    equalPressCount = 0;
                }, 2000);
            } else if (equalPressCount === 2) {
                clearTimeout(equalPressTimer);
                equalPressCount = 0;
                enteredCode = "";
                activateRakshaMode();
                return;
            }
        } else {
            equalPressCount = 0;
        }

        // Normal calculator equals
        if (viewModel.previousValue && viewModel.currentValue && viewModel.operator) {
            calculateResult();
        }
        enteredCode = "";
    };

    function calculateResult() {
        try {
            const prev = parseFloat(viewModel.previousValue);
            const current = parseFloat(viewModel.currentValue);
            let result = 0;

            switch (viewModel.operator) {
                case "+": result = prev + current; break;
                case "-": result = prev - current; break;
                case "×": result = prev * current; break;
                case "÷": 
                    if (current === 0) {
                        viewModel.set("display", "Error");
                        viewModel.set("expression", "Error");
                        return;
                    }
                    result = prev / current; 
                    break;
            }

            // Format result
            result = Math.round(result * 1000000000) / 1000000000;
            const resultStr = result.toString();
            
            viewModel.set("display", resultStr);
            viewModel.set("expression", resultStr);
            viewModel.currentValue = resultStr;
            viewModel.previousValue = "";
            viewModel.operator = "";
            viewModel.newNumber = true;
        } catch (error) {
            viewModel.set("display", "Error");
            viewModel.set("expression", "Error");
        }
    }

    viewModel.onDecimal = () => {
        if (viewModel.newNumber) {
            viewModel.set("display", "0.");
            viewModel.set("expression", "0.");
            viewModel.newNumber = false;
        } else if (!viewModel.display.includes(".")) {
            viewModel.set("display", viewModel.display + ".");
            viewModel.set("expression", viewModel.expression + ".");
        }
        viewModel.currentValue = viewModel.display;
    };

    viewModel.onClear = () => {
        viewModel.set("display", "0");
        viewModel.set("expression", "");
        viewModel.currentValue = "";
        viewModel.previousValue = "";
        viewModel.operator = "";
        viewModel.newNumber = true;
        enteredCode = "";
        equalPressCount = 0;
    };

    viewModel.onBackspace = () => {
        if (viewModel.display.length > 1 && viewModel.display !== "0" && viewModel.display !== "Error") {
            const newDisplay = viewModel.display.slice(0, -1);
            viewModel.set("display", newDisplay);
            viewModel.set("expression", viewModel.expression.slice(0, -1));
            viewModel.currentValue = newDisplay;
        } else {
            viewModel.set("display", "0");
            viewModel.set("expression", "");
            viewModel.newNumber = true;
        }
    };

    // Activate Raksha mode
    function activateRakshaMode() {
        viewModel.set("isRakshaMode", true);
        viewModel.set("showHelp", true);
        
        // Update title
        viewModel.notifyPropertyChange("t", viewModel.t);
        
        // Vibrate to confirm activation
        if (Utils.android) {
            try {
                const context = Utils.android.getActivity() || Utils.android.getApplicationContext();
                const vibrator = context.getSystemService(android.content.Context.VIBRATOR_SERVICE);
                if (vibrator) {
                    vibrator.vibrate(300);
                }
            } catch (error) {
                console.log("Vibration not available");
            }
        }
    }

    // Safety Features
    viewModel.onSOS = async () => {
        try {
            const location = await getCurrentLocation({
                desiredAccuracy: 3,
                updateDistance: 10,
                timeout: 20000
            });
            
            console.log(`Emergency SOS activated`);
            console.log(`Location: ${location.latitude}, ${location.longitude}`);
            
            Dialogs.alert({
                title: viewModel.t.sosTitle,
                message: viewModel.t.sosMessage,
                okButtonText: viewModel.t.ok
            });
        } catch (error) {
            console.error("SOS Error:", error);
            Dialogs.alert({
                title: viewModel.t.sosTitle,
                message: viewModel.t.sosMessage,
                okButtonText: viewModel.t.ok
            });
        }
    };

    viewModel.onQuickExit = () => {
        viewModel.set("showHelp", false);
        viewModel.set("isRakshaMode", false);
        viewModel.onClear();
        
        if (Utils.android) {
            try {
                const intent = new android.content.Intent(android.content.Intent.ACTION_MAIN);
                intent.addCategory(android.content.Intent.CATEGORY_HOME);
                intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                Utils.android.getActivity().startActivity(intent);
            } catch (error) {
                console.log("Cannot minimize app");
            }
        }
    };

    viewModel.onFindShelters = () => {
        const shelterList = [];
        Object.keys(shelters).forEach(city => {
            shelterList.push(`--- ${city} ---`);
            shelterList.push(...shelters[city]);
        });

        Dialogs.action({
            title: viewModel.t.nearestShelters,
            message: viewModel.t.selectShelter,
            cancelButtonText: viewModel.t.back,
            actions: shelterList.slice(0, 20) // Limit for performance
        });
    };

    viewModel.onLegalHelp = () => {
        Dialogs.action({
            title: viewModel.t.legalHelp,
            message: viewModel.t.selectService,
            cancelButtonText: viewModel.t.back,
            actions: legalServices[viewModel.currentLanguage]
        });
    };

    viewModel.onCounseling = () => {
        Dialogs.action({
            title: viewModel.t.counselingServices,
            message: viewModel.t.selectService,
            cancelButtonText: viewModel.t.back,
            actions: counselingServices[viewModel.currentLanguage]
        });
    };

    viewModel.onContacts = () => {
        const contactList = emergencyContacts.map(c => {
            const name = viewModel.currentLanguage === "hi" ? c.nameHi : c.name;
            return `${name}: ${c.number}`;
        });

        Dialogs.action({
            title: viewModel.t.emergencyContacts,
            message: viewModel.t.selectContact,
            cancelButtonText: viewModel.t.back,
            actions: contactList
        });
    };

    viewModel.onSettings = () => {
        viewModel.set("showSettings", !viewModel.showSettings);
    };

    return viewModel;
}
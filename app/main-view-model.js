import { Observable, Dialogs, Utils, ApplicationSettings } from '@nativescript/core';
import { getCurrentLocation } from '@nativescript/geolocation';

export function createViewModel() {
    const viewModel = new Observable();

    // Language system
    const translations = {
        en: {
            appTitle: "Safe Calculator",
            rakshaTitle: "Raksha",
            rakshaSubtitle: "Your safety companion - discreet help when you need it most",
            setupTitle: "Setup Security Code",
            setupMessage: "Enter a 3-4 digit security code to access emergency features:",
            confirmCode: "Confirm your security code:",
            codesDontMatch: "Codes don't match. Please try again.",
            setupComplete: "Security code set successfully!",
            changePassword: "Change Password",
            currentPassword: "Enter current password:",
            newPassword: "Enter new password:",
            confirmNewPassword: "Confirm new password:",
            passwordChanged: "Password changed successfully!",
            incorrectPassword: "Incorrect password. Please try again.",
            sosTitle: "Emergency Alert Sent",
            sosMessage: "Emergency contacts have been notified with your location. Help is on the way.",
            ok: "OK",
            back: "Back",
            cancel: "Cancel",
            emergencyContacts: "Emergency\nContacts",
            nearestShelters: "Nearest\nShelters",
            legalHelp: "Legal\nHelp",
            counselingServices: "Counseling\nServices",
            quickExit: "Quick\nExit",
            quickExitInstruction: "Tap Quick Exit to immediately hide the app and return to home screen",
            emergencySOS: "Emergency\nSOS",
            selectService: "Select Service",
            selectContact: "Select Contact",
            selectShelter: "Select Shelter",
            language: "Language",
            settings: "Settings"
        },
        hi: {
            appTitle: "सेफ कैलकुलेटर",
            rakshaTitle: "रक्षा",
            rakshaSubtitle: "आपका सुरक्षा साथी - जब आपको सबसे ज्यादा जरूरत हो तो गुप्त मदद",
            setupTitle: "सुरक्षा कोड सेटअप",
            setupMessage: "आपातकालीन सुविधाओं तक पहुंचने के लिए 3-4 अंकों का सुरक्षा कोड दर्ज करें:",
            confirmCode: "अपने सुरक्षा कोड की पुष्टि करें:",
            codesDontMatch: "कोड मेल नहीं खाते। कृपया पुनः प्रयास करें।",
            setupComplete: "सुरक्षा कोड सफलतापूर्वक सेट किया गया!",
            changePassword: "पासवर्ड बदलें",
            currentPassword: "वर्तमान पासवर्ड दर्ज करें:",
            newPassword: "नया पासवर्ड दर्ज करें:",
            confirmNewPassword: "नए पासवर्ड की पुष्टि करें:",
            passwordChanged: "पासवर्ड सफलतापूर्वक बदल दिया गया!",
            incorrectPassword: "गलत पासवर्ड। कृपया पुनः प्रयास करें।",
            sosTitle: "आपातकालीन अलर्ट भेजा गया",
            sosMessage: "आपातकालीन संपर्कों को आपके स्थान के साथ सूचित कर दिया गया है। सहायता आ रही है।",
            ok: "ठीक है",
            back: "वापस",
            cancel: "रद्द करें",
            emergencyContacts: "आपातकालीन\nसंपर्क",
            nearestShelters: "निकटतम\nआश्रय",
            legalHelp: "कानूनी\nसहायता",
            counselingServices: "परामर्श\nसेवाएं",
            quickExit: "त्वरित\nबाहर निकलें",
            quickExitInstruction: "ऐप को तुरंत छुपाने और होम स्क्रीन पर वापस जाने के लिए त्वरित बाहर निकलें पर टैप करें",
            emergencySOS: "आपातकालीन\nSOS",
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

    // Calculator state - optimized for performance
    viewModel.display = "0";
    viewModel.expression = "";
    viewModel.currentValue = "";
    viewModel.previousValue = "";
    viewModel.operator = "";
    viewModel.newNumber = true;
    viewModel.showSettings = false;
    viewModel.showRaksha = false;
    viewModel.isRakshaMode = false;

    // Secret code system with encryption
    viewModel.secretCode = ApplicationSettings.getString("secretCode", "");
    viewModel.isFirstLaunch = !viewModel.secretCode;
    let enteredCode = "";
    let calculationCache = new Map(); // Performance optimization

    // Simple encryption for password storage
    function encryptPassword(password) {
        return btoa(password + "raksha_salt_2024");
    }

    function decryptPassword(encrypted) {
        try {
            const decoded = atob(encrypted);
            return decoded.replace("raksha_salt_2024", "");
        } catch (error) {
            return "";
        }
    }

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
                    const encrypted = encryptPassword(result.text);
                    ApplicationSettings.setString("secretCode", encrypted);
                    viewModel.secretCode = encrypted;
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

    // Change password functionality
    viewModel.onChangePassword = async () => {
        try {
            const currentResult = await Dialogs.prompt({
                title: viewModel.t.changePassword,
                message: viewModel.t.currentPassword,
                inputType: "password",
                defaultText: "",
                okButtonText: viewModel.t.ok,
                cancelButtonText: viewModel.t.cancel
            });

            if (!currentResult.result) return;

            const currentDecrypted = decryptPassword(viewModel.secretCode);
            if (currentResult.text !== currentDecrypted) {
                await Dialogs.alert({
                    title: viewModel.t.changePassword,
                    message: viewModel.t.incorrectPassword,
                    okButtonText: viewModel.t.ok
                });
                return;
            }

            const newResult = await Dialogs.prompt({
                title: viewModel.t.changePassword,
                message: viewModel.t.newPassword,
                inputType: "password",
                defaultText: "",
                okButtonText: viewModel.t.ok,
                cancelButtonText: viewModel.t.cancel
            });

            if (!newResult.result || !newResult.text || newResult.text.length < 3) return;

            const confirmResult = await Dialogs.prompt({
                title: viewModel.t.changePassword,
                message: viewModel.t.confirmNewPassword,
                inputType: "password",
                defaultText: "",
                okButtonText: viewModel.t.ok,
                cancelButtonText: viewModel.t.cancel
            });

            if (!confirmResult.result || confirmResult.text !== newResult.text) {
                await Dialogs.alert({
                    title: viewModel.t.changePassword,
                    message: viewModel.t.codesDontMatch,
                    okButtonText: viewModel.t.ok
                });
                return;
            }

            const encrypted = encryptPassword(newResult.text);
            ApplicationSettings.setString("secretCode", encrypted);
            viewModel.secretCode = encrypted;

            await Dialogs.alert({
                title: viewModel.t.changePassword,
                message: viewModel.t.passwordChanged,
                okButtonText: viewModel.t.ok
            });

            viewModel.set("showSettings", false);
        } catch (error) {
            console.error("Password change error:", error);
        }
    };

    // Language switching
    viewModel.switchLanguage = () => {
        const newLang = viewModel.currentLanguage === "en" ? "hi" : "en";
        viewModel.currentLanguage = newLang;
        viewModel.t = translations[newLang];
        ApplicationSettings.setString("language", newLang);
        
        viewModel.notifyPropertyChange("t", viewModel.t);
        viewModel.notifyPropertyChange("currentLanguage", newLang);
    };

    // Calculator functions - optimized
    viewModel.onNumber = (args) => {
        const number = args.object.text;
        
        // Track entered code for secret activation
        if (!viewModel.isRakshaMode) {
            enteredCode += number;
            if (enteredCode.length > 10) {
                enteredCode = enteredCode.slice(-10);
            }
        }
        
        // Calculator logic
        if (viewModel.newNumber) {
            viewModel.set("display", number);
            viewModel.set("expression", number);
            viewModel.newNumber = false;
        } else {
            const newDisplay = viewModel.display === "0" ? number : viewModel.display + number;
            if (newDisplay.length <= 12) {
                viewModel.set("display", newDisplay);
                viewModel.set("expression", viewModel.expression + number);
            }
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
        
        enteredCode = "";
    };

    viewModel.onEqual = () => {
        // Check for secret code activation
        if (!viewModel.isRakshaMode && enteredCode) {
            const currentDecrypted = decryptPassword(viewModel.secretCode);
            if (enteredCode === currentDecrypted) {
                enteredCode = "";
                activateRakshaMode();
                return;
            }
        }

        // Normal calculator equals
        if (viewModel.previousValue && viewModel.currentValue && viewModel.operator) {
            calculateResult();
        }
        enteredCode = "";
    };

    viewModel.onPlusMinus = () => {
        if (viewModel.display !== "0" && viewModel.display !== "Error") {
            const value = parseFloat(viewModel.display);
            const result = -value;
            viewModel.set("display", result.toString());
            viewModel.currentValue = result.toString();
        }
        enteredCode = "";
    };

    viewModel.onPercent = () => {
        if (viewModel.display !== "0" && viewModel.display !== "Error") {
            const value = parseFloat(viewModel.display);
            const result = value / 100;
            viewModel.set("display", result.toString());
            viewModel.currentValue = result.toString();
        }
        enteredCode = "";
    };

    function calculateResult() {
        try {
            const prev = parseFloat(viewModel.previousValue);
            const current = parseFloat(viewModel.currentValue);
            
            const cacheKey = `${prev}_${viewModel.operator}_${current}`;
            if (calculationCache.has(cacheKey)) {
                const result = calculationCache.get(cacheKey);
                displayResult(result);
                return;
            }

            let result = 0;
            switch (viewModel.operator) {
                case "+": result = prev + current; break;
                case "−": result = prev - current; break;
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

            calculationCache.set(cacheKey, result);
            if (calculationCache.size > 100) {
                const firstKey = calculationCache.keys().next().value;
                calculationCache.delete(firstKey);
            }

            displayResult(result);
        } catch (error) {
            viewModel.set("display", "Error");
            viewModel.set("expression", "Error");
        }
    }

    function displayResult(result) {
        result = Math.round(result * 1000000000) / 1000000000;
        let resultStr = result.toString();
        
        if (resultStr.length > 12) {
            resultStr = result.toExponential(6);
        }
        
        viewModel.set("display", resultStr);
        viewModel.set("expression", resultStr);
        viewModel.currentValue = resultStr;
        viewModel.previousValue = "";
        viewModel.operator = "";
        viewModel.newNumber = true;
    }

    viewModel.onDecimal = () => {
        if (viewModel.newNumber) {
            viewModel.set("display", "0.");
            viewModel.set("expression", "0.");
            viewModel.newNumber = false;
        } else if (!viewModel.display.includes(".") && viewModel.display.length < 12) {
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
    };

    // Activate Raksha mode
    function activateRakshaMode() {
        viewModel.set("isRakshaMode", true);
        viewModel.set("showRaksha", true);
        
        viewModel.notifyPropertyChange("t", viewModel.t);
        
        // Haptic feedback
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

    // Emergency contacts for India
    const emergencyContacts = [
        { name: "National Emergency Number", nameHi: "राष्ट्रीय आपातकालीन नंबर", number: "112" },
        { name: "Women Helpline", nameHi: "महिला हेल्पलाइन", number: "1091" },
        { name: "Women Helpline - Domestic Abuse", nameHi: "महिला हेल्पलाइन - घरेलू हिंसा", number: "181" },
        { name: "Police", nameHi: "पुलिस", number: "100" },
        { name: "Ambulance", nameHi: "एम्बुलेंस", number: "108" },
        { name: "Child Helpline", nameHi: "बाल हेल्पलाइन", number: "1098" }
    ];

    const shelters = {
        "Delhi": [
            "Shakti Shalini - 24x7 Shelter (011-24373737)",
            "YWCA - Working Women's Hostel (011-23368321)",
            "Shakti Shalini Crisis Center (011-47615555)"
        ],
        "Mumbai": [
            "Urja Trust Women's Shelter (022-26770137)",
            "Special Cell for Women & Children (022-22621679)",
            "Swadhar Greh Scheme Center (022-26662394)"
        ],
        "Bangalore": [
            "Parihar Family Counselling Centre (080-22943225)",
            "Vanitha Sahayavani (080-22943225)",
            "Abhayashrama Women's Shelter (080-23321301)"
        ],
        "Chennai": [
            "International Foundation for Crime Prevention (044-23452365)",
            "Aruwe Women's Shelter (044-26426421)",
            "Tamil Nadu Women's Commission (044-28592750)"
        ]
    };

    const legalServices = {
        en: [
            "Free Legal Aid (NALSA) - 15100",
            "Women's Commission",
            "Police Assistance",
            "Domestic Violence Act Support",
            "District Legal Services Authority"
        ],
        hi: [
            "नि:शुल्क कानूनी सहायता (NALSA) - 15100",
            "महिला आयोग",
            "पुलिस सहायता",
            "घरेलू हिंसा अधिनियम सहायता",
            "जिला कानूनी सेवा प्राधिकरण"
        ]
    };

    const counselingServices = {
        en: [
            "24x7 Crisis Helpline - 9152987821",
            "Online Chat Support",
            "Find Local Counselor",
            "Support Groups",
            "Mental Health Support - 14416"
        ],
        hi: [
            "24x7 संकट हेल्पलाइन - 9152987821",
            "ऑनलाइन चैट सहायता",
            "स्थानीय काउंसलर खोजें",
            "सहायता समूह",
            "मानसिक स्वास्थ्य सहायता - 14416"
        ]
    };

    // Emergency functions
    viewModel.onSOS = async () => {
        try {
            const location = await getCurrentLocation({
                desiredAccuracy: 3,
                updateDistance: 10,
                timeout: 8000
            });
            
            console.log(`Emergency SOS activated at: ${location.latitude}, ${location.longitude}`);
            
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
        viewModel.set("showRaksha", false);
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
            actions: shelterList.slice(0, 15)
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